# 📖 COURS 2 : LE SERVEUR - ANALYSE LIGNE PAR LIGNE

## Décortiquer server.js pour tout comprendre

---

## 🎯 OBJECTIF

À la fin de ce cours, vous comprendrez :
- ✅ Chaque ligne de code de server.js
- ✅ Pourquoi chaque partie est là
- ✅ Comment les requêtes HTTP sont traitées
- ✅ L'architecture modulaire

---

## 📄 PARTIE 1 : L'EN-TÊTE DU FICHIER

### **Les commentaires :**

```javascript
/**
 * SERVEUR PRINCIPAL - SEMANTIC PLATFORM
 * ======================================
 * 
 * Fonctionnalités :
 * 1. Import de données produits via IA (n'importe quel format)
 * 2. Gestion de l'ADN de marque (prompt libre)
 * 3. Environnement de test avant déploiement
 * 4. Dashboard web-marketeur
 */
```

**Explication :**
- `/**` et `*/` = Délimiteurs de commentaire multi-lignes
- Les commentaires sont **ignorés** par Node.js
- **Utilité** : Documentation pour les humains qui lisent le code
- **Analogie** : Les notes dans la marge d'un livre

---

## 📦 PARTIE 2 : LES IMPORTS (require)

### **Code :**

```javascript
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
```

### **Décortiquage ligne par ligne :**

