#!/bin/bash

###############################################################################
# SEMANTIC PLATFORM - SCRIPT D'INSTALLATION AUTOMATIQUE
###############################################################################
# 
# Ce script installe TOUT ce dont vous avez besoin :
# - Ollama (serveur IA local)
# - Modèle Llama 3.1 8B
# - Node.js 20
# - PostgreSQL
# - Toutes les dépendances
# 
# Usage : bash install.sh
#
###############################################################################

set -e  # Arrêter en cas d'erreur

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  🧬 SEMANTIC PLATFORM - Installation Automatique            ║"
echo "║  ══════════════════════════════════════════════════════      ║"
echo "║  Ce script va installer :                                    ║"
echo "║  • Ollama (IA locale)                                        ║"
echo "║  • Llama 3.1 8B                                              ║"
echo "║  • Node.js 20                                                ║"
echo "║  • PostgreSQL                                                ║"
echo "║  • Toutes les dépendances                                    ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Détecter l'OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    echo "✅ Système détecté : Linux"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="mac"
    echo "✅ Système détecté : macOS"
else
    echo "❌ Système non supporté : $OSTYPE"
    exit 1
fi

echo ""
echo "🔍 Vérification des permissions..."
if [ "$EUID" -eq 0 ]; then 
   echo "⚠️  Ne pas lancer avec sudo, on demandera le mot de passe si nécessaire"
   exit 1
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 1/7 : Installation de Ollama (IA locale)"
echo "══════════════════════════════════════════════════════════════"

if command -v ollama &> /dev/null; then
    echo "✅ Ollama déjà installé"
    ollama --version
else
    echo "📥 Téléchargement et installation de Ollama..."
    curl -fsSL https://ollama.com/install.sh | sh
    echo "✅ Ollama installé"
fi

# Démarrer Ollama en arrière-plan
echo "🚀 Démarrage de Ollama..."
if [ "$OS" == "mac" ]; then
    # Sur Mac, Ollama se lance via l'app
    open -a Ollama 2>/dev/null || ollama serve &
else
    # Sur Linux
    ollama serve > /tmp/ollama.log 2>&1 &
fi

sleep 3  # Attendre que le serveur démarre

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 2/7 : Téléchargement du modèle IA (Llama 3.1 8B)"
echo "══════════════════════════════════════════════════════════════"
echo "⚠️  Attention : ~4.7GB à télécharger, peut prendre 10-30 min"
echo ""

if ollama list | grep -q "llama3.1:8b"; then
    echo "✅ Llama 3.1 8B déjà téléchargé"
else
    echo "📥 Téléchargement de Llama 3.1 8B..."
    ollama pull llama3.1:8b
    echo "✅ Modèle téléchargé"
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 3/7 : Installation de Node.js 20"
echo "══════════════════════════════════════════════════════════════"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        echo "✅ Node.js $NODE_VERSION déjà installé"
    else
        echo "⚠️  Node.js $NODE_VERSION trop ancien, installation de v20..."
        if [ "$OS" == "linux" ]; then
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
        else
            brew install node@20
        fi
    fi
else
    echo "📥 Installation de Node.js 20..."
    if [ "$OS" == "linux" ]; then
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
    else
        brew install node@20
    fi
    echo "✅ Node.js installé"
fi

node --version
npm --version

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 4/7 : Installation de PostgreSQL"
echo "══════════════════════════════════════════════════════════════"

if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL déjà installé"
else
    echo "📥 Installation de PostgreSQL..."
    if [ "$OS" == "linux" ]; then
        sudo apt-get update
        sudo apt-get install -y postgresql postgresql-contrib
    else
        brew install postgresql@14
        brew services start postgresql@14
    fi
    echo "✅ PostgreSQL installé"
fi

# Démarrer PostgreSQL
if [ "$OS" == "linux" ]; then
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 5/7 : Installation des dépendances Node.js"
echo "══════════════════════════════════════════════════════════════"

echo "📥 Installation des packages npm..."
npm install

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 6/7 : Configuration de la base de données"
echo "══════════════════════════════════════════════════════════════"

echo "🗄️  Création de la base de données..."

if [ "$OS" == "linux" ]; then
    sudo -u postgres psql -c "CREATE DATABASE semantic;" 2>/dev/null || echo "Base déjà existante"
    sudo -u postgres psql -c "CREATE USER semantic WITH PASSWORD 'semantic123';" 2>/dev/null || echo "Utilisateur déjà existant"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE semantic TO semantic;" 2>/dev/null
else
    psql postgres -c "CREATE DATABASE semantic;" 2>/dev/null || echo "Base déjà existante"
    psql postgres -c "CREATE USER semantic WITH PASSWORD 'semantic123';" 2>/dev/null || echo "Utilisateur déjà existant"
fi

echo "✅ Base de données configurée"

echo ""
echo "══════════════════════════════════════════════════════════════"
echo "  ÉTAPE 7/7 : Configuration finale"
echo "══════════════════════════════════════════════════════════════"

# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cat > .env << 'EOF'
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL=postgresql://semantic:semantic123@localhost:5432/semantic

# Ollama (IA locale)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# URLs
BASE_URL=http://localhost:3000
EOF
    echo "✅ Fichier .env créé"
else
    echo "✅ Fichier .env déjà existant"
fi

# Créer les dossiers nécessaires
mkdir -p data/logs
mkdir -p data/imports
mkdir -p data/brand-dna
mkdir -p data/fine-tuning
mkdir -p data/learning
mkdir -p uploads

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║  ✅ INSTALLATION TERMINÉE !                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "🎉 Tout est prêt !"
echo ""
echo "Pour démarrer la plateforme :"
echo ""
echo "  1. Lancer le serveur :"
echo "     npm start"
echo ""
echo "  2. Ouvrir votre navigateur :"
echo "     http://localhost:3000/dashboard.html"
echo ""
echo "📚 Documentation disponible dans le dossier /docs/"
echo ""
echo "🆘 Besoin d'aide ? support@semanticplatform.com"
echo ""
