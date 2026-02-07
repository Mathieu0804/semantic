# 📐 ARCHITECTURE DÉTAILLÉE - MARKETING SÉMANTIQUE

## 🎯 OBJECTIF DU DOCUMENT

Ce document explique **en profondeur** comment fonctionne chaque composant du système backend, leurs rôles, leurs interactions et leurs fonctions précises.

---

## 📊 VUE D'ENSEMBLE DE L'ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────────┐
│                      COUCHE PRÉSENTATION                        │
│  • Sites web des marques                                        │
│  • Applications mobiles                                         │
│  • Agents IA (ChatGPT, Claude, Perplexity, etc.)              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP/HTTPS
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      COUCHE APPLICATION                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SERVER.JS (Express)                        │  │
│  │  • Routage API                                          │  │
│  │  • Middleware de sécurité                               │  │
│  │  • Gestion des requêtes/réponses                        │  │
│  └─────────────────────────────────────────────────────────┘  │
│                         │                                       │
│        ┌────────────────┼────────────────┐                     │
│        │                │                │                     │
│        ▼                ▼                ▼                     │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐               │
│  │VALIDATORS│    │ DATABASE │    │ANALYTICS │               │
│  │   .js    │    │   .js    │    │   (logs) │               │
│  └──────────┘    └──────────┘    └──────────┘               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      │ Mongoose ORM
                      │
┌─────────────────────▼───────────────────────────────────────────┐
│                    COUCHE DONNÉES                               │
│                                                                 │
│  ┌─────────────────┐          ┌─────────────────┐             │
│  │  Collection:    │          │  Collection:    │             │
│  │    brands       │          │   analytics     │             │
│  │                 │          │                 │             │
│  │  • Documents    │          │  • Logs         │             │
│  │    de marques   │          │  • Événements   │             │
│  │  • Produits     │          │  • Métriques    │             │
│  └─────────────────┘          └─────────────────┘             │
│                                                                 │
│                     MongoDB                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 COMPOSANT 1 : SERVER.JS

### 📝 Rôle

Le serveur principal qui :
1. **Expose l'API REST** pour gérer l'ADN des marques
2. **Gère la sécurité** (CORS, rate limiting, helmet)
3. **Route les requêtes** vers les bonnes fonctions
4. **Transforme les données** entre formats (JSON brut ↔ JSON-LD)

### 🔨 Fonctions principales

#### 1. Configuration du serveur

```javascript
const app = express();
app.use(cors());      // Permet aux IA d'accéder aux données
app.use(helmet());    // Sécurise les headers HTTP
app.use(express.json()); // Parse les requêtes JSON
```

**Pourquoi ?**
- **CORS** : Sans cela, les agents IA ne pourraient pas faire de requêtes depuis des domaines différents
- **Helmet** : Protège contre des attaques comme XSS, clickjacking, etc.
- **express.json()** : Convertit automatiquement le body des requêtes en objets JavaScript

