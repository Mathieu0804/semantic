# 🚀 Guide de Déploiement sur Render.com avec Gemini API

## 📋 Vue d'Ensemble

Ce guide vous explique comment déployer votre application **PME IA Assistant** sur **Render.com** en utilisant **Google Gemini API** au lieu d'Ollama local.

### Pourquoi Gemini au lieu d'Ollama ?

| Critère | Ollama (Local) | Gemini API (Cloud) |
|---------|----------------|---------------------|
| **Déploiement** | ❌ Impossible sur Render | ✅ Compatible |
| **Coût** | Gratuit (infra locale) | Gratuit (limite quotidienne) |
| **Performance** | Dépend de votre machine | ⚡ Ultra-rapide |
| **Maintenance** | Vous gérez | Google gère |
| **Scalabilité** | ❌ Limitée | ✅ Automatique |

---

## 🎯 Prérequis

### 1. Compte Render.com
- Créer un compte sur https://render.com (gratuit)
- Connecter votre compte GitHub

### 2. Clé API Gemini
- Aller sur https://makersuite.google.com/app/apikey
- Cliquer "Create API Key"
- Copier la clé (format : `AIzaSy...`)

### 3. Repository GitHub
- Pusher votre code sur GitHub
- Le repository doit être public OU vous devez autoriser Render

---

## 📦 Changements par Rapport à la Version Locale

### Fichiers Ajoutés

```
pme-ia-assistant/
├── src/lib/gemini.ts              # ✅ Client Gemini (nouveau)
├── src/app/api/gemini/            # ✅ API routes Gemini (nouveau)
└── render.yaml                    # ✅ Config Render (nouveau)
```

### Fichiers Modifiés

```diff
package.json
+ "@google/generative-ai": "^0.21.0"

.env.example
+ GEMINI_API_KEY="votre_cle_api_gemini"
+ GEMINI_MODEL="gemini-pro"
- OLLAMA_API_URL="http://localhost:11434"
- OLLAMA_MODEL="llama3"
```

### Code Modifié

**Composant ChatBot** - Changement d'endpoint :

```typescript
// AVANT (Ollama)
fetch('/api/ollama/chat', ...)

// APRÈS (Gemini)
fetch('/api/gemini/chat', ...)
```

---

## 🚀 Déploiement Étape par Étape

### Étape 1 : Préparer le Code

```bash
# 1. Extraire l'archive
tar -xzf pme-ia-assistant-render.tar.gz
cd pme-ia-assistant

# 2. Installer les dépendances (pour tester localement)
npm install

# 3. Configurer .env pour test local
cp .env.example .env

# 4. Ajouter votre clé Gemini dans .env
# GEMINI_API_KEY="AIzaSy..."

# 5. Tester localement
npm run db:push
npm run dev
```

**Vérifier que ça fonctionne :**
- Ouvrir http://localhost:3000
- Tester le chatbot (doit utiliser Gemini)

### Étape 2 : Pusher sur GitHub

```bash
# Initialiser Git (si pas déjà fait)
git init
git add .
git commit -m "Initial commit"

# Créer un repo sur GitHub
# Puis :
git remote add origin https://github.com/votre-username/pme-ia-assistant.git
git branch -M main
git push -u origin main
```

### Étape 3 : Créer le Service sur Render

#### A. Via l'Interface Web (Recommandé)

1. **Aller sur Render Dashboard**
   - https://dashboard.render.com

2. **Cliquer "New +"**
   - Sélectionner "Web Service"

3. **Connecter le Repository**
   - Chercher votre repo `pme-ia-assistant`
   - Cliquer "Connect"

