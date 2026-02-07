# 🗄️ COURS 5 : BASE DE DONNÉES POSTGRESQL

## Stocker et gérer vos données avec PostgreSQL

**Durée :** 2 heures  
**Niveau :** Intermédiaire  
**Prérequis :** Cours 1

---

## 📋 SOMMAIRE

1. [Introduction aux bases de données](#1-introduction)
2. [Qu'est-ce que PostgreSQL ?](#2-postgresql)
3. [SQL : Le langage des données](#3-sql)
4. [Installation et configuration](#4-installation)
5. [Créer des tables](#5-tables)
6. [Opérations CRUD](#6-crud)
7. [Connexion depuis Node.js](#7-nodejs)
8. [Requêtes avancées](#8-avancees)
9. [Exercices](#9-exercices)
10. [Quiz](#10-quiz)

---

## 1. INTRODUCTION AUX BASES DE DONNÉES {#1-introduction}

### 🤔 Pourquoi une base de données ?

**Sans base de données :**
```javascript
// Données en mémoire (perdues au redémarrage)
let users = [
  { id: 1, nom: 'Alice' },
  { id: 2, nom: 'Bob' }
];
```

**Problèmes :**
- ❌ Données perdues si serveur redémarre
- ❌ Impossible de chercher rapidement
- ❌ Pas de relations entre données
- ❌ Pas de sécurité
- ❌ Limité par la RAM

**Avec une base de données :**
- ✅ Données persistantes (sur disque)
- ✅ Recherche ultra-rapide (index)
- ✅ Relations (Foreign Keys)
- ✅ Sécurité et permissions
- ✅ Millions d'enregistrements

### 📚 Types de bases de données

| Type | Exemples | Usage |
|------|----------|-------|
| **Relationnelle (SQL)** | PostgreSQL, MySQL | Données structurées |
| **NoSQL Document** | MongoDB | JSON, flexible |
| **NoSQL Clé-Valeur** | Redis | Cache, sessions |
| **Graphe** | Neo4j | Relations complexes |

**Nous utilisons PostgreSQL** car :
- Gratuit et open-source
- Très puissant
- Standard de l'industrie
- Excellent pour apprendre

---

## 2. QU'EST-CE QUE POSTGRESQL ? {#2-postgresql}

### 🐘 PostgreSQL expliqué

**PostgreSQL** (souvent appelé **Postgres**) est un **système de gestion de base de données relationnelle** (SGBD).

**Analogie :**
```
Base de données = Bibliothèque
Table = Étagère
Ligne = Livre
Colonne = Propriété du livre (titre, auteur, année)
```

### 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Votre Application Node.js       │
│                                     │
│  const result = await pool.query(  │
│    'SELECT * FROM users'            │
│  );                                 │
└─────────────┬───────────────────────┘
              │ TCP Connection
              ↓
┌─────────────────────────────────────┐
│         PostgreSQL Server           │
│         (localhost:5432)            │
│                                     │
│  1. Reçoit la requête SQL          │
│  2. Vérifie les permissions        │
│  3. Optimise la requête            │
│  4. Exécute sur les données        │
│  5. Retourne le résultat           │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│           Fichiers disque           │
│                                     │
│  /var/lib/postgresql/data/          │
│  ├─ base/                           │
│  ├─ global/                         │
│  └─ pg_wal/                         │
└─────────────────────────────────────┘
```

### 🎯 Concepts clés

**Base de données :**
```
semantic_platform  ← Nom de la base
├─ users           ← Table
├─ products        ← Table
└─ orders          ← Table
```

**Table :**
```
users
├─ id (INT)        ← Colonne
├─ nom (VARCHAR)   ← Colonne
├─ email (VARCHAR) ← Colonne
└─ created_at      ← Colonne
```

**Ligne (row) :**
```
id | nom   | email
---+-------+-----------------
1  | Alice | alice@email.com
2  | Bob   | bob@email.com
```

---

## 3. SQL : LE LANGAGE DES DONNÉES {#3-sql}

### 📖 Qu'est-ce que SQL ?

**SQL** = **S**tructured **Q**uery **L**anguage  
(Langage de Requête Structuré)

C'est le **langage universel** pour communiquer avec les bases de données relationnelles.

### 🎯 Les 4 opérations de base (CRUD)

| Opération | SQL | Signification |
|-----------|-----|---------------|
| **C**reate | `INSERT` | Créer |
| **R**ead | `SELECT` | Lire |
| **U**pdate | `UPDATE` | Modifier |
| **D**elete | `DELETE` | Supprimer |

### 📝 Syntaxe de base

**SELECT (Lire) :**
```sql
SELECT colonne1, colonne2
FROM nom_table
WHERE condition;
```

**INSERT (Créer) :**
```sql
INSERT INTO nom_table (colonne1, colonne2)
VALUES (valeur1, valeur2);
```

**UPDATE (Modifier) :**
```sql
UPDATE nom_table
SET colonne1 = valeur1
WHERE condition;
```

**DELETE (Supprimer) :**
```sql
DELETE FROM nom_table
WHERE condition;
```

### ⚠️ Points importants

1. **SQL n'est PAS sensible à la casse** (mais convention : MAJUSCULES pour mots-clés)
```sql
SELECT * FROM users;  ← Convention
select * from users;  ← Fonctionne aussi
```

2. **Toujours terminer par `;`**
```sql
SELECT * FROM users;
                    ↑ Point-virgule obligatoire
```

3. **Chaînes entre guillemets simples**
```sql
WHERE nom = 'Alice'
            ↑     ↑ Guillemets simples
```

---

## 4. INSTALLATION ET CONFIGURATION {#4-installation}

### 📥 Installer PostgreSQL

**Sur macOS :**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Sur Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Sur Windows :**
```
Télécharger depuis : https://postgresql.org/download/windows/
Installer l'exécutable
```

### 🔐 Créer un utilisateur

**Se connecter en tant que superuser :**
```bash
sudo -u postgres psql
```

**Créer un utilisateur :**
```sql
CREATE USER semantic_user WITH PASSWORD 'votremotdepasse';
```

**Donner tous les privilèges :**
```sql
ALTER USER semantic_user CREATEDB;
```

**Quitter :**
```sql
\q
```

### 🗄️ Créer la base de données

```bash
createdb -U semantic_user semantic_platform
```

**Ou en SQL :**
```sql
CREATE DATABASE semantic_platform
    OWNER semantic_user
    ENCODING 'UTF8';
```

### 🔗 Tester la connexion

```bash
psql -U semantic_user -d semantic_platform
```

**Si ça marche, vous verrez :**
```
semantic_platform=>
```

---

## 5. CRÉER DES TABLES {#5-tables}

### 🏗️ Syntaxe CREATE TABLE

```sql
CREATE TABLE nom_table (
    colonne1 TYPE CONTRAINTES,
    colonne2 TYPE CONTRAINTES,
    ...
);
```

### 📊 Types de données courants

| Type | Description | Exemple |
|------|-------------|---------|
| `INTEGER` / `INT` | Nombre entier | 42 |
| `SERIAL` | Entier auto-incrémenté | 1, 2, 3... |
| `VARCHAR(n)` | Texte limité à n caractères | 'Alice' |
| `TEXT` | Texte illimité | 'Long texte...' |
| `BOOLEAN` | Vrai/Faux | true, false |
| `DATE` | Date | '2024-02-06' |
| `TIMESTAMP` | Date + Heure | '2024-02-06 14:30:00' |
| `NUMERIC(p,s)` | Décimal précis | 19.99 |
| `JSON` / `JSONB` | Données JSON | '{"nom": "Alice"}' |

### 🔐 Contraintes courantes

| Contrainte | Signification |
|------------|---------------|
| `PRIMARY KEY` | Identifiant unique de la ligne |
| `NOT NULL` | Ne peut pas être vide |
| `UNIQUE` | Doit être unique dans la table |
| `DEFAULT valeur` | Valeur par défaut |
| `FOREIGN KEY` | Référence une autre table |
| `CHECK (condition)` | Validation personnalisée |

### 🎯 Exemple : Table users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    age INTEGER CHECK (age >= 18),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Décortiquons :**
```sql
id SERIAL PRIMARY KEY
   ↑      ↑
   │      └─ Clé primaire (unique)
   └─ Auto-incrémente (1, 2, 3...)

nom VARCHAR(100) NOT NULL
    ↑            ↑
    │            └─ Obligatoire
    └─ Texte max 100 caractères

email VARCHAR(255) NOT NULL UNIQUE
                   ↑        ↑
                   │        └─ Pas de doublons
                   └─ Obligatoire

age INTEGER CHECK (age >= 18)
            ↑
            └─ Doit être >= 18

created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                     ↑
                     └─ Date/heure actuelle automatique
```

### 🔗 Relations entre tables

**Table orders (commandes) :**
```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Clé étrangère vers users
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);
```

**Explications :**
```sql
FOREIGN KEY (user_id) REFERENCES users(id)
            ↑                    ↑
            │                    └─ Colonne référencée
            └─ Colonne locale

ON DELETE CASCADE
↑
└─ Si user supprimé, supprimer ses commandes aussi
```

**Autres options :**
- `ON DELETE CASCADE` : Supprimer en cascade
- `ON DELETE SET NULL` : Mettre NULL
- `ON DELETE RESTRICT` : Interdire la suppression

---

## 6. OPÉRATIONS CRUD {#6-crud}

### ✏️ CREATE - INSERT

**Insérer une ligne :**
```sql
INSERT INTO users (nom, email, password_hash, age)
VALUES ('Alice', 'alice@email.com', 'hash123', 25);
```

**Insérer plusieurs lignes :**
```sql
INSERT INTO users (nom, email, password_hash, age)
VALUES 
    ('Bob', 'bob@email.com', 'hash456', 30),
    ('Charlie', 'charlie@email.com', 'hash789', 28);
```

**Récupérer l'ID créé :**
```sql
INSERT INTO users (nom, email, password_hash)
VALUES ('David', 'david@email.com', 'hash000')
RETURNING id;
```

### 📖 READ - SELECT

**Tout sélectionner :**
```sql
SELECT * FROM users;
```

**Colonnes spécifiques :**
```sql
SELECT nom, email FROM users;
```

**Avec condition WHERE :**
```sql
SELECT * FROM users
WHERE age > 25;
```

**Plusieurs conditions :**
```sql
SELECT * FROM users
WHERE age > 25 AND actif = true;
```

**Opérateurs de comparaison :**
```sql
=   -- Égal
!=  -- Différent
>   -- Supérieur
<   -- Inférieur
>=  -- Supérieur ou égal
<=  -- Inférieur ou égal
LIKE -- Ressemble à (avec % pour joker)
IN   -- Dans une liste
```

**Exemples :**
```sql
-- Recherche partielle
SELECT * FROM users
WHERE email LIKE '%@gmail.com';

-- Dans une liste
SELECT * FROM users
WHERE nom IN ('Alice', 'Bob', 'Charlie');

-- Entre deux valeurs
SELECT * FROM users
WHERE age BETWEEN 25 AND 35;
```

**Trier (ORDER BY) :**
```sql
SELECT * FROM users
ORDER BY age DESC;  -- DESC = décroissant, ASC = croissant
```

**Limiter les résultats :**
```sql
SELECT * FROM users
LIMIT 10;  -- Seulement 10 résultats
```

**Pagination :**
```sql
SELECT * FROM users
ORDER BY id
LIMIT 10 OFFSET 20;  -- Résultats 21-30
```

### ✏️ UPDATE - Modifier

**Modifier une ligne :**
```sql
UPDATE users
SET age = 26
WHERE id = 1;
```

**Modifier plusieurs colonnes :**
```sql
UPDATE users
SET age = 26, email = 'newemail@email.com'
WHERE id = 1;
```

**⚠️ ATTENTION : Toujours mettre WHERE !**
```sql
-- ❌ DANGER : Modifie TOUTES les lignes
UPDATE users
SET age = 99;

-- ✅ BON : Modifie seulement une ligne
UPDATE users
SET age = 99
WHERE id = 1;
```

### 🗑️ DELETE - Supprimer

**Supprimer une ligne :**
```sql
DELETE FROM users
WHERE id = 1;
```

**⚠️ ATTENTION : Toujours mettre WHERE !**
```sql
-- ❌ DANGER : Supprime TOUTES les lignes
DELETE FROM users;

-- ✅ BON : Supprime seulement une ligne
DELETE FROM users
WHERE id = 1;
```

---

## 7. CONNEXION DEPUIS NODE.JS {#7-nodejs}

### 📦 Installer le driver PostgreSQL

```bash
npm install pg
```

`pg` = **P**ost**g**reSQL client pour Node.js

### 🔌 Configuration de la connexion

**fichier : config/database.js**
```javascript
const { Pool } = require('pg');

// Pool = Groupe de connexions réutilisables
const pool = new Pool({
  user: 'semantic_user',
  host: 'localhost',
  database: 'semantic_platform',
  password: 'votremotdepasse',
  port: 5432,  // Port par défaut de PostgreSQL
  max: 20,     // Max 20 connexions simultanées
  idleTimeoutMillis: 30000,  // Fermer après 30s d'inactivité
  connectionTimeoutMillis: 2000,  // Timeout de connexion
});

// Tester la connexion
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erreur connexion DB :', err);
  } else {
    console.log('✅ Connecté à PostgreSQL :', res.rows[0].now);
  }
});

module.exports = pool;
```

### 🎯 Pourquoi un Pool ?

**Sans pool :**
```javascript
// Chaque requête = nouvelle connexion (LENT)
const client = new Client({...});
await client.connect();
await client.query('SELECT...');
await client.end();
```

**Avec pool :**
```javascript
// Réutilise les connexions existantes (RAPIDE)
const result = await pool.query('SELECT...');
```

**Analogie :**
```
Pool = Parking de voitures
- 20 voitures disponibles
- Tu en prends une pour une course
- Tu la rends au parking après
- Quelqu'un d'autre la réutilise
```

### 💬 Première requête

**fichier : test-db.js**
```javascript
const pool = require('./config/database');

async function testDB() {
  try {
    // Requête simple
    const result = await pool.query('SELECT * FROM users');
    
    console.log('Résultats :', result.rows);
    console.log('Nombre :', result.rowCount);
    
  } catch (error) {
    console.error('Erreur :', error);
  } finally {
    // Fermer le pool à la fin
    await pool.end();
  }
}

testDB();
```

**Exécuter :**
```bash
node test-db.js
```

### 📊 Structure du résultat

```javascript
const result = await pool.query('SELECT * FROM users');

console.log(result);
```

**Sortie :**
```javascript
{
  command: 'SELECT',
  rowCount: 3,
  rows: [
    { id: 1, nom: 'Alice', email: 'alice@email.com', age: 25 },
    { id: 2, nom: 'Bob', email: 'bob@email.com', age: 30 },
    { id: 3, nom: 'Charlie', email: 'charlie@email.com', age: 28 }
  ],
  fields: [...],  // Métadonnées des colonnes
}
```

**Accéder aux données :**
```javascript
// Toutes les lignes
const users = result.rows;

// Première ligne
const firstUser = result.rows[0];

// Parcourir
result.rows.forEach(user => {
  console.log(user.nom);
});
```

### 🔐 Requêtes paramétrées (IMPORTANT)

**❌ DANGER : Injection SQL**
```javascript
// Ne JAMAIS faire ça !
const nom = req.body.nom;
const result = await pool.query(
  `SELECT * FROM users WHERE nom = '${nom}'`
);

// Si nom = "'; DROP TABLE users; --"
// → Supprime toute la table !
```

**✅ SÉCURISÉ : Requêtes paramétrées**
```javascript
const nom = req.body.nom;
const result = await pool.query(
  'SELECT * FROM users WHERE nom = $1',
  [nom]
);

// $1 = premier paramètre
// [nom] = tableau des valeurs
// PostgreSQL échappe automatiquement les valeurs
```

**Plusieurs paramètres :**
```javascript
const result = await pool.query(
  'SELECT * FROM users WHERE nom = $1 AND age > $2',
  ['Alice', 25]
);

// $1 = 'Alice'
// $2 = 25
```

### 🎯 Exemples pratiques

**SELECT avec paramètres :**
```javascript
async function getUserByEmail(email) {
  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
  
  return result.rows[0];  // Première ligne ou undefined
}
```

**INSERT avec RETURNING :**
```javascript
async function createUser(nom, email, password) {
  const result = await pool.query(
    `INSERT INTO users (nom, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, nom, email`,
    [nom, email, password]
  );
  
  return result.rows[0];  // Retourne l'user créé
}
```

**UPDATE :**
```javascript
async function updateUserAge(id, newAge) {
  const result = await pool.query(
    'UPDATE users SET age = $1 WHERE id = $2 RETURNING *',
    [newAge, id]
  );
  
  return result.rows[0];
}
```

**DELETE :**
```javascript
async function deleteUser(id) {
  const result = await pool.query(
    'DELETE FROM users WHERE id = $1 RETURNING *',
    [id]
  );
  
  return result.rowCount > 0;  // true si supprimé
}
```

---

## 8. REQUÊTES AVANCÉES {#8-avancees}

### 🔗 JOIN - Joindre des tables

**Tables :**
```sql
users
├─ id
├─ nom
└─ email

orders
├─ id
├─ user_id (FK → users.id)
├─ total
└─ status
```

**INNER JOIN (seulement les lignes correspondantes) :**
```sql
SELECT 
    users.nom,
    users.email,
    orders.total,
    orders.status
FROM users
INNER JOIN orders ON users.id = orders.user_id;
```

**LEFT JOIN (toutes les lignes de users, même sans commande) :**
```sql
SELECT 
    users.nom,
    orders.total
FROM users
LEFT JOIN orders ON users.id = orders.user_id;
```

**Depuis Node.js :**
```javascript
async function getUserOrders(userId) {
  const result = await pool.query(
    `SELECT 
      users.nom,
      orders.id AS order_id,
      orders.total,
      orders.created_at
    FROM users
    LEFT JOIN orders ON users.id = orders.user_id
    WHERE users.id = $1`,
    [userId]
  );
  
  return result.rows;
}
```

### 📊 Agrégations

**COUNT - Compter :**
```sql
SELECT COUNT(*) FROM users;
```

**SUM - Somme :**
```sql
SELECT SUM(total) FROM orders;
```

**AVG - Moyenne :**
```sql
SELECT AVG(age) FROM users;
```

**MAX/MIN :**
```sql
SELECT MAX(age), MIN(age) FROM users;
```

**GROUP BY - Grouper :**
```sql
-- Nombre de commandes par user
SELECT 
    user_id,
    COUNT(*) as nombre_commandes,
    SUM(total) as total_depense
FROM orders
GROUP BY user_id;
```

**HAVING - Filtrer les groupes :**
```sql
-- Users avec plus de 5 commandes
SELECT 
    user_id,
    COUNT(*) as nb_commandes
FROM orders
GROUP BY user_id
HAVING COUNT(*) > 5;
```

### 🔍 Sous-requêtes

**Dans WHERE :**
```sql
SELECT * FROM users
WHERE id IN (
    SELECT user_id FROM orders
    WHERE total > 100
);
```

**Dans FROM (subquery) :**
```sql
SELECT nom, total_depense
FROM (
    SELECT 
        users.nom,
        SUM(orders.total) as total_depense
    FROM users
    JOIN orders ON users.id = orders.user_id
    GROUP BY users.nom
) AS subquery
WHERE total_depense > 500;
```

### 🔄 Transactions

**Pourquoi ?**
```
Scénario : Virement bancaire
1. Débiter compte A (-100€)
2. Créditer compte B (+100€)

Si erreur après l'étape 1 ?
→ 100€ disparaissent !

Solution : Transaction
- Soit tout réussit
- Soit tout échoue (rollback)
```

**Syntaxe :**
```javascript
const client = await pool.connect();

try {
  await client.query('BEGIN');
  
  // Opération 1
  await client.query(
    'UPDATE comptes SET solde = solde - $1 WHERE id = $2',
    [100, compteA]
  );
  
  // Opération 2
  await client.query(
    'UPDATE comptes SET solde = solde + $1 WHERE id = $2',
    [100, compteB]
  );
  
  await client.query('COMMIT');
  console.log('Transaction réussie !');
  
} catch (error) {
  await client.query('ROLLBACK');
  console.error('Transaction annulée :', error);
} finally {
  client.release();
}
```

---

## 9. EXERCICES {#9-exercices}

### ✏️ Exercice 1 : Créer une table (Facile)

**Consigne :**
Créez une table `products` avec :
- id (auto-incrémenté)
- nom (texte, max 200 caractères, obligatoire)
- prix (décimal 10,2, obligatoire)
- stock (entier, défaut 0)
- created_at (timestamp, auto)

<details>
<summary>💡 Voir la solution</summary>

```sql
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    prix NUMERIC(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
</details>

---

### ✏️ Exercice 2 : Insérer des données (Facile)

**Consigne :**
Insérez 3 produits dans la table `products`.

<details>
<summary>💡 Voir la solution</summary>

```sql
INSERT INTO products (nom, prix, stock)
VALUES 
    ('MacBook Pro', 2499.99, 10),
    ('iPhone 15', 999.99, 50),
    ('AirPods Pro', 279.99, 100);
```
</details>

---

### ✏️ Exercice 3 : Requête SELECT (Moyen)

**Consigne :**
Trouvez tous les produits avec un prix > 500€, triés par prix décroissant.

<details>
<summary>💡 Voir la solution</summary>

```sql
SELECT * FROM products
WHERE prix > 500
ORDER BY prix DESC;
```
</details>

---

### ✏️ Exercice 4 : UPDATE avec condition (Moyen)

**Consigne :**
Augmentez le stock de 10 pour tous les produits dont le stock est inférieur à 20.

<details>
<summary>💡 Voir la solution</summary>

```sql
UPDATE products
SET stock = stock + 10
WHERE stock < 20;
```
</details>

---

### ✏️ Exercice 5 : Node.js - Fonction CRUD (Difficile)

**Consigne :**
Créez 4 fonctions en Node.js :
- `getAllProducts()`
- `getProductById(id)`
- `createProduct(nom, prix, stock)`
- `updateProductStock(id, newStock)`

<details>
<summary>💡 Voir la solution</summary>

```javascript
const pool = require('./config/database');

async function getAllProducts() {
  const result = await pool.query(
    'SELECT * FROM products ORDER BY nom'
  );
  return result.rows;
}

async function getProductById(id) {
  const result = await pool.query(
    'SELECT * FROM products WHERE id = $1',
    [id]
  );
  return result.rows[0];
}

async function createProduct(nom, prix, stock) {
  const result = await pool.query(
    `INSERT INTO products (nom, prix, stock)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [nom, prix, stock]
  );
  return result.rows[0];
}

async function updateProductStock(id, newStock) {
  const result = await pool.query(
    'UPDATE products SET stock = $1 WHERE id = $2 RETURNING *',
    [newStock, id]
  );
  return result.rows[0];
}

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProductStock
};
```
</details>

---

### ✏️ Exercice 6 : API REST complète (Difficile)

**Consigne :**
Créez une API Express pour gérer les produits :
- `GET /api/products` - Lister tous
- `GET /api/products/:id` - Un produit
- `POST /api/products` - Créer
- `PUT /api/products/:id` - Modifier stock
- `DELETE /api/products/:id` - Supprimer

<details>
<summary>💡 Voir la solution</summary>

```javascript
const express = require('express');
const pool = require('./config/database');

const app = express();
app.use(express.json());

// GET tous les produits
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET un produit
app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM products WHERE id = $1',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST créer un produit
app.post('/api/products', async (req, res) => {
  try {
    const { nom, prix, stock } = req.body;
    
    if (!nom || !prix) {
      return res.status(400).json({ 
        error: 'nom et prix requis' 
      });
    }
    
    const result = await pool.query(
      `INSERT INTO products (nom, prix, stock)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [nom, prix, stock || 0]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier le stock
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { stock } = req.body;
    
    if (stock === undefined) {
      return res.status(400).json({ error: 'stock requis' });
    }
    
    const result = await pool.query(
      'UPDATE products SET stock = $1 WHERE id = $2 RETURNING *',
      [stock, id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE supprimer
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }
    
    res.json({ 
      message: 'Produit supprimé',
      product: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('API démarrée sur http://localhost:3000');
});
```
</details>

---

## 10. QUIZ {#10-quiz}

### ❓ Question 1

Quelle est la différence entre `INT` et `SERIAL` ?

A) Aucune  
B) SERIAL s'auto-incrémente  
C) INT est plus rapide  
D) SERIAL accepte les décimaux

<details>
<summary>✅ Réponse</summary>
**B** - SERIAL = INT qui s'incrémente automatiquement (1, 2, 3...).
</details>

---

### ❓ Question 2

Que fait `PRIMARY KEY` ?

A) Rend la colonne obligatoire  
B) Rend la colonne unique  
C) Les deux + index automatique  
D) Rien de spécial

