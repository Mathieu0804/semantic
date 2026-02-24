# PME Brain Souverain 🧠

**Assistant IA pour PME — 100% local, zéro cloud, zéro abonnement**

LLM local (Ollama) + Agents RL autonomes + Optimisation sémantique continue.
Vos données ne quittent jamais votre machine.

---

## Structure du Dépôt

```
/
├── pme_sovereign.py        ← Point d'entrée principal — lancer ce fichier
├── local_llm.py            ← Adaptateur Ollama (remplace Gemini/Claude)
├── semantic_module.py      ← Agents RL + Scorer JSON-LD + Gardien Marque
├── scraper_tool.py         ← Collecte données externes (optionnel)
├── page_generator.py       ← Génère les pages HTML post-optimisation RL
├── ui.html                 ← Interface chat (VOTRE FICHIER EXISTANT)
├── requirements.txt        ← Dépendances Python
├── .env.example            ← Template de configuration → copier en .env
├── setup_sovereign.sh      ← Script d'installation automatique (Linux)
└── README.md
```

> **`ui.html`** n'est pas dans ce dépôt — c'est votre fichier existant de `pme_final.py`.
> Copiez-le dans ce dossier, il fonctionnera sans modification.

---

## Installation Rapide (Linux/Ubuntu)

```bash
# 1. Cloner le dépôt
git clone https://github.com/VOTRE_COMPTE/pme-brain-souverain.git
cd pme-brain-souverain

# 2. Lancer le script d'installation automatique
chmod +x setup_sovereign.sh
./setup_sovereign.sh
# → Installe Ollama, télécharge les modèles, configure le service

# 3. Copier et configurer
cp .env.example .env
# Éditer .env si besoin (OLLAMA_HOST, OLLAMA_MODEL)

# 4. Copier votre ui.html existant
cp /chemin/vers/votre/ui.html .

# 5. Lancer
python pme_sovereign.py
```

**L'app tourne sur http://localhost:8000**

---

## Installation Manuelle (Windows/Mac/Linux)

```bash
# Prérequis : Python 3.11+, Node.js (optionnel)

# 1. Installer Ollama
# → https://ollama.ai/download
ollama serve &
ollama pull qwen2.5:14b      # Modèle principal (9 Go)
ollama pull mistral:7b        # Modèle fallback (4 Go)
ollama pull nomic-embed-text  # Embeddings (274 Mo)

# 2. Environnement Python
python -m venv venv
source venv/bin/activate   # Linux/Mac
# venv\Scripts\activate    # Windows

pip install -r requirements.txt

# 3. Configuration
cp .env.example .env

# 4. Lancer
python pme_sovereign.py
```

---

## Vérifications

```bash
# LLM local opérationnel ?
http://localhost:8000/test-llm

# Statut général
http://localhost:8000/status

# Tester le chat
http://localhost:8000
```

---

## Les 4 Outils Sémantiques (via le chat)

| Commande | Ce qui se passe |
|----------|-----------------|
| `"Analyse le SEO de mes produits"` | Score sémantique de chaque produit en DB |
| `"Optimise les métadonnées du produit 3"` | Agent RL tourne 30 épisodes, Gardien Marque filtre |
| `"Génère la page web du produit 3"` | Page HTML complète avec JSON-LD optimisé |
| `"Donne-moi le rapport sémantique"` | Rapport de couverture global |

---

## Fichiers Générés Automatiquement

```
semantic_outputs/
├── jsonld/
│   ├── jsonld_best.json              ← Meilleur graphe JSON-LD trouvé
│   └── product_N_optimized.json      ← JSON-LD par produit
├── pages/
│   └── product_N.html               ← Pages HTML prêtes à déployer
├── reports/
│   └── FINAL_SEMANTIC_REPORT.md     ← Rapport de couverture
└── scores.json                       ← Historique des scores RL

scraper_cache/                        ← Données concurrents (local)
pme_memory.json                       ← Mémoire conversationnelle locale
pme_brain.db                          ← Base de données SQLite
```

---

## Matériel Recommandé

| Config | GPU | RAM | Modèle | Coût |
|--------|-----|-----|--------|------|
| Minimum | RTX 3060 12Go | 16 Go | qwen2.5:14b | ~900 € |
| Recommandé | RTX 4070 16Go | 32 Go | qwen2.5:14b | ~1 500 € |
| Premium | RTX 4090 24Go | 64 Go | llama3.3:70b | ~4 000 € |

**Sans GPU** : `mistral:7b` tourne en CPU (lent mais fonctionnel, ~30 sec/réponse).

---

## Architecture en Une Ligne

```
Chat (ui.html) → FastAPI (pme_sovereign.py) → Ollama LLM local
                                            → Agent RL (semantic_module.py)
                                            → Scraper optionnel (scraper_tool.py)
                                            → Générateur pages (page_generator.py)
```

---

## Dépendances Clés

| Package | Rôle |
|---------|------|
| `fastapi` + `uvicorn` | Serveur web |
| `sqlalchemy` + `aiosqlite` | Base de données locale |
| `httpx` | Requêtes HTTP vers Ollama et scrapers |
| `torch` + `numpy` | Agents RL (CPU, pas besoin de GPU) |
| `python-dotenv` | Gestion de la config `.env` |

---

## Souveraineté — Ce qui Ne Sort Jamais de Votre Machine

- Données clients et réservations (SQLite local)
- Conversations avec l'assistant (pme_memory.json local)
- JSON-LD optimisés et pages générées (semantic_outputs/ local)
- Modèle LLM (stocké dans ~/.ollama/models/)
- Poids des agents RL (RAM locale)

**Le seul trafic réseau externe** : le scraper optionnel qui lit les pages publiques de vos concurrents.
