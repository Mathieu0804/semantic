#!/bin/bash
# setup_sovereign.sh — Installation complète du système souverain
# Lance ce script une seule fois sur ton serveur Ubuntu
# Tout tourne en local, zéro cloud, zéro abonnement

set -e
echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║     PME Brain Souverain — Installation Automatique      ║"
echo "║     LLM Local + RL + SEO — 100% sur ta machine         ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# ─── ÉTAPE 1 : Système ───────────────────────────────────────────
echo "▶ [1/6] Mise à jour du système..."
sudo apt-get update -qq
sudo apt-get install -y -qq \
    python3.11 python3.11-venv python3-pip \
    git curl wget nginx supervisor \
    htop nvtop \  
    chromium-browser chromium-chromedriver  # Pour les scrapers

# ─── ÉTAPE 2 : Ollama ────────────────────────────────────────────
echo ""
echo "▶ [2/6] Installation d'Ollama (LLM local)..."
if ! command -v ollama &> /dev/null; then
    curl -fsSL https://ollama.ai/install.sh | sh
    echo "✓ Ollama installé"
else
    echo "✓ Ollama déjà présent"
fi

# Démarrer Ollama comme service systemd
sudo tee /etc/systemd/system/ollama.service > /dev/null <<EOF
[Unit]
Description=Ollama LLM Server
After=network.target

[Service]
ExecStart=/usr/local/bin/ollama serve
User=$USER
Restart=always
RestartSec=3
Environment=OLLAMA_HOST=0.0.0.0:11434
Environment=OLLAMA_MODELS=/opt/ollama/models
Environment=OLLAMA_NUM_PARALLEL=2

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
echo "✓ Ollama démarré comme service"

# ─── ÉTAPE 3 : Télécharger les modèles ──────────────────────────
echo ""
echo "▶ [3/6] Téléchargement des modèles LLM..."
echo "   (Cette étape peut prendre 10-30 minutes selon la connexion)"
echo ""

# Modèle principal : meilleur français + raisonnement
echo "   Téléchargement qwen2.5:14b (9 Go)..."
ollama pull qwen2.5:14b

# Modèle rapide pour les tâches fréquentes
echo "   Téléchargement mistral:7b (4.1 Go)..."
ollama pull mistral:7b

# Modèle pour les embeddings (mémoire vectorielle)
echo "   Téléchargement nomic-embed-text (274 Mo)..."
ollama pull nomic-embed-text

echo "✓ Modèles téléchargés"

# ─── ÉTAPE 4 : Environnement Python ─────────────────────────────
echo ""
echo "▶ [4/6] Environnement Python..."
cd /opt
sudo mkdir -p pme_brain
sudo chown $USER:$USER pme_brain
cd pme_brain

python3.11 -m venv venv
source venv/bin/activate

pip install --quiet \
    fastapi uvicorn[standard] \
    sqlalchemy[asyncio] aiosqlite \
    httpx python-dotenv \
    torch numpy \
    playwright \
    chromadb \  # Base vectorielle locale
    sentence-transformers

playwright install chromium

echo "✓ Dépendances installées"

# ─── ÉTAPE 5 : Configuration .env ───────────────────────────────
echo ""
echo "▶ [5/6] Fichier de configuration..."

cat > /opt/pme_brain/.env <<EOF
# LLM LOCAL — Ollama
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=qwen2.5:14b
OLLAMA_FALLBACK=mistral:7b

# PME Brain
DATABASE_URL=sqlite+aiosqlite:///./pme_brain.db

# Désactiver les APIs cloud (souveraineté)
GEMINI_API_KEY=
ANTHROPIC_API_KEY=

# Scheduler
SCHEDULER_HOUR=3
SCHEDULER_MINUTE=0
EOF

echo "✓ Configuration créée"

# ─── ÉTAPE 6 : Service PME Brain ────────────────────────────────
echo ""
echo "▶ [6/6] Service PME Brain..."

sudo tee /etc/systemd/system/pme-brain.service > /dev/null <<EOF
[Unit]
Description=PME Brain Souverain
After=network.target ollama.service

[Service]
WorkingDirectory=/opt/pme_brain
ExecStart=/opt/pme_brain/venv/bin/uvicorn pme_sovereign:app --host 0.0.0.0 --port 8000
User=$USER
Restart=always
RestartSec=5
EnvironmentFile=/opt/pme_brain/.env

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable pme-brain

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALLATION TERMINÉE                                ║"
echo "╠══════════════════════════════════════════════════════════╣"
echo "║  Copier tes fichiers dans /opt/pme_brain/               ║"
echo "║  puis lancer :                                           ║"
echo "║                                                          ║"
echo "║  sudo systemctl start pme-brain                         ║"
echo "║  http://localhost:8000                                   ║"
echo "║                                                          ║"
echo "║  VÉRIFICATIONS :                                         ║"
echo "║  ollama list          → modèles disponibles              ║"
echo "║  ollama ps            → modèle en mémoire               ║"
echo "║  systemctl status ollama                                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""
