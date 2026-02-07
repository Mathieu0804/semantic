# 🎨 COURS 8 : FRONTEND

## Créer une interface web pour votre application

**Durée :** 2 heures  
**Niveau :** Débutant/Intermédiaire  
**Prérequis :** Cours 1-3

---

## 📋 SOMMAIRE

1. [Introduction au Frontend](#1-intro)
2. [HTML : Structure](#2-html)
3. [CSS : Style](#3-css)
4. [JavaScript : Interactivité](#4-js)
5. [Fetch API : Appels HTTP](#5-fetch)
6. [Dashboard décortiqué](#6-dashboard)
7. [Responsive Design](#7-responsive)
8. [Exercices](#8-exercices)
9. [Quiz](#9-quiz)

---

## 1. INTRODUCTION AU FRONTEND {#1-intro}

### 🌐 Qu'est-ce que le Frontend ?

**Frontend** = Tout ce que l'utilisateur **voit et utilise** dans le navigateur

**Analogie :**
```
Site web = Restaurant
├─ Backend = Cuisine (invisible)
│  └─ Prépare les plats
└─ Frontend = Salle (visible)
   └─ Présente les plats
```

### 🎯 Les 3 piliers du web

| Technologie | Rôle | Analogie |
|-------------|------|----------|
| **HTML** | Structure | Squelette |
| **CSS** | Apparence | Peau, vêtements |
| **JavaScript** | Comportement | Muscles, cerveau |

**Exemple concret :**
```html
<!-- HTML : Structure -->
<button>Cliquez-moi</button>

<!-- CSS : Apparence -->
<style>
button {
  background-color: blue;
  color: white;
}
</style>

<!-- JavaScript : Comportement -->
<script>
button.addEventListener('click', () => {
  alert('Cliqué !');
});
</script>
```

---

## 2. HTML : STRUCTURE {#2-html}

### 📄 Qu'est-ce que HTML ?

**HTML** = **H**yper**T**ext **M**arkup **L**anguage  
(Langage de Balisage Hypertexte)

C'est un langage de **balises** qui structure le contenu.

### 🏗️ Structure de base

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ma Page</title>
</head>
<body>
    <h1>Bonjour le monde !</h1>
    <p>Ceci est un paragraphe.</p>
</body>
</html>
```

**Décortiquons :**

```html
<!DOCTYPE html>
↑ Déclare que c'est du HTML5

<html lang="fr">
      ↑ Langue du document

<head>
↑ Métadonnées (invisible à l'utilisateur)
  
  <meta charset="UTF-8">
        ↑ Encodage (pour les accents)
  
  <title>Ma Page</title>
         ↑ Titre dans l'onglet du navigateur

<body>
↑ Corps (visible à l'utilisateur)
  
  <h1>Titre</h1>
      ↑ Heading 1 (titre principal)
  
  <p>Texte</p>
     ↑ Paragraph
```

### 🎯 Balises courantes

#### **Titres**
```html
<h1>Titre principal</h1>
<h2>Sous-titre</h2>
<h3>Sous-sous-titre</h3>
<!-- h1 à h6 -->
```

#### **Texte**
```html
<p>Paragraphe normal</p>
<strong>Texte important (gras)</strong>
<em>Texte emphase (italique)</em>
<br>  <!-- Saut de ligne -->
```

#### **Listes**
```html
<!-- Liste non ordonnée -->
<ul>
    <li>Élément 1</li>
    <li>Élément 2</li>
</ul>

<!-- Liste ordonnée -->
<ol>
    <li>Premier</li>
    <li>Deuxième</li>
</ol>
```

#### **Liens et Images**
```html
<!-- Lien -->
<a href="https://google.com">Aller sur Google</a>

<!-- Image -->
<img src="logo.png" alt="Logo de l'entreprise">
```

#### **Formulaires**
```html
<form>
    <label for="nom">Nom :</label>
    <input type="text" id="nom" name="nom">
    
    <label for="email">Email :</label>
    <input type="email" id="email" name="email">
    
    <button type="submit">Envoyer</button>
</form>
```

#### **Conteneurs**
```html
<!-- Division (bloc générique) -->
<div class="container">
    Contenu...
</div>

<!-- Span (inline générique) -->
<span class="highlight">Texte surligné</span>
```

### 🎨 Balises sémantiques (HTML5)

```html
<header>
    <!-- En-tête de la page -->
    <nav>
        <!-- Menu de navigation -->
    </nav>
</header>

<main>
    <!-- Contenu principal -->
    <article>
        <!-- Un article -->
    </article>
    
    <section>
        <!-- Une section -->
    </section>
    
    <aside>
        <!-- Contenu à côté (sidebar) -->
    </aside>
</main>

<footer>
    <!-- Pied de page -->
</footer>
```

---

## 3. CSS : STYLE {#3-css}

### 🎨 Qu'est-ce que CSS ?

**CSS** = **C**ascading **S**tyle **S**heets  
(Feuilles de Style en Cascade)

C'est le langage qui donne du **style** au HTML.

### 📝 Syntaxe

```css
selecteur {
    propriété: valeur;
    propriété: valeur;
}
```

**Exemple :**
```css
h1 {
    color: blue;
    font-size: 32px;
    text-align: center;
}
```

### 🎯 Types de sélecteurs

#### **1. Sélecteur d'élément**
```css
p {
    color: black;
}
/* Cible TOUS les <p> */
```

#### **2. Sélecteur de classe**
```css
.highlight {
    background-color: yellow;
}
/* Cible <span class="highlight"> */
```

#### **3. Sélecteur d'ID**
```css
#main-title {
    font-size: 40px;
}
/* Cible <h1 id="main-title"> */
```

#### **4. Sélecteur combiné**
```css
div p {
    color: gray;
}
/* Cible les <p> DANS les <div> */

.container .button {
    background: blue;
}
/* Cible les .button DANS .container */
```

### 🎨 Propriétés courantes

#### **Couleurs**
```css
.element {
    color: red;                    /* Texte */
    background-color: #3498db;     /* Fond (hex) */
    background-color: rgb(52, 152, 219);  /* RGB */
    border-color: rgba(0, 0, 0, 0.5);    /* RGBA (avec transparence) */
}
```

#### **Texte**
```css
.text {
    font-size: 16px;
    font-family: Arial, sans-serif;
    font-weight: bold;        /* normal, bold, 100-900 */
    text-align: center;       /* left, center, right, justify */
    text-decoration: underline;  /* none, underline, line-through */
    line-height: 1.5;
}
```

#### **Dimensions**
```css
.box {
    width: 300px;
    height: 200px;
    max-width: 100%;    /* Responsive */
    min-height: 100px;
}
```

#### **Espacement**
```css
.element {
    margin: 20px;           /* Extérieur */
    padding: 10px;          /* Intérieur */
    
    /* Détaillé */
    margin-top: 10px;
    margin-right: 20px;
    margin-bottom: 10px;
    margin-left: 20px;
    
    /* Raccourci (haut, droite, bas, gauche) */
    margin: 10px 20px 10px 20px;
    
    /* Raccourci (vertical horizontal) */
    margin: 10px 20px;
}
```

#### **Bordures**
```css
.box {
    border: 2px solid black;
    border-radius: 10px;    /* Coins arrondis */
    
    /* Détaillé */
    border-width: 2px;
    border-style: solid;    /* solid, dashed, dotted */
    border-color: black;
}
```

#### **Affichage**
```css
.element {
    display: block;         /* Prend toute la largeur */
    display: inline;        /* Prend juste sa place */
    display: inline-block;  /* Les deux */
    display: none;          /* Caché */
    display: flex;          /* Flexbox (moderne) */
}
```

### 📦 Box Model

```
┌─────────────────────────────────┐
│         MARGIN (extérieur)      │
│  ┌──────────────────────────┐   │
│  │      BORDER              │   │
│  │  ┌───────────────────┐   │   │
│  │  │   PADDING         │   │   │
│  │  │  ┌────────────┐   │   │   │
│  │  │  │  CONTENT   │   │   │   │
│  │  │  │  width x   │   │   │   │
│  │  │  │  height    │   │   │   │
│  │  │  └────────────┘   │   │   │
│  │  └───────────────────┘   │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

### 🎯 Flexbox (Layout moderne)

```css
.container {
    display: flex;
    justify-content: center;     /* Horizontal */
    align-items: center;         /* Vertical */
    gap: 20px;                   /* Espace entre éléments */
}

.container {
    display: flex;
    flex-direction: row;         /* row, column */
    flex-wrap: wrap;             /* Retour à la ligne */
}
```

**Exemple concret :**
```html
<div class="container">
    <div class="box">1</div>
    <div class="box">2</div>
    <div class="box">3</div>
</div>

<style>
.container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 200px;
    background: #f0f0f0;
}

.box {
    width: 100px;
    height: 100px;
    background: #3498db;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
}
</style>
```

---

## 4. JAVASCRIPT : INTERACTIVITÉ {#4-js}

### ⚡ Qu'est-ce que JavaScript ?

**JavaScript** est le langage de programmation du navigateur qui rend les pages **interactives**.

### 🎯 Sélectionner des éléments

```javascript
// Par ID
const element = document.getElementById('main-title');

// Par classe
const elements = document.getElementsByClassName('button');

// Sélecteur CSS (moderne)
const element = document.querySelector('#main-title');
const elements = document.querySelectorAll('.button');
```

### ✏️ Modifier le contenu

```javascript
// Changer le texte
element.textContent = 'Nouveau texte';
element.innerHTML = '<strong>Texte en gras</strong>';

// Changer les styles
element.style.color = 'red';
element.style.fontSize = '24px';

// Ajouter/Supprimer des classes
element.classList.add('active');
element.classList.remove('hidden');
element.classList.toggle('highlight');
```

### 🎬 Événements

```javascript
// Click
button.addEventListener('click', function() {
    console.log('Bouton cliqué !');
});

// Avec fonction fléchée
button.addEventListener('click', () => {
    console.log('Cliqué !');
});

// Autres événements
input.addEventListener('input', (e) => {
    console.log('Valeur :', e.target.value);
});

form.addEventListener('submit', (e) => {
    e.preventDefault();  // Empêcher le rechargement
    console.log('Formulaire soumis');
});
```

### 📝 Exemple complet : Compteur

```html
<!DOCTYPE html>
<html>
<head>
    <title>Compteur</title>
    <style>
        .container {
            text-align: center;
            margin-top: 50px;
        }
        
        .counter {
            font-size: 48px;
            margin: 20px;
        }
        
        button {
            font-size: 20px;
            padding: 10px 20px;
            margin: 5px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Compteur</h1>
        <div class="counter" id="counter">0</div>
        <button id="increment">+</button>
        <button id="decrement">-</button>
        <button id="reset">Reset</button>
    </div>
    
    <script>
        let count = 0;
        
        const counterElement = document.getElementById('counter');
        const incrementBtn = document.getElementById('increment');
        const decrementBtn = document.getElementById('decrement');
        const resetBtn = document.getElementById('reset');
        
        incrementBtn.addEventListener('click', () => {
            count++;
            counterElement.textContent = count;
        });
        
        decrementBtn.addEventListener('click', () => {
            count--;
            counterElement.textContent = count;
        });
        
        resetBtn.addEventListener('click', () => {
            count = 0;
            counterElement.textContent = count;
        });
    </script>
</body>
</html>
```

---

## 5. FETCH API : APPELS HTTP {#5-fetch}

### 🌐 Fetch API

**Fetch** permet de faire des requêtes HTTP depuis JavaScript.

### 📥 GET - Récupérer des données

```javascript
async function getUsers() {
    try {
        // Faire la requête
        const response = await fetch('http://localhost:3000/api/users');
        
        // Parser le JSON
        const users = await response.json();
        
        // Utiliser les données
        console.log(users);
        
    } catch (error) {
        console.error('Erreur :', error);
    }
}
```

### 📤 POST - Envoyer des données

```javascript
async function createUser(nom, email) {
    try {
        const response = await fetch('http://localhost:3000/api/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nom: nom,
                email: email
            })
        });
        
        const result = await response.json();
        console.log('User créé :', result);
        
    } catch (error) {
        console.error('Erreur :', error);
    }
}
```

### 🎯 Gestion des erreurs

```javascript
async function fetchData(url) {
    try {
        const response = await fetch(url);
        
        // Vérifier le statut
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
        
    } catch (error) {
        console.error('Erreur fetch :', error);
        
        // Afficher à l'utilisateur
        alert('Erreur de chargement des données');
        
        throw error;  // Relancer l'erreur
    }
}
```

---

## 6. DASHBOARD DÉCORTIQUÉ {#6-dashboard}

### 🎨 Dashboard complet

**fichier : public/dashboard.html**
```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Semantic Platform - Dashboard</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f5f5f5;
        }
        
        /* Header */
        .header {
            background: #2c3e50;
            color: white;
            padding: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .header h1 {
            font-size: 28px;
        }
        
        /* Container */
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        /* Statistiques */
        .stats {
            display: flex;
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            flex: 1;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .stat-card h3 {
            color: #7f8c8d;
            font-size: 14px;
            margin-bottom: 10px;
        }
        
        .stat-card .value {
            font-size: 32px;
            font-weight: bold;
            color: #2c3e50;
        }
        
        /* Chat */
        .chat-container {
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .chat-header {
            background: #3498db;
            color: white;
            padding: 15px 20px;
        }
        
        .messages {
            height: 400px;
            overflow-y: auto;
            padding: 20px;
        }
        
        .message {
            margin-bottom: 15px;
            display: flex;
            gap: 10px;
        }
        
        .message.user {
            flex-direction: row-reverse;
        }
        
        .message .avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #3498db;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
        }
        
        .message.assistant .avatar {
            background: #2ecc71;
        }
        
        .message .bubble {
            background: #ecf0f1;
            padding: 10px 15px;
            border-radius: 18px;
            max-width: 70%;
        }
        
        .message.user .bubble {
            background: #3498db;
            color: white;
        }
        
        /* Input */
        .chat-input {
            display: flex;
            gap: 10px;
            padding: 20px;
            border-top: 1px solid #ecf0f1;
        }
        
        .chat-input input {
            flex: 1;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 24px;
            font-size: 14px;
        }
        
        .chat-input button {
            padding: 12px 30px;
            background: #3498db;
            color: white;
            border: none;
            border-radius: 24px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
        }
        
        .chat-input button:hover {
            background: #2980b9;
        }
        
        /* Feedback */
        .feedback {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        
        .feedback button {
            padding: 5px 15px;
            border: 1px solid #ddd;
            background: white;
            border-radius: 16px;
            cursor: pointer;
            font-size: 12px;
        }
        
        .feedback button:hover {
            background: #f0f0f0;
        }
        
        /* Loading */
        .loading {
            display: none;
            padding: 10px;
            text-align: center;
            color: #7f8c8d;
        }
        
        .loading.show {
            display: block;
        }
    </style>
</head>
<body>
    <!-- Header -->
    <div class="header">
        <h1>🤖 Semantic Platform</h1>
    </div>
    
    <!-- Container -->
    <div class="container">
        <!-- Statistiques -->
        <div class="stats">
            <div class="stat-card">
                <h3>INTERACTIONS TOTALES</h3>
                <div class="value" id="total-interactions">0</div>
            </div>
            <div class="stat-card">
                <h3>DONNÉES TRAINING</h3>
                <div class="value" id="training-ready">0</div>
            </div>
            <div class="stat-card">
                <h3>SCORE MOYEN</h3>
                <div class="value" id="avg-score">0.0</div>
            </div>
        </div>
        
        <!-- Chat -->
        <div class="chat-container">
            <div class="chat-header">
                <h2>💬 Assistant IA</h2>
            </div>
            
            <div class="messages" id="messages"></div>
            
            <div class="loading" id="loading">
                ⏳ L'IA réfléchit...
            </div>
            
            <div class="chat-input">
                <input 
                    type="text" 
                    id="user-input" 
                    placeholder="Posez votre question..."
                    onkeypress="if(event.key === 'Enter') sendMessage()"
                >
                <button onclick="sendMessage()">Envoyer</button>
            </div>
        </div>
    </div>
    
    <script>
        // Variables globales
        let currentInteractionId = null;
        const sessionId = 'session-' + Date.now();
        
        // Charger les stats au démarrage
        loadStats();
        
        // Charger les statistiques
        async function loadStats() {
            try {
                const response = await fetch('/api/ai/training/status');
                const data = await response.json();
                
                document.getElementById('total-interactions').textContent = 
                    data.total || 0;
                document.getElementById('training-ready').textContent = 
                    data.ready || 0;
                document.getElementById('avg-score').textContent = 
                    (data.avgScore || 0).toFixed(1);
                    
            } catch (error) {
                console.error('Erreur chargement stats :', error);
            }
        }
        
        // Envoyer un message
        async function sendMessage() {
            const input = document.getElementById('user-input');
            const message = input.value.trim();
            
            if (!message) return;
            
            // Afficher le message utilisateur
            addMessage('user', message);
            
            // Vider l'input
            input.value = '';
            
            // Afficher le loading
            document.getElementById('loading').classList.add('show');
            
            try {
                // Appeler l'API
                const response = await fetch('/api/ai/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        message,
                        sessionId,
                        userId: 1,
                        brandId: 1
                    })
                });
                
                const data = await response.json();
                
                // Cacher le loading
                document.getElementById('loading').classList.remove('show');
                
                // Afficher la réponse
                addMessage('assistant', data.response, data.interactionId);
                
                // Recharger les stats
                loadStats();
                
            } catch (error) {
                document.getElementById('loading').classList.remove('show');
                addMessage('assistant', 'Erreur : ' + error.message);
            }
        }
        
        // Ajouter un message dans le chat
        function addMessage(role, content, interactionId) {
            const messagesDiv = document.getElementById('messages');
            
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${role}`;
            
            const avatar = role === 'user' ? 'U' : 'AI';
            
            let html = `
                <div class="avatar">${avatar}</div>
                <div class="bubble">
                    ${content}
            `;
            
            // Ajouter les boutons de feedback pour l'assistant
            if (role === 'assistant' && interactionId) {
                html += `
                    <div class="feedback" id="feedback-${interactionId}">
                        <button onclick="sendFeedback(${interactionId}, 5)">👍 Excellent</button>
                        <button onclick="sendFeedback(${interactionId}, 4)">🙂 Bien</button>
                        <button onclick="sendFeedback(${interactionId}, 3)">😐 Moyen</button>
                        <button onclick="sendFeedback(${interactionId}, 1)">👎 Mauvais</button>
                    </div>
                `;
            }
            
            html += `</div>`;
            
            messageDiv.innerHTML = html;
            messagesDiv.appendChild(messageDiv);
            
            // Scroll vers le bas
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
        
        // Envoyer un feedback
        async function sendFeedback(interactionId, score) {
            try {
                await fetch('/api/ai/feedback', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        interactionId,
                        score,
                        feedback: ''
                    })
                });
                
                // Supprimer les boutons
                const feedbackDiv = document.getElementById(`feedback-${interactionId}`);
                feedbackDiv.innerHTML = '<small>✅ Merci pour votre feedback !</small>';
                
                // Recharger les stats
                loadStats();
                
            } catch (error) {
                console.error('Erreur feedback :', error);
            }
        }
    </script>
</body>
</html>
```

---

## 7. RESPONSIVE DESIGN {#7-responsive}

### 📱 Media Queries

```css
/* Desktop (par défaut) */
.container {
    max-width: 1200px;
}

/* Tablette */
@media (max-width: 768px) {
    .container {
        max-width: 100%;
        padding: 10px;
    }
    
    .stats {
        flex-direction: column;
    }
}

/* Mobile */
@media (max-width: 480px) {
    .header h1 {
        font-size: 20px;
    }
    
    .message .bubble {
        max-width: 85%;
    }
}
```

---

## 8. EXERCICES {#8-exercices}

### ✏️ Exercice 1 : To-Do List (Moyen)

**Consigne :**
Créez une liste de tâches avec :
- Input pour ajouter une tâche
- Liste des tâches
- Bouton pour marquer comme fait
- Bouton pour supprimer

<details>
<summary>💡 Voir la solution</summary>

```html
<!DOCTYPE html>
<html>
<head>
    <title>To-Do List</title>
    <style>
        .container {
            max-width: 500px;
            margin: 50px auto;
        }
        
        .task {
            display: flex;
            justify-content: space-between;
            padding: 10px;
            border-bottom: 1px solid #ddd;
        }
        
        .task.done {
            text-decoration: line-through;
            opacity: 0.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>To-Do List</h1>
        <input type="text" id="task-input" placeholder="Nouvelle tâche...">
        <button onclick="addTask()">Ajouter</button>
        
        <div id="tasks"></div>
    </div>
    
    <script>
        const tasks = [];
        
        function addTask() {
            const input = document.getElementById('task-input');
            const text = input.value.trim();
            
            if (!text) return;
            
            tasks.push({
                id: Date.now(),
                text,
                done: false
            });
            
            input.value = '';
            renderTasks();
        }
        
        function toggleTask(id) {
            const task = tasks.find(t => t.id === id);
            task.done = !task.done;
            renderTasks();
        }
        
        function deleteTask(id) {
            const index = tasks.findIndex(t => t.id === id);
            tasks.splice(index, 1);
            renderTasks();
        }
        
        function renderTasks() {
            const container = document.getElementById('tasks');
            
            container.innerHTML = tasks.map(task => `
                <div class="task ${task.done ? 'done' : ''}">
                    <span onclick="toggleTask(${task.id})">${task.text}</span>
                    <button onclick="deleteTask(${task.id})">✕</button>
                </div>
            `).join('');
        }
    </script>
</body>
</html>
```
</details>

---

## 9. QUIZ {#9-quiz}

### ❓ Question 1

Quelle balise HTML pour un titre principal ?

A) `<title>`  
B) `<h1>`  
C) `<header>`  
D) `<main>`

<details>
<summary>✅ Réponse</summary>
**B** - `<h1>` pour le titre principal visible sur la page.
</details>

---

### ❓ Question 2

Comment sélectionner un élément avec l'ID "main" en JavaScript ?

A) `document.get('#main')`  
B) `document.querySelector('#main')`  
C) `document.select('main')`  
D) `element('#main')`

<details>
<summary>✅ Réponse</summary>
**B** - `document.querySelector('#main')`
</details>

---

## 🎓 FÉLICITATIONS !

Vous avez terminé le Cours 8 ! 🎉

**Continuez vers :**
- ✅ **COURS 9** : Sécurité

**Compétences acquises :**
- ✅ HTML structure
- ✅ CSS styling
- ✅ JavaScript interactivité
- ✅ Fetch API
- ✅ Dashboard complet
- ✅ Responsive design

**Félicitations ! 🚀**
