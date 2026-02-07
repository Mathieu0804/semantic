# 📖 COURS 1 : LES BASES ABSOLUES

## Comprendre le web de A à Z

---

## 🌐 PARTIE 1 : COMMENT FONCTIONNE INTERNET ?

### **Analogie complète : La Poste**

Internet fonctionne exactement comme le service postal :

```
┌─────────────────────────────────────────────────────────────┐
│  VOUS (Client)                                               │
│  Vous écrivez une lettre : "Je veux la page d'accueil"      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │  📮 ENVOI (Requête HTTP)
                   │  Adresse : http://monsite.com
                   │  Demande : GET /accueil.html
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  INTERNET (Le réseau postal)                                 │
│  Les routeurs = Les centres de tri                           │
│  Ils acheminent votre lettre vers la bonne destination      │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  SERVEUR (Le destinataire)                                   │
│  - Lit votre demande                                         │
│  - Cherche la page demandée                                  │
│  - Prépare la réponse                                        │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │  📬 RETOUR (Réponse HTTP)
                   │  Contenu : Le fichier HTML de la page
                   │
                   ▼
┌─────────────────────────────────────────────────────────────┐
│  VOUS (Client)                                               │
│  Votre navigateur affiche la page                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 PARTIE 2 : QU'EST-CE QUE NODE.JS ?

### **Définition simple :**
Node.js permet d'exécuter du JavaScript **en dehors** d'un navigateur.

### **Avant Node.js :**
```
JavaScript pouvait SEULEMENT tourner dans :
├─ Chrome
├─ Firefox
├─ Safari
└─ Edge

Usage : Rendre les pages web interactives
```

### **Avec Node.js :**
```
JavaScript peut maintenant tourner sur :
├─ Votre ordinateur (comme un programme normal)
├─ Un serveur web
└─ Un Raspberry Pi, etc.

Usage : Créer des serveurs, des outils, des APIs
```

### **Exemple concret :**

**Sans Node.js (dans le navigateur) :**
```javascript
// Ce code tourne dans Chrome
document.getElementById('bouton').addEventListener('click', function() {
  alert('Vous avez cliqué !');
});
```

**Avec Node.js (sur un serveur) :**
```javascript
// Ce code tourne sur votre PC comme serveur
const express = require('express');  // Importer une bibliothèque
const app = express();               // Créer un serveur

app.get('/', function(requete, reponse) {
  reponse.send('Bonjour du serveur !');
});

app.listen(3000);  // Écouter sur le port 3000
```

### **Jargon expliqué :**

**Bibliothèque (Library)** :
- **Analogie** : Une boîte à outils
- **Explication** : Du code déjà écrit par d'autres que vous pouvez réutiliser
- **Exemple** : Express est une bibliothèque pour créer des serveurs web

**require()** :
- **Traduction** : "Requérir", "avoir besoin de"
- **Explication** : Importer du code d'une bibliothèque
- **Analogie** : Aller chercher un outil dans la boîte à outils

**Port** :
- **Analogie** : Un numéro de quai dans un port maritime
- **Explication** : Un numéro qui identifie un service sur votre ordinateur
- **Exemple** : 
  - Port 80 = HTTP (sites web normaux)
  - Port 443 = HTTPS (sites web sécurisés)
  - Port 3000 = Notre serveur Semantic Platform

---

## 🔧 PARTIE 3 : EXPRESS.JS EXPLIQUÉ

### **Qu'est-ce qu'Express ?**

Express = Un framework pour créer des serveurs web facilement

**Framework** :
- **Analogie** : Un squelette préfabriqué pour une maison
- **Explication** : Une structure de base qui vous évite de tout coder de zéro

### **Code Express décortiqué ligne par ligne :**

```javascript
// LIGNE 1 : Importer Express
const express = require('express');
// ┌─────┐ ┌──────┐   ┌────────┐
// │const│ │express│ = │require│('express')
// └─────┘ └──────┘   └────────┘
//   │       │            └─ Aller chercher la bibliothèque Express
//   │       └─ Nom de variable (on peut l'appeler comme on veut)
//   └─ Mot-clé JavaScript pour déclarer une constante (ne change jamais)

// LIGNE 2 : Créer une instance (un exemplaire) du serveur
const app = express();
// On crée notre serveur et on le stocke dans la variable "app"

// LIGNE 3 : Définir une route (une URL que le serveur peut gérer)
app.get('/', function(req, res) {
// │   │   │   └─ Fonction qui s'exécute quand on visite cette route
// │   │   └─ Le chemin (ici "/" = page d'accueil)
// │   └─ Verbe HTTP (GET = récupérer)
// └─ Notre serveur
  
  // req = requête (ce que demande le client)
  // res = réponse (ce qu'on va renvoyer)
  
  res.send('Bonjour !');
  // Envoyer la réponse "Bonjour !" au client
});

