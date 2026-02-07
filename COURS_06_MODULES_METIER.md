# 🏗️ COURS 6 : MODULES MÉTIER

## Architecture modulaire et organisation du code

**Durée :** 3 heures  
**Niveau :** Intermédiaire  
**Prérequis :** Cours 1-5

---

## 📋 SOMMAIRE

1. [Qu'est-ce qu'un module ?](#1-module)
2. [Architecture modulaire](#2-architecture)
3. [DataImporter décortiqué](#3-dataimporter)
4. [BrandDNAManager décortiqué](#4-branddna)
5. [TestEnvironment décortiqué](#5-testenv)
6. [Créer ses propres modules](#6-creer)
7. [Bonnes pratiques](#7-bonnes-pratiques)
8. [Exercices](#8-exercices)
9. [Quiz](#9-quiz)

---

## 1. QU'EST-CE QU'UN MODULE ? {#1-module}

### 🧩 Définition simple

Un **module** est un **fichier JavaScript** qui contient du code réutilisable.

**Sans modules (tout dans un fichier) :**
```javascript
// server.js - 5000 lignes 😱
const express = require('express');
const app = express();

// Routes utilisateurs
app.get('/users', (req, res) => {...});
app.post('/users', (req, res) => {...});

// Routes produits
app.get('/products', (req, res) => {...});
app.post('/products', (req, res) => {...});

// Fonctions base de données
function getUserById(id) {...}
function createUser(data) {...}
function getProductById(id) {...}

// Fonctions IA
function analyzeText(text) {...}
function generateContent(prompt) {...}

// ... 5000 lignes de plus
```

**Avec modules (organisé) :**
```javascript
// server.js - 50 lignes 😊
const express = require('express');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

app.use('/users', userRoutes);
app.use('/products', productRoutes);

// routes/users.js
const db = require('../modules/database');
const router = express.Router();
router.get('/', async (req, res) => {...});

// modules/database.js
class Database {
  async getUserById(id) {...}
  async createUser(data) {...}
}

// modules/ai.js
class AIService {
  async analyzeText(text) {...}
  async generateContent(prompt) {...}
}
```

### ✅ Avantages des modules

| Avantage | Explication |
|----------|-------------|
| **Lisibilité** | Code organisé et facile à trouver |
| **Réutilisabilité** | Utiliser le même code partout |
| **Testabilité** | Tester chaque module séparément |
| **Maintenabilité** | Modifier sans casser le reste |
| **Collaboration** | Plusieurs devs sur différents modules |

### 🎯 Analogie

```
Application = Maison
├─ Cuisine (module cuisine)
│  ├─ Frigo (classe)
│  ├─ Four (classe)
│  └─ Évier (classe)
├─ Chambre (module chambre)
│  ├─ Lit (classe)
│  └─ Armoire (classe)
└─ Salon (module salon)
   ├─ Canapé (classe)
   └─ TV (classe)

Chaque pièce = module indépendant
Mais elles communiquent entre elles
```

---

## 2. ARCHITECTURE MODULAIRE {#2-architecture}

### 🏗️ Structure du projet Semantic Platform

```
semantic-platform/
├─ server.js                 ← Point d'entrée
├─ config/                   ← Configuration
│  ├─ database.js           ← Connexion DB
│  └─ ollama.js             ← Connexion IA
├─ routes/                   ← Routes Express
│  ├─ users.js
│  ├─ products.js
│  └─ ai.js
├─ modules/                  ← MODULES MÉTIER
│  ├─ DataImporter.js       ← Import de données
│  ├─ BrandDNAManager.js    ← Gestion ADN de marque
│  └─ TestEnvironment.js    ← Environnement de test
├─ models/                   ← Modèles de données
│  ├─ User.js
│  └─ Product.js
├─ utils/                    ← Utilitaires
│  ├─ logger.js
│  └─ validators.js
└─ public/                   ← Frontend
   ├─ index.html
   └─ dashboard.html
```

### 🔄 Flux de données

```
┌──────────────────┐
│   Client HTTP    │
│  (Navigateur)    │
└────────┬─────────┘
         │ GET /api/products
         ↓
┌──────────────────┐
│    server.js     │ ← Point d'entrée
│  app.use(routes) │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ routes/products  │ ← Route handler
│  router.get('/')  │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│ modules/Database │ ← Module métier
│  getProducts()   │
└────────┬─────────┘
         │
         ↓
┌──────────────────┐
│   PostgreSQL     │ ← Base de données
│   SELECT * ...   │
└──────────────────┘
```

### 📦 Types de modules

#### **1. Modules de configuration**
```javascript
// config/database.js
const { Pool } = require('pg');
const pool = new Pool({...});
module.exports = pool;
```

#### **2. Modules utilitaires**
```javascript
// utils/logger.js
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}
module.exports = { log };
```

#### **3. Modules métier (business logic)**
```javascript
// modules/DataImporter.js
class DataImporter {
  async importCSV(filepath) {
    // Logique métier complexe
  }
}
module.exports = DataImporter;
```

#### **4. Modèles de données**
```javascript
// models/User.js
class User {
  constructor(data) {
    this.id = data.id;
    this.nom = data.nom;
  }
  
  validate() {
    // Validation
  }
}
module.exports = User;
```

---

## 3. DATAIMPORTER DÉCORTIQUÉ {#3-dataimporter}

### 🎯 Rôle du module

**DataImporter** permet d'importer des données depuis différentes sources :
- CSV
- Excel
- JSON
- API externes

### 📁 Structure du fichier

**fichier : modules/DataImporter.js**
```javascript
const fs = require('fs');
const csv = require('csv-parser');
const xlsx = require('xlsx');

class DataImporter {
  constructor(pool) {
    this.pool = pool;  // Connexion à la DB
    this.stats = {
      imported: 0,
      errors: 0
    };
  }
  
  // Méthode 1 : Importer CSV
  async importCSV(filepath, tableName) {
    // ...
  }
  
  // Méthode 2 : Importer Excel
  async importExcel(filepath, tableName) {
    // ...
  }
  
  // Méthode 3 : Valider les données
  validateRow(row, schema) {
    // ...
  }
  
  // Méthode 4 : Insérer en base
  async insertRow(tableName, data) {
    // ...
  }
}

module.exports = DataImporter;
```

### 🔍 Décortiquons chaque méthode

#### **Constructor**

```javascript
constructor(pool) {
  this.pool = pool;  // Stocke la connexion DB
  this.stats = {     // Statistiques d'import
    imported: 0,
    errors: 0
  };
}
```

**Pourquoi `pool` en paramètre ?**
- Le module ne crée PAS la connexion
- Il la reçoit de l'extérieur
- Principe : **Injection de dépendances**

**Utilisation :**
```javascript
const pool = require('../config/database');
const importer = new DataImporter(pool);
```

#### **importCSV - Import de fichier CSV**

```javascript
async importCSV(filepath, tableName) {
  return new Promise((resolve, reject) => {
    const rows = [];
    
    // 1. Lire le fichier CSV
    fs.createReadStream(filepath)
      .pipe(csv())
      .on('data', (row) => {
        // 2. Pour chaque ligne
        rows.push(row);
      })
      .on('end', async () => {
        // 3. Quand terminé
        try {
          // 4. Insérer dans la DB
          for (const row of rows) {
            await this.insertRow(tableName, row);
            this.stats.imported++;
          }
          resolve(this.stats);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', reject);
  });
}
```

**Explications :**

1. **Stream de lecture**
```javascript
fs.createReadStream(filepath)
// Lit le fichier ligne par ligne (efficace pour gros fichiers)
```

2. **Pipe vers csv-parser**
```javascript
.pipe(csv())
// Transforme chaque ligne en objet JavaScript
// "Alice,25,alice@email.com" → {nom: 'Alice', age: '25', email: '...'}
```

3. **Événement 'data'**
```javascript
.on('data', (row) => {
  rows.push(row);
})
// Collecte chaque ligne
```

4. **Événement 'end'**
```javascript
.on('end', async () => {
  // Fichier entièrement lu
  // Maintenant on insère tout en DB
})
```

#### **insertRow - Insertion dynamique**

```javascript
async insertRow(tableName, data) {
  // 1. Extraire les colonnes
  const columns = Object.keys(data);
  // ['nom', 'age', 'email']
  
  // 2. Extraire les valeurs
  const values = Object.values(data);
  // ['Alice', '25', 'alice@email.com']
  
  // 3. Créer les placeholders ($1, $2, $3)
  const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
  // '$1, $2, $3'
  
  // 4. Construire la requête SQL
  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders})
  `;
  // INSERT INTO users (nom, age, email) VALUES ($1, $2, $3)
  
  // 5. Exécuter
  try {
    await this.pool.query(query, values);
  } catch (error) {
    this.stats.errors++;
    console.error(`Erreur ligne :`, data, error.message);
  }
}
```

**Pourquoi dynamique ?**
- Fonctionne avec N'IMPORTE quelle table
- S'adapte aux colonnes du CSV

### 🎯 Utilisation complète

**fichier : routes/import.js**
```javascript
const express = require('express');
const multer = require('multer');
const pool = require('../config/database');
const DataImporter = require('../modules/DataImporter');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Route d'import
router.post('/import/csv', upload.single('file'), async (req, res) => {
  try {
    const { tableName } = req.body;
    const filepath = req.file.path;
    
    // Créer une instance
    const importer = new DataImporter(pool);
    
    // Importer
    const stats = await importer.importCSV(filepath, tableName);
    
    res.json({
      message: 'Import réussi',
      stats: stats
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

**Tester avec Postman :**
```
POST http://localhost:3000/api/import/csv
Body (form-data):
  - file: [votre fichier.csv]
  - tableName: "users"
```

---

## 4. BRANDDNAMANAGER DÉCORTIQUÉ {#4-branddna}

### 🧬 Concept : ADN de marque

L'**ADN de marque** (Brand DNA) est l'ensemble des caractéristiques qui définissent une marque :
- Ton de communication
- Valeurs
- Personnalité
- Style visuel
- Vocabulaire préféré

**Pourquoi un module pour ça ?**
- L'IA doit connaître la marque
- Générer du contenu cohérent
- Analyser si du contenu est "on-brand"

### 📁 Structure du module

**fichier : modules/BrandDNAManager.js**
```javascript
const pool = require('../config/database');
const ollama = require('../config/ollama');

class BrandDNAManager {
  constructor() {
    this.dnaCache = new Map();  // Cache en mémoire
  }
  
  // Méthode 1 : Charger l'ADN d'une marque
  async loadBrandDNA(brandId) {
    // ...
  }
  
  // Méthode 2 : Analyser un texte
  async analyzeContent(brandId, content) {
    // ...
  }
  
  // Méthode 3 : Générer du contenu "on-brand"
  async generateBrandedContent(brandId, prompt) {
    // ...
  }
  
  // Méthode 4 : Mettre à jour l'ADN
  async updateBrandDNA(brandId, dnaData) {
    // ...
  }
}

module.exports = BrandDNAManager;
```

### 🔍 Décortiquons les méthodes

#### **loadBrandDNA - Charger depuis la DB**

```javascript
async loadBrandDNA(brandId) {
  // 1. Vérifier le cache
  if (this.dnaCache.has(brandId)) {
    return this.dnaCache.get(brandId);
  }
  
  // 2. Sinon, charger depuis la DB
  const result = await pool.query(
    'SELECT * FROM brand_dna WHERE brand_id = $1',
    [brandId]
  );
  
  if (result.rowCount === 0) {
    throw new Error(`ADN non trouvé pour brand ${brandId}`);
  }
  
  const dna = result.rows[0];
  
  // 3. Parser le JSON (si stocké en JSON)
  if (typeof dna.values === 'string') {
    dna.values = JSON.parse(dna.values);
  }
  if (typeof dna.tone === 'string') {
    dna.tone = JSON.parse(dna.tone);
  }
  
  // 4. Mettre en cache
  this.dnaCache.set(brandId, dna);
  
  return dna;
}
```

**Structure de l'ADN en DB :**
```sql
CREATE TABLE brand_dna (
    id SERIAL PRIMARY KEY,
    brand_id INTEGER REFERENCES brands(id),
    values JSONB,  -- ["Innovation", "Qualité", "Durabilité"]
    tone JSONB,    -- {"formality": 7, "warmth": 8, "enthusiasm": 6}
    vocabulary JSONB,  -- {"preferred": [...], "avoid": [...]}
    visual_style JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### **analyzeContent - Analyser si "on-brand"**

```javascript
async analyzeContent(brandId, content) {
  // 1. Charger l'ADN
  const dna = await this.loadBrandDNA(brandId);
  
  // 2. Créer le prompt pour l'IA
  const prompt = `
Tu es un expert en analyse de marque.

ADN de marque :
- Valeurs : ${dna.values.join(', ')}
- Ton : Formalité ${dna.tone.formality}/10, Chaleur ${dna.tone.warmth}/10
- Vocabulaire préféré : ${dna.vocabulary.preferred.join(', ')}
- Vocabulaire à éviter : ${dna.vocabulary.avoid.join(', ')}

Analyse ce contenu et dis s'il respecte l'ADN de la marque :

"${content}"

Réponds en JSON :
{
  "on_brand": true/false,
  "score": 0-100,
  "strengths": ["..."],
  "improvements": ["..."]
}
`;

  // 3. Appeler l'IA
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: prompt }]
  });
  
  // 4. Parser la réponse
  const text = response.message.content;
  const json = JSON.parse(text.match(/\{.*\}/s)[0]);
  
  return json;
}
```

**Utilisation :**
```javascript
const manager = new BrandDNAManager();

const content = "Notre produit révolutionnaire change la donne !";
const analysis = await manager.analyzeContent(1, content);

console.log(analysis);
/*
{
  on_brand: true,
  score: 85,
  strengths: ["Ton enthousiaste", "Vocabulaire innovant"],
  improvements: ["Ajouter mention de qualité"]
}
*/
```

#### **generateBrandedContent - Générer du contenu**

```javascript
async generateBrandedContent(brandId, prompt) {
  // 1. Charger l'ADN
  const dna = await this.loadBrandDNA(brandId);
  
  // 2. Créer un prompt enrichi
  const enrichedPrompt = `
Tu es le copywriter de la marque.

IDENTITÉ DE MARQUE :
Valeurs : ${dna.values.join(', ')}
Ton : ${this.describeTone(dna.tone)}
Utilise ces mots : ${dna.vocabulary.preferred.join(', ')}
Évite ces mots : ${dna.vocabulary.avoid.join(', ')}

DEMANDE :
${prompt}

Génère du contenu qui respecte parfaitement l'ADN de marque.
`;

  // 3. Appeler l'IA
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: enrichedPrompt }]
  });
  
  return response.message.content;
}

// Fonction helper
describeTone(tone) {
  const descriptions = [];
  
  if (tone.formality > 7) descriptions.push("très formel");
  else if (tone.formality > 4) descriptions.push("semi-formel");
  else descriptions.push("décontracté");
  
  if (tone.warmth > 7) descriptions.push("chaleureux");
  if (tone.enthusiasm > 7) descriptions.push("enthousiaste");
  
  return descriptions.join(', ');
}
```

**Utilisation :**
```javascript
const content = await manager.generateBrandedContent(
  1,
  "Écris un tweet pour annoncer notre nouveau produit"
);

console.log(content);
// "🚀 Découvrez notre dernière innovation qui allie qualité 
//  et durabilité ! Un produit pensé pour vous. #Innovation"
```

---

## 5. TESTENVIRONMENT DÉCORTIQUÉ {#5-testenv}

### 🧪 Rôle du module

**TestEnvironment** crée un environnement isolé pour tester l'auto-apprentissage de l'IA :
- Générer des données de test
- Simuler des interactions
- Mesurer les performances
- Nettoyer après les tests

### 📁 Structure du module

**fichier : modules/TestEnvironment.js**
```javascript
const pool = require('../config/database');
const ollama = require('../config/ollama');

class TestEnvironment {
  constructor() {
    this.testDB = 'test_semantic_platform';
    this.testData = [];
  }
  
  // Méthode 1 : Créer l'environnement
  async setup() {
    // ...
  }
  
  // Méthode 2 : Générer des données de test
  async generateTestData(count) {
    // ...
  }
  
  // Méthode 3 : Exécuter un test
  async runTest(testName, testFn) {
    // ...
  }
  
  // Méthode 4 : Mesurer les performances
  async benchmark(operation, iterations) {
    // ...
  }
  
  // Méthode 5 : Nettoyer
  async teardown() {
    // ...
  }
}

module.exports = TestEnvironment;
```

### 🔍 Décortiquons les méthodes

#### **setup - Créer l'environnement**

```javascript
async setup() {
  console.log('🧪 Création environnement de test...');
  
  try {
    // 1. Créer la base de test
    await pool.query(`
      CREATE DATABASE ${this.testDB}
      WITH TEMPLATE template0
      ENCODING 'UTF8'
    `);
    
    // 2. Se connecter à la base de test
    this.testPool = new Pool({
      ...pool.options,
      database: this.testDB
    });
    
    // 3. Créer les tables
    await this.createTables();
    
    console.log('✅ Environnement prêt');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Base de test existe déjà');
    } else {
      throw error;
    }
  }
}

async createTables() {
  // Créer les mêmes tables que prod
  await this.testPool.query(`
    CREATE TABLE IF NOT EXISTS test_users (
      id SERIAL PRIMARY KEY,
      nom VARCHAR(100),
      email VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE IF NOT EXISTS test_interactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER,
      input TEXT,
      output TEXT,
      score NUMERIC(5,2),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}
```

#### **generateTestData - Générer des données**

```javascript
async generateTestData(count) {
  console.log(`📊 Génération de ${count} données de test...`);
  
  const names = ['Alice', 'Bob', 'Charlie', 'David', 'Eve'];
  const domains = ['email.com', 'test.fr', 'demo.org'];
  
  for (let i = 0; i < count; i++) {
    const nom = names[Math.floor(Math.random() * names.length)];
    const email = `${nom.toLowerCase()}${i}@${domains[Math.floor(Math.random() * domains.length)]}`;
    
    const result = await this.testPool.query(
      'INSERT INTO test_users (nom, email) VALUES ($1, $2) RETURNING *',
      [nom, email]
    );
    
    this.testData.push(result.rows[0]);
  }
  
  console.log(`✅ ${count} utilisateurs générés`);
  return this.testData;
}
```

#### **runTest - Exécuter un test**

```javascript
async runTest(testName, testFn) {
  console.log(`\n🧪 Test : ${testName}`);
  const startTime = Date.now();
  
  try {
    // Exécuter la fonction de test
    const result = await testFn(this.testPool);
    
    const duration = Date.now() - startTime;
    console.log(`✅ Réussi en ${duration}ms`);
    
    return {
      success: true,
      duration,
      result
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`❌ Échoué en ${duration}ms :`, error.message);
    
    return {
      success: false,
      duration,
      error: error.message
    };
  }
}
```

**Utilisation :**
```javascript
const env = new TestEnvironment();

await env.setup();
await env.generateTestData(100);

// Test 1 : Insertion
await env.runTest('Insert performance', async (pool) => {
  const start = Date.now();
  for (let i = 0; i < 1000; i++) {
    await pool.query(
      'INSERT INTO test_users (nom, email) VALUES ($1, $2)',
      [`User${i}`, `user${i}@test.com`]
    );
  }
  return Date.now() - start;
});

// Test 2 : Requête IA
await env.runTest('AI response time', async () => {
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: 'Test' }]
  });
  return response.message.content.length;
});

await env.teardown();
```

#### **benchmark - Mesurer les performances**

```javascript
async benchmark(operation, iterations) {
  console.log(`⚡ Benchmark : ${iterations} itérations`);
  
  const times = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await operation();
    times.push(Date.now() - start);
  }
  
  // Calculer les stats
  const avg = times.reduce((a, b) => a + b) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);
  
  return {
    average: avg,
    min,
    max,
    total: times.reduce((a, b) => a + b)
  };
}
```

**Utilisation :**
```javascript
const stats = await env.benchmark(
  async () => {
    await pool.query('SELECT * FROM users WHERE id = $1', [1]);
  },
  1000
);

console.log(stats);
/*
{
  average: 2.5,  // ms
  min: 1.8,
  max: 15.3,
  total: 2500
}
*/
```

#### **teardown - Nettoyer**

```javascript
async teardown() {
  console.log('🧹 Nettoyage environnement de test...');
  
  try {
    // 1. Fermer la connexion de test
    if (this.testPool) {
      await this.testPool.end();
    }
    
    // 2. Supprimer la base de test
    await pool.query(`DROP DATABASE IF EXISTS ${this.testDB}`);
    
    // 3. Réinitialiser les données
    this.testData = [];
    
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur nettoyage :', error);
  }
}
```

---

## 6. CRÉER SES PROPRES MODULES {#6-creer}

### 🎯 Exemple : Module EmailService

**fichier : modules/EmailService.js**
```javascript
const nodemailer = require('nodemailer');

class EmailService {
  constructor(config) {
    // Configuration SMTP
    this.transporter = nodemailer.createTransport(config);
    this.from = config.from;
  }
  
  // Envoyer un email simple
  async sendEmail(to, subject, body) {
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to,
        subject,
        html: body
      });
      
      return {
        success: true,
        messageId: info.messageId
      };
      
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // Envoyer un email avec template
  async sendTemplateEmail(to, templateName, data) {
    const template = this.loadTemplate(templateName);
    const body = this.renderTemplate(template, data);
    
    return this.sendEmail(to, data.subject, body);
  }
  
  // Charger un template
  loadTemplate(name) {
    const fs = require('fs');
    return fs.readFileSync(`./templates/${name}.html`, 'utf8');
  }
  
  // Rendre le template avec les données
  renderTemplate(template, data) {
    let rendered = template;
    
    for (const [key, value] of Object.entries(data)) {
      rendered = rendered.replace(
        new RegExp(`{{${key}}}`, 'g'),
        value
      );
    }
    
    return rendered;
  }
}

module.exports = EmailService;
```

**Utilisation :**
```javascript
const EmailService = require('./modules/EmailService');

const emailService = new EmailService({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'your@email.com',
    pass: 'yourpassword'
  },
  from: 'noreply@semantic.com'
});

// Email simple
await emailService.sendEmail(
  'user@email.com',
  'Bienvenue !',
  '<h1>Bonjour !</h1><p>Merci de vous être inscrit.</p>'
);

// Email avec template
await emailService.sendTemplateEmail(
  'user@email.com',
  'welcome',
  {
    subject: 'Bienvenue !',
    name: 'Alice',
    activationLink: 'https://...'
  }
);
```

### 🎯 Exemple : Module Logger

**fichier : modules/Logger.js**
```javascript
const fs = require('fs');
const path = require('path');

class Logger {
  constructor(options = {}) {
    this.logDir = options.logDir || './logs';
    this.level = options.level || 'info';
    this.console = options.console !== false;
    
    // Créer le dossier logs
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }
  
  // Niveaux de log
  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
  
  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }
  
  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }
  
  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }
  
  // Méthode principale
  log(level, message, meta) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    
    // Écrire dans la console
    if (this.console) {
      const color = this.getColor(level);
      console.log(
        `${color}[${timestamp}] ${level}:${'\x1b[0m'} ${message}`
      );
    }
    
    // Écrire dans le fichier
    const filename = `${this.logDir}/${this.getLogFilename()}`;
    fs.appendFileSync(
      filename,
      JSON.stringify(logEntry) + '\n'
    );
  }
  
  // Nom du fichier par jour
  getLogFilename() {
    const date = new Date().toISOString().split('T')[0];
    return `app-${date}.log`;
  }
  
  // Couleurs pour la console
  getColor(level) {
    const colors = {
      DEBUG: '\x1b[36m',  // Cyan
      INFO: '\x1b[32m',   // Vert
      WARN: '\x1b[33m',   // Jaune
      ERROR: '\x1b[31m'   // Rouge
    };
    return colors[level] || '';
  }
}

module.exports = Logger;
```

**Utilisation :**
```javascript
const Logger = require('./modules/Logger');

const logger = new Logger({
  logDir: './logs',
  level: 'info',
  console: true
});

logger.info('Serveur démarré', { port: 3000 });
logger.warn('Connexion lente', { duration: 5000 });
logger.error('Erreur DB', { error: 'Connection refused' });
```

---

## 7. BONNES PRATIQUES {#7-bonnes-pratiques}

### ✅ 1. Une classe = Un fichier

```javascript
// ❌ Mauvais : Tout dans un fichier
class User {}
class Product {}
class Order {}

// ✅ Bon : Un fichier par classe
// models/User.js
class User {}
module.exports = User;
```

### ✅ 2. Injection de dépendances

```javascript
// ❌ Mauvais : Créer les dépendances dans la classe
class DataImporter {
  constructor() {
    this.pool = new Pool({...});  // Créé ici
  }
}

// ✅ Bon : Recevoir les dépendances
class DataImporter {
  constructor(pool) {
    this.pool = pool;  // Reçu en paramètre
  }
}

// Utilisation
const pool = require('./config/database');
const importer = new DataImporter(pool);
```

**Avantages :**
- Testabilité (mock facile)
- Flexibilité
- Pas de couplage fort

### ✅ 3. Nommage explicite

```javascript
// ❌ Mauvais
class Manager {}
function process() {}

// ✅ Bon
class BrandDNAManager {}
function processPayment() {}
```

### ✅ 4. Documentation

```javascript
/**
 * Importe des données depuis un fichier CSV
 * @param {string} filepath - Chemin du fichier CSV
 * @param {string} tableName - Nom de la table destination
 * @returns {Promise<Object>} Statistiques d'import
 */
async importCSV(filepath, tableName) {
  // ...
}
```

### ✅ 5. Gestion d'erreurs

```javascript
class DataImporter {
  async importCSV(filepath, tableName) {
    // Valider les paramètres
    if (!filepath || !tableName) {
      throw new Error('filepath et tableName requis');
    }
    
    // Vérifier que le fichier existe
    if (!fs.existsSync(filepath)) {
      throw new Error(`Fichier non trouvé : ${filepath}`);
    }
    
    try {
      // Logique d'import
    } catch (error) {
      // Ajouter du contexte
      throw new Error(`Erreur import CSV : ${error.message}`);
    }
  }
}
```

### ✅ 6. Principe de responsabilité unique

```javascript
// ❌ Mauvais : Classe qui fait trop de choses
class UserManager {
  createUser() {}
  sendEmail() {}
  generatePDF() {}
  processPayment() {}
}

// ✅ Bon : Chaque classe a UNE responsabilité
class UserService {
  createUser() {}
  updateUser() {}
}

class EmailService {
  sendEmail() {}
}

class PDFService {
  generatePDF() {}
}

class PaymentService {
  processPayment() {}
}
```

---

## 8. EXERCICES {#8-exercices}

### ✏️ Exercice 1 : Module Calculator (Facile)

**Consigne :**
Créez un module `Calculator` avec les méthodes : add, subtract, multiply, divide.

<details>
<summary>💡 Voir la solution</summary>

```javascript
// modules/Calculator.js
class Calculator {
  add(a, b) {
    return a + b;
  }
  
  subtract(a, b) {
    return a - b;
  }
  
  multiply(a, b) {
    return a * b;
  }
  
  divide(a, b) {
    if (b === 0) {
      throw new Error('Division par zéro');
    }
    return a / b;
  }
}

module.exports = Calculator;

// Utilisation
const Calculator = require('./modules/Calculator');
const calc = new Calculator();

console.log(calc.add(5, 3));       // 8
console.log(calc.divide(10, 2));   // 5
```
</details>

---

### ✏️ Exercice 2 : Module FileManager (Moyen)

**Consigne :**
Créez un module qui peut :
- Lire un fichier
- Écrire dans un fichier
- Lister les fichiers d'un dossier
- Supprimer un fichier

<details>
<summary>💡 Voir la solution</summary>

```javascript
// modules/FileManager.js
const fs = require('fs').promises;
const path = require('path');

class FileManager {
  async readFile(filepath) {
    try {
      const content = await fs.readFile(filepath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`Erreur lecture : ${error.message}`);
    }
  }
  
  async writeFile(filepath, content) {
    try {
      await fs.writeFile(filepath, content, 'utf8');
      return true;
    } catch (error) {
      throw new Error(`Erreur écriture : ${error.message}`);
    }
  }
  
  async listFiles(directory) {
    try {
      const files = await fs.readdir(directory);
      return files;
    } catch (error) {
      throw new Error(`Erreur listage : ${error.message}`);
    }
  }
  
  async deleteFile(filepath) {
    try {
      await fs.unlink(filepath);
      return true;
    } catch (error) {
      throw new Error(`Erreur suppression : ${error.message}`);
    }
  }
}

module.exports = FileManager;
```
</details>

---

### ✏️ Exercice 3 : Module CacheManager (Difficile)

**Consigne :**
Créez un module de cache en mémoire avec :
- set(key, value, ttl) - Stocker avec expiration
- get(key) - Récupérer
- delete(key) - Supprimer
- clear() - Tout vider
- Les valeurs expirent après TTL secondes

<details>
<summary>💡 Voir la solution</summary>

```javascript
// modules/CacheManager.js
class CacheManager {
  constructor() {
    this.cache = new Map();
    this.timers = new Map();
  }
  
  set(key, value, ttl = 60) {
    // Stocker la valeur
    this.cache.set(key, value);
    
    // Annuler l'ancien timer si existe
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
    }
    
    // Créer un timer d'expiration
    const timer = setTimeout(() => {
      this.delete(key);
    }, ttl * 1000);
    
    this.timers.set(key, timer);
    
    return true;
  }
  
  get(key) {
    return this.cache.get(key);
  }
  
  has(key) {
    return this.cache.has(key);
  }
  
  delete(key) {
    // Supprimer la valeur
    this.cache.delete(key);
    
    // Annuler le timer
    if (this.timers.has(key)) {
      clearTimeout(this.timers.get(key));
      this.timers.delete(key);
    }
    
    return true;
  }
  
  clear() {
    // Annuler tous les timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    
    this.cache.clear();
    this.timers.clear();
    
    return true;
  }
  
  size() {
    return this.cache.size;
  }
}

module.exports = CacheManager;

// Utilisation
const cache = new CacheManager();

cache.set('user:1', { nom: 'Alice' }, 10);  // Expire après 10s
console.log(cache.get('user:1'));  // { nom: 'Alice' }

setTimeout(() => {
  console.log(cache.get('user:1'));  // undefined (expiré)
}, 11000);
```
</details>

---

## 9. QUIZ {#9-quiz}

### ❓ Question 1

Qu'est-ce qu'un module ?

A) Un fichier JavaScript réutilisable  
B) Une base de données  
C) Un serveur web  
D) Un framework

<details>
<summary>✅ Réponse</summary>
**A** - Un module est un fichier JavaScript qui exporte du code réutilisable.
</details>

---

### ❓ Question 2

Comment exporter une classe d'un module ?

A) `export class MyClass {}`  
B) `module.exports = MyClass;`  
C) `return MyClass;`  
D) `send MyClass;`

