#!/bin/bash

echo "🚀 Installation de PME IA Assistant"
echo "===================================="
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js n'est pas installé"
    echo "Télécharger: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) détecté"

# Vérifier Ollama
if ! command -v ollama &> /dev/null; then
    echo "⚠️  Ollama n'est pas installé"
    echo "Installation recommandée:"
    echo "  curl https://ollama.ai/install.sh | sh"
    echo ""
    read -p "Continuer sans Ollama? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ Ollama détecté"
    
    # Vérifier modèle llama3
    if ollama list | grep -q "llama3"; then
        echo "✅ Modèle llama3 installé"
    else
        echo "⚠️  Modèle llama3 non trouvé"
        read -p "Télécharger llama3? (Y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            echo "📥 Téléchargement de llama3..."
            ollama pull llama3
        fi
    fi
fi

# Installer dépendances
echo ""
echo "📦 Installation des dépendances..."
npm install

# Configurer .env
if [ ! -f .env ]; then
    echo "⚙️  Configuration de l'environnement..."
    cp .env.example .env
    echo "✅ Fichier .env créé"
    echo "   Éditez .env si nécessaire"
fi

# Initialiser la base de données
echo ""
echo "🗄️  Initialisation de la base de données..."
npm run db:push

echo ""
echo "✅ Installation terminée !"
echo ""
echo "Pour démarrer l'application:"
echo "  1. Assurez-vous qu'Ollama est en cours d'exécution (ollama serve)"
echo "  2. Lancez: npm run dev"
echo "  3. Ouvrez: http://localhost:3000"
echo ""