#### **Ligne 1 : Express**
```javascript
const express = require('express');
```
- **const** = Constante (la valeur ne changera jamais)
- **express** = Nom de variable (on aurait pu l'appeler "serveur")
- **require('express')** = Importer la bibliothèque Express
- **Résultat** : On peut maintenant utiliser Express via la variable `express`

#### **Ligne 2 : CORS**
```javascript
const cors = require('cors');
```
- **CORS** = Cross-Origin Resource Sharing
- **Traduction** : Partage de Ressources entre Origines Différentes
- **Explication simple** : Permet à votre site web d'appeler votre serveur
- **Sans CORS** : Le navigateur bloquerait les requêtes (sécurité)
- **Analogie** : Autorisation de passage entre deux pays

**Exemple concret :**
```
Sans CORS :
Site sur http://monsite.com
  ↓ Appel API
Serveur sur http://localhost:3000
  ❌ BLOQUÉ par le navigateur

Avec CORS :
Site sur http://monsite.com
  ↓ Appel API
Serveur sur http://localhost:3000
  ✅ AUTORISÉ
```

#### **Ligne 3 : Helmet**
```javascript
const helmet = require('helmet');
```
- **Helmet** = "Casque" en anglais
- **Rôle** : Protéger le serveur contre les attaques courantes
- **Comment** : Ajoute des en-têtes de sécurité HTTP
- **Analogie** : Un casque de chantier pour protéger

**Protections ajoutées :**
- XSS (Cross-Site Scripting)
- Clickjacking
- MIME Sniffing
- Etc.

#### **Ligne 4 : Multer**
```javascript
const multer = require('multer');
```
- **Multer** : Bibliothèque pour gérer l'upload de fichiers
- **Upload** = Téléversement (envoyer un fichier vers le serveur)
- **Utilité** : Quand l'utilisateur envoie son CSV/Excel
- **Analogie** : Un service postal qui accepte les colis

**Sans Multer :**
```javascript
// ❌ Impossible de recevoir des fichiers facilement
app.post('/upload', (req, res) => {
  // req.file n'existe pas
});
```

**Avec Multer :**
```javascript
// ✅ Multer gère la réception automatiquement
app.post('/upload', upload.single('file'), (req, res) => {
  const file = req.file;  // Le fichier est là !
});
```

#### **Ligne 5 : Express-validator**
```javascript
const { body, validationResult } = require('express-validator');
```

**Syntaxe spéciale expliquée :**
```javascript
const { body, validationResult } = ...
       ↑ Accolades = Destructuration
```

**Destructuration** :
- **Explication** : Extraire des parties spécifiques d'un objet
- **Analogie** : Ouvrir un colis et prendre seulement ce qui vous intéresse

**Exemple :**
```javascript
// Sans destructuration
const validator = require('express-validator');
const body = validator.body;
const validationResult = validator.validationResult;

// Avec destructuration (équivalent mais plus court)
const { body, validationResult } = require('express-validator');
```

**Utilité de express-validator :**
- Valider les données reçues
- Vérifier que l'email est un vrai email
- Vérifier qu'un champ n'est pas vide
- Etc.

---

## 📦 PARTIE 3 : IMPORT DES MODULES MÉTIER

```javascript
const DataImporter = require('./modules/data-importer');
const BrandDNAManager = require('./modules/brand-dna-manager');
const TestEnvironment = require('./modules/test-environment');
const DeploymentManager = require('./modules/deployment-manager');
```

### **Différence entre require('express') et require('./modules/...')**

```javascript
require('express')
// ↑ Sans ./ ou ../ = Bibliothèque NPM (dans node_modules/)

require('./modules/data-importer')
// ↑ Avec ./ = Fichier local (dans votre projet)
```

**Chemin expliqué :**
```
semantic-platform/
├── backend/
│   ├── server.js  ← Vous êtes ici
│   └── modules/
│       └── data-importer.js  ← Vous voulez l'importer
│
Depuis server.js :
./modules/data-importer
│  └──────┘ └────────────┘
│   Même    Nom du fichier (sans .js)
│   dossier
```

**Module métier** :
- **Explication** : Code qui gère une fonctionnalité spécifique
- **Avantage** : Organisation (au lieu d'un gros fichier de 5000 lignes)
- **Analogie** : Chapitres dans un livre

---

## ⚙️ PARTIE 4 : CONFIGURATION DE L'APPLICATION

```javascript
const app = express();
const PORT = process.env.PORT || 3000;
```

### **Ligne 1 : Créer l'application**
```javascript
const app = express();
```
- Appelle la fonction `express()`
- Crée une instance de serveur
- Stocke dans la variable `app`

**Instance** :
- **Explication** : Un exemplaire, une copie
- **Analogie** : "app" est UNE voiture créée à partir du modèle Express

### **Ligne 2 : PORT**
```javascript
const PORT = process.env.PORT || 3000;
```

**Décortiquage complet :**

```javascript
const PORT = process.env.PORT || 3000;
//           └──────┬──────┘    └─┬─┘
//                  │             └─ Valeur par défaut
//                  └─ Variable d'environnement
```

**process.env** :
- **process** = L'objet représentant le processus Node.js en cours
- **env** = environment = environnement
- **process.env.PORT** = Variable d'environnement nommée PORT

**Variable d'environnement** :
- **Explication** : Une variable définie en dehors du code
- **Utilité** : Changer le comportement sans modifier le code
- **Analogie** : Réglages de votre téléphone

**Exemple :**
```bash
# Démarrer avec PORT=8080
PORT=8080 node server.js

# Dans le code, process.env.PORT vaudra 8080
```

**L'opérateur || (OU logique)** :
```javascript
const PORT = A || B;
// Signifie : "Prends A, si A n'existe pas, prends B"

// Exemples :
const PORT = 8080 || 3000;     // PORT = 8080
const PORT = undefined || 3000; // PORT = 3000
const PORT = null || 3000;      // PORT = 3000
```

---

## 🔧 PARTIE 5 : MIDDLEWARES

```javascript
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

### **Qu'est-ce qu'un middleware ?**

**Middleware** :
- **Traduction littérale** : "Logiciel du milieu"
- **Explication** : Code qui s'exécute ENTRE la requête et la réponse
- **Analogie** : Contrôle de sécurité à l'aéroport

```
Requête → Middleware 1 → Middleware 2 → Route → Réponse
         (helmet)        (cors)          (votre code)
```

**Exemple visuel :**
```
┌─────────────┐
│  Client     │
└──────┬──────┘
       │ Requête POST /api/data
       │ Body: { "name": "Test" }
       ▼
┌──────────────────────┐
│  Middleware: helmet  │  ← Ajoute headers de sécurité
└──────┬───────────────┘
       │ Headers: X-Content-Type-Options: nosniff
       ▼
┌──────────────────────┐
│  Middleware: cors    │  ← Vérifie origine autorisée
└──────┬───────────────┘
       │ Headers: Access-Control-Allow-Origin: *
       ▼
┌──────────────────────┐
│  Middleware: json    │  ← Parse le JSON
└──────┬───────────────┘
       │ req.body = { name: "Test" }
       ▼
┌──────────────────────┐
│  Votre route         │  ← Votre code peut lire req.body
│  app.post('/api/...) │
└──────┬───────────────┘
       │ Réponse
       ▼
┌─────────────┐
│  Client     │
└─────────────┘
```

### **app.use() expliqué :**

```javascript
app.use(helmet());
// ↑   ↑   └─ Appel de la fonction helmet()
// │   └─ Méthode use() (utiliser un middleware)
// └─ Notre application
```

### **Chaque middleware en détail :**

#### **1. helmet()**
```javascript
app.use(helmet());
```
Active toutes les protections de sécurité par défaut.

#### **2. cors()**
```javascript
app.use(cors());
```
Autorise tous les domaines à appeler votre API.
```javascript
// Plus restrictif (production) :
app.use(cors({
  origin: 'https://monsite.com'  // Seulement ce domaine
}));
```

#### **3. express.json()**
```javascript
app.use(express.json({ limit: '50mb' }));
```

**Rôle** : Parser (analyser) le JSON dans le corps des requêtes

**Sans express.json() :**
```javascript
app.post('/api/data', (req, res) => {
  console.log(req.body);  // ❌ undefined
});
```

**Avec express.json() :**
```javascript
app.post('/api/data', (req, res) => {
  console.log(req.body);  // ✅ { name: "Test", age: 25 }
});
```

**{ limit: '50mb' }** :
- Limite la taille maximale du JSON
- Sans limite = risque de saturation mémoire
- 50mb = suffisant pour uploader des fichiers encodés en base64

#### **4. express.urlencoded()**
```javascript
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
```

**Rôle** : Parser les données de formulaires HTML

**Format URL-encoded :**
```
name=John&age=25&city=Paris
```

**extended: true** :
- Permet de parser des objets complexes
- Utilise la bibliothèque "qs"

**Exemple :**
```html
<!-- Formulaire HTML -->
<form method="POST" action="/api/contact">
  <input name="name" value="John">
  <input name="email" value="john@example.com">
  <button type="submit">Envoyer</button>
</form>
```

```javascript
// Côté serveur
app.post('/api/contact', (req, res) => {
  console.log(req.body);
  // ✅ { name: "John", email: "john@example.com" }
});
```

---

## 📁 PARTIE 6 : CONFIGURATION MULTER

```javascript
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, true);
  }
});
```

### **Décortiquage complet :**

```javascript
const upload = multer({
  // ↑ Configuration sous forme d'objet JavaScript
  
  dest: 'uploads/',
  // ↑ Destination = Dossier où sauvegarder les fichiers uploadés
  
  limits: { fileSize: 50 * 1024 * 1024 },
  //       └─ Objet imbriqué
  //          fileSize: taille max en octets
  //          50 * 1024 * 1024 = 50 MB
  
  fileFilter: (req, file, cb) => {
    //         └─ Fonction fléchée (arrow function)
    cb(null, true);
    // ↑ Callback (fonction de rappel)
    // Premier param = erreur (null = pas d'erreur)
    // Second param = accepter le fichier (true = oui)
  }
});
```

**Calcul de la taille :**
```
1 KB (kilobyte) = 1024 bytes (octets)
1 MB (megabyte) = 1024 KB = 1024 * 1024 bytes
50 MB = 50 * 1024 * 1024 = 52,428,800 bytes
```

**Fonction fléchée (arrow function) :**
```javascript
// Ancienne syntaxe
function(req, file, cb) {
  cb(null, true);
}

