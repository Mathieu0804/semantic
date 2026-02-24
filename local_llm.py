"""
local_llm.py — Adaptateur LLM Local (Ollama)
Remplace call_gemini() par call_local_llm() dans pme_final.py.
Zéro donnée sort de la machine. Zéro coût API.
"""

import asyncio
import json
import logging
import os
from typing import Optional

import httpx

logger = logging.getLogger("pme.local_llm")

# ─── CONFIG ──────────────────────────────────────────────────────
# Ollama tourne sur localhost par défaut
# Pour un serveur dédié sur le réseau local : changer l'IP
OLLAMA_HOST  = os.getenv("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen2.5:14b")

# Fallback si Ollama n'est pas dispo : essayer un second modèle
OLLAMA_FALLBACK = os.getenv("OLLAMA_FALLBACK", "mistral:7b")

logger.info(f"LLM Local: {OLLAMA_HOST} | Modèle: {OLLAMA_MODEL}")


# ─── VÉRIFICATION OLLAMA ─────────────────────────────────────────

async def check_ollama() -> dict:
    """Vérifie qu'Ollama tourne et que le modèle est disponible."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            # Vérifier que le serveur répond
            r = await client.get(f"{OLLAMA_HOST}/api/tags")
            if r.status_code != 200:
                return {"ok": False, "error": f"Ollama HTTP {r.status_code}"}

            models = [m["name"] for m in r.json().get("models", [])]
            model_available = any(OLLAMA_MODEL in m for m in models)

            return {
                "ok": True,
                "models_disponibles": models,
                "modele_principal": OLLAMA_MODEL,
                "modele_charge": model_available,
                "conseil": "" if model_available else f"Lancer: ollama pull {OLLAMA_MODEL}",
            }
    except httpx.ConnectError:
        return {
            "ok": False,
            "error": "Ollama non démarré",
            "conseil": "Lancer: ollama serve"
        }
    except Exception as e:
        return {"ok": False, "error": str(e)}


# ─── APPEL LLM LOCAL ─────────────────────────────────────────────

async def call_local_llm(
    prompt: str,
    temperature: float = 0.3,
    retries: int = 3,
    model: Optional[str] = None,
    max_tokens: int = 1500,
) -> str:
    """
    Remplace call_gemini() — même signature, même comportement.
    Appelle Ollama en local. Zéro réseau externe.

    Args:
        prompt      : le prompt complet
        temperature : créativité (0=précis, 1=créatif)
        retries     : tentatives en cas d'erreur
        model       : forcer un modèle spécifique
        max_tokens  : longueur max de la réponse
    """
    target_model = model or OLLAMA_MODEL

    payload = {
        "model": target_model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
            "top_p": 0.9,
            # Optimisations pour la cohérence JSON
            "repeat_penalty": 1.1,
            "stop": ["</s>", "[/INST]", "###"],
        }
    }

    for attempt in range(1, retries + 1):
        try:
            async with httpx.AsyncClient(
                timeout=httpx.Timeout(120.0, connect=10.0)  # LLM local peut être lent
            ) as client:
                r = await client.post(
                    f"{OLLAMA_HOST}/api/generate",
                    json=payload,
                )

            if r.status_code == 200:
                data = r.json()
                text = data.get("response", "")
                tokens = data.get("eval_count", 0)
                duration = data.get("eval_duration", 0) / 1e9  # ns → s
                speed = tokens / duration if duration > 0 else 0
                logger.info(
                    f"[LOCAL LLM] OK | {tokens} tokens | "
                    f"{speed:.1f} tok/s | {len(text)} chars"
                )
                return text

            elif r.status_code == 404:
                # Modèle non trouvé → essayer le fallback
                if target_model != OLLAMA_FALLBACK and attempt == 1:
                    logger.warning(
                        f"[LOCAL LLM] Modèle {target_model} introuvable, "
                        f"fallback vers {OLLAMA_FALLBACK}"
                    )
                    target_model = OLLAMA_FALLBACK
                    payload["model"] = target_model
                    continue
                return f"ERREUR: Modèle {target_model} non disponible. Lancer: ollama pull {target_model}"

            else:
                logger.error(f"[LOCAL LLM] HTTP {r.status_code}")
                if attempt < retries:
                    await asyncio.sleep(2)
                    continue
                return f"ERREUR_HTTP: {r.status_code}"

        except httpx.ConnectError:
            if attempt < retries:
                logger.warning(f"[LOCAL LLM] Connexion refusée (tentative {attempt}), retry dans 3s...")
                await asyncio.sleep(3)
                continue
            return "ERREUR: Ollama non joignable. Vérifier que 'ollama serve' tourne."

        except httpx.ReadTimeout:
            if attempt < retries:
                logger.warning(f"[LOCAL LLM] Timeout (tentative {attempt}), le modèle charge peut-être...")
                await asyncio.sleep(10)
                continue
            return "ERREUR: Timeout LLM local. Essayer un modèle plus petit (mistral:7b)."

        except Exception as e:
            logger.error(f"[LOCAL LLM] Exception: {e}")
            return f"ERREUR: {e}"

    return "ERREUR: Toutes les tentatives ont échoué"


# ─── VERSION CHAT (avec historique messages) ─────────────────────

async def call_local_chat(
    messages: list,
    temperature: float = 0.3,
    model: Optional[str] = None,
    max_tokens: int = 1500,
) -> str:
    """
    Version chat d'Ollama (messages multiples avec rôles).
    Meilleure cohérence pour les conversations longues.

    messages format: [{"role": "user"/"assistant"/"system", "content": "..."}]
    """
    target_model = model or OLLAMA_MODEL

    payload = {
        "model": target_model,
        "messages": messages,
        "stream": False,
        "options": {
            "temperature": temperature,
            "num_predict": max_tokens,
            "repeat_penalty": 1.1,
        }
    }

    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(120.0)) as client:
            r = await client.post(f"{OLLAMA_HOST}/api/chat", json=payload)
        if r.status_code == 200:
            return r.json()["message"]["content"]
        return f"ERREUR_HTTP: {r.status_code}"
    except httpx.ConnectError:
        return "ERREUR: Ollama non joignable."
    except Exception as e:
        return f"ERREUR: {e}"


# ─── EMBEDDINGS LOCAUX (pour mémoire vectorielle) ────────────────

async def embed_local(text: str, model: str = "nomic-embed-text") -> list:
    """
    Génère des embeddings localement pour la mémoire vectorielle.
    Modèle léger dédié : ollama pull nomic-embed-text (274 Mo)
    
    Utilisé pour retrouver les schémas JSON-LD similaires déjà optimisés.
    """
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            r = await client.post(
                f"{OLLAMA_HOST}/api/embeddings",
                json={"model": model, "prompt": text}
            )
        if r.status_code == 200:
            return r.json().get("embedding", [])
        return []
    except Exception:
        return []


# ─── GESTIONNAIRE DE MODÈLES ─────────────────────────────────────

class ModelManager:
    """
    Gère plusieurs modèles locaux selon la tâche.
    Chaque tâche utilise le modèle le plus adapté.
    """

    TASK_MODELS = {
        # Tâches rapides et fréquentes → modèle léger
        "classification": "mistral:7b",
        "extraction_json": "mistral:7b",

        # Tâches de raisonnement → modèle intermédiaire
        "planification": "qwen2.5:14b",
        "analyse_seo": "qwen2.5:14b",
        "rapport": "qwen2.5:14b",

        # Tâches créatives → modèle plus puissant si dispo
        "redaction_page": "llama3.3:70b",
        "generation_contenu": "llama3.3:70b",

        # Analyse critique / éthique → modèle conservateur
        "gardien_marque": "deepseek-r1:14b",
    }

    def __init__(self):
        self.available_models: list = []

    async def refresh_available(self):
        """Met à jour la liste des modèles disponibles."""
        status = await check_ollama()
        self.available_models = status.get("models_disponibles", [])

    def get_model_for_task(self, task: str) -> str:
        """Retourne le meilleur modèle disponible pour une tâche."""
        preferred = self.TASK_MODELS.get(task, OLLAMA_MODEL)

        # Si le modèle préféré est dispo, l'utiliser
        if any(preferred in m for m in self.available_models):
            return preferred

        # Sinon, fallback sur le modèle principal
        if any(OLLAMA_MODEL in m for m in self.available_models):
            return OLLAMA_MODEL

        # Dernier recours
        return OLLAMA_FALLBACK

    async def call_for_task(self, task: str, prompt: str, temperature: float = 0.3) -> str:
        """Appelle le bon modèle pour une tâche donnée."""
        model = self.get_model_for_task(task)
        logger.info(f"[MODEL MGR] Tâche '{task}' → modèle '{model}'")
        return await call_local_llm(prompt, temperature=temperature, model=model)


# ─── ADAPTATION pme_final.py ─────────────────────────────────────

def get_pme_compatible_caller():
    """
    Retourne une fonction call_gemini() compatible avec pme_final.py
    mais qui appelle Ollama en local.

    Usage dans pme_final.py :
        # Remplacer :
        from local_llm import get_pme_compatible_caller
        call_gemini = get_pme_compatible_caller()
    """
    async def _call(prompt: str, temperature: float = 0.3, retries: int = 3) -> str:
        return await call_local_llm(prompt, temperature=temperature, retries=retries)

    return _call


# ─── TEST STANDALONE ─────────────────────────────────────────────

async def _test():
    print("=== TEST LLM LOCAL ===\n")

    # 1. Vérifier Ollama
    status = await check_ollama()
    print(f"Ollama status: {json.dumps(status, indent=2, ensure_ascii=False)}")

    if not status["ok"]:
        print(f"\n⚠️  {status.get('conseil', '')}")
        print("Instructions:")
        print("  1. curl -fsSL https://ollama.ai/install.sh | sh")
        print("  2. ollama serve &")
        print(f"  3. ollama pull {OLLAMA_MODEL}")
        return

    # 2. Test simple
    print("\n📝 Test de génération...")
    response = await call_local_llm(
        "Réponds uniquement en JSON: {\"statut\": \"ok\", \"message\": \"LLM local opérationnel\"}",
        temperature=0.1
    )
    print(f"Réponse: {response[:200]}")

    # 3. Test JSON (critique pour PME Brain)
    print("\n🔧 Test extraction JSON (PME Brain)...")
    prompt = """Tu es l'assistant IA d'une PME. REPONDS UNIQUEMENT EN JSON.
Message: "Ajoute un produit: Croissant, 1.50 euros, stock 50"
JSON: {"outil": "ajouter_produit", "params": {"nom": "Croissant", "prix": 1.50, "stock": 50}, "direct": ""}"""

    response = await call_local_llm(prompt, temperature=0.1)
    print(f"Réponse JSON: {response[:300]}")

    # 4. Embeddings
    print("\n🧮 Test embeddings locaux...")
    embedding = await embed_local("Produit artisanal boulangerie")
    print(f"Embedding: {len(embedding)} dimensions")

    print("\n✅ LLM local opérationnel et souverain!")


if __name__ == "__main__":
    asyncio.run(_test())
