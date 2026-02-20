#!/usr/bin/env python3
"""
PME Brain - Version Finale
Gemini 2.0 Flash + retry automatique sur quota 429
Un seul fichier Python + ui.html dans le meme dossier
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

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger("pme")

# ─── CONFIG ──────────────────────────────────────────────────────────────────
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
# Modele force via .env, sinon gemini-2.0-flash par defaut
MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
GEMINI_URL     = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"
DATABASE_URL   = "sqlite+aiosqlite:///./pme_brain.db"

logger.info(f"Modele Gemini: {MODEL}")
logger.info(f"Cle API: {'presente (' + GEMINI_API_KEY[:8] + '...)' if GEMINI_API_KEY else 'MANQUANTE'}")

# ─── BASE DE DONNEES ─────────────────────────────────────────────────────────
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

# ─── GEMINI AVEC RETRY 429 ───────────────────────────────────────────────────
async def call_gemini(prompt: str, temperature: float = 0.3, retries: int = 3) -> str:
    """
    Appelle Gemini. Sur quota 429 : attend 65 secondes et reessaie.
    retries = nombre de tentatives max.
    """
    if not GEMINI_API_KEY:
        return "ERREUR: GEMINI_API_KEY manquante dans .env"

    payload = {
        "contents": [{"role": "user", "parts": [{"text": prompt}]}],
        "generationConfig": {"temperature": temperature, "maxOutputTokens": 1500}
    }

    for attempt in range(1, retries + 1):
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                r = await client.post(
                    GEMINI_URL, json=payload,
                    headers={"x-goog-api-key": GEMINI_API_KEY}
                )

            if r.status_code == 200:
                text = r.json()["candidates"][0]["content"]["parts"][0]["text"]
                logger.info(f"[GEMINI] OK ({len(text)} chars)")
                return text

            elif r.status_code == 429:
                if attempt < retries:
                    logger.warning(f"[GEMINI] 429 quota (tentative {attempt}/{retries}) - attente 65s...")
                    await asyncio.sleep(65)
                    continue
                else:
                    return "QUOTA: Limite Gemini atteinte. Attendez 1 minute et reessayez."

            elif r.status_code == 400:
                try:
                    msg = r.json().get("error", {}).get("message", "")[:150]
                except Exception:
                    msg = "400"
                logger.error(f"[GEMINI] 400: {msg}")
                return f"ERREUR_CLE: {msg}"

            elif r.status_code == 403:
                try:
                    msg = r.json().get("error", {}).get("message", "")[:150]
                except Exception:
                    msg = "403"
                logger.error(f"[GEMINI] 403: {msg}")
                return f"ERREUR_ACCES: {msg}"

            else:
                logger.error(f"[GEMINI] HTTP {r.status_code}")
                return f"ERREUR_HTTP: {r.status_code}"

        except httpx.TimeoutException:
            logger.warning(f"[GEMINI] Timeout tentative {attempt}")
            if attempt < retries:
                await asyncio.sleep(5)
            else:
                return "ERREUR: Timeout Gemini"
        except Exception as e:
            logger.error(f"[GEMINI] Exception: {e}")
            return f"ERREUR: {e}"

    return "ERREUR: Toutes les tentatives ont echoue"


def parse_json(text: str) -> Optional[Dict]:
    """Extrait un objet JSON d'un texte, meme s'il y a du texte autour."""
    import re
    if not text:
        return None
    # Direct
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    # Bloc ```json
    m = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1))
        except Exception:
            pass
    # Chercher { ... }
    try:
        s = text.index("{")
        e = text.rindex("}") + 1
        return json.loads(text[s:e])
    except Exception:
        pass
    return None

# ─── OUTILS ──────────────────────────────────────────────────────────────────
async def t_configurer(nom="", secteur="", description="", email="", telephone="", ville="", ton="chaleureux", valeurs=None, points_forts=None):
    if not nom.strip():
        return {"success": False, "question": "Quel est le nom de votre entreprise ?"}
    if not secteur.strip():
        return {"success": False, "question": "Quel est votre secteur (ex: boulangerie, plomberie) ?"}
    async with Session() as s:
        r = await s.execute(select(Entreprise).limit(1))
        e = r.scalar_one_or_none() or Entreprise()
        e.nom=nom; e.secteur=secteur; e.description=description
        e.email=email; e.telephone=telephone; e.ville=ville; e.ton=ton
        e.valeurs=json.dumps(valeurs or []); e.points_forts=json.dumps(points_forts or [])
        s.add(e); await s.commit()
    return {"success": True, "message": f"Entreprise {nom} configuree."}

async def t_ajouter_produit(nom="", prix=0.0, description="", categorie="General", stock=0):
    if not nom.strip():
        return {"success": False, "question": "Nom du produit ?"}
    if float(prix) <= 0:
        return {"success": False, "question": f"Prix de {nom} ?"}
    async with Session() as s:
        p = Produit(nom=nom, prix=float(prix), description=description, categorie=categorie, stock=int(stock))
        s.add(p); await s.commit(); await s.refresh(p)
    return {"success": True, "id": p.id, "message": f"{nom} ajoute a {prix}EUR, stock: {stock}"}

async def t_lister_produits(categorie=""):
    async with Session() as s:
        q = select(Produit)
        if categorie:
            q = q.where(Produit.categorie == categorie)
        r = await s.execute(q)
        items = [{"id": p.id, "nom": p.nom, "prix": p.prix, "stock": p.stock, "cat": p.categorie}
                 for p in r.scalars().all()]
    return {"success": True, "produits": items, "total": len(items)}

async def t_modifier_stock(nom_produit="", nouveau_stock=0):
    if not nom_produit.strip():
        return {"success": False, "question": "Quel produit modifier ?"}
    async with Session() as s:
        r = await s.execute(select(Produit).where(Produit.nom.ilike(f"%{nom_produit}%")))
        p = r.scalar_one_or_none()
        if not p:
            return {"success": False, "message": f"'{nom_produit}' introuvable"}
        p.stock = int(nouveau_stock); p.disponible = int(nouveau_stock) > 0
        await s.commit()
    return {"success": True, "message": f"Stock {p.nom}: {nouveau_stock}"}

async def t_reserver(client_nom="", service="", date_heure="", notes=""):
    m = []
    if not client_nom.strip(): m.append("Nom du client ?")
    if not service.strip():    m.append("Quel service ?")
    if not date_heure.strip(): m.append("Date et heure ?")
    if m:
        return {"success": False, "question": m[0]}
    async with Session() as s:
        r = Reservation(client_nom=client_nom, service=service, date_heure=date_heure, notes=notes)
        s.add(r); await s.commit(); await s.refresh(r)
    return {"success": True, "id": r.id, "message": f"Reservation #{r.id}: {client_nom} / {service} / {date_heure}"}

async def t_agenda():
    async with Session() as s:
        r = await s.execute(select(Reservation).order_by(Reservation.created_at.desc()).limit(20))
        items = [{"id": x.id, "client": x.client_nom, "service": x.service,
                  "date": x.date_heure, "statut": x.statut}
                 for x in r.scalars().all()]
    return {"success": True, "reservations": items, "total": len(items)}

async def t_ajouter_client(nom="", email="", telephone="", notes=""):
    if not nom.strip():
        return {"success": False, "question": "Nom du client ?"}
    async with Session() as s:
        c = Client(nom=nom, email=email, telephone=telephone, notes=notes)
        s.add(c); await s.commit(); await s.refresh(c)
    return {"success": True, "id": c.id, "message": f"Client {nom} ajoute"}

async def t_clients():
    async with Session() as s:
        r = await s.execute(select(Client).order_by(Client.created_at.desc()))
        items = [{"id": c.id, "nom": c.nom, "email": c.email, "tel": c.telephone}
                 for c in r.scalars().all()]
    return {"success": True, "clients": items, "total": len(items)}

async def t_faq(question="", reponse=""):
    if not question.strip(): return {"success": False, "question": "La question ?"}
    if not reponse.strip():  return {"success": False, "question": "La reponse ?"}
    async with Session() as s:
        s.add(FAQ(question=question, reponse=reponse)); await s.commit()
    return {"success": True, "message": "FAQ ajoutee."}

async def t_bilan():
    async with Session() as s:
        np = (await s.execute(select(func.count(Produit.id)))).scalar()
        nc = (await s.execute(select(func.count(Client.id)))).scalar()
        nr = (await s.execute(select(func.count(Reservation.id)))).scalar()
        rb = await s.execute(select(Produit).where(Produit.stock < 5, Produit.disponible == True))
        bas = [p.nom for p in rb.scalars().all()]
    return {"success": True, "produits": np, "clients": nc, "reservations": nr,
            "stock_alerte": bas,
            "message": f"Bilan: {np} produits, {nc} clients, {nr} reservations" +
                       (f" | Stock bas: {', '.join(bas)}" if bas else "")}

async def t_post(sujet="", plateforme="instagram"):
    if not sujet.strip():
        return {"success": False, "question": "Sujet du post ?"}
    async with Session() as s:
        r = await s.execute(select(Entreprise).limit(1))
        e = r.scalar_one_or_none()
    prompt = (
        f"Redige 2 variantes de post {plateforme} pour {e.nom if e else 'notre entreprise'}. "
        f"Ton: {e.ton if e else 'chaleureux'}. Sujet: {sujet}. "
        f"En francais, avec hashtags. "
        f"Format strict:\nVARIANTE A:\n[texte]\n\nVARIANTE B:\n[texte]"
    )
    texte = await call_gemini(prompt, temperature=0.8)
    if texte.startswith("ERREUR") or texte.startswith("QUOTA"):
        return {"success": False, "message": texte}
    return {"success": True, "post": texte, "message": "Post genere"}

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

CATALOG = (
    "Tu es l assistant IA d une PME. REPONDS UNIQUEMENT EN JSON, rien d autre.\n\n"
    "OUTILS:\n"
    "- configurer_entreprise(nom, secteur, description, email, telephone, ville, ton, valeurs, points_forts)\n"
    "- ajouter_produit(nom, prix, description, categorie, stock)\n"
    "- lister_produits(categorie)\n"
    "- modifier_stock(nom_produit, nouveau_stock)\n"
    "- creer_reservation(client_nom, service, date_heure, notes)\n"
    "- voir_agenda()\n"
    "- ajouter_client(nom, email, telephone, notes)\n"
    "- lister_clients()\n"
    "- ajouter_faq(question, reponse)\n"
    "- bilan()\n"
    "- generer_post(sujet, plateforme)\n\n"
    "REPONSE JSON OBLIGATOIRE:\n"
    "{\"outil\": \"nom_outil\", \"params\": {\"cle\": \"valeur\"}, \"direct\": \"\"}\n"
    "Si pas d outil: {\"outil\": null, \"params\": {}, \"direct\": \"ta reponse en francais\"}\n"
)

history: List[Dict] = []

async def process(message: str) -> Dict:
    history.append({"role": "user", "content": message})

    ctx = ""
    if len(history) > 2:
        ctx = "Contexte:\n" + "\n".join(
            f"{'U' if m['role']=='user' else 'A'}: {m['content'][:100]}"
            for m in history[-5:-1]
        ) + "\n\n"

    prompt = CATALOG + ctx + "Message utilisateur: " + message + "\n\nJSON:"
    raw = await call_gemini(prompt, temperature=0.1)

    # Cas quota/erreur Gemini
    if raw.startswith("QUOTA"):
        msg = "Quota Gemini atteint. Je reessaie automatiquement, patientez..."
        history.append({"role": "assistant", "content": msg})
        return {"response": msg, "tools_called": [], "tool_result": None}

    if raw.startswith("ERREUR"):
        history.append({"role": "assistant", "content": raw})
        return {"response": raw, "tools_called": [], "tool_result": None}

    decision = parse_json(raw)

    # Gemini n'a pas retourne de JSON valide
    if not decision:
        resp = raw[:400] if raw else "Comment puis-je vous aider ?"
        history.append({"role": "assistant", "content": resp})
        return {"response": resp, "tools_called": [], "tool_result": None}

    tool_name = decision.get("outil") or ""
    params    = decision.get("params") or {}
    direct    = decision.get("direct") or ""

    # Pas d'outil -> reponse directe
    if not tool_name or tool_name == "null":
        resp = direct or "Comment puis-je vous aider ?"
        history.append({"role": "assistant", "content": resp})
        return {"response": resp, "tools_called": [], "tool_result": None}

    # Outil inconnu
    fn = TOOLS.get(tool_name)
    if not fn:
        resp = f"Outil inconnu: {tool_name}"
        history.append({"role": "assistant", "content": resp})
        return {"response": resp, "tools_called": [tool_name], "tool_result": None}

    # Appel de l'outil
    try:
        clean_params = {k: v for k, v in params.items() if v is not None}
        result = await fn(**clean_params)
    except Exception as ex:
        result = {"success": False, "message": str(ex)}

    # L'outil demande une info supplementaire
    if not result.get("success") and result.get("question"):
        q = result["question"]
        history.append({"role": "assistant", "content": q})
        return {"response": q, "tools_called": [tool_name], "tool_result": result, "needs_info": True}

    # Synthese de la reponse
    synth_prompt = (
        f"L utilisateur a dit: {message}\n"
        f"Action realisee ({tool_name}): {json.dumps(result, ensure_ascii=False)[:500]}\n"
        f"Ecris une confirmation courte et naturelle en francais (2 phrases max). "
        f"Pas de JSON, pas de markdown."
    )
    synth = await call_gemini(synth_prompt, temperature=0.5)

    if synth.startswith("ERREUR") or synth.startswith("QUOTA"):
        synth = result.get("message", "Action realisee avec succes.")

    history.append({"role": "assistant", "content": synth})
    return {"response": synth, "tools_called": [tool_name], "tool_result": result}

# ─── APP WEB ─────────────────────────────────────────────────────────────────
app = FastAPI(title="PME Brain")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Base de donnees OK")

@app.post("/chat")
async def chat(req: Request):
    body = await req.json()
    msg  = (body.get("message") or "").strip()
    if not msg:
        return JSONResponse({"error": "vide"}, status_code=400)
    return JSONResponse(await process(msg))

@app.get("/status")
async def status():
    async with Session() as s:
        np = (await s.execute(select(func.count(Produit.id)))).scalar()
        nc = (await s.execute(select(func.count(Client.id)))).scalar()
        nr = (await s.execute(select(func.count(Reservation.id)))).scalar()
        er = await s.execute(select(Entreprise).limit(1))
        e  = er.scalar_one_or_none()
    return {
        "gemini": "ok" if GEMINI_API_KEY else "manquant",
        "modele": MODEL,
        "entreprise": e.nom if e else "non configuree",
        "produits": np, "clients": nc, "reservations": nr
    }

@app.get("/test-gemini")
async def test_gemini():
    if not GEMINI_API_KEY:
        return {"ok": False, "erreur": "GEMINI_API_KEY absente du .env"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        try:
            r = await client.post(
                GEMINI_URL,
                json={"contents": [{"role": "user", "parts": [{"text": "reponds juste: ok"}]}],
                      "generationConfig": {"maxOutputTokens": 5}},
                headers={"x-goog-api-key": GEMINI_API_KEY}
            )
            if r.status_code == 200:
                return {"ok": True, "modele": MODEL, "reponse": r.json()["candidates"][0]["content"]["parts"][0]["text"]}
            elif r.status_code == 429:
                return {"ok": True, "modele": MODEL,
                        "note": "Cle valide mais quota 429 — attendez 60s avant d utiliser le chat"}
            else:
                try:
                    msg = r.json().get("error", {}).get("message", "")[:200]
                except Exception:
                    msg = str(r.status_code)
                return {"ok": False, "code": r.status_code, "erreur": msg,
                        "conseil": "Si 404: essayez GEMINI_MODEL=gemini-2.5-flash dans .env"}
        except Exception as ex:
            return {"ok": False, "erreur": str(ex)}

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
        return HTMLResponse(
            "<h2>ui.html manquant</h2>"
            "<p>Placez ui.html dans le meme dossier que pme_final.py</p>",
            status_code=500
        )

if __name__ == "__main__":
    import uvicorn
    print()
    print("=" * 50)
    print("  >>> PME Brain FINAL - pme_final.py <<<")
    print("=" * 50)
    print(f"  Cle Gemini : {'OK (' + GEMINI_API_KEY[:8] + '...)' if GEMINI_API_KEY else 'MANQUANTE'}")
    print(f"  Modele     : {MODEL}")
    print(f"  App        : http://localhost:8000")
    print(f"  Test cle   : http://localhost:8000/test-gemini")
    print("=" * 50)
    print()
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="warning")
