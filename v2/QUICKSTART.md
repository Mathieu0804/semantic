# 🚀 Guide de Démarrage Rapide - PME AI Platform

## Bienvenue ! 👋

Ce guide vous permet de démarrer votre plateforme en **moins de 10 minutes**.

## 📋 Pré-requis Minimums

Avant de commencer, assurez-vous d'avoir :

- **Ordinateur** : Linux, macOS ou Windows (avec WSL2)
- **RAM** : Minimum 8 GB (16 GB recommandé pour l'IA)
- **Stockage** : 20 GB d'espace libre
- **Connexion Internet** : Pour télécharger les dépendances

## ⚡ Installation Express (Recommandé)

### Option 1 : Docker (Plus Simple)

```bash
# 1. Cloner le projet
git clone https://github.com/votre-repo/pme-ai-platform.git
cd pme-ai-platform

# 2. Lancer le script d'installation
chmod +x install.sh
./install.sh

# 3. C'est tout ! 🎉
# Les services démarrent automatiquement
```

**Temps d'installation : ~5 minutes**

### Option 2 : Installation Manuelle

Si vous préférez tout contrôler :

```bash
# 1. Installer les dépendances
npm install -g npm@latest

# 2. Créer la base de données
createdb pme_ai_platform
psql pme_ai_platform < database/schemas/init.sql

# 3. Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3:8b

# 4. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres

# 5. Installer et démarrer les services
cd backend/api && npm install && npm run dev &
cd backend/mcp-server && npm install && npm start &
cd frontend/site-creator && npm install && npm run dev &
```

**Temps d'installation : ~15 minutes**

## 🎯 Premier Lancement

### Accéder aux Interfaces

Une fois installé, ouvrez votre navigateur :

1. **Créateur de Site** : http://localhost:3000
2. **Gestion Catalogue** : http://localhost:3001
3. **Identité Entreprise** : http://localhost:3002

### Créer Votre Compte

1. Cliquez sur "S'inscrire"
2. Remplissez les informations de votre entreprise
3. Validez votre email (si configuré)
4. Connectez-vous !

## 🎨 Créer Votre Premier Site Web

### Étape 1 : Configurer Votre Identité

1. Allez sur http://localhost:3002 (Identity Manager)
2. Cliquez sur "Nouvelle Configuration"
3. Dialoguez avec l'IA pour définir :
   - Votre mission
   - Votre vision
   - Vos valeurs
   - Votre public cible
4. L'IA génère automatiquement :
   - Mots-clés SEO
   - LD-JSON
   - Configuration de marque

**Temps estimé : 10 minutes**

### Étape 2 : Créer Votre Site

1. Allez sur http://localhost:3000 (Site Creator)
2. Cliquez sur "Nouvelle Conversation"
3. L'IA vous pose des questions sur :
   - Type de site souhaité
   - Préférences de design
   - Contenu à inclure
4. Sélectionnez un template
5. Personnalisez les couleurs
6. Cliquez sur "Générer le Site"

**Temps estimé : 15 minutes**

### Étape 3 : Ajouter Vos Produits

1. Allez sur http://localhost:3001 (Catalog Manager)
2. Options :
   - **Import CSV** : Si vous avez déjà un catalogue
   - **Création Manuelle** : Cliquez "Nouveau Produit"
3. Pour chaque produit :
   - Nom, description
   - Prix, stock
   - Catégorie
   - Images
4. L'IA génère automatiquement les descriptions SEO !

**Temps estimé : 5 minutes par produit**

## 🤖 Activer le Serveur MCP (Commercial IA)

Le serveur MCP permet aux IA externes (ChatGPT, Claude, etc.) de dialoguer avec votre entreprise.

### Configuration

1. Récupérez votre Company ID :
```bash
# Dans PostgreSQL
psql pme_ai_platform -c "SELECT id FROM companies WHERE name = 'Votre Entreprise';"
```

2. Ajoutez-le dans `.env` :
```bash
COMPANY_ID=votre-company-id-uuid
MCP_PUBLIC_URL=https://votre-domaine.com/mcp
```

3. Redémarrez le serveur MCP :
```bash
docker-compose restart mcp-server
```

### Test du MCP

Testez que votre IA répond correctement :

```bash
curl -X POST http://localhost:5001/mcp/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bonjour, avez-vous des produits en stock ?",
    "sessionId": "test-123",
    "externalAIId": "test-ai"
  }'
```

## 📊 Consulter Vos Analytics

Les analytics collectent automatiquement :
- Visiteurs uniques
- Pages vues
- Parcours utilisateur
- Taux de conversion

**Accès** : Via l'API ou dashboards personnalisés

```bash
curl http://localhost:5000/api/analytics/dashboard \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

## 🔧 Commandes Utiles

### Docker

```bash
# Voir les logs
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend-api

# Arrêter tout
docker-compose down

# Tout supprimer (attention !)
docker-compose down -v
```

### Base de Données

```bash
# Backup
pg_dump pme_ai_platform > backup.sql

# Restore
psql pme_ai_platform < backup.sql

# Accès psql
docker exec -it pme-postgres psql -U pme_admin -d pme_ai_platform
```

### Ollama (IA Locale)

```bash
# Lister les modèles installés
ollama list

# Installer un autre modèle
ollama pull mistral

# Tester l'IA
ollama run llama3:8b "Bonjour, qui es-tu ?"
```

## 🆘 Dépannage

### L'IA ne répond pas

```bash
# Vérifier qu'Ollama tourne
docker ps | grep ollama

# Vérifier les logs
docker logs pme-ollama

# Redémarrer
docker-compose restart ollama
```

### Erreur de connexion base de données

```bash
# Vérifier PostgreSQL
docker ps | grep postgres

# Tester la connexion
psql -h localhost -U pme_admin -d pme_ai_platform

# Recréer les tables si nécessaire
psql pme_ai_platform < database/schemas/init.sql
```

### Frontend ne charge pas

```bash
# Vérifier que le backend tourne
curl http://localhost:5000/health

# Vérifier les ports
netstat -tuln | grep -E '3000|3001|3002|5000|5001'

# Réinstaller les dépendances
cd frontend/site-creator
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## 🎓 Aller Plus Loin

### Personnaliser l'IA

Éditez la configuration IA dans l'interface Identity Manager :
- Changez le ton (professionnel, décontracté, technique)
- Ajoutez des connaissances spécifiques
- Définissez des réponses pré-configurées

### Déployer en Production

Consultez `docs/DEPLOYMENT.md` pour :
- Configuration serveur
- SSL/TLS
- DNS
- Sauvegardes automatiques
- Monitoring

### Intégrations

- **Google Analytics** : Ajoutez votre ID dans `.env`
- **Emails** : Configurez SMTP pour notifications
- **Paiements** : Intégration Stripe/PayPal (à venir)

## 📚 Ressources

- **Documentation complète** : `./README.md`
- **Architecture technique** : `./ARCHITECTURE.md`
- **API Reference** : `./docs/API.md`
- **Support** : support@pme-ai-platform.local

## 💡 Conseils Pro

1. **Commencez petit** : Créez d'abord votre identité, puis votre site
2. **Utilisez l'IA** : Elle génère de meilleures descriptions que vous ne le pensez
3. **Analysez vos données** : Les patterns révèlent ce qui marche
4. **Testez le MCP** : C'est votre commercial 24/7
5. **Sauvegardez régulièrement** : `pg_dump` est votre ami

## 🎉 Félicitations !

Vous avez maintenant une plateforme web complète avec IA intégrée !

**Prochaines étapes recommandées** :
1. ✅ Finaliser votre identité entreprise
2. ✅ Créer votre site web
3. ✅ Ajouter vos produits/services
4. ✅ Activer le serveur MCP
5. ✅ Analyser vos premières données

**Questions ?** N'hésitez pas à consulter la documentation ou à nous contacter.

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2025  
Développé avec ❤️ pour les PME/PMI françaises