// LIGNE 4 : Démarrer le serveur
app.listen(3000, function() {
//         └─ Port 3000
  console.log('Serveur démarré sur http://localhost:3000');
  // Afficher un message dans le terminal
});
```

### **Exemple visuel de route :**

```
Quand vous tapez dans votre navigateur :
http://localhost:3000/

Le serveur exécute :
app.get('/', function(req, res) {
  res.send('Bonjour !');
});

Et vous voyez s'afficher : Bonjour !
```

### **Routes multiples :**

```javascript
app.get('/', function(req, res) {
  res.send('Page d\'accueil');
});

app.get('/contact', function(req, res) {
  res.send('Page de contact');
});

app.get('/produits', function(req, res) {
  res.send('Liste des produits');
});

// Résultat :
// http://localhost:3000/         → "Page d'accueil"
// http://localhost:3000/contact  → "Page de contact"
// http://localhost:3000/produits → "Liste des produits"
```

---

## 📦 PARTIE 4 : NPM (Node Package Manager)

### **Qu'est-ce que NPM ?**

**NPM** = Node Package Manager
- **Traduction** : Gestionnaire de Paquets Node
- **Analogie** : Un app store pour développeurs
- **Explication** : Un magasin où vous pouvez télécharger des bibliothèques

### **package.json expliqué :**

```json
{
  "name": "semantic-platform",
  // ↑ Nom de votre projet
  
  "version": "2.0.0",
  // ↑ Numéro de version (2.0.0 = majeur.mineur.patch)
  
  "dependencies": {
    // ↑ Liste des bibliothèques dont votre projet a BESOIN
    
    "express": "^4.18.2",
    // ↑ On a besoin d'Express version 4.18.2 (ou compatible)
    
    "pg": "^8.11.3"
    // ↑ On a besoin de PostgreSQL client version 8.11.3
  },
  
  "scripts": {
    // ↑ Raccourcis de commandes
    
    "start": "node backend/server.js"
    // ↑ Quand on tape "npm start", ça exécute cette commande
  }
}
```

### **Symbole ^ (caret) expliqué :**

```
"express": "^4.18.2"
           ↑
           
Le ^ signifie : "Version 4.18.2 ou supérieure compatible"

Compatible = 
- ✅ 4.18.3 (OK)
- ✅ 4.19.0 (OK)
- ❌ 5.0.0 (NON - changement majeur)
```

### **Commandes NPM essentielles :**

```bash
# Installer toutes les dépendances listées dans package.json
npm install

# Installer une bibliothèque spécifique
npm install express

# Lancer le script "start" défini dans package.json
npm start

# Désinstaller une bibliothèque
npm uninstall express
```

---

## 🗄️ PARTIE 5 : BASE DE DONNÉES (PostgreSQL)

### **Qu'est-ce qu'une base de données ?**

**Analogie** : Un immense classeur Excel

```
┌─────────────────────────────────────────┐
│  TABLE : produits                       │
├─────┬──────────┬────────┬───────────────┤
│ id  │   nom    │  prix  │  description  │
├─────┼──────────┼────────┼───────────────┤
│  1  │ Sérum A  │  45.90 │ Anti-âge...   │
│  2  │ Crème B  │  52.00 │ Hydratante... │
│  3  │ Gel C    │  22.50 │ Nettoyant...  │
└─────┴──────────┴────────┴───────────────┘

┌─────────────────────────────────────────┐
│  TABLE : clients                        │
├─────┬──────────┬─────────────────────────┤
│ id  │   nom    │       email             │
├─────┼──────────┼─────────────────────────┤
│  1  │  Marie   │ marie@example.com       │
│  2  │  Paul    │ paul@example.com        │
└─────┴──────────┴─────────────────────────┘
```

### **SQL expliqué (Structured Query Language) :**

**SQL** = Language pour parler aux bases de données

```sql
-- CRÉER UNE TABLE
CREATE TABLE produits (
  id SERIAL PRIMARY KEY,
  -- ↑ Un numéro auto-incrémenté (1, 2, 3...)
  
  nom VARCHAR(255),
  -- ↑ Du texte avec max 255 caractères
  
  prix DECIMAL(10, 2),
  -- ↑ Un nombre décimal (ex: 45.90)
  
  description TEXT
  -- ↑ Du texte long sans limite
);

-- INSÉRER DES DONNÉES
INSERT INTO produits (nom, prix, description)
VALUES ('Sérum A', 45.90, 'Anti-âge efficace');
--      ↑ Valeurs à insérer

-- LIRE DES DONNÉES
SELECT * FROM produits;
-- ↑ Récupérer TOUTES les colonnes de TOUS les produits

SELECT nom, prix FROM produits WHERE prix < 50;
-- ↑ Récupérer seulement nom et prix des produits < 50€

-- MODIFIER DES DONNÉES
UPDATE produits SET prix = 39.90 WHERE id = 1;
--     ↑ Table     ↑ Nouvelle   ↑ Condition
--                   valeur