4. **Configurer le Service**

   | Champ | Valeur |
   |-------|--------|
   | **Name** | `pme-ia-assistant` |
   | **Region** | `Frankfurt` (ou proche de vous) |
   | **Branch** | `main` |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npx prisma generate && npm run build` |
   | **Start Command** | `npm start` |
   | **Plan** | `Free` (ou `Starter` pour production) |

5. **Configurer les Variables d'Environnement**

   Cliquer "Environment" puis ajouter :

   ```
   NODE_ENV=production
   DATABASE_URL=file:./prod.db
   GEMINI_API_KEY=AIzaSy... (votre clé)
   GEMINI_MODEL=gemini-pro
   AI_TEMPERATURE=0.7
   AI_MAX_TOKENS=2048
   ENABLE_ANALYTICS=true
   TASK_INTERVAL=60
   RAPPORT_INTERVAL=10080
   ```

   **Pour JWT_SECRET :**
   - Cliquer "Generate" à côté du champ
   - Render générera un secret aléatoire

6. **Créer le Service**
   - Cliquer "Create Web Service"
   - Attendre le build (~5-10 minutes)

#### B. Via render.yaml (Automatique)

Si vous avez `render.yaml` à la racine :

1. Render détectera automatiquement la config
2. Vous devrez quand même ajouter `GEMINI_API_KEY` manuellement

---

### Étape 4 : Vérifier le Déploiement

```bash
# 1. Une fois le build terminé, Render affiche l'URL
# Format : https://pme-ia-assistant-XXXX.onrender.com

# 2. Tester l'API Gemini
curl https://votre-app.onrender.com/api/gemini/chat

# Devrait retourner :
{
  "service": "Gemini API",
  "available": true,
  "model": "gemini-pro",
  "message": "Gemini API est configurée et prête"
}
```

### Étape 5 : Initialiser la Base de Données

⚠️ **Important :** SQLite sur plan gratuit = données perdues à chaque redéploiement

**Solution temporaire :**
- Accepter que la BDD soit réinitialisée
- Pour production → migrer vers PostgreSQL (voir ci-dessous)

**Initialiser manuellement (si besoin) :**
```bash
# Via Render Shell (Dashboard > Shell)
cd /app
npx prisma db push
```

---

## 🎉 Application Déployée !

Votre application est maintenant accessible sur :
```
https://votre-app.onrender.com
```

### Fonctionnalités Disponibles

✅ Page d'accueil  
✅ Configuration entreprise  
✅ Générateur de site (chatbot Gemini)  
✅ Gestion catalogue  
✅ Analytics  

---

## 🔧 Configuration Avancée

### Port Render (10000)

Render utilise automatiquement `process.env.PORT` (10000 par défaut).

**Next.js le gère automatiquement**, mais si vous avez un serveur custom :

```javascript
// server.js
const PORT = process.env.PORT || 3000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`)
})
```

### Domaine Personnalisé

1. Dashboard Render > Votre service > Settings
2. Aller dans "Custom Domains"
3. Ajouter votre domaine (ex: `www.mon-site.com`)
4. Configurer les DNS selon les instructions Render

---

## 💾 Migrer vers PostgreSQL (Production)

### Pourquoi PostgreSQL ?

- ✅ Données persistantes (pas perdues au redéploiement)
- ✅ Performances supérieures
- ✅ Support transactions complexes
- ✅ Plan gratuit Render disponible

### Étapes de Migration

#### 1. Créer une Base PostgreSQL sur Render

```bash
# Dashboard Render > New + > PostgreSQL
# Plan : Free (512 MB)
```

#### 2. Modifier `prisma/schema.prisma`

```diff
datasource db {
-  provider = "sqlite"
+  provider = "postgresql"
   url      = env("DATABASE_URL")
}
```

#### 3. Mettre à Jour `DATABASE_URL`

Dans Render Dashboard :

```
# Remplacer par l'Internal Database URL fournie par Render
DATABASE_URL=postgresql://user:password@hostname:port/database
```

#### 4. Relancer le Build

```bash
# Render rebuildera automatiquement
# Les tables seront créées automatiquement
```

---

## 📊 Coûts et Limites

### Render.com (Plan Gratuit)

| Ressource | Limite |
|-----------|--------|
| **Services Web** | Illimités |
| **RAM** | 512 MB |
| **Temps de build** | 15 min max |
| **Temps d'inactivité** | App dort après 15 min (redémarre à la requête) |
| **Bande passante** | 100 GB/mois |

### Gemini API (Gratuit)

| Modèle | Limite Gratuite |
|--------|-----------------|
| **gemini-pro** | 60 req/min, 1M tokens/mois |
| **gemini-pro-vision** | 60 req/min |

**Largement suffisant pour une PME !**

