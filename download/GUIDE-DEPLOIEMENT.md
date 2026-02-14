# Guide de Déploiement - Plateforme IA PME

## Table des matières
1. [Publication sur GitHub](#1-publication-sur-github)
2. [Déploiement sur serveur distant](#2-déploiement-sur-serveur-distant)
3. [Configuration du serveur MCP](#3-configuration-du-serveur-mcp)
4. [Tests et validation](#4-tests-et-validation)

---

## 1. Publication sur GitHub

### Étape 1: Initialiser le dépôt Git

```bash
# Dans le dossier du projet
cd plateforme-ia-pme

# Initialiser git si ce n'est pas fait
git init

# Créer le fichier .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
.pnp
.pnp.js

# Build
.next/
out/
build/
dist/

# Database
*.db
*.db-journal
prisma/*.db

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Misc
.vercel
.turbo
*.pem
EOF

# Ajouter tous les fichiers
git add .

# Commit initial
git commit -m "Initial commit - Plateforme IA PME"
```

### Étape 2: Créer le repository GitHub

```bash
# Créer le repo sur GitHub (via CLI ou interface web)
# Puis connecter et pousser:

git remote add origin https://github.com/VOTRE-USER/plateforme-ia-pme.git
git branch -M main
git push -u origin main
```

---

## 2. Déploiement sur serveur distant

### Option A: VPS (Ubuntu/Debian) - Recommandé

#### Prérequis serveur
```bash
# Sur le serveur (Ubuntu 22.04 recommandé)
# Minimum: 2 CPU, 4GB RAM, 20GB SSD

# Installer Node.js 20 et Bun
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Installer Bun
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc

# Installer PM2 pour la gestion des processus
sudo npm install -g pm2

# Installer Nginx (reverse proxy)
sudo apt install -y nginx
```

#### Cloner et configurer le projet
```bash
# Cloner le repo
git clone https://github.com/VOTRE-USER/plateforme-ia-pme.git
cd plateforme-ia-pme

# Installer les dépendances
bun install

# Créer le fichier d'environnement
cat > .env << 'EOF'
# Base de données
DATABASE_URL="file:./db/production.db"

# Configuration
NODE_ENV=production
PORT=3000

# Sécurité (générer des clés fortes)
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://votre-domaine.com"

# IA Locale (si applicable)
# AI_API_KEY="votre-cle-api"
EOF

# Initialiser la base de données
bun run db:push

# Créer le dossier de base de données
mkdir -p db
```

#### Configurer PM2
```bash
# Créer le fichier ecosystem.config.js
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'plateforme-ia-pme',
    script: 'bun',
    args: 'run start',
    cwd: '/home/user/plateforme-ia-pme',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
EOF

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la config PM2
pm2 save
pm2 startup
```

#### Configurer Nginx (Reverse Proxy)
```bash
# Créer la config Nginx
sudo cat > /etc/nginx/sites-available/plateforme-ia-pme << 'EOF'
server {
    listen 80;
    server_name votre-domaine.com www.votre-domaine.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Augmenter la limite pour l'import de fichiers
    client_max_body_size 50M;
}
EOF

# Activer le site
sudo ln -s /etc/nginx/sites-available/plateforme-ia-pme /etc/nginx/sites-enabled/

# Tester et recharger Nginx
sudo nginx -t
sudo systemctl reload nginx
```

#### Configurer HTTPS (Let's Encrypt)
```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir le certificat SSL
sudo certbot --nginx -d votre-domaine.com -d www.votre-domaine.com

# Renouvellement automatique
sudo systemctl enable certbot.timer
```

### Option B: Plateforme Cloud (Vercel, Railway)

#### Vercel (gratuit pour débuter)
```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Configurer les variables d'environnement dans le dashboard Vercel:
# DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL
```

#### Railway (base de données incluse)
```bash
# Via GitHub integration sur railway.app
# Connecter le repo et configurer les variables d'environnement
```

---

## 3. Configuration du serveur MCP

### Architecture MCP

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client IA     │───►│   Serveur MCP   │───►│   IA Locale     │
│ (Siri/Alexa/    │    │   /api/mcp      │    │   (votre PME)   │
│  Assistant)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                      │
        │                      ▼
        │              ┌─────────────────┐
        │              │   Base SQLite   │
        │              │   (Dialogues,   │
        │              │    Connexions)  │
        │              └─────────────────┘
        │
        ▼
  Token d'authentification
  (hashé SHA256)
```

### Endpoints MCP

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/mcp` | GET | Statut du serveur |
| `/api/mcp?action=connect` | POST | Créer une nouvelle connexion |
| `/api/mcp?action=request` | POST | Envoyer une requête IA |
| `/api/mcp?action=connections` | GET | Liste des connexions |
| `/api/mcp?action=stats` | GET | Statistiques |
| `/api/mcp` | DELETE | Révoquer une connexion |

### Étape 1: Activer le serveur MCP dans l'interface

1. Aller dans l'onglet **"Serveur MCP"**
2. Activer le toggle **"Activer le serveur MCP"**
3. Configurer l'URL: `https://votre-domaine.com/api/mcp`
4. Cliquer sur **"Enregistrer"**

### Étape 2: Configuration de l'IA locale

Dans l'onglet **"Identité & SEO"** > **"IA"** :

```
Personnalité de l'IA:
"Tu es l'assistant virtuel de [Nom Entreprise]. Tu représentes notre 
entreprise avec professionnalisme et bienveillance. Tu connais parfaitement 
nos produits et services. Tu aides les clients à trouver ce qu'ils cherchent 
et tu proposes des solutions adaptées à leurs besoins."

Ton de l'IA:
- Professionnel (recommandé pour B2B)
- Amical (recommandé pour B2C)
- Formel (services juridiques, banques)
- Décontracté (startups, lifestyle)

Domaines d'expertise:
"Vente de [produits], Conseil en [domaine], Service après-vente, 
Devis personnalisés, Prise de rendez-vous"
```

### Étape 3: Configuration pour les clients IA externes

#### Exemple d'intégration pour un assistant IA externe

```javascript
// Configuration client MCP
const MCP_CONFIG = {
  serverUrl: 'https://votre-domaine.com/api/mcp',
  clientName: 'MonAssistant',
  clientType: 'assistant'
};

// 1. Se connecter au serveur MCP
async function connectToMCP() {
  const response = await fetch(MCP_CONFIG.serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'connect',
      clientName: MCP_CONFIG.clientName,
      clientType: MCP_CONFIG.clientType
    })
  });
  
  const data = await response.json();
  // Sauvegarder le token (à garder secret!)
  localStorage.setItem('mcp_token', data.token);
  localStorage.setItem('mcp_session', data.sessionId);
  
  return data;
}

// 2. Envoyer une requête à l'IA locale
async function sendMCPRequest(message) {
  const token = localStorage.getItem('mcp_token');
  
  const response = await fetch(MCP_CONFIG.serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'request',
      token: token,
      endpoint: 'chat',
      payload: { message: message }
    })
  });
  
  return await response.json();
}

// 3. Récupérer les produits
async function getProducts() {
  const token = localStorage.getItem('mcp_token');
  
  const response = await fetch(MCP_CONFIG.serverUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'request',
      token: token,
      endpoint: 'products',
      payload: {}
    })
  });
  
  return await response.json();
}
```

### Étape 4: Intégration LD-JSON pour SEO

Le serveur MCP est automatiquement référencé dans le LD-JSON généré:

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Votre Entreprise",
  "description": "Description de votre entreprise",
  "url": "https://votre-domaine.com",
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "customer service",
    "availableLanguage": "French"
  },
  "potentialAction": {
    "@type": "CommunicateAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://votre-domaine.com/api/mcp",
      "actionPlatform": [
        "http://schema.org/DesktopApplication",
        "http://schema.org/MobileApplication"
      ]
    }
  }
}
```

### Étape 5: Sécurité du serveur MCP

#### Rate Limiting (à ajouter dans nginx)
```nginx
# Dans /etc/nginx/sites-available/plateforme-ia-pme
limit_req_zone $binary_remote_addr zone=mcp_limit:10m rate=10r/m;

server {
    # ... configuration existante ...
    
    location /api/mcp {
        limit_req zone=mcp_limit burst=20 nodelay;
        proxy_pass http://localhost:3000;
        # ... reste de la config ...
    }
}
```

#### Firewall (UFW)
```bash
# Configurer le firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 4. Tests et validation

### Test 1: Vérifier que l'application tourne

```bash
# Sur le serveur
pm2 status
pm2 logs plateforme-ia-pme

# Tester l'API
curl https://votre-domaine.com/api/company
```

### Test 2: Tester le serveur MCP

```bash
# 1. Tester le statut
curl https://votre-domaine.com/api/mcp

# 2. Créer une connexion
curl -X POST https://votre-domaine.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"action":"connect","clientName":"TestClient","clientType":"test"}'

# Réponse attendue:
# {"sessionId":"xxx","token":"xxx","serverUrl":"https://..."}

# 3. Envoyer un message (remplacer TOKEN)
curl -X POST https://votre-domaine.com/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"action":"request","token":"TOKEN","endpoint":"chat","payload":{"message":"Bonjour"}}'
```

### Test 3: Vérifier les analytics

```bash
# Consulter les analytics
curl https://votre-domaine.com/api/analytics

# Vérifier les connexions MCP
curl https://votre-domaine.com/api/mcp?action=connections
```

### Test 4: Import de données

```bash
# Créer un fichier CSV de test
cat > products.csv << 'EOF'
name,description,price,category,stock
Produit 1,Description du produit 1,29.99,Catégorie A,100
Produit 2,Description du produit 2,49.99,Catégorie B,50
EOF

# Importer via l'interface ou curl
curl -X POST https://votre-domaine.com/api/import \
  -F "file=@products.csv" \
  -F "type=products"
```

---

## Checklist finale

- [ ] Code poussé sur GitHub
- [ ] Serveur configuré (VPS/Cloud)
- [ ] Base de données initialisée
- [ ] HTTPS activé (Let's Encrypt)
- [ ] PM2 configuré pour redémarrage auto
- [ ] Nginx configuré comme reverse proxy
- [ ] MCP activé dans l'interface
- [ ] IA locale configurée (personnalité, ton)
- [ ] Tests API effectués
- [ ] Backup de la base de données configuré

---

## Commandes utiles

```bash
# Logs
pm2 logs plateforme-ia-pme
sudo tail -f /var/log/nginx/error.log

# Redémarrer
pm2 restart plateforme-ia-pme

# Mise à jour
git pull
bun install
bun run db:push
pm2 restart plateforme-ia-pme

# Backup base de données
sqlite3 db/production.db ".backup db/backup_$(date +%Y%m%d).db"

# Surveillance
pm2 monit
```

---

## Support

En cas de problème:
1. Vérifier les logs: `pm2 logs`
2. Vérifier Nginx: `sudo nginx -t`
3. Vérifier les processus: `pm2 status`
4. Redémarrer tout: `pm2 restart all && sudo systemctl restart nginx`