<details>
<summary>✅ Réponse</summary>
**C** - PRIMARY KEY = NOT NULL + UNIQUE + indexé pour rapidité.
</details>

---

### ❓ Question 3

Quelle requête est DANGEREUSE ?

```javascript
// A
pool.query('SELECT * FROM users WHERE id = $1', [id])

// B
pool.query(`SELECT * FROM users WHERE id = ${id}`)

// C
pool.query('SELECT * FROM users WHERE nom = $1', [nom])
```

<details>
<summary>✅ Réponse</summary>
**B** - Injection SQL possible. Toujours utiliser `$1, $2...`
</details>

---

### ❓ Question 4

Comment récupérer l'ID d'un INSERT ?

A) `pool.query('INSERT...')` retourne l'ID  
B) Ajouter `RETURNING id`  
C) Faire un SELECT après  
D) C'est impossible

<details>
<summary>✅ Réponse</summary>
**B** - `RETURNING id` ou `RETURNING *` pour tout récupérer.
</details>

---

### ❓ Question 5

Que fait `ON DELETE CASCADE` ?

A) Supprime la ligne  
B) Met NULL dans la FK  
C) Supprime toutes les lignes liées  
D) Empêche la suppression

<details>
<summary>✅ Réponse</summary>
**C** - Si user supprimé, ses orders sont aussi supprimées.
</details>

