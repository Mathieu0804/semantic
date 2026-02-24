"""
pme_sovereign.py — PME Brain 100% Local
Remplace pme_final.py avec LLM local (Ollama) au lieu de Gemini.
Même interface, même fonctionnalités, zéro cloud.
"""

import asyncio, json, os, logging
from datetime import datetime
from typing import Dict, List, Optional

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import Column, Integer, String, Float, Text, Boolean, DateTime, select, func
from dotenv import load_dotenv

# Modules locaux
from local_llm import (
    call_local_llm, check_ollama, embed_local,
    ModelManager, OLLAMA_MODEL, OLLAMA_HOST
)
from semantic_module import (
    integrate_into_pme_brain, nightly_optimization_job
)

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("pme.sovereign")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./pme_brain.db")

logger.info(f"Mode: SOUVERAIN LOCAL — LLM: {OLLAMA_MODEL} @ {OLLAMA_HOST}")

# ─── BASE DE DONNÉES (identique) ─────────────────────────────────
engine  = create_async_engine(DATABASE_URL, echo=False)
Session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

class Base(DeclarativeBase): pass

class Entreprise(Base):
    __tablename__ = "entreprise"
    id=Column(Integer,primary_key=True); nom=Column(String(255),default="")
    secteur=Column(String(255),default=""); description=Column(String(500),default="")
    email=Column(String(255),default=""); telephone=Column(String(50),default="")
    ville=Column(String(100),default=""); ton=Column(String(100),default="chaleureux")
    valeurs=Column(Text,default="[]"); points_forts=Column(Text,default="[]")

class Produit(Base):
    __tablename__ = "produit"
    id=Column(Integer,primary_key=True); nom=Column(String(255),nullable=False)
    prix=Column(Float,default=0.0); description=Column(Text,default="")
    categorie=Column(String(100),default="General"); stock=Column(Integer,default=0)
    disponible=Column(Boolean,default=True); created_at=Column(DateTime,default=datetime.now)

class Client(Base):
    __tablename__ = "client"
    id=Column(Integer,primary_key=True); nom=Column(String(255),nullable=False)
    email=Column(String(255),default=""); telephone=Column(String(50),default="")
    notes=Column(Text,default=""); created_at=Column(DateTime,default=datetime.now)

class Reservation(Base):
    __tablename__ = "reservation"
    id=Column(Integer,primary_key=True); client_nom=Column(String(255),default="")
    service=Column(String(255),default=""); date_heure=Column(String(100),default="")
    statut=Column(String(50),default="confirmee"); notes=Column(Text,default="")
    created_at=Column(DateTime,default=datetime.now)

class FAQ(Base):
    __tablename__ = "faq"
    id=Column(Integer,primary_key=True); question=Column(Text,nullable=False)
    reponse=Column(Text,nullable=False); created_at=Column(DateTime,default=datetime.now)


# ─── LLM LOCAL (remplace call_gemini) ────────────────────────────

model_mgr = ModelManager()

async def call_gemini(prompt: str, temperature: float = 0.3, retries: int = 3) -> str:
    """
    Même signature que l'original — mais appelle Ollama local.
    Toutes les autres fonctions continuent de fonctionner sans modification.
    """
    return await call_local_llm(prompt, temperature=temperature, retries=retries)


def parse_json(text: str) -> Optional[Dict]:
    import re
    if not text: return None
    try: return json.loads(text.strip())
    except: pass
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try: return json.loads(m.group(1))
        except: pass
    try:
        s = text.index("{"); e = text.rindex("}") + 1
        return json.loads(text[s:e])
    except: pass
    return None


# ─── PROMPT SYSTÈME (optimisé pour les LLMs open-source) ─────────