// Nouvelle syntaxe (équivalent)
(req, file, cb) => {
  cb(null, true);
}
```

**Callback (cb) :**
- **Explication** : Fonction qu'on appelle quand on a fini
- **Utilité** : Gérer les opérations asynchrones
- **Analogie** : "Rappelle-moi quand tu as fini"

**fileFilter en détail :**
```javascript
fileFilter: (req, file, cb) => {
  // file.mimetype = type du fichier
  // ex: "text/csv", "application/pdf", "image/jpeg"
  
  if (file.mimetype === 'text/csv') {
    cb(null, true);  // Accepter
  } else {
    cb(new Error('Seulement CSV !'), false);  // Rejeter
  }
}
```

---

## 🎓 EXERCICE DE COMPRÉHENSION

1. **Quelle est la différence entre `const` et `let` ?**

2. **Que fait `app.use(cors())` ?**

3. **Pourquoi `process.env.PORT || 3000` ?**

4. **Qu'est-ce qu'un middleware ?**

5. **À quoi sert `express.json()` ?**

---

## 📚 PROCHAINE ÉTAPE

Cours 3 : **Les routes HTTP expliquées (GET, POST, PUT, DELETE)**

Nous verrons :
- Comment créer des routes
- La différence entre GET et POST
- Les paramètres d'URL
- Le traitement des requêtes