---

### ❓ Question 6

Quelle différence entre `Pool` et `Client` ?

A) Aucune  
B) Pool réutilise les connexions  
C) Client est plus rapide  
D) Pool est pour PostgreSQL seulement

<details>
<summary>✅ Réponse</summary>
**B** - Pool = groupe de connexions réutilisables = plus rapide.
</details>

---

### ❓ Question 7

Comment paginer les résultats ?

A) `LIMIT 10`  
B) `LIMIT 10 OFFSET 20`  
C) `WHERE page = 2`  
D) Ce n'est pas possible en SQL

<details>
<summary>✅ Réponse</summary>
**B** - `LIMIT` = nombre de résultats, `OFFSET` = sauter les X premiers.
</details>

---

### ❓ Question 8

Que fait `INNER JOIN` ?

A) Toutes les lignes de gauche  
B) Toutes les lignes de droite  
C) Seulement les lignes correspondantes  
D) Toutes les lignes des deux tables

<details>
<summary>✅ Réponse</summary>
**C** - INNER JOIN = seulement où il y a correspondance dans les deux tables.
</details>

---

### ❓ Question 9

Comment compter les lignes ?

A) `SELECT LENGTH(*) FROM users`  
B) `SELECT COUNT(*) FROM users`  
C) `SELECT SUM(*) FROM users`  
D) `result.rowCount`