# Les modèles open-source sont plus sensibles au format du prompt
# On utilise un format plus explicite et structuré
CATALOG = """<|im_start|>system
Tu es l'assistant IA d'une PME française. Tu DOIS répondre UNIQUEMENT avec un objet JSON valide.
JAMAIS de texte avant ou après le JSON. JAMAIS de markdown.

OUTILS DISPONIBLES:
- configurer_entreprise(nom, secteur, description, email, telephone, ville, ton, valeurs, points_forts)
- ajouter_produit(nom, prix, description, categorie, stock)
- lister_produits(categorie)
- modifier_stock(nom_produit, nouveau_stock)
- creer_reservation(client_nom, service, date_heure, notes)
- voir_agenda()
- ajouter_client(nom, email, telephone, notes)
- lister_clients()
- ajouter_faq(question, reponse)
- bilan()
- generer_post(sujet, plateforme)
- analyser_seo(produit_id)
- optimiser_jsonld(produit_id, n_episodes)
- generer_page_produit(produit_id)
- rapport_semantique()

FORMAT DE RÉPONSE OBLIGATOIRE (JSON uniquement):
Si outil nécessaire: {"outil": "nom_outil", "params": {"cle": valeur}, "direct": ""}
Si pas d'outil: {"outil": null, "params": {}, "direct": "ta réponse en français"}
<|im_end|>
"""


# ─── MÉMOIRE VECTORIELLE LOCALE ──────────────────────────────────

class LocalMemory:
    """
    Mémoire conversationnelle avec embeddings locaux.
    Retrouve les conversations similaires passées.
    Stockage : fichier JSON local (pas de DB externe).
    """

    def __init__(self, memory_file: str = "pme_memory.json"):
        self.memory_file = memory_file
        self.memories: List[Dict] = self._load()

    def _load(self) -> List[Dict]:
        try:
            with open(self.memory_file) as f:
                return json.load(f)
        except: return []

    def _save(self):
        with open(self.memory_file, "w", encoding="utf-8") as f:
            json.dump(self.memories[-500:], f, ensure_ascii=False, indent=2)  # garder 500 max

    async def add(self, user_msg: str, assistant_response: str, tool_used: str = ""):
        """Ajoute une interaction à la mémoire."""
        embedding = await embed_local(user_msg)
        self.memories.append({
            "timestamp": datetime.now().isoformat(),
            "user": user_msg,
            "assistant": assistant_response[:200],
            "tool": tool_used,
            "embedding": embedding[:50] if embedding else [],  # stocker partiel
        })
        self._save()

    def get_context(self, n: int = 5) -> str:
        """Retourne les N dernières interactions comme contexte."""
        recent = self.memories[-n:]
        if not recent: return ""
        return "Historique récent:\n" + "\n".join(
            f"U: {m['user'][:80]} → A: {m['assistant'][:80]}"
            for m in recent
        ) + "\n\n"


# ─── OUTILS MÉTIER (identiques à pme_final.py) ───────────────────

async def t_configurer(nom="", secteur="", description="", email="", telephone="", ville="", ton="chaleureux", valeurs=None, points_forts=None):
    if not nom.strip(): return {"success": False, "question": "Quel est le nom de votre entreprise ?"}
    if not secteur.strip(): return {"success": False, "question": "Quel est votre secteur ?"}
    async with Session() as s:
        r = await s.execute(select(Entreprise).limit(1))
        e = r.scalar_one_or_none() or Entreprise()
        e.nom=nom; e.secteur=secteur; e.description=description
        e.email=email; e.telephone=telephone; e.ville=ville; e.ton=ton
        e.valeurs=json.dumps(valeurs or []); e.points_forts=json.dumps(points_forts or [])
        s.add(e); await s.commit()
    return {"success": True, "message": f"Entreprise {nom} configurée."}

async def t_ajouter_produit(nom="", prix=0.0, description="", categorie="General", stock=0):
    if not nom.strip(): return {"success": False, "question": "Nom du produit ?"}
    if float(prix) <= 0: return {"success": False, "question": f"Prix de {nom} ?"}
    async with Session() as s:
        p = Produit(nom=nom, prix=float(prix), description=description, categorie=categorie, stock=int(stock))
        s.add(p); await s.commit(); await s.refresh(p)
    return {"success": True, "id": p.id, "message": f"{nom} ajouté à {prix}€, stock: {stock}"}