---

## 🐛 Troubleshooting

### ❌ Erreur "GEMINI_API_KEY not found"

**Solution :**
```bash
# Vérifier dans Render Dashboard > Environment
# La variable GEMINI_API_KEY est bien présente
# Relancer le deploy
```

### ❌ Erreur "502 Bad Gateway"

**Causes possibles :**
1. App ne bind pas sur 0.0.0.0
2. App ne bind pas sur `process.env.PORT`
3. App crash au démarrage

**Solution :**
```bash
# Vérifier les logs
Render Dashboard > Logs

# Vérifier que Next.js écoute bien sur PORT
# (Next.js le fait par défaut)
```

### ❌ "Database locked" ou "no such table"

**Cause :** SQLite réinitialisé au redéploiement

**Solution :**
- Migrer vers PostgreSQL (voir ci-dessus)
- OU accepter que les données soient temporaires

### ❌ App dort après 15 minutes

**Cause :** Plan gratuit Render met en veille après inactivité

**Solutions :**
1. **Ping externe :** Service comme UptimeRobot (gratuit)
2. **Passer au plan Starter ($7/mois)** : Pas de veille

**Setup UptimeRobot :**
```
1. Créer compte sur uptimerobot.com
2. Ajouter un monitor HTTP(s)
3. URL: https://votre-app.onrender.com
4. Interval: 5 minutes
```

### ❌ Gemini API limite dépassée

**Erreur :** "429 Too Many Requests"

**Solutions :**
1. Réduire la fréquence des appels
2. Implémenter un cache (Redis)
3. Passer à Gemini Pro payant

---

## 🔒 Sécurité en Production

### 1. Variables d'Environnement

✅ **Jamais** commiter `.env` sur GitHub  
✅ Utiliser le Dashboard Render pour les secrets  
✅ Régénérer `JWT_SECRET` régulièrement  

### 2. HTTPS

✅ Automatique sur Render (certificat SSL gratuit)  
✅ Forcer HTTPS dans Next.js :

```javascript
// next.config.ts
{
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}
```

### 3. Rate Limiting

Ajouter un middleware Next.js :

```typescript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimit = new Map<string, number>()

export function middleware(request: NextRequest) {
  const ip = request.ip || 'unknown'
  const now = Date.now()
  
  const requests = rateLimit.get(ip) || 0
  
  if (requests > 100) { // Max 100 req/min
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    )
  }
  
  rateLimit.set(ip, requests + 1)
  
  // Reset après 1 minute
  setTimeout(() => rateLimit.delete(ip), 60000)
  
  return NextResponse.next()
}
```

---

## 📈 Monitoring

### Logs Render

```bash
# Temps réel
Dashboard > Votre service > Logs

# Filtrer par erreur
Rechercher "error" ou "ERROR"
```

### Gemini API Usage

```bash
# Vérifier utilisation
https://makersuite.google.com/app/apikey

# Voir quotas et limites
```

---

## 🎯 Checklist Pré-Production

- [ ] PostgreSQL configuré (pas SQLite)
- [ ] Variables d'environnement sécurisées
- [ ] HTTPS forcé
- [ ] Rate limiting activé
- [ ] Monitoring configuré (UptimeRobot)
- [ ] Backups BDD automatiques
- [ ] Domaine personnalisé configuré
- [ ] Tests de charge effectués
- [ ] Plan Render adapté (pas gratuit si traffic élevé)

---

## 📞 Support

### Ressources Render
- [Documentation](https://render.com/docs)
- [Community Forum](https://community.render.com)
- [Status Page](https://status.render.com)

### Ressources Gemini
- [Documentation](https://ai.google.dev/docs)
- [Pricing](https://ai.google.dev/pricing)
- [Support](https://support.google.com)

---

## 🎉 Félicitations !

Votre application est maintenant **déployée en production** sur Render avec Gemini API !

**Prochaines étapes :**
1. Tester toutes les fonctionnalités
2. Inviter des utilisateurs beta
3. Collecter les feedbacks
4. Itérer et améliorer

---

**Version :** 1.0.0 (Render)  
**Date :** Février 2026  
**Auteur :** PME IA Assistant Team