<details>
<summary>✅ Réponse</summary>
**B** et **D** - En SQL : `COUNT(*)`, en Node.js : `result.rowCount`.
</details>

---

### ❓ Question 10

À quoi sert une transaction ?

A) Accélérer les requêtes  
B) Garantir que tout réussit ou rien  
C) Faire plusieurs SELECT  
D) Sécuriser les données

<details>
<summary>✅ Réponse</summary>
**B** - Transaction = tout ou rien (atomicité).
```javascript
BEGIN;
UPDATE compte_a SET solde = solde - 100;
UPDATE compte_b SET solde = solde + 100;
COMMIT;  -- Ou ROLLBACK si erreur
```
</details>

---

## 📊 RÉSULTATS

**Score :** ___ / 10

- **9-10** : Expert PostgreSQL ! 🏆
- **7-8** : Très bien, quelques révisions 👍
- **5-6** : Bien, revoir les bases 📖
- **< 5** : Recommencer le cours 🔄

---

## 🎓 PROCHAINES ÉTAPES

Vous avez terminé le Cours 5 ! 🎉

**Continuez vers :**
- ✅ **COURS 6** : Modules métier
- 🔜 **COURS 7** : Fine-tuning IA

**Compétences acquises :**
- ✅ Comprendre les bases de données
- ✅ Écrire du SQL
- ✅ Créer des tables avec contraintes
- ✅ CRUD complet
- ✅ Se connecter depuis Node.js
- ✅ Requêtes paramétrées sécurisées
- ✅ JOIN et agrégations
- ✅ Transactions

---

**Félicitations ! 🚀**