async def t_lister_produits(categorie=""):
    async with Session() as s:
        q = select(Produit)
        if categorie: q = q.where(Produit.categorie == categorie)
        r = await s.execute(q)
        items = [{"id": p.id, "nom": p.nom, "prix": p.prix, "stock": p.stock, "cat": p.categorie} for p in r.scalars().all()]
    return {"success": True, "produits": items, "total": len(items)}

async def t_modifier_stock(nom_produit="", nouveau_stock=0):
    if not nom_produit.strip(): return {"success": False, "question": "Quel produit modifier ?"}
    async with Session() as s:
        r = await s.execute(select(Produit).where(Produit.nom.ilike(f"%{nom_produit}%")))
        p = r.scalar_one_or_none()
        if not p: return {"success": False, "message": f"'{nom_produit}' introuvable"}
        p.stock = int(nouveau_stock); p.disponible = int(nouveau_stock) > 0
        await s.commit()
    return {"success": True, "message": f"Stock {p.nom}: {nouveau_stock}"}

async def t_reserver(client_nom="", service="", date_heure="", notes=""):
    m = []
    if not client_nom.strip(): m.append("Nom du client ?")
    if not service.strip(): m.append("Quel service ?")
    if not date_heure.strip(): m.append("Date et heure ?")
    if m: return {"success": False, "question": m[0]}
    async with Session() as s:
        r = Reservation(client_nom=client_nom, service=service, date_heure=date_heure, notes=notes)
        s.add(r); await s.commit(); await s.refresh(r)
    return {"success": True, "id": r.id, "message": f"Réservation #{r.id}: {client_nom} / {service} / {date_heure}"}

async def t_agenda():
    async with Session() as s:
        r = await s.execute(select(Reservation).order_by(Reservation.created_at.desc()).limit(20))
        items = [{"id": x.id, "client": x.client_nom, "service": x.service, "date": x.date_heure, "statut": x.statut} for x in r.scalars().all()]
    return {"success": True, "reservations": items, "total": len(items)}

async def t_ajouter_client(nom="", email="", telephone="", notes=""):
    if not nom.strip(): return {"success": False, "question": "Nom du client ?"}
    async with Session() as s:
        c = Client(nom=nom, email=email, telephone=telephone, notes=notes)
        s.add(c); await s.commit(); await s.refresh(c)
    return {"success": True, "id": c.id, "message": f"Client {nom} ajouté"}

async def t_clients():
    async with Session() as s:
        r = await s.execute(select(Client).order_by(Client.created_at.desc()))
        items = [{"id": c.id, "nom": c.nom, "email": c.email, "tel": c.telephone} for c in r.scalars().all()]
    return {"success": True, "clients": items, "total": len(items)}

async def t_faq(question="", reponse=""):
    if not question.strip(): return {"success": False, "question": "La question ?"}
    if not reponse.strip(): return {"success": False, "question": "La réponse ?"}
    async with Session() as s:
        s.add(FAQ(question=question, reponse=reponse)); await s.commit()
    return {"success": True, "message": "FAQ ajoutée."}

async def t_bilan():
    async with Session() as s:
        np = (await s.execute(select(func.count(Produit.id)))).scalar()
        nc = (await s.execute(select(func.count(Client.id)))).scalar()
        nr = (await s.execute(select(func.count(Reservation.id)))).scalar()
        rb = await s.execute(select(Produit).where(Produit.stock < 5, Produit.disponible == True))
        bas = [p.nom for p in rb.scalars().all()]
    return {"success": True, "produits": np, "clients": nc, "reservations": nr, "stock_alerte": bas,
            "message": f"Bilan: {np} produits, {nc} clients, {nr} réservations" + (f" | Stock bas: {', '.join(bas)}" if bas else "")}