<details>
<summary>✅ Réponse</summary>
**B** - En Node.js : `module.exports = MyClass;`
</details>

---

### ❓ Question 3

Qu'est-ce que l'injection de dépendances ?

A) Créer des dépendances dans la classe  
B) Recevoir les dépendances en paramètre  
C) Ne pas avoir de dépendances  
D) Utiliser des variables globales

<details>
<summary>✅ Réponse</summary>
**B** - Recevoir les dépendances plutôt que les créer.
```javascript
// Injection
constructor(pool) {
  this.pool = pool;  // Reçu
}
```
</details>

---

### ❓ Question 4

Pourquoi utiliser un cache (Map) dans BrandDNAManager ?

A) Pour la sécurité  
B) Pour éviter de recharger depuis la DB  
C) Pour la beauté du code  
D) C'est obligatoire

<details>
<summary>✅ Réponse</summary>
**B** - Le cache évite des requêtes DB répétées = plus rapide.
</details>

---

### ❓ Question 5

À quoi sert TestEnvironment ?

A) Tester en production  
B) Créer un environnement isolé pour tests  
C) Supprimer des données  
D) Générer des rapports

<details>
<summary>✅ Réponse</summary>
**B** - TestEnvironment crée une DB de test séparée.
</details>

---

## 📊 RÉSULTATS

**Score :** ___ / 5

- **5/5** : Expert en modules ! 🏆
- **4/5** : Très bien ! 👍
- **3/5** : Bien, relire certaines parties 📖
- **< 3** : Reprendre le cours 🔄

---

## 🎓 PROCHAINES ÉTAPES

Vous avez terminé le Cours 6 ! 🎉

**Continuez vers :**
- ✅ **COURS 7** : Fine-tuning IA
- 🔜 **COURS 8** : Frontend

**Compétences acquises :**
- ✅ Comprendre les modules
- ✅ Architecture modulaire
- ✅ Créer ses propres modules
- ✅ Injection de dépendances
- ✅ Bonnes pratiques
- ✅ DataImporter, BrandDNAManager, TestEnvironment

---

**Félicitations ! 🚀**