#### 2. Rate Limiting

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requêtes max
});
```

**Pourquoi ?**
Protège contre :
- Les attaques DDoS (Distributed Denial of Service)
- Les bots malveillants qui spamment l'API
- Les coûts excessifs de serveur

**Comment ça marche ?**
1. Chaque IP est trackée
2. Compteur incrémenté à chaque requête
3. Si > 100 requêtes en 15 min → HTTP 429 (Too Many Requests)
4. Compteur reset après 15 minutes

#### 3. Logging des agents IA

```javascript
app.use((req, res, next) => {
    const isAIAgent = req.headers['x-ai-agent'] || 
                      req.headers['user-agent']?.includes('AI');
    
    if (isAIAgent) {
        console.log(`[IA REQUEST] ${req.method} ${req.path}`);
    }
    next();
});
```

**Pourquoi ?**
Permet de :
- **Identifier** quels agents IA utilisent l'API
- **Analyser** les patterns de requêtes
- **Optimiser** l'API selon les usages réels
- **Détecter** les abus

#### 4. Routes API

##### GET /api/brands

```javascript
app.get('/api/brands', (req, res) => {
    // Liste simplifiée des marques
    const brands = brandDatabase.brands.map(b => ({
        id: b.id,
        name: b.name,
        version: b.version,
        status: b.status
    }));
    
    res.json({ success: true, data: brands });
});
```

**Quand l'utiliser ?**
- Dashboard administrateur
- Sélecteur de marque dans une interface
- Discovery endpoint pour les agents IA

##### GET /api/brands/:id

```javascript
app.get('/api/brands/:id', (req, res) => {
    const brand = findBrand(req.params.id);
    
    logAIAnalytics({
        event: 'brand_data_request',
        brandId: brand.id
    });
    
    res.json({ success: true, data: brand });
});
```

**Quand l'utiliser ?**
- Récupérer TOUTES les infos d'une marque
- Format JSON standard (pas JSON-LD)

##### GET /api/brands/:id/jsonld

```javascript
app.get('/api/brands/:id/jsonld', (req, res) => {
    const brand = findBrand(req.params.id);
    const jsonLD = convertToJSONLD(brand);
    
    res.setHeader('Content-Type', 'application/ld+json');
    res.json(jsonLD);
});
```

**Quand l'utiliser ?**
- **C'est l'endpoint principal pour les IA**
- Format optimisé selon les standards Schema.org
- Meilleure compréhension sémantique

**Différence entre /api/brands/:id et /api/brands/:id/jsonld ?**

| Aspect | /api/brands/:id | /api/brands/:id/jsonld |
|--------|----------------|----------------------|
| Format | JSON brut | JSON-LD (Linked Data) |
| Usage | Humains, dashboards | Agents IA, moteurs de recherche |
| Structure | Plate | Hiérarchique avec @context |
| Sémantique | Faible | Riche (comprend les relations) |

##### POST /api/brands

```javascript
app.post('/api/brands', (req, res) => {
    const { name, identity, products } = req.body;
    
    // Validation
    if (!name || !identity || !products) {
        return res.status(400).json({ 
            error: 'Données incomplètes' 
        });
    }
    
    // Création
    const newBrand = {
        id: generateId(),
        name,
        identity,
        products,
        version: '1.0.0',
        lastUpdated: new Date()
    };
    
    database.save(newBrand);
    
    res.status(201).json({ 
        success: true, 
        data: newBrand 
    });
});
```

**Étapes internes :**
1. **Parsing** : Express extrait le JSON du body
2. **Validation basique** : Vérifie la présence des champs requis
3. **Génération d'ID** : Crée un identifiant unique
4. **Sauvegarde** : Persiste dans la base de données
5. **Réponse** : Retourne la marque créée avec son ID

##### PUT /api/brands/:id

```javascript
app.put('/api/brands/:id', (req, res) => {
    const brand = findBrand(req.params.id);
    
    // Fusion des données
    const updated = {
        ...brand,
        ...req.body,
        id: brand.id, // Préserver l'ID
        version: incrementVersion(brand.version),
        lastUpdated: new Date()
    };
    
    database.update(updated);
    
    res.json({ success: true, data: updated });
});
```

**Pourquoi incrémenter la version ?**
- Permet aux agents IA de savoir si les données ont changé
- Utile pour le caching : "Pas de mise à jour depuis v1.2.0"
- Traçabilité : audit trail des changements

##### GET /api/products/search

```javascript
app.get('/api/products/search', (req, res) => {
    const { query, category, maxPrice, minSustainability } = req.query;
    
    let results = getAllProducts();
    
    // Filtrage sémantique
    if (query) {
        const terms = query.toLowerCase().split(' ');
        results = results.filter(p => {
            const text = `${p.name} ${p.description} ${p.aiPitch}`;
            return terms.some(t => text.includes(t));
        });
    }
    
    if (maxPrice) {
        results = results.filter(p => p.price <= maxPrice);
    }
    
    // ... autres filtres
    
    res.json({ success: true, data: results });
});
```

**Cas d'usage concret :**

Utilisateur demande à ChatGPT : *"Trouve un soin anti-âge bio sous 60€"*

1. ChatGPT appelle : `GET /api/products/search?query=anti-age bio&maxPrice=60`
2. Le serveur filtre les produits
3. Retourne les résultats avec leur `aiPitch`
4. ChatGPT présente : *"J'ai trouvé 3 produits..."*

##### GET /embed/:brandId

```javascript
app.get('/embed/:brandId', (req, res) => {
    const brand = findBrand(req.params.brandId);
    const jsonLD = convertToJSONLD(brand);
    
    const script = `
    <script type="application/ld+json">
    ${JSON.stringify(jsonLD)}
    </script>
    
    <script>
    window.semanticMarketing = {
        brand: '${brand.id}',
        getBrandData: async () => { /* ... */ }
    };
    </script>
    `;
    
    res.setHeader('Content-Type', 'text/html');
    res.send(script);
});
```

**Comment l'utiliser dans un site web ?**

```html
<!-- Dans le <head> de votre site -->
<script src="http://localhost:3000/embed/luxe-ethique-001"></script>
```

**Résultat :**
1. Le JSON-LD est injecté dans la page
2. Google, Bing, agents IA peuvent le lire
3. L'objet `window.semanticMarketing` devient disponible pour JavaScript

#### 5. Fonction de conversion JSON-LD

```javascript
function convertToJSONLD(brandData) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': brandData.name,
        'brandIdentity': {
            '@type': 'BrandGuidelines',
            'aiInstructions': brandData.identity.aiInstructions
        },
        'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'itemListElement': brandData.products.map(...)
        }
    };
}
```

**Pourquoi JSON-LD ?**

JSON-LD = **JSON for Linking Data**

**Avantages :**
1. **Compréhension sémantique** : Les IA comprennent les relations (Product → Offer → Price)
2. **Standard universel** : Google, Microsoft, Meta l'utilisent
3. **Extensible** : On peut ajouter nos propres types (@type: 'BrandGuidelines')
4. **Évolutif** : Compatible avec les futures IA

**Exemple de différence :**

```javascript
// JSON classique
{
  "product": "Sérum",
  "price": 68
}