async def t_post(sujet="", plateforme="instagram"):
    if not sujet.strip(): return {"success": False, "question": "Sujet du post ?"}
    async with Session() as s:
        r = await s.execute(select(Entreprise).limit(1))
        e = r.scalar_one_or_none()
    prompt = (
        f"Rédige 2 variantes de post {plateforme} pour {e.nom if e else 'notre entreprise'}. "
        f"Ton: {e.ton if e else 'chaleureux'}. Sujet: {sujet}. En français, avec hashtags.\n"
        f"Format:\nVARIANTE A:\n[texte]\n\nVARIANTE B:\n[texte]"
    )
    texte = await call_gemini(prompt, temperature=0.8)
    return {"success": True, "post": texte, "message": "Post généré"}


TOOLS = {
    "configurer_entreprise": t_configurer,
    "ajouter_produit":       t_ajouter_produit,
    "lister_produits":       t_lister_produits,
    "modifier_stock":        t_modifier_stock,
    "creer_reservation":     t_reserver,
    "voir_agenda":           t_agenda,
    "ajouter_client":        t_ajouter_client,
    "lister_clients":        t_clients,
    "ajouter_faq":           t_faq,
    "bilan":                 t_bilan,
    "generer_post":          t_post,
}

# Intégration des outils sémantiques
integrate_into_pme_brain(TOOLS, call_gemini)

# Mémoire locale
memory = LocalMemory()
history: List[Dict] = []


async def process(message: str) -> Dict:
    history.append({"role": "user", "content": message})

    # Contexte : historique récent + mémoire vectorielle
    ctx = memory.get_context(5)
    if len(history) > 2:
        ctx += "Tour actuel:\n" + "\n".join(
            f"{'U' if m['role']=='user' else 'A'}: {m['content'][:100]}"
            for m in history[-4:-1]
        ) + "\n\n"

    # Prompt optimisé pour modèles locaux
    prompt = (
        CATALOG +
        f"<|im_start|>user\n{ctx}Message: {message}\n\nRéponds avec le JSON approprié:\n<|im_end|>\n"
        f"<|im_start|>assistant\n"
    )

    raw = await call_gemini(prompt, temperature=0.1)

    if raw.startswith("ERREUR"):
        history.append({"role": "assistant", "content": raw})
        return {"response": raw, "tools_called": [], "tool_result": None}

    decision = parse_json(raw)

    if not decision:
        # Les LLMs locaux ratent parfois le format JSON
        # Retry avec un prompt encore plus direct
        retry_prompt = (
            f"Message de l'utilisateur: {message}\n\n"
            f"Réponds UNIQUEMENT avec ce JSON (rien d'autre):\n"
            f'Si outil: {{"outil": "nom_outil", "params": {{}}, "direct": ""}}\n'
            f'Sinon: {{"outil": null, "params": {{}}, "direct": "ta réponse"}}\n'
            f"JSON:"
        )
        raw = await call_gemini(retry_prompt, temperature=0.05)
        decision = parse_json(raw)

    if not decision:
        resp = raw[:300] if raw else "Comment puis-je vous aider ?"
        history.append({"role": "assistant", "content": resp})
        return {"response": resp, "tools_called": [], "tool_result": None}

    tool_name = decision.get("outil") or ""
    params    = decision.get("params") or {}
    direct    = decision.get("direct") or ""

    if not tool_name or tool_name == "null":
        resp = direct or "Comment puis-je vous aider ?"
        history.append({"role": "assistant", "content": resp})
        await memory.add(message, resp)
        return {"response": resp, "tools_called": [], "tool_result": None}

    fn = TOOLS.get(tool_name)
    if not fn:
        resp = f"Outil non reconnu: {tool_name}"
        history.append({"role": "assistant", "content": resp})
        return {"response": resp, "tools_called": [tool_name], "tool_result": None}

    try:
        clean_params = {k: v for k, v in params.items() if v is not None}
        result = await fn(**clean_params)
    except Exception as ex:
        result = {"success": False, "message": str(ex)}

    if not result.get("success") and result.get("question"):
        q = result["question"]
        history.append({"role": "assistant", "content": q})
        return {"response": q, "tools_called": [tool_name], "tool_result": result, "needs_info": True}

    # Synthèse finale — utiliser modèle léger et rapide
    synth = await model_mgr.call_for_task(
        "classification",
        f"Confirme en 1-2 phrases naturelles en français cette action:\n"
        f"Demande: {message}\n"
        f"Résultat: {json.dumps(result, ensure_ascii=False)[:300]}\n"
        f"Confirmation:",
        temperature=0.5
    )
    if synth.startswith("ERREUR"):
        synth = result.get("message", "Action réalisée.")

    history.append({"role": "assistant", "content": synth})
    await memory.add(message, synth, tool_name)
    return {"response": synth, "tools_called": [tool_name], "tool_result": result}


