# 📝 Résumé des Changements - Version Render.com

## 🎯 Objectif

Adapter l'application PME IA Assistant pour fonctionner sur **Render.com** avec **Google Gemini API** au lieu d'Ollama local.

---

## ✅ Changements Appliqués

### 1. Nouveaux Fichiers

| Fichier | Description |
|---------|-------------|
| `src/lib/gemini.ts` | Client Google Gemini API |
| `src/app/api/gemini/chat/route.ts` | Endpoint API pour Gemini |
| `src/lib/ai-provider.ts` | Détection automatique du provider |
| `render.yaml` | Configuration Render (déploiement automatique) |
| `RENDER_DEPLOY.md` | Guide complet de déploiement |

### 2. Fichiers Modifiés

#### `package.json`
```diff
"dependencies": {
+  "@google/generative-ai": "^0.21.0",
}
```

#### `.env.example`
```diff
+ # Gemini API (pour Render.com et cloud)
+ GEMINI_API_KEY="votre_cle_api_gemini_ici"
+ GEMINI_MODEL="gemini-pro"

- # Ollama (pour développement local uniquement)
- OLLAMA_API_URL="http://localhost:11434"
- OLLAMA_MODEL="llama3"
```

#### `src/components/ChatBot.tsx`
```diff
- fetch('/api/ollama/chat', ...)
+ fetch('/api/gemini/chat', ...)
```

---

## 🚀 Configuration Render.com

### Port

✅ **Render écoute sur le port 10000**  
✅ Next.js utilise automatiquement `process.env.PORT`  
✅ Pas de configuration supplémentaire nécessaire

### Variables d'Environnement Requises

| Variable | Valeur | Où obtenir |
|----------|--------|------------|
| `GEMINI_API_KEY` | `AIzaSy...` | https://makersuite.google.com/app/apikey |
| `NODE_ENV` | `production` | Automatique |
| `DATABASE_URL` | `file:./prod.db` | SQLite local (ou PostgreSQL) |

---

## 📊 Comparaison Ollama vs Gemini

| Aspect | Ollama (Local) | Gemini (Cloud) |
|--------|----------------|----------------|
| **Hébergement** | ❌ Impossible sur Render | ✅ Compatible |
| **Configuration** | Installer Ollama localement | Juste une clé API |
| **Coût** | Gratuit (infra locale) | Gratuit (60 req/min) |
| **Performance** | Dépend de votre CPU | ⚡ Ultra-rapide (Google infra) |
| **Latence** | Variable (local) | ~500ms (cloud) |
| **Disponibilité** | Dépend de votre machine | 99.9% uptime |

---

## 🔐 Sécurité

### Clé API Gemini

⚠️ **Ne jamais** commiter `GEMINI_API_KEY` sur GitHub

**Bonnes pratiques :**
1. Ajouter `.env` dans `.gitignore` ✅ (déjà fait)
2. Configurer la clé dans Render Dashboard uniquement
3. Rotation régulière des clés (tous les 6 mois)

---

## 💰 Coûts

### Render.com Free Plan

| Ressource | Limite |
|-----------|--------|
| RAM | 512 MB |
| Services | Illimités |
| Temps d'inactivité | App dort après 15 min |
| Bande passante | 100 GB/mois |
| **Prix** | **Gratuit** 🎉 |

### Gemini API Free Tier

| Modèle | Limite |
|--------|--------|
| gemini-pro | 60 req/min |
| Tokens | 1M/mois |
| **Prix** | **Gratuit** 🎉 |

**💡 Total : 0€/mois pour démarrer !**

---

## 🧪 Tests Recommandés

### Avant Déploiement

```bash
# 1. Tester localement avec Gemini
export GEMINI_API_KEY="votre_cle"
npm run dev

# 2. Tester le chatbot
# Ouvrir http://localhost:3000/generateur-site

# 3. Vérifier l'API
curl http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Bonjour"}]}'
```

### Après Déploiement

```bash
# Vérifier que Gemini est configuré
curl https://votre-app.onrender.com/api/gemini/chat

# Devrait retourner:
{
  "service": "Gemini API",
  "available": true,
  "model": "gemini-pro"
}
```

---

## 🎓 Migration Existante (Ollama → Gemini)

Si vous avez déjà déployé avec Ollama localement :

### Étape 1 : Obtenir Clé Gemini
```
https://makersuite.google.com/app/apikey
```

### Étape 2 : Modifier `.env`
```bash
# Commenter Ollama
# OLLAMA_API_URL="http://localhost:11434"
# OLLAMA_MODEL="llama3"

# Ajouter Gemini
GEMINI_API_KEY="AIzaSy..."
GEMINI_MODEL="gemini-pro"
```

### Étape 3 : Installer Dépendances
```bash
npm install @google/generative-ai
```

### Étape 4 : Tester
```bash
npm run dev
# Vérifier que le chatbot utilise Gemini
```

### Étape 5 : Déployer
```bash
git add .
git commit -m "Migration vers Gemini API"
git push

# Render redéploiera automatiquement
```

---

## 📚 Documentation Complémentaire

| Document | Contenu |
|----------|---------|
| `README.md` | Documentation générale |
| `RENDER_DEPLOY.md` | **Guide complet Render** ⭐ |
| `QUICKSTART.md` | Installation locale rapide |
| `.env.example` | Variables d'environnement |

---

## ✅ Checklist Déploiement

### Avant de Déployer

- [ ] Clé Gemini API obtenue
- [ ] Code testé localement avec Gemini
- [ ] `.env` ajouté au `.gitignore`
- [ ] Code pushé sur GitHub
- [ ] Render.yaml vérifié

### Pendant le Déploiement

- [ ] Service Render créé
- [ ] Repository GitHub connecté
- [ ] `GEMINI_API_KEY` configurée dans Dashboard
- [ ] Build terminé sans erreur
- [ ] URL Render accessible

### Après le Déploiement

- [ ] API Gemini fonctionnelle (tester `/api/gemini/chat`)
- [ ] Chatbot répond correctement
- [ ] Pages accessibles (accueil, entreprise, générateur)
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] Monitoring activé (UptimeRobot)

---

## 🐛 Problèmes Connus

### 1. SQLite + Render Free Plan

**Problème :** Données perdues à chaque redéploiement

**Solution :**
- Court terme : Accepter (OK pour démo/test)
- Long terme : Migrer vers PostgreSQL (gratuit sur Render)

### 2. Cold Start (15 min inactivité)

**Problème :** Première requête lente après 15 min

**Solution :**
- Gratuit : UptimeRobot (ping toutes les 5 min)
- Payant : Plan Starter ($7/mois, pas de veille)

### 3. Limites Gemini API

**Problème :** 60 requêtes/minute max

**Solution :**
- Implémenter cache (localStorage côté client)
- Débouncer les appels API
- Upgrade vers compte payant si nécessaire

---

## 🎯 Prochaines Étapes

1. **Déployer sur Render** (suivre `RENDER_DEPLOY.md`)
2. **Tester avec utilisateurs beta**
3. **Collecter feedbacks**
4. **Migrer vers PostgreSQL** (si production)
5. **Optimiser coûts** (caching, compression)

---

## 📞 Support

- **Render :** https://render.com/docs
- **Gemini :** https://ai.google.dev/docs
- **Issues GitHub :** (votre repo)

---

**✨ Tout est prêt pour le déploiement !**

Consultez `RENDER_DEPLOY.md` pour le guide détaillé étape par étape.
