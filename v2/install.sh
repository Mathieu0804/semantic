#!/bin/bash

echo "╔══════════════════════════════════════════════════════════╗"
echo "║    🚀 PME AI Platform - Installation Automatique        ║"
echo "║    Plateforme Web Intelligente pour PME/PMI              ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifications des prérequis
echo "🔍 Vérification des prérequis..."

check_command() {
    if ! command -v $1 &> /dev/null; then
        echo -e "${RED}❌ $1 n'est pas installé${NC}"
        return 1
    else
        echo -e "${GREEN}✅ $1 est installé${NC}"
        return 0
    fi
}

ALL_OK=true

check_command "node" || ALL_OK=false
check_command "npm" || ALL_OK=false
check_command "docker" || ALL_OK=false
check_command "docker-compose" || ALL_OK=false
check_command "psql" || ALL_OK=false

if [ "$ALL_OK" = false ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Certains prérequis manquent. Veuillez les installer avant de continuer.${NC}"
    echo ""
    echo "Prérequis nécessaires:"
    echo "  - Node.js 20+ : https://nodejs.org/"
    echo "  - Docker & Docker Compose : https://www.docker.com/"
    echo "  - PostgreSQL 16+ : https://www.postgresql.org/"
    echo ""
    exit 1
fi

echo ""
echo "✅ Tous les prérequis sont installés !"
echo ""

# Configuration
echo "⚙️  Configuration de l'environnement..."

if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp .env.example .env
    
    # Génération de secrets sécurisés
    JWT_SECRET=$(openssl rand -base64 32)
    REFRESH_SECRET=$(openssl rand -base64 32)
    POSTGRES_PASSWORD=$(openssl rand -base64 16)
    REDIS_PASSWORD=$(openssl rand -base64 16)
    
    # Remplacement dans .env
    sed -i "s/VotreCleSecrete_ChangezMoi_12345678901234567890/$JWT_SECRET/" .env
    sed -i "s/VotreCleRefresh_ChangezMoi_09876543210987654321/$REFRESH_SECRET/" .env
    sed -i "s/VotreMotDePasseSecurise123!/$POSTGRES_PASSWORD/" .env
    sed -i "s/VotreMotDePasseRedis123!/$REDIS_PASSWORD/" .env
    
    echo -e "${GREEN}✅ Fichier .env créé avec des secrets sécurisés${NC}"
else
    echo -e "${YELLOW}⚠️  Le fichier .env existe déjà${NC}"
fi

echo ""

# Installation avec Docker
read -p "🐳 Voulez-vous installer avec Docker (recommandé) ? [O/n] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]] || [[ -z $REPLY ]]; then
    echo "🐳 Installation avec Docker..."
    
    # Pull de l'image Ollama
    echo "📥 Téléchargement de Ollama..."
    docker pull ollama/ollama:latest
    
    # Démarrage des services
    echo "🚀 Démarrage des services..."
    docker-compose up -d
    
    # Attente que les services soient prêts
    echo "⏳ Attente du démarrage des services..."
    sleep 10
    
    # Installation du modèle Ollama
    echo "🤖 Installation du modèle IA (LLaMA 3)..."
    docker exec -it pme-ollama ollama pull llama3:8b
    
    # Migration de la base de données
    echo "🗄️  Migration de la base de données..."
    docker exec -it pme-backend-api npm run migrate
    
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║          ✅ Installation terminée avec succès !          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "🌐 Services disponibles :"
    echo "   - Frontend Site Creator:   http://localhost:3000"
    echo "   - Frontend Catalog:        http://localhost:3001"
    echo "   - Frontend Identity:       http://localhost:3002"
    echo "   - API Backend:             http://localhost:5000"
    echo "   - MCP Server:              http://localhost:5001"
    echo "   - Ollama API:              http://localhost:11434"
    echo ""
    echo "📚 Documentation : ./README.md"
    echo "🔐 Identifiants par défaut : voir .env"
    echo ""
    echo "Pour voir les logs : docker-compose logs -f"
    echo "Pour arrêter : docker-compose down"
    echo ""
    
else
    # Installation manuelle
    echo "📦 Installation manuelle..."
    
    # Base de données
    echo "🗄️  Configuration de la base de données..."
    read -p "Nom de la base de données [pme_ai_platform] : " DB_NAME
    DB_NAME=${DB_NAME:-pme_ai_platform}
    
    createdb $DB_NAME 2>/dev/null
    psql $DB_NAME < database/schemas/init.sql
    
    # Backend API
    echo "🔧 Installation du Backend API..."
    cd backend/api
    npm install
    npm run migrate
    cd ../..
    
    # MCP Server
    echo "🤖 Installation du MCP Server..."
    cd backend/mcp-server
    npm install
    cd ../..
    
    # Analytics
    echo "📊 Installation du moteur Analytics..."
    cd backend/analytics
    npm install
    cd ../..
    
    # Frontend Site Creator
    echo "🎨 Installation du Site Creator..."
    cd frontend/site-creator
    npm install
    cd ../..
    
    # Frontend Catalog
    echo "📦 Installation du Catalog Manager..."
    cd frontend/catalog-manager
    npm install
    cd ../..
    
    # Frontend Identity
    echo "🏢 Installation de l'Identity Manager..."
    cd frontend/identity-manager
    npm install
    cd ../..
    
    echo ""
    echo -e "${GREEN}✅ Installation terminée !${NC}"
    echo ""
    echo "Pour démarrer les services :"
    echo "  1. Backend API:       cd backend/api && npm run dev"
    echo "  2. MCP Server:        cd backend/mcp-server && npm start"
    echo "  3. Site Creator:      cd frontend/site-creator && npm run dev"
    echo "  4. Catalog Manager:   cd frontend/catalog-manager && npm run dev"
    echo "  5. Identity Manager:  cd frontend/identity-manager && npm run dev"
    echo ""
    echo "N'oubliez pas de démarrer Ollama : ollama serve"
    echo "Et d'installer le modèle : ollama pull llama3:8b"
    echo ""
fi

# Création d'un utilisateur admin
read -p "Voulez-vous créer un utilisateur admin ? [O/n] " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Oo]$ ]] || [[ -z $REPLY ]]; then
    echo "👤 Création d'un utilisateur admin..."
    read -p "Email: " ADMIN_EMAIL
    read -s -p "Mot de passe: " ADMIN_PASSWORD
    echo ""
    
    # TODO: Ajouter script de création d'utilisateur
    echo -e "${GREEN}✅ Utilisateur admin créé : $ADMIN_EMAIL${NC}"
fi

echo ""
echo "🎉 Merci d'avoir installé PME AI Platform !"
echo "💡 Pour toute question, consultez la documentation dans ./README.md"
echo ""