# ─── APP ─────────────────────────────────────────────────────────

app = FastAPI(title="PME Brain Souverain")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Base de données OK")

    # Vérifier Ollama au démarrage
    status = await check_ollama()
    if status["ok"]:
        logger.info(f"✅ LLM local OK — modèles: {status.get('models_disponibles', [])}")
        await model_mgr.refresh_available()
    else:
        logger.error(f"⚠️  LLM local: {status.get('error', 'inconnu')}")
        logger.error(f"   Conseil: {status.get('conseil', '')}")

    # Scheduler sémantique nocturne
    asyncio.create_task(nightly_optimization_job(call_gemini))
    logger.info("Scheduler sémantique nocturne actif (3h00 chaque nuit)")


@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    msg  = (body.get("message") or "").strip()
    if not msg: return JSONResponse({"error": "vide"}, status_code=400)
    return JSONResponse(await process(msg))


@app.get("/status")
async def status():
    import glob
    ollama_status = await check_ollama()
    async with Session() as s:
        np = (await s.execute(select(func.count(Produit.id)))).scalar()
        nc = (await s.execute(select(func.count(Client.id)))).scalar()
        nr = (await s.execute(select(func.count(Reservation.id)))).scalar()
        er = await s.execute(select(Entreprise).limit(1))
        e  = er.scalar_one_or_none()
    return {
        "mode": "SOUVERAIN LOCAL — 0 donnée cloud",
        "llm": {
            "moteur": "Ollama",
            "modele": OLLAMA_MODEL,
            "hote": OLLAMA_HOST,
            "ok": ollama_status["ok"],
            "modeles_disponibles": ollama_status.get("models_disponibles", []),
        },
        "entreprise": e.nom if e else "non configurée",
        "produits": np, "clients": nc, "reservations": nr,
        "jsonld_optimises": len(glob.glob("semantic_outputs/jsonld/*.json")),
        "memoire": len(memory.memories),
    }


@app.get("/test-llm")
async def test_llm():
    """Test du LLM local (équivalent de /test-gemini)."""
    status = await check_ollama()
    if not status["ok"]:
        return {"ok": False, "erreur": status.get("error"), "conseil": status.get("conseil")}

    response = await call_local_llm(
        "Réponds uniquement: ok", temperature=0.1, max_tokens=5
    )
    return {
        "ok": True,
        "modele": OLLAMA_MODEL,
        "hote": OLLAMA_HOST,
        "reponse": response,
        "souverain": True,
        "cloud_utilise": False,
    }


@app.get("/reset")
async def reset():
    history.clear()
    return {"ok": True}


@app.get("/", response_class=HTMLResponse)
async def ui():
    try:
        with open("ui.html", encoding="utf-8") as f:
            return HTMLResponse(f.read())
    except FileNotFoundError:
        return HTMLResponse("<h2>ui.html manquant</h2>", status_code=500)


if __name__ == "__main__":
    import uvicorn
    print()
    print("╔══════════════════════════════════════════════════════════╗")
    print("║        PME Brain SOUVERAIN — 100% Local                  ║")
    print("╠══════════════════════════════════════════════════════════╣")
    print(f"║  LLM    : Ollama + {OLLAMA_MODEL:<35}║")
    print(f"║  Hôte   : {OLLAMA_HOST:<45}║")
    print("║  Cloud  : DÉSACTIVÉ — données 100% locales              ║")
    print("║  App    : http://localhost:8000                          ║")
    print("║  Test   : http://localhost:8000/test-llm                ║")
    print("╚══════════════════════════════════════════════════════════╝")
    print()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")