-- SUPPRIMER DES DONNÉES
DELETE FROM produits WHERE id = 3;
--          ↑ Table      ↑ Condition
```

### **Jargon SQL :**

**PRIMARY KEY** :
- **Traduction** : Clé primaire
- **Explication** : L'identifiant unique de chaque ligne
- **Analogie** : Le numéro de sécurité sociale (unique pour chaque personne)

**SERIAL** :
- **Explication** : Un nombre qui s'incrémente automatiquement
- **Exemple** : 1, 2, 3, 4, 5...

**VARCHAR** :
- **Explication** : VARiable CHARacter (texte de longueur variable)
- **Exemple** : VARCHAR(255) = maximum 255 caractères

**DECIMAL(10, 2)** :
- **Explication** : 10 chiffres dont 2 après la virgule
- **Exemple** : 12345678.90

---

## 🔄 PARTIE 6 : ARCHITECTURE CLIENT-SERVEUR COMPLÈTE

### **Schéma détaillé avec tous les acteurs :**

```
┌──────────────────────────────────────────────────────────────┐
│  NAVIGATEUR (Client)                                         │
│  Chrome, Firefox, Safari...                                  │
│                                                              │
│  1. L'utilisateur clique sur "Importer des produits"        │
│  2. JavaScript envoie une requête HTTP                       │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │  Requête HTTP POST
                        │  URL: http://localhost:3000/api/import
                        │  Body: { file: "produits.csv" }
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│  SERVEUR NODE.JS (Backend)                                   │
│  Port 3000                                                   │
│                                                              │
│  app.post('/api/import', function(req, res) {               │
│    // 3. Recevoir le fichier                                │
│    const file = req.file;                                    │
│                                                              │
│    // 4. Lire et analyser le fichier                        │
│    const data = analyzeCSV(file);                           │
│                                                              │
│    // 5. Appeler l'IA pour transformer                      │
│    const transformed = await callOllama(data);              │
│                                                              │
│    // 6. Sauvegarder en base de données                     │
│    await saveToDatabase(transformed);                       │
│                                                              │
│    // 7. Renvoyer la réponse                                │
│    res.json({ success: true, products: transformed });      │
│  });                                                         │
└───────────────┬──────────────────┬───────────────────────────┘
                │                  │
                │                  │
        ┌───────▼──────┐   ┌──────▼───────┐
        │  OLLAMA (IA) │   │  PostgreSQL  │
        │  Port 11434  │   │  Port 5432   │
        │              │   │              │
        │  8. Génère   │   │  9. Stocke   │
        │  du contenu  │   │  les données │
        └──────────────┘   └──────────────┘
```

### **Chaque étape en détail :**

**Étape 1-2 : Client → Serveur**
```javascript
// Dans le navigateur
fetch('http://localhost:3000/api/import', {
  method: 'POST',
  body: formData
})
```

**Étape 3 : Serveur reçoit**
```javascript
app.post('/api/import', function(req, res) {
  const file = req.file;  // Le fichier uploadé
})
```

**Étape 4 : Analyse**
```javascript
const csv = require('csv-parse');
const data = csv.parse(fileContent);
// Transforme le CSV en tableau JavaScript
```

**Étape 5 : Appel IA**
```javascript
const ollama = new Ollama();
const prompt = "Transforme ces données : " + JSON.stringify(data);
const result = await ollama.generate(prompt);
```

**Étape 6 : Sauvegarde**
```javascript
const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://...' });
await pool.query('INSERT INTO produits VALUES ($1, $2)', [nom, prix]);
```

**Étape 7 : Réponse**
```javascript
res.json({ success: true, products: result });
// Renvoie du JSON au client
```

---

## ✅ EXERCICE DE COMPRÉHENSION

Répondez à ces questions pour vérifier votre compréhension :

1. **Qu'est-ce qu'HTTP ?**
   - [ ] Un langage de programmation
   - [ ] Un protocole de communication
   - [ ] Un type de base de données

2. **Que fait `require('express')` ?**
   - [ ] Crée un serveur
   - [ ] Importe la bibliothèque Express
   - [ ] Lance le serveur

3. **À quoi sert un port ?**
   - [ ] Identifier un service sur l'ordinateur
   - [ ] Stocker des données
   - [ ] Exécuter du code

4. **Que signifie SQL ?**
   - [ ] Server Query Language
   - [ ] Structured Query Language
   - [ ] Simple Query Language

5. **Que fait `app.get('/contact', ...)` ?**
   - [ ] Récupère la page contact depuis la base de données
   - [ ] Définit ce qui se passe quand on visite /contact
   - [ ] Envoie un email de contact

**Réponses : 1-b, 2-b, 3-a, 4-b, 5-b**

---

## 📚 PROCHAINE ÉTAPE

Maintenant que vous comprenez les bases, passons au cours suivant :
**COURS 2 : Notre serveur server.js ligne par ligne**

