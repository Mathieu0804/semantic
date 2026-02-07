# 🚀 COURS 10 : DÉPLOIEMENT

## Mettre votre application en production

**Durée :** 1-2 heures  
**Niveau :** Avancé  
**Prérequis :** Cours 1-9

---

## 📋 SOMMAIRE

1. [Production vs Développement](#1-prod-vs-dev)
2. [Variables d'environnement](#2-env)
3. [Process Manager (PM2)](#3-pm2)
4. [Hébergement](#4-hebergement)
5. [Docker](#5-docker)
6. [Nginx (Reverse Proxy)](#6-nginx)
7. [Monitoring](#7-monitoring)
8. [Backups](#8-backups)
9. [CI/CD](#9-cicd)
10. [Exercices](#10-exercices)
11. [Quiz](#11-quiz)

---

## 1. PRODUCTION VS DÉVELOPPEMENT {#1-prod-vs-dev}

### 🔄 Différences clés

| Aspect | Développement | Production |
|--------|---------------|------------|
| **Erreurs** | Affichées en détail | Masquées (logs) |
| **Port** | 3000 (local) | 80/443 (HTTP/HTTPS) |
| **DB** | Locale | Cloud/distante |
| **Logs** | Console | Fichiers |
| **Cache** | Désactivé | Activé |
| **Compression** | Non | Oui |
| **HTTPS** | Non requis | Obligatoire |
| **NODE_ENV** | development | production |

### 🎯 Configuration par environnement

**fichier : config/config.js**
```javascript
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  port: process.env.PORT || 3000,
  
  database: {
    host: isDev ? 'localhost' : process.env.DB_HOST,
    port: isDev ? 5432 : process.env.DB_PORT,
    database: isDev ? 'semantic_dev' : process.env.DB_NAME,
    user: isDev ? 'postgres' : process.env.DB_USER,
    password: isDev ? 'password' : process.env.DB_PASSWORD
  },
  
  logging: isDev,
  
  cors: {
    origin: isDev ? '*' : process.env.ALLOWED_ORIGINS
  }
};
```

---

## 2. VARIABLES D'ENVIRONNEMENT {#2-env}

### 📁 Fichier .env

**Développement : .env**
```
NODE_ENV=development
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=semantic_dev
DB_USER=postgres
DB_PASSWORD=password

JWT_SECRET=dev-secret-key

OLLAMA_HOST=http://localhost:11434
```

**Production : .env.production**
```
NODE_ENV=production
PORT=80

DB_HOST=db.example.com
DB_PORT=5432
DB_NAME=semantic_prod
DB_USER=semantic_user
DB_PASSWORD=very-secure-password-123

JWT_SECRET=super-secret-production-key-xyz

OLLAMA_HOST=http://ollama:11434
```

### 🔒 Sécurité

**❌ Ne JAMAIS commit .env**

**fichier : .gitignore**
```
.env
.env.production
.env.local
node_modules/
logs/
```

### 📦 Utiliser dotenv

```javascript
require('dotenv').config();

const port = process.env.PORT || 3000;
const dbPassword = process.env.DB_PASSWORD;
```

---

## 3. PROCESS MANAGER (PM2) {#3-pm2}

### 🎯 Qu'est-ce que PM2 ?

**PM2** = Process Manager pour Node.js

**Avantages :**
- ✅ Redémarre automatiquement si crash
- ✅ Load balancing (plusieurs instances)
- ✅ Logs centralisés
- ✅ Monitoring
- ✅ Redémarre au reboot serveur

### 📥 Installation

```bash
npm install -g pm2
```

### 🚀 Démarrer l'application

```bash
# Démarrer
pm2 start server.js

# Avec un nom
pm2 start server.js --name semantic-platform

# Mode cluster (plusieurs instances)
pm2 start server.js -i 4  # 4 instances
pm2 start server.js -i max  # Max CPUs
```

### 📊 Commandes utiles

```bash
# Lister les apps
pm2 list

# Voir les logs
pm2 logs

# Logs d'une app
pm2 logs semantic-platform

# Monitoring
pm2 monit

# Redémarrer
pm2 restart semantic-platform

# Arrêter
pm2 stop semantic-platform

# Supprimer
pm2 delete semantic-platform

# Sauvegarder la config
pm2 save

# Redémarrer au boot
pm2 startup
```

### ⚙️ Fichier de configuration

**fichier : ecosystem.config.js**
```javascript
module.exports = {
  apps: [{
    name: 'semantic-platform',
    script: './server.js',
    
    // Instances
    instances: 4,
    exec_mode: 'cluster',
    
    // Environnement
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 80
    },
    
    // Logs
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    
    // Auto-restart
    watch: false,
    max_memory_restart: '1G',
    
    // Crash
    min_uptime: '10s',
    max_restarts: 10,
    autorestart: true
  }]
};
```

**Utiliser :**
```bash
pm2 start ecosystem.config.js --env production
```

---

## 4. HÉBERGEMENT {#4-hebergement}

### ☁️ Options d'hébergement

#### **1. VPS (Virtual Private Server)**

**Providers :**
- DigitalOcean (5$/mois)
- Linode
- Vultr
- OVH

**Avantages :**
- Contrôle total
- Pas cher
- Flexible

**Inconvénients :**
- Configuration manuelle
- Maintenance nécessaire

#### **2. PaaS (Platform as a Service)**

**Providers :**
- Heroku
- Railway
- Render
- Fly.io

**Avantages :**
- Déploiement facile
- Scaling automatique
- Maintenance gérée

**Inconvénients :**
- Plus cher
- Moins de contrôle

#### **3. Serverless**

**Providers :**
- Vercel
- Netlify
- AWS Lambda

**Avantages :**
- Gratuit pour petits projets
- Auto-scaling

**Inconvénients :**
- Limité pour Node.js backend
- Cold starts

### 🚀 Déploiement sur VPS (DigitalOcean)

#### **Étape 1 : Créer un Droplet**

1. Se connecter à DigitalOcean
2. Créer un Droplet Ubuntu 22.04
3. Choisir la taille (2GB RAM minimum)
4. Ajouter SSH key

#### **Étape 2 : Se connecter**

```bash
ssh root@votre-ip
```

#### **Étape 3 : Installer Node.js**

```bash
# Mettre à jour
apt update
apt upgrade -y

# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérifier
node -v
npm -v
```

#### **Étape 4 : Installer PostgreSQL**

```bash
apt install postgresql postgresql-contrib -y

# Créer la base
sudo -u postgres psql
CREATE DATABASE semantic_platform;
CREATE USER semantic_user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE semantic_platform TO semantic_user;
\q
```

#### **Étape 5 : Cloner le projet**

```bash
# Installer Git
apt install git -y

# Cloner
cd /var/www
git clone https://github.com/votre-repo/semantic-platform.git
cd semantic-platform

# Installer les dépendances
npm install
```

#### **Étape 6 : Configurer l'environnement**

```bash
nano .env
```

```
NODE_ENV=production
PORT=3000
DB_HOST=localhost
DB_PASSWORD=password
...
```

#### **Étape 7 : Démarrer avec PM2**

```bash
# Installer PM2
npm install -g pm2

# Démarrer
pm2 start ecosystem.config.js --env production

# Sauvegarder
pm2 save
pm2 startup
```

---

## 5. DOCKER {#5-docker}

### 🐳 Pourquoi Docker ?

**Avantages :**
- ✅ Environnement identique partout
- ✅ Isolation
- ✅ Facile à déployer
- ✅ Scalable

### 📦 Dockerfile

**fichier : Dockerfile**
```dockerfile
# Image de base
FROM node:20-alpine

# Dossier de travail
WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code
COPY . .

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["node", "server.js"]
```

### 🔧 Docker Compose

**fichier : docker-compose.yml**
```yaml
version: '3.8'

services:
  # Application Node.js
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=db
      - DB_PORT=5432
      - DB_NAME=semantic_platform
      - DB_USER=postgres
      - DB_PASSWORD=password
    depends_on:
      - db
      - ollama
    restart: unless-stopped
  
  # PostgreSQL
  db:
    image: postgres:16
    environment:
      - POSTGRES_DB=semantic_platform
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped
  
  # Ollama
  ollama:
    image: ollama/ollama
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  postgres_data:
  ollama_data:
```

### 🚀 Commandes Docker

```bash
# Build
docker-compose build

# Démarrer
docker-compose up -d

# Logs
docker-compose logs -f

# Arrêter
docker-compose down

# Rebuild
docker-compose up -d --build
```

---

## 6. NGINX (REVERSE PROXY) {#6-nginx}

### 🔄 Qu'est-ce qu'un Reverse Proxy ?

```
Internet → Nginx (port 80/443) → Node.js (port 3000)
```

**Avantages :**
- ✅ HTTPS / SSL
- ✅ Load balancing
- ✅ Compression
- ✅ Cache statique
- ✅ Protection DDoS

### 📥 Installation

```bash
apt install nginx -y
```

### ⚙️ Configuration

**fichier : /etc/nginx/sites-available/semantic-platform**
```nginx
server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;
    
    # Redirection HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name votredomaine.com www.votredomaine.com;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/votredomaine.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/votredomaine.com/privkey.pem;
    
    # Sécurité
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Proxy vers Node.js
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
    }
    
    # Fichiers statiques
    location /static/ {
        alias /var/www/semantic-platform/public/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
}
```

**Activer :**
```bash
ln -s /etc/nginx/sites-available/semantic-platform /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### 🔒 SSL avec Let's Encrypt

```bash
# Installer Certbot
apt install certbot python3-certbot-nginx -y

# Obtenir le certificat
certbot --nginx -d votredomaine.com -d www.votredomaine.com

# Auto-renewal
certbot renew --dry-run
```

---

## 7. MONITORING {#7-monitoring}

### 📊 PM2 Monitoring

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30

# Dashboard web
pm2 plus
```

### 📈 Custom Monitoring

**fichier : modules/Monitoring.js**
```javascript
class Monitoring {
  constructor() {
    this.metrics = {
      requests: 0,
      errors: 0,
      avgResponseTime: 0
    };
  }
  
  middleware() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Compter la requête
      this.metrics.requests++;
      
      // Intercepter la réponse
      res.on('finish', () => {
        const duration = Date.now() - start;
        
        // Moyenne du temps de réponse
        this.metrics.avgResponseTime = 
          (this.metrics.avgResponseTime * (this.metrics.requests - 1) + duration) 
          / this.metrics.requests;
        
        // Compter les erreurs
        if (res.statusCode >= 500) {
          this.metrics.errors++;
        }
      });
      
      next();
    };
  }
  
  getMetrics() {
    return {
      ...this.metrics,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }
}

module.exports = Monitoring;
```

**Utilisation :**
```javascript
const Monitoring = require('./modules/Monitoring');
const monitoring = new Monitoring();

app.use(monitoring.middleware());

app.get('/metrics', (req, res) => {
  res.json(monitoring.getMetrics());
});
```

---

## 8. BACKUPS {#8-backups}

### 💾 Backup PostgreSQL

**Script : backup.sh**
```bash
#!/bin/bash

# Variables
DB_NAME="semantic_platform"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Créer le dossier
mkdir -p $BACKUP_DIR

# Backup
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# Compresser
gzip $BACKUP_DIR/backup_$DATE.sql

# Supprimer les backups > 30 jours
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup terminé : backup_$DATE.sql.gz"
```

**Rendre exécutable :**
```bash
chmod +x backup.sh
```

**Cron (automatique) :**
```bash
crontab -e

# Backup tous les jours à 2h du matin
0 2 * * * /path/to/backup.sh
```

### 📤 Backup vers S3 (AWS)

```bash
#!/bin/bash

# Installer AWS CLI
apt install awscli -y

# Configurer
aws configure

# Backup
DATE=$(date +%Y%m%d)
pg_dump semantic_platform | gzip | aws s3 cp - s3://my-backups/db_$DATE.sql.gz
```

---

## 9. CI/CD {#9-cicd}

### 🔄 GitHub Actions

**fichier : .github/workflows/deploy.yml**
```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '20'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_KEY }}
        script: |
          cd /var/www/semantic-platform
          git pull origin main
          npm ci
          pm2 restart semantic-platform
```

---

## 10. EXERCICES {#10-exercices}

### ✏️ Exercice 1 : Configuration environnement (Facile)

**Consigne :**
Créez un fichier `.env` avec toutes les variables nécessaires.

<details>
<summary>💡 Voir la solution</summary>

```
NODE_ENV=production
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_NAME=semantic_platform
DB_USER=semantic_user
DB_PASSWORD=secure-password-123

JWT_SECRET=super-secret-jwt-key-xyz
JWT_EXPIRES_IN=24h

OLLAMA_HOST=http://localhost:11434

CORS_ORIGIN=https://votredomaine.com

LOG_LEVEL=info
LOG_FILE=./logs/app.log
```
</details>

---

### ✏️ Exercice 2 : PM2 Config (Moyen)

**Consigne :**
Créez un `ecosystem.config.js` pour 4 instances en cluster.

<details>
<summary>💡 Voir la solution</summary>

```javascript
module.exports = {
  apps: [{
    name: 'semantic-platform',
    script: './server.js',
    instances: 4,
    exec_mode: 'cluster',
    
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    
    min_uptime: '10s',
    max_restarts: 10
  }]
};
```
</details>

---

## 11. QUIZ {#11-quiz}

### ❓ Question 1

Quelle est la différence entre développement et production ?

A) Aucune  
B) NODE_ENV différent  
C) Logs, sécurité, optimisations  
D) Juste le port

<details>
<summary>✅ Réponse</summary>
**C** - Nombreuses différences : logs, erreurs, cache, compression, etc.
</details>

---

### ❓ Question 2

À quoi sert PM2 ?

A) Gérer PostgreSQL  
B) Gérer les process Node.js  
C) Compiler le code  
D) Gérer Nginx

<details>
<summary>✅ Réponse</summary>
**B** - PM2 gère les process Node.js (restart, logs, cluster).
</details>

---

## 🎓 FÉLICITATIONS ! 🎉

### Vous avez terminé TOUTE LA FORMATION ! 🏆

**Les 10 cours complétés :**
- ✅ Cours 1 : Les bases absolues
- ✅ Cours 2 : Le serveur
- ✅ Cours 3 : Routes HTTP
- ✅ Cours 4 : Intelligence Artificielle
- ✅ Cours 5 : Base de données
- ✅ Cours 6 : Modules métier
- ✅ Cours 7 : Fine-tuning IA
- ✅ Cours 8 : Frontend
- ✅ Cours 9 : Sécurité
- ✅ Cours 10 : Déploiement

---

## 🎯 VOUS SAVEZ MAINTENANT

### Backend
- ✅ Node.js et Express
- ✅ API REST
- ✅ PostgreSQL et SQL
- ✅ Async/await
- ✅ Modules et architecture

### IA
- ✅ Ollama et LLMs
- ✅ Prompts efficaces
- ✅ Fine-tuning
- ✅ Auto-apprentissage

### Frontend
- ✅ HTML, CSS, JavaScript
- ✅ Fetch API
- ✅ Dashboards interactifs

### Production
- ✅ Sécurité (SQL injection, XSS, CSRF)
- ✅ Déploiement (VPS, Docker)
- ✅ PM2 et monitoring
- ✅ Nginx et HTTPS
- ✅ CI/CD

---

## 🚀 PROCHAINES ÉTAPES

### 1. Pratiquer
- Créer vos propres projets
- Contribuer à des projets open-source
- Participer à des hackathons

### 2. Apprendre plus
- TypeScript
- GraphQL
- Redis (cache)
- WebSockets (temps réel)
- Kubernetes

### 3. Certifications
- AWS Certified Developer
- Google Cloud Developer
- MongoDB Certification

### 4. Communauté
- Rejoindre des forums (Reddit, Discord)
- Assister à des meetups
- Créer un blog technique

---

## 💬 FEEDBACK

Cette formation vous a aidé ? Partagez votre expérience !

---

**Merci d'avoir suivi cette formation ! 🙏**

**Bon code ! 💻🚀**