// JSON-LD
{
  "@type": "Product",
  "name": "Sérum",
  "offers": {
    "@type": "Offer",
    "price": 68,
    "priceCurrency": "EUR"
  }
}
```

L'IA comprend que 68 est un **prix en euros**, pas juste un nombre.

---

## 🔧 COMPOSANT 2 : DATABASE.JS

### 📝 Rôle

Gère la **persistance des données** avec MongoDB via Mongoose.

### 🗃️ Structure des schémas

#### Schéma Principal : Brand

```javascript
const brandSchema = new mongoose.Schema({
    brandId: String,      // Identifiant unique
    name: String,         // Nom de la marque
    version: String,      // Version de l'ADN (ex: "1.2.0")
    status: String,       // 'draft', 'active', 'archived'
    identity: Object,     // Identité complète de la marque
    products: Array,      // Catalogue de produits
    
    // Métadonnées automatiques
    createdAt: Date,      // Date de création
    updatedAt: Date,      // Dernière modification
    viewCount: Number,    // Nombre de consultations
    lastAccessed: Date    // Dernière consultation
});
```

#### Méthodes d'instance

```javascript
// Incrémenter la version
brand.incrementVersion()  // 1.2.0 → 1.2.1

// Activer/archiver
brand.activate()
brand.archive()

// Enregistrer une vue
brand.recordView()

// Convertir en JSON-LD
brand.toJSONLD()
```

**Pourquoi des méthodes d'instance ?**

Au lieu de :
```javascript
brand.version = incrementVersion(brand.version);
brand.save();
```

On peut simplement :
```javascript
brand.incrementVersion();
```

Plus propre, plus maintenable, logique encapsulée.

#### Méthodes statiques

```javascript
// Recherche textuelle
Brand.searchByText('cosmétiques bio')

