# BACKEND - MARKETING SÉMANTIQUE
## Documentation Complète

---

## 📚 TABLE DES MATIÈRES

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du système](#architecture-du-système)
3. [Étapes détaillées](#étapes-détaillées)
4. [Modules et leurs rôles](#modules-et-leurs-rôles)
5. [API Endpoints](#api-endpoints)
6. [Installation et démarrage](#installation-et-démarrage)
7. [Flux de données](#flux-de-données)
8. [Sécurité](#sécurité)
9. [Monitoring et Analytics](#monitoring-et-analytics)

---

## 🎯 VUE D'ENSEMBLE

Ce backend implémente un système de **marketing sémantique** qui permet aux marques de contrôler comment les IA les représentent, plutôt que de subir les "hallucinations" des modèles.

### Problème résolu
- ❌ **Avant** : Les IA "devinent" ce qu'est votre marque en scrappant vos pages web
- ✅ **Après** : Les IA lisent directement votre "ADN de marque" certifié

### Trois piliers
1. **Encapsulation** : L'ADN de marque est structuré et enrichi
2. **Certification** : Signature cryptographique pour authenticité
3. **Analytics** : Mesure de l'efficacité du marketing sémantique

---

## 🏗️ ARCHITECTURE DU SYSTÈME

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Agent IA)                        │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   SERVER (Express)                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Routes API                                           │  │
│  │  - /api/brand-dna (GET)                              │  │
│  │  - /api/brand-dna/products (GET)                     │  │
│  │  - /api/analytics/interaction (POST)                 │  │
│  │  - /api/validate/brand-dna (POST)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                  │
│  ┌───────────────────────┼──────────────────────────────┐  │
│  │                    MODULES                            │  │
│  │  ┌────────────────┐  ┌──────────────────┐           │  │
│  │  │ BrandDNA       │  │ Semantic         │           │  │
│  │  │ Manager        │  │ Validator        │           │  │
│  │  └────────────────┘  └──────────────────┘           │  │
│  │  ┌────────────────┐  ┌──────────────────┐           │  │
│  │  │ AI Interaction │  │ Certification    │           │  │
│  │  │ Logger         │  │ Service          │           │  │
│  │  └────────────────┘  └──────────────────┘           │  │
│  └──────────────────────────────────────────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   STORAGE LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │  brand-dna   │  │    logs/     │  │    keys/         │  │
│  │  .json       │  │  YYYY-MM-DD  │  │  public.pem      │  │
│  │              │  │  .log        │  │  private.pem     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 ÉTAPES DÉTAILLÉES

### ÉTAPE 1 : Initialisation du serveur
**Fichier** : `server.js`

**Rôle** : Point d'entrée du système

**Ce qui se passe** :
1. ✅ Chargement des variables d'environnement (.env)
2. ✅ Configuration des middleware de sécurité (Helmet, CORS)
3. ✅ Mise en place du rate limiting (protection contre abus)
4. ✅ Initialisation des 4 modules métier
5. ✅ Démarrage du serveur sur le port configuré

**Code clé** :
```javascript
app.listen(PORT, () => {
    brandDNA.initialize();
    certifier.initialize();
    logger.initialize();
});
```

---

### ÉTAPE 2 : Stockage de l'ADN de marque
**Module** : `BrandDNAManager`

**Rôle** : Gérer l'ADN de marque (le "cerveau" du système)

**Fonctions principales** :
1. **`initialize()`** : Charge ou crée l'ADN au démarrage
2. **`getDNA(version)`** : Récupère l'ADN (avec cache pour performance)
3. **`getProducts(filters)`** : Filtre les produits selon critères
4. **`update(newDNA)`** : Met à jour l'ADN + versioning

**Optimisations** :
- ⚡ **Cache en mémoire** : 5 minutes de TTL pour éviter lecture disque
- 📦 **Versioning** : Chaque modification crée un snapshot
- 🔄 **Rollback** : Possibilité de revenir à une version antérieure

**Exemple de structure ADN** :
```json
{
  "version": "1.0.0",
  "brandIdentity": {
    "name": "LuxeÉthique",
    "aiInstructions": {
      "role": "Tu es l'ambassadeur de LuxeÉthique",
      "tone": ["Élégant", "Scientifique"],
      "values": ["Durabilité", "Innovation"],
      "prohibitedClaims": ["Jamais promettre résultats instantanés"]
    }
  },
  "products": [...]
}
```

---

### ÉTAPE 3 : Validation sémantique
**Module** : `SemanticValidator`

**Rôle** : Garantir la cohérence de l'ADN avant publication

**Types de validation** :

#### A. Validation structurelle (JSON Schema)
- ✅ Présence des champs obligatoires
- ✅ Types de données corrects
- ✅ Formats valides (URLs, emails, dates)

#### B. Validation sémantique
**Détecte les incohérences** :
```javascript
// Exemple d'incohérence détectée
Ton : ["Chaleureux", "Bienveillant"]
Valeurs : ["Agressivité", "Domination"]
→ ⚠️ WARNING: Contradiction ton/valeurs
```

**Vérifications** :
- 🔍 Vocabulaire préféré vs vocabulaire interdit
- 🔍 Messages clés vs interdictions
- 🔍 Exemples de phrases conformes au vocabulaire

#### C. Validation qualitative
**Score de qualité (0-100)** basé sur :
- Richesse du vocabulaire
- Nombre d'exemples fournis
- Spécificité des instructions
- Complétude des produits

**Pénalités** :
- -5 points si moins de 2 attributs de ton
- -10 points si moins de 3 exemples de phrases
- -15 points si aucun message clé
- -20 points si catalogue vide

---

### ÉTAPE 4 : Certification cryptographique
**Module** : `CertificationService`

**Rôle** : Prouver l'authenticité des données (anti-phishing)

**Processus de signature** :

1. **Génération de clés RSA** (première fois)
```
Clé privée (2048 bits) → Stockée sécurisée (permissions 600)
Clé publique (2048 bits) → Distribuée aux IA
```

2. **Signature des données**
```javascript
Données → JSON canonique → Hash SHA-256 → Signature RSA → Données certifiées
```

3. **Ajout métadonnées C2PA**
```json
{
  "data": { ... },
  "certification": {
    "signature": "base64...",
    "timestamp": "2025-02-03T10:30:00Z",
    "issuer": "Votre Marque Officielle",
    "algorithm": "RSA-SHA256",
    "publicKey": "-----BEGIN PUBLIC KEY-----...",
    "c2pa": {
      "claim": {
        "contentType": "application/json",
        "assertions": [{
          "label": "c2pa.brand-identity",
          "data": { "brandName": "LuxeÉthique", "verified": true }
        }]
      }
    }
  }
}
```

**Vérification par l'IA** :
```javascript
1. Télécharger la clé publique
2. Recalculer le hash des données
3. Vérifier la signature avec la clé publique
4. Vérifier timestamp (< 24h pour éviter replay attack)
5. ✅ ou ❌
```

**Sécurité** :
- 🔐 Rotation de clés tous les 6-12 mois
- 🔐 En production : HSM (Hardware Security Module)
- 🔐 Détection de falsification = signature invalide

---

### ÉTAPE 5 : Logging et Analytics
**Module** : `AIInteractionLogger`

**Rôle** : Mesurer l'efficacité du marketing sémantique

**Types de logs** :

#### A. Logs d'accès
```json
{
  "type": "access",
  "timestamp": "2025-02-03T10:30:00Z",
  "accessType": "dna_access",
  "userAgent": "GPT-4-Agent/1.0",
  "ip": "192.168.1.0" // Anonymisé (RGPD)
}
```

#### B. Logs d'interaction
```json
{
  "type": "interaction",
  "agentId": "chatgpt-session-123",
  "actionType": "recommendation",
  "productId": "serum-aurore",
  "metadata": {
    "userQuery": "produit pour taches",
    "confidence": 0.92
  }
}
```

#### C. Logs de conversion
```json
{
  "type": "interaction",
  "actionType": "purchase",
  "productId": "serum-aurore",
  "sessionId": "abc123",
  "revenue": 68.00
}
```

**Métriques calculées** :

1. **Taux de conversion global**
```
Conversions = Achats / Recommandations × 100
```

2. **Performance par agent IA**
```javascript
{
  "chatgpt": {
    "recommendations": 150,
    "purchases": 23,
    "conversionRate": 15.3%
  },
  "claude": {
    "recommendations": 89,
    "purchases": 31,
    "conversionRate": 34.8%
  }
}
```

3. **Top produits recommandés**
```javascript
[
  { "productId": "serum-aurore", "count": 342 },
  { "productId": "creme-nuit", "count": 198 }
]
```

4. **Tendances temporelles**
```javascript
{
  "2025-02-01": { "access": 234, "interactions": 156, "purchases": 23 },
  "2025-02-02": { "access": 267, "interactions": 189, "purchases": 31 },
  "2025-02-03": { "access": 198, "interactions": 142, "purchases": 19 }
}
```

**Optimisations** :
- 📦 **Buffer en mémoire** (100 entrées) avant écriture disque
- ⚡ **Flush automatique** toutes les 60 secondes
- 💾 **Logs quotidiens** : Un fichier par jour pour faciliter archivage
- 🔒 **Anonymisation IP** : Conformité RGPD

---

## 🔌 API ENDPOINTS

### 1. GET `/api/brand-dna`
**Rôle** : Récupérer l'ADN complet de la marque

**Query params** :
- `version` (optionnel) : Version spécifique ou "latest"

**Réponse** :
```json
{
  "success": true,
  "data": {
    "data": { /* ADN complet */ },
    "certification": { /* Signature + métadonnées */ }
  },
  "metadata": {
    "version": "1.2.3",
    "lastUpdated": "2025-02-03T10:00:00Z",
    "schemaVersion": "1.0.0"
  }
}
```

**Utilisation par l'IA** :
```javascript
// L'IA récupère l'ADN au début de chaque session
const response = await fetch('https://api.marque.com/api/brand-dna');
const { data, certification } = await response.json();

// Vérifier l'authenticité
const isValid = await verifyCertification(data, certification);

// Charger les instructions
const instructions = data.data.brandIdentity.aiInstructions;
```

---

### 2. GET `/api/brand-dna/products`
**Rôle** : Récupérer uniquement les produits (optimisé)

**Query params** :
- `category` : Filtrer par catégorie
- `inStock` : true/false
- `minPrice`, `maxPrice` : Fourchette de prix

**Réponse** :
```json
{
  "success": true,
  "count": 12,
  "data": [
    {
      "name": "Sérum Lumière d'Aurore",
      "aiPitch": "Recommandé pour...",
      "price": { "price": "68.00", "priceCurrency": "EUR" },
      ...
    }
  ]
}
```

---

### 3. POST `/api/analytics/interaction`
**Rôle** : Enregistrer une action de l'IA

**Body** :
```json
{
  "agentId": "chatgpt-session-xyz",
  "actionType": "recommendation",
  "productId": "serum-aurore",
  "metadata": {
    "userQuery": "anti-taches naturel",
    "confidence": 0.87
  }
}
```

**Types d'action** :
- `recommendation` : Produit recommandé
- `search` : Recherche dans le catalogue
- `purchase` : Achat effectué
- `comparison` : Comparaison de produits

---

### 4. GET `/api/analytics/dashboard`
**Rôle** : Obtenir les métriques d'analytics

**Query params** :
- `startDate`, `endDate` : Période d'analyse

**Réponse** :
```json
{
  "success": true,
  "data": {
    "totalAccess": 1234,
    "totalInteractions": 567,
    "conversionRate": 18.5,
    "topProducts": [...],
    "agentPerformance": {...},
    "trends": {...}
  }
}
```

---

### 5. POST `/api/validate/brand-dna`
**Rôle** : Valider un ADN avant publication

**Body** : Nouvel ADN à valider

**Réponse** :
```json
{
  "success": true,
  "isValid": true,
  "errors": [],
  "warnings": [
    {
      "type": "quality",
      "message": "Seulement 2 exemples de phrases (3+ recommandé)"
    }
  ],
  "score": 87,
  "suggestions": [
    "Ajoutez plus d'exemples pour illustrer le style"
  ]
}
```

---

## 🚀 INSTALLATION ET DÉMARRAGE

### Prérequis
- Node.js 16+
- npm ou yarn

### Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 3. Démarrer en développement
npm run dev

# 4. Démarrer en production
npm start
```

### Structure des fichiers
```
backend/
├── server.js                 # Point d'entrée
├── modules/
│   ├── brand-dna-manager.js
│   ├── semantic-validator.js
│   ├── ai-interaction-logger.js
│   └── certification-service.js
├── data/
│   ├── brand-dna.json       # ADN de marque
│   ├── versions/            # Snapshots versionnés
│   ├── logs/                # Logs quotidiens
│   └── keys/                # Clés cryptographiques
├── package.json
└── .env
```

---

## 🔐 SÉCURITÉ

### Couches de sécurité

1. **Transport** : HTTPS obligatoire en production
2. **Headers** : Helmet.js (XSS, CSP, etc.)
3. **CORS** : Liste blanche d'origines autorisées
4. **Rate limiting** : Max 100 req/15min par IP
5. **Validation** : express-validator sur tous les inputs
6. **Cryptographie** : RSA-2048 pour signatures
7. **RGPD** : Anonymisation des IP dans logs

### Recommandations production

- ✅ Utiliser un HSM pour stocker la clé privée
- ✅ Activer le chiffrement de la clé privée avec passphrase
- ✅ Rotation de clés tous les 6 mois
- ✅ Monitoring des signatures invalides (tentatives de phishing)
- ✅ Audit logs réguliers

---

## 📊 MONITORING ET ANALYTICS

### KPIs à suivre

1. **Engagement IA**
   - Nombre d'accès uniques/jour
   - Fréquence de rafraîchissement

2. **Efficacité marketing**
   - Taux de recommandation par produit
   - Taux de conversion global
   - Revenu généré par agent IA

3. **Qualité sémantique**
   - Score de validation de l'ADN
   - Nombre de warnings/errors

4. **Sécurité**
   - Tentatives de signatures invalides
   - Rate limit hits

### Dashboard recommandé

Créer un dashboard avec :
- Graphique : Accès + Interactions + Conversions (timeline)
- Top 10 produits recommandés
- Performance par agent IA
- Alertes : Baisse de conversion, signatures invalides

---

## 🎓 CONCLUSION

Ce système backend transforme votre site web en une **API sémantique intelligente** que les IA peuvent interroger pour vous représenter fidèlement.

**Bénéfices** :
✅ Contrôle total de votre message de marque
✅ Protection contre phishing et désinformation
✅ Métriques précises sur l'efficacité
✅ Indépendance vis-à-vis des plateformes

**Prochaines étapes** :
1. Implémenter la Partie 3 : Commerce M2M
2. Ajouter un dashboard administrateur
3. Intégrer avec CMS existant
4. Créer un SDK pour les développeurs d'IA

---

📧 Support : contact@votre-marque.com