// Récupérer les marques actives
Brand.findActive()

// Statistiques
Brand.getStats()
```

**Exemple d'utilisation :**

```javascript
// Recherche tous les produits mentionnant "bio"
const brands = await Brand.searchByText('bio');

// Récupère toutes les marques actives
const activeBrands = await Brand.findActive();

// Statistiques globales
const stats = await Brand.getStats();
// Résultat : { active: 5, draft: 2, avgProducts: 12 }
```

#### Index pour performances

```javascript
brandSchema.index({ name: 'text', 'identity.description': 'text' });
brandSchema.index({ status: 1, updatedAt: -1 });
```

**Pourquoi des index ?**

Sans index :
- Recherche de "Sérum" → Scan de TOUTES les marques → Lent

Avec index :
- MongoDB crée une structure optimisée
- Recherche instantanée même avec 10 000 marques

**Types d'index :**
- **text** : Pour recherche textuelle (`$text: { $search: "..." }`)
- **1** : Ordre croissant (A→Z, 0→9)
- **-1** : Ordre décroissant (Z→A, 9→0)

#### Schéma Analytics

```javascript
const analyticsSchema = new mongoose.Schema({
    event: String,        // 'brand_data_request', 'product_search'
    brandId: String,      // ID de la marque concernée
    userAgent: String,    // User-Agent de la requête
    timestamp: Date       // Horodatage
});
```

**Utilisation :**

```javascript
// Enregistrer une consultation
Analytics.create({
    event: 'brand_data_request',
    brandId: 'luxe-ethique-001',
    userAgent: req.headers['user-agent']
});

// Analyser les tendances
const last24h = await Analytics.find({
    timestamp: { $gte: new Date(Date.now() - 24*60*60*1000) }
});
```

---

## 🔧 COMPOSANT 3 : VALIDATORS.JS

### 📝 Rôle

Valide que les données de marque sont :
1. **Structurellement correctes** (champs requis, types, formats)
2. **Sémantiquement cohérentes** (qualité des instructions IA)

### 🔍 Validation structurelle

#### Schéma de validation

```javascript
const brandSchema = {
    required: ['name', 'identity', 'products'],
    fields: {
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        identity: {
            type: 'object',
            required: ['description', 'url', 'aiInstructions']
        }
    }
};
```

#### Fonction de validation

```javascript
function validateField(value, rules) {
    const errors = [];
    
    // Vérifier le type
    if (typeof value !== rules.type) {
        errors.push('Type incorrect');
    }
    
    // Vérifier la longueur (pour strings)
    if (value.length < rules.minLength) {
        errors.push('Trop court');
    }
    
    return errors;
}
```

**Exemple :**

```javascript
const brand = {
    name: 'X',  // ERREUR : trop court (min 2)
    identity: {
        description: 'Ma marque',
        url: 'not-a-url',  // ERREUR : format URL invalide
        aiInstructions: {
            role: 'Ambassadeur',
            tone: ['Un seul']  // ERREUR : min 2 éléments
        }
    }
};

const result = validateBrand(brand);
// result.isValid = false
// result.errors = ['name: trop court', 'url: invalide', ...]
```

### 🧠 Validation sémantique

#### Objectif

Vérifier la **qualité** des instructions pour l'IA, pas juste leur présence.

#### Checks effectués

```javascript
function validateSemanticQuality(brand) {
    const warnings = [];
    
    // 1. Rôle IA trop court
    if (brand.identity.aiInstructions.role.length < 50) {
        warnings.push('Rôle IA trop court');
    }
    
    // 2. Cohérence valeurs ↔ messages
    const values = brand.identity.aiInstructions.values.join(' ');
    const messages = brand.identity.aiInstructions.keyMessages.join(' ');
    
    if (values.includes('durable') && !messages.includes('durable')) {
        warnings.push('Messages ne reflètent pas la valeur "durable"');
    }
    
    // 3. aiPitch trop court
    brand.products.forEach(p => {
        if (p.aiPitch.length < 30) {
            warnings.push(`aiPitch trop court pour ${p.name}`);
        }
    });
    
    return { warnings };
}
```

**Pourquoi c'est important ?**

❌ **Mauvais aiPitch** : "Bon produit"
✅ **Bon aiPitch** : "Recommandé pour les peaux sensibles cherchant un éclat naturel. Formule hypoallergénique testée dermatologiquement."

L'IA aura beaucoup plus de contexte pour faire une bonne recommandation.

#### Score de qualité

```javascript
function calculateQualityScore(structureValidation, semanticValidation) {
    let score = 100;
    
    score -= structureValidation.errors.length * 50;  // -50 par erreur
    score -= semanticValidation.warnings.length * 5;  // -5 par warning
    
    return Math.max(0, score);
}
```

**Interprétation :**
- **100** : Parfait, données optimales
- **80-99** : Bien, quelques améliorations possibles
- **50-79** : Moyen, optimisation recommandée
- **< 50** : Faible, révision nécessaire

---

## 🔄 FLUX DE DONNÉES COMPLET

### Scénario : Création d'une nouvelle marque

```
1. CLIENT envoie POST /api/brands
   ↓
2. SERVER.JS reçoit la requête
   ↓
3. VALIDATORS.JS valide les données
   ├─ Erreur ? → Retour 400 Bad Request
   └─ OK ? → Continue
   ↓
4. Génération d'un ID unique
   ↓
5. DATABASE.JS sauvegarde dans MongoDB
   ↓
6. ANALYTICS enregistre l'événement
   ↓
7. SERVER.JS retourne la réponse 201 Created
```

### Scénario : Agent IA recherche un produit

```
1. IA demande à l'utilisateur ses critères
   ↓
2. IA appelle GET /api/products/search?query=...
   ↓
3. SERVER.JS parse les paramètres
   ↓
4. DATABASE.JS récupère tous les produits
   ↓
5. Filtrage selon critères (prix, catégorie, etc.)
   ↓
6. SERVER.JS retourne les résultats
   ↓
7. IA présente les produits à l'utilisateur
   avec les aiPitch contextualisés
```

---

## 🔐 SÉCURITÉ - FONCTIONNEMENT DÉTAILLÉ

### 1. Helmet

```javascript
app.use(helmet());
```

**Headers HTTP ajoutés :**
- `X-Content-Type-Options: nosniff` → Empêche les attaques MIME
- `X-Frame-Options: DENY` → Empêche le clickjacking
- `Strict-Transport-Security` → Force HTTPS
- `X-XSS-Protection` → Protection XSS navigateur

### 2. CORS

```javascript
app.use(cors({
    origin: ['https://marque.com', 'https://ia-agent.com'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type']
}));
```

**Sans CORS :**
```
https://ia-agent.com → GET http://api.com/brands
❌ BLOQUÉ par le navigateur (Same-Origin Policy)
```

**Avec CORS :**
```
https://ia-agent.com → GET http://api.com/brands
✅ AUTORISÉ (header Access-Control-Allow-Origin présent)
```

### 3. Rate Limiting

```javascript
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    handler: (req, res) => {
        res.status(429).json({
            error: 'Trop de requêtes'
        });
    }
});
```

**Fonctionnement interne :**
1. Stockage en mémoire (ou Redis en production)
2. Clé = IP de l'utilisateur
3. Valeur = compteur de requêtes
4. TTL = 15 minutes

**Stockage :**
```
{
  "192.168.1.1": { count: 87, resetAt: 1675889400 },
  "192.168.1.2": { count: 12, resetAt: 1675889400 }
}
```

---

## 📊 ANALYTICS - TRACKING DES IA

### Enregistrement d'un événement

```javascript
function logAIAnalytics(event) {
    Analytics.create({
        event: event.type,
        brandId: event.brandId,
        userAgent: event.userAgent,
        metadata: event.metadata,
        timestamp: new Date()
    });
}
```

### Types d'événements trackés

1. **brand_data_request** : Consultation d'une marque
2. **jsonld_request** : Consultation du JSON-LD
3. **product_search** : Recherche de produits
4. **brand_created** : Création de marque
5. **brand_updated** : Mise à jour de marque

### Analyse des données

```javascript
// Marques les plus consultées
const topBrands = await Analytics.aggregate([
    { $match: { event: 'brand_data_request' } },
    { $group: { _id: '$brandId', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 }
]);

// Agents IA les plus actifs
const topAgents = await Analytics.aggregate([
    { $group: { _id: '$userAgent', count: { $sum: 1 } } },
    { $sort: { count: -1 } }
]);
```

---

## 🚀 OPTIMISATIONS POSSIBLES

### 1. Caching avec Redis

```javascript
const redis = require('redis');
const client = redis.createClient();

app.get('/api/brands/:id', async (req, res) => {
    // Vérifier le cache
    const cached = await client.get(`brand:${req.params.id}`);
    
    if (cached) {
        return res.json(JSON.parse(cached));
    }
    
    // Sinon, récupérer de la base
    const brand = await Brand.findOne({ brandId: req.params.id });
    
    // Mettre en cache (expire après 1h)
    await client.setex(`brand:${req.params.id}`, 3600, JSON.stringify(brand));
    
    res.json(brand);
});
```

**Gain :** Réponse 100x plus rapide (< 10ms vs 100-200ms)

### 2. CDN pour les données statiques

```javascript
// Générer un fichier JSON-LD statique
const jsonLD = brand.toJSONLD();
fs.writeFileSync(`./cdn/brands/${brand.id}.jsonld`, JSON.stringify(jsonLD));

// Servir via CDN (Cloudflare, AWS CloudFront)
// URL : https://cdn.semantic-marketing.com/brands/luxe-ethique-001.jsonld
```

**Avantages :**
- Latence ultra-faible (< 50ms globalement)
- Pas de charge sur le serveur
- Mise à jour périodique (ex: toutes les heures)

### 3. GraphQL pour requêtes complexes

```graphql
query {
  brand(id: "luxe-ethique-001") {
    name
    products(category: "Soin visage", maxPrice: 70) {
      name
      price
      aiPitch
    }
  }
}
```

**Avantages :**
- Les IA peuvent demander exactement ce qu'elles veulent
- Pas de sur-fetching
- Une seule requête au lieu de plusieurs

---

## 🔮 ÉVOLUTION FUTURE (Parties 2 & 3)

### Partie 2 : Certification (C2PA)

```javascript
const crypto = require('crypto');

function signBrandData(brand, privateKey) {
    const data = JSON.stringify(brand);
    const signature = crypto.sign('sha256', Buffer.from(data), privateKey);
    
    return {
        data: brand,
        signature: signature.toString('base64'),
        timestamp: new Date(),
        issuer: 'LuxeÉthique'
    };
}

function verifyBrandData(signedData, publicKey) {
    const isValid = crypto.verify(
        'sha256',
        Buffer.from(JSON.stringify(signedData.data)),
        publicKey,
        Buffer.from(signedData.signature, 'base64')
    );
    
    return isValid;
}
```

### Partie 3 : Commerce M2M

```javascript
// Négociation automatique entre agents IA
app.post('/api/negotiate', async (req, res) => {
    const { productId, constraints } = req.body;
    
    const product = await findProduct(productId);
    
    // L'IA de la marque propose une offre
    const offer = {
        product: product,
        price: calculateDynamicPrice(product, constraints),
        delivery: estimateDelivery(constraints.location),
        loyaltyBonus: checkLoyalty(constraints.userId)
    };
    
    res.json({ offer });
});
```

---

**Document créé le** : Février 2026  
**Version** : 1.0.0
