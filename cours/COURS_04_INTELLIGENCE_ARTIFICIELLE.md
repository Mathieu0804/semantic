# 🤖 COURS 4 : L'INTELLIGENCE ARTIFICIELLE

## Intégrer Ollama et les LLMs dans votre application

**Durée :** 2 heures  
**Niveau :** Intermédiaire  
**Prérequis :** Cours 1, 2, 3

---

## 📋 SOMMAIRE

1. [Introduction à l'IA générative](#1-introduction)
2. [Qu'est-ce qu'Ollama ?](#2-ollama)
3. [Modèles de langage (LLM)](#3-llm)
4. [Installer et configurer Ollama](#4-installation)
5. [Appeler l'IA depuis Node.js](#5-nodejs)
6. [Écrire des prompts efficaces](#6-prompts)
7. [Gérer les réponses](#7-reponses)
8. [Cas pratiques](#8-pratique)
9. [Exercices](#9-exercices)
10. [Quiz](#10-quiz)

---

## 1. INTRODUCTION À L'IA GÉNÉRATIVE {#1-introduction}

### 🎯 Qu'est-ce que l'IA générative ?

L'**IA générative** est une intelligence artificielle capable de **créer du nouveau contenu** :
- 📝 Texte (articles, résumés, code)
- 🎨 Images (dessins, photos)
- 🎵 Musique
- 💬 Conversations

**Exemple concret :**
```
Vous : "Écris un email professionnel pour annuler un rendez-vous"
IA : "Bonjour, Je me permets de vous contacter concernant..."
```

### 🧠 Comment ça marche (version simple)

L'IA a été **entraînée** sur des millions de textes :
- Livres
- Articles
- Sites web
- Conversations

Elle a appris les **patterns** (modèles) du langage :

```
"Le chat mange" → probable
"Le chat volant" → peu probable
"Le mange chat" → incorrect
```

**Analogie :**
```
C'est comme un enfant qui apprend à parler :
- Il entend des milliers de phrases
- Il comprend les règles
- Il peut créer ses propres phrases
```

---

## 2. QU'EST-CE QU'OLLAMA ? {#2-ollama}

### 📦 Ollama expliqué simplement

**Ollama** est un **logiciel** qui permet de faire tourner des modèles d'IA **localement** sur votre ordinateur.

**Avant Ollama :**
```
Votre app → Internet → API OpenAI (payant, lent)
```

**Avec Ollama :**
```
Votre app → Ollama (local, gratuit, rapide)
```

### ✅ Avantages d'Ollama

| Avantage | Explication |
|----------|-------------|
| **Gratuit** | Pas de frais d'API |
| **Privé** | Vos données restent locales |
| **Rapide** | Pas de latence réseau |
| **Offline** | Fonctionne sans Internet |
| **Personnalisable** | Vous contrôlez tout |

### 🏗️ Architecture

```
┌─────────────────────────────────────┐
│     Votre Application Node.js       │
│                                     │
│  app.post('/chat', async (req) =>  │
│    const response = await ollama   │
│  )                                  │
└─────────────┬───────────────────────┘
              │ HTTP Request
              ↓
┌─────────────────────────────────────┐
│         Ollama (localhost:11434)    │
│                                     │
│  - Reçoit le prompt                │
│  - Charge le modèle Llama          │
│  - Génère la réponse               │
└─────────────┬───────────────────────┘
              │
              ↓
┌─────────────────────────────────────┐
│      Modèle IA (ex: Llama 3.2)     │
│                                     │
│  Poids du modèle : 4-70 GB         │
│  Stocké dans : ~/.ollama/models    │
└─────────────────────────────────────┘
```

---

## 3. MODÈLES DE LANGAGE (LLM) {#3-llm}

### 🤔 C'est quoi un LLM ?

**LLM = Large Language Model**  
(Grand Modèle de Langage)

Un LLM est un **fichier géant** contenant les connaissances de l'IA :

```
Fichier : llama3.2:3b
Taille : 3 milliards de paramètres = ~4 GB
Contenu : Poids neuronaux entraînés
```

### 🎯 Modèles populaires sur Ollama

| Modèle | Taille | Usage | RAM requise |
|--------|--------|-------|-------------|
| `llama3.2:1b` | 1.3 GB | Léger, rapide | 4 GB |
| `llama3.2:3b` | 2 GB | Bon équilibre | 8 GB |
| `llama3.1:8b` | 4.7 GB | Performant | 16 GB |
| `llama3.1:70b` | 40 GB | Très puissant | 64 GB |

**Comment choisir ?**

```javascript
// Pour développement/tests
const model = 'llama3.2:3b'; // Rapide

// Pour production
const model = 'llama3.1:8b'; // Meilleure qualité
```

### 📊 Paramètres (billions)

**Qu'est-ce qu'un "billion" ?**

Un paramètre = un "neurone" du modèle

```
1B paramètres = 1 milliard de connexions
3B = 3 fois plus "intelligent" (généralement)
```

**Analogie :**
```
1B = Élève de primaire
3B = Lycéen
8B = Étudiant universitaire
70B = Expert avec PhD
```

---

## 4. INSTALLER ET CONFIGURER OLLAMA {#4-installation}

### 📥 Installation

**Sur macOS :**
```bash
brew install ollama
```

**Sur Linux :**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Sur Windows :**
```bash
# Télécharger depuis ollama.com
# Installer l'exécutable
```

### 🚀 Démarrer Ollama

**Terminal 1 :**
```bash
ollama serve
# Démarre le serveur sur localhost:11434
```

**Vérifier que ça marche :**
```bash
curl http://localhost:11434
# Devrait retourner "Ollama is running"
```

### 📦 Télécharger un modèle

```bash
# Télécharger Llama 3.2 (3B)
ollama pull llama3.2:3b

# Télécharger Llama 3.1 (8B)
ollama pull llama3.1:8b
```

**Tester en ligne de commande :**
```bash
ollama run llama3.2:3b

>>> Bonjour, comment vas-tu ?
Bonjour ! Je vais bien, merci. Comment puis-je vous aider ?

>>> /bye
```

### 📝 Lister les modèles

```bash
ollama list

NAME              ID            SIZE    MODIFIED
llama3.2:3b       a80c4f17..    2.0 GB  2 hours ago
llama3.1:8b       3b4d42a..     4.7 GB  1 day ago
```

---

## 5. APPELER L'IA DEPUIS NODE.JS {#5-nodejs}

### 📚 Installer la bibliothèque

```bash
npm install ollama
```

### 🔌 Se connecter à Ollama

**fichier : config/ollama.js**
```javascript
const { Ollama } = require('ollama');

// Créer une instance Ollama
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

module.exports = ollama;
```

### 💬 Premier appel simple

**fichier : test-ollama.js**
```javascript
const ollama = require('./config/ollama');

async function testIA() {
  try {
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [
        {
          role: 'user',
          content: 'Dis bonjour en français'
        }
      ]
    });
    
    console.log(response.message.content);
    // Affiche : "Bonjour ! Comment allez-vous ?"
    
  } catch (error) {
    console.error('Erreur IA :', error);
  }
}

testIA();
```

**Exécuter :**
```bash
node test-ollama.js
```

### 🎯 Décortiquons le code

```javascript
// 1. Importer la connexion Ollama
const ollama = require('./config/ollama');

// 2. Fonction asynchrone (l'IA prend du temps)
async function testIA() {
  
  // 3. try/catch pour gérer les erreurs
  try {
    
    // 4. Appeler l'IA
    const response = await ollama.chat({
      
      // 5. Quel modèle utiliser ?
      model: 'llama3.2:3b',
      
      // 6. Les messages de conversation
      messages: [
        {
          role: 'user',      // Qui parle ? L'utilisateur
          content: 'Bonjour' // Que dit-il ?
        }
      ]
    });
    
    // 7. Récupérer la réponse
    console.log(response.message.content);
    
  } catch (error) {
    // 8. Si erreur, l'afficher
    console.error(error);
  }
}
```

### 📨 Structure d'un message

```javascript
{
  role: 'user',      // Ou 'assistant' ou 'system'
  content: 'Texte'   // Le message
}
```

**Types de rôles :**

| Role | Qui ? | Exemple |
|------|-------|---------|
| `system` | Instructions | "Tu es un assistant médical" |
| `user` | L'utilisateur | "J'ai mal à la tête" |
| `assistant` | L'IA | "Je recommande du repos" |

---

## 6. ÉCRIRE DES PROMPTS EFFICACES {#6-prompts}

### 🎯 Qu'est-ce qu'un prompt ?

Un **prompt** = l'instruction que vous donnez à l'IA

**Mauvais prompt :**
```javascript
"analyse"
// Trop vague, résultat imprévisible
```

**Bon prompt :**
```javascript
"Analyse ces données de ventes et donne-moi le TOP 3 
des produits avec leur chiffre d'affaires en euros"
// Clair, précis, format défini
```

### 📝 Les 5 règles d'un bon prompt

#### **1. Être spécifique**

❌ Mauvais :
```javascript
"Écris un texte sur les voitures"
```

✅ Bon :
```javascript
"Écris un paragraphe de 100 mots sur les avantages 
des voitures électriques pour l'environnement"
```

#### **2. Donner du contexte**

❌ Mauvais :
```javascript
"C'est quoi Express ?"
```

✅ Bon :
```javascript
"Je suis débutant en JavaScript. Peux-tu m'expliquer 
ce qu'est Express.js en termes simples avec un exemple ?"
```

#### **3. Définir le format**

❌ Mauvais :
```javascript
"Donne-moi des infos sur ce produit"
```

✅ Bon :
```javascript
"Donne-moi les infos suivantes au format JSON :
{
  \"nom\": \"...\",
  \"prix\": ...,
  \"stock\": ...
}"
```

#### **4. Donner des exemples**

❌ Mauvais :
```javascript
"Résume ce texte"
```

✅ Bon :
```javascript
"Résume ce texte en 3 points, comme ceci :
- Point 1
- Point 2
- Point 3"
```

#### **5. Utiliser un rôle (system message)**

```javascript
const response = await ollama.chat({
  model: 'llama3.2:3b',
  messages: [
    {
      role: 'system',
      content: 'Tu es un expert en marketing. Réponds de manière professionnelle et concise.'
    },
    {
      role: 'user',
      content: 'Comment améliorer mes ventes ?'
    }
  ]
});
```

### 🎨 Templates de prompts

**Pour analyser des données :**
```javascript
const prompt = `
Analyse les données suivantes et fournis :
1. Tendance générale
2. Top 3 insights
3. Recommandations

Données :
${JSON.stringify(data)}

Format de réponse : JSON
`;
```

**Pour extraire des informations :**
```javascript
const prompt = `
Extrais les informations suivantes du texte ci-dessous :
- Nom de l'entreprise
- Secteur d'activité
- Chiffre d'affaires

Texte : "${texte}"

Réponds uniquement au format JSON sans explications.
`;
```

**Pour générer du contenu :**
```javascript
const prompt = `
Rédige un email professionnel pour :
- Destinataire : ${destinataire}
- Sujet : ${sujet}
- Ton : ${ton} (formel/informel)
- Longueur : ${longueur} mots maximum

Ne mets pas d'objet d'email, juste le corps du message.
`;
```

---

## 7. GÉRER LES RÉPONSES {#7-reponses}

### 📥 Structure de la réponse

```javascript
const response = await ollama.chat({...});

console.log(response);
```

**Résultat :**
```javascript
{
  model: 'llama3.2:3b',
  created_at: '2024-02-06T10:30:00Z',
  message: {
    role: 'assistant',
    content: 'Voici ma réponse...'
  },
  done: true,
  total_duration: 2500000000,  // nanosecondes
  load_duration: 50000000,
  prompt_eval_count: 25,
  eval_count: 150
}
```

### 🎯 Extraire la réponse

```javascript
// Récupérer juste le texte
const texte = response.message.content;

// Statistiques
const duree = response.total_duration / 1000000000; // secondes
const tokens = response.eval_count;
console.log(`Réponse en ${duree}s avec ${tokens} tokens`);
```

### 📊 Parser du JSON

Si vous demandez du JSON à l'IA :

```javascript
const response = await ollama.chat({
  model: 'llama3.2:3b',
  messages: [{
    role: 'user',
    content: 'Donne-moi {"nom": "Apple", "secteur": "Tech"} en JSON'
  }]
});

// L'IA peut répondre avec du texte autour :
// "Voici le JSON : {"nom": "Apple", "secteur": "Tech"}"

// Il faut extraire le JSON
const texte = response.message.content;

// Méthode 1 : Regex
const match = texte.match(/\{.*\}/s);
if (match) {
  const data = JSON.parse(match[0]);
  console.log(data.nom); // "Apple"
}

// Méthode 2 : Trouver { et }
const debut = texte.indexOf('{');
const fin = texte.lastIndexOf('}');
if (debut !== -1 && fin !== -1) {
  const json = texte.substring(debut, fin + 1);
  const data = JSON.parse(json);
}
```

**Meilleure solution : Bien formuler le prompt**

```javascript
const prompt = `
Réponds UNIQUEMENT avec du JSON valide, sans texte avant ou après.

{"nom": "...", "secteur": "..."}
`;
```

### 🛡️ Gérer les erreurs

```javascript
async function appelIA(prompt) {
  try {
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [{ role: 'user', content: prompt }]
    });
    
    return response.message.content;
    
  } catch (error) {
    // Ollama n'est pas démarré
    if (error.code === 'ECONNREFUSED') {
      throw new Error('Ollama n\'est pas démarré. Lance : ollama serve');
    }
    
    // Modèle non trouvé
    if (error.message.includes('model')) {
      throw new Error('Modèle non téléchargé. Lance : ollama pull llama3.2:3b');
    }
    
    // Autre erreur
    throw error;
  }
}
```

---

## 8. CAS PRATIQUES {#8-pratique}

### 🎯 Cas 1 : Analyser un avis client

**Objectif :** Déterminer si un avis est positif, négatif ou neutre

**Code :**
```javascript
async function analyserAvis(avis) {
  const prompt = `
Analyse cet avis client et détermine :
1. Sentiment : positif, négatif ou neutre
2. Note estimée : /10
3. Points forts (liste)
4. Points faibles (liste)

Avis : "${avis}"

Réponds au format JSON :
{
  "sentiment": "...",
  "note": ...,
  "points_forts": [],
  "points_faibles": []
}
`;

  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: prompt }]
  });
  
  const texte = response.message.content;
  const json = JSON.parse(texte.match(/\{.*\}/s)[0]);
  
  return json;
}

// Test
const avis = "Super produit, livraison rapide mais emballage fragile";
const analyse = await analyserAvis(avis);

console.log(analyse);
/*
{
  sentiment: "positif",
  note: 7,
  points_forts: ["Produit de qualité", "Livraison rapide"],
  points_faibles: ["Emballage fragile"]
}
*/
```

### 🎯 Cas 2 : Générer des descriptions produits

**Objectif :** Créer des fiches produits à partir de données brutes

**Code :**
```javascript
async function genererDescription(produit) {
  const prompt = `
Rédige une description commerciale attrayante pour ce produit :

Nom : ${produit.nom}
Catégorie : ${produit.categorie}
Prix : ${produit.prix}€
Caractéristiques : ${produit.caracteristiques.join(', ')}

La description doit :
- Faire 100-150 mots
- Être engageante et professionnelle
- Mettre en avant les bénéfices clients
- Se terminer par un appel à l'action
`;

  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response.message.content;
}

// Test
const produit = {
  nom: "Chaussures de running Pro",
  categorie: "Sport",
  prix: 89.99,
  caracteristiques: ["Légères", "Respirantes", "Semelle amortissante"]
};

const description = await genererDescription(produit);
console.log(description);
```

### 🎯 Cas 3 : Chatbot conversationnel

**Objectif :** Créer un chatbot qui se souvient du contexte

**Code :**
```javascript
class Chatbot {
  constructor() {
    this.conversation = [];
  }
  
  async discuter(message) {
    // Ajouter le message utilisateur
    this.conversation.push({
      role: 'user',
      content: message
    });
    
    // Appeler l'IA avec tout l'historique
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: this.conversation
    });
    
    // Ajouter la réponse de l'IA
    this.conversation.push({
      role: 'assistant',
      content: response.message.content
    });
    
    return response.message.content;
  }
  
  reset() {
    this.conversation = [];
  }
}

// Utilisation
const bot = new Chatbot();

await bot.discuter("Bonjour, je m'appelle Alice");
// "Bonjour Alice ! Comment puis-je vous aider ?"

await bot.discuter("Quel est mon prénom ?");
// "Votre prénom est Alice."
// ☝️ Le bot se souvient !

bot.reset(); // Oublier la conversation
```

### 🎯 Cas 4 : Extraction d'informations (Web Scraping)

**Objectif :** Extraire des données structurées d'un texte libre

**Code :**
```javascript
async function extraireInfos(texte) {
  const prompt = `
Extrais les informations suivantes de ce texte :
- Entreprises mentionnées (liste)
- Montants en euros (liste avec contexte)
- Dates (liste)
- Personnes (liste)

Texte : "${texte}"

Réponds en JSON uniquement :
{
  "entreprises": [],
  "montants": [],
  "dates": [],
  "personnes": []
}
`;

  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: prompt }]
  });
  
  const json = response.message.content.match(/\{.*\}/s)[0];
  return JSON.parse(json);
}

// Test
const texte = `
Apple a annoncé un investissement de 500 millions d'euros 
dans son nouveau datacenter en France. Tim Cook rencontrera 
Emmanuel Macron le 15 mars 2024 pour discuter du projet.
`;

const infos = await extraireInfos(texte);
console.log(infos);
/*
{
  entreprises: ["Apple"],
  montants: ["500 millions d'euros pour datacenter"],
  dates: ["15 mars 2024"],
  personnes: ["Tim Cook", "Emmanuel Macron"]
}
*/
```

---

## 9. EXERCICES {#9-exercices}

### ✏️ Exercice 1 : Premier appel (Facile)

**Consigne :**
Créez un script qui demande à l'IA de raconter une blague.

**À faire :**
1. Importer ollama
2. Créer une fonction async
3. Appeler l'IA avec le prompt "Raconte-moi une blague courte"
4. Afficher la réponse

<details>
<summary>💡 Voir la solution</summary>

```javascript
const { Ollama } = require('ollama');
const ollama = new Ollama({ host: 'http://localhost:11434' });

async function blague() {
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{
      role: 'user',
      content: 'Raconte-moi une blague courte'
    }]
  });
  
  console.log(response.message.content);
}

blague();
```
</details>

---

### ✏️ Exercice 2 : Traduction (Moyen)

**Consigne :**
Créez une fonction qui traduit un texte anglais vers français.

**À faire :**
```javascript
async function traduire(texte) {
  // Votre code ici
  // Prompt : "Traduis ce texte en français : ..."
}

// Test
traduire("Hello, how are you?");
// Devrait afficher : "Bonjour, comment allez-vous ?"
```

<details>
<summary>💡 Voir la solution</summary>

```javascript
async function traduire(texte) {
  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{
      role: 'system',
      content: 'Tu es un traducteur professionnel. Traduis uniquement, sans commentaire.'
    }, {
      role: 'user',
      content: `Traduis en français : "${texte}"`
    }]
  });
  
  return response.message.content;
}
```
</details>

---

### ✏️ Exercice 3 : Résumé de texte (Moyen)

**Consigne :**
Créez une fonction qui résume un long texte en 3 points.

**À faire :**
```javascript
async function resumer(texte) {
  // Prompt : Résume en 3 points maximum
}

const article = `
L'intelligence artificielle transforme le monde...
[300 mots]
`;

const resume = await resumer(article);
console.log(resume);
```

<details>
<summary>💡 Voir la solution</summary>

```javascript
async function resumer(texte) {
  const prompt = `
Résume ce texte en exactement 3 points clés.
Format :
- Point 1
- Point 2  
- Point 3

Texte : "${texte}"
`;

  const response = await ollama.chat({
    model: 'llama3.2:3b',
    messages: [{ role: 'user', content: prompt }]
  });
  
  return response.message.content;
}
```
</details>

---

### ✏️ Exercice 4 : Analyse de sentiment (Difficile)

**Consigne :**
Créez une API Express qui analyse le sentiment d'un texte.

**À faire :**
```javascript
// Route POST /api/sentiment
// Body : { "texte": "..." }
// Réponse : { "sentiment": "positif/négatif/neutre", "score": 0-10 }
```

<details>
<summary>💡 Voir la solution</summary>

```javascript
const express = require('express');
const { Ollama } = require('ollama');

const app = express();
const ollama = new Ollama({ host: 'http://localhost:11434' });

app.use(express.json());

app.post('/api/sentiment', async (req, res) => {
  try {
    const { texte } = req.body;
    
    if (!texte) {
      return res.status(400).json({ error: 'Texte requis' });
    }
    
    const prompt = `
Analyse le sentiment de ce texte.
Réponds uniquement en JSON :
{
  "sentiment": "positif" ou "négatif" ou "neutre",
  "score": 0-10
}

Texte : "${texte}"
`;
    
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [{ role: 'user', content: prompt }]
    });
    
    const json = response.message.content.match(/\{.*\}/s)[0];
    const resultat = JSON.parse(json);
    
    res.json(resultat);
    
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

### ✏️ Exercice 5 : Chatbot avec mémoire (Difficile)

**Consigne :**
Créez une route Express pour un chatbot qui garde en mémoire la conversation.

**À faire :**
```javascript
// POST /api/chat
// Body : { "message": "...", "session_id": "abc123" }
// La conversation doit être sauvegardée par session
```

<details>
<summary>💡 Voir la solution</summary>

```javascript
const express = require('express');
const { Ollama } = require('ollama');

const app = express();
const ollama = new Ollama({ host: 'http://localhost:11434' });

app.use(express.json());

// Stockage en mémoire des conversations
const sessions = new Map();

app.post('/api/chat', async (req, res) => {
  try {
    const { message, session_id } = req.body;
    
    if (!message || !session_id) {
      return res.status(400).json({ 
        error: 'message et session_id requis' 
      });
    }
    
    // Récupérer ou créer la conversation
    if (!sessions.has(session_id)) {
      sessions.set(session_id, []);
    }
    const conversation = sessions.get(session_id);
    
    // Ajouter le message utilisateur
    conversation.push({
      role: 'user',
      content: message
    });
    
    // Appeler l'IA
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: conversation
    });
    
    // Ajouter la réponse
    conversation.push({
      role: 'assistant',
      content: response.message.content
    });
    
    // Limiter l'historique à 10 messages
    if (conversation.length > 10) {
      conversation.splice(0, 2);
    }
    
    res.json({
      response: response.message.content,
      historique_length: conversation.length
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour réinitialiser une session
app.delete('/api/chat/:session_id', (req, res) => {
  const { session_id } = req.params;
  sessions.delete(session_id);
  res.json({ message: 'Session réinitialisée' });
});

app.listen(3000);
```
</details>

---

## 10. QUIZ {#10-quiz}

### ❓ Question 1

Qu'est-ce qu'Ollama ?

A) Une base de données  
B) Un logiciel pour faire tourner des modèles IA localement  
C) Un framework JavaScript  
D) Un service cloud payant

<details>
<summary>✅ Réponse</summary>
**B** - Ollama permet d'exécuter des LLMs localement.
</details>

---

### ❓ Question 2

Quelle est la différence entre un modèle 3B et 8B ?

A) La vitesse de réponse  
B) Le nombre de paramètres (neurones)  
C) La langue supportée  
D) Le prix

<details>
<summary>✅ Réponse</summary>
**B** - 3B = 3 milliards de paramètres, 8B = 8 milliards.  
Plus de paramètres = généralement plus "intelligent" mais plus lent.
</details>

---

### ❓ Question 3

Quel est le rôle de `system` dans les messages ?

A) Envoyer la requête  
B) Donner des instructions générales à l'IA  
C) Recevoir la réponse  
D) Gérer les erreurs

<details>
<summary>✅ Réponse</summary>
**B** - Le message `system` définit le comportement global de l'IA.
</details>

---

### ❓ Question 4

Comment parser du JSON depuis une réponse IA ?

A) `JSON.parse(response)`  
B) `JSON.parse(response.message.content)`  
C) Extraire le JSON avec regex puis parser  
D) L'IA retourne toujours du JSON pur

<details>
<summary>✅ Réponse</summary>
**C** - L'IA ajoute souvent du texte autour du JSON, il faut l'extraire.
```javascript
const match = texte.match(/\{.*\}/s);
const json = JSON.parse(match[0]);
```
</details>

---

### ❓ Question 5

Comment garder le contexte d'une conversation ?

A) L'IA se souvient automatiquement  
B) Envoyer tout l'historique à chaque appel  
C) Utiliser des cookies  
D) Ce n'est pas possible

<details>
<summary>✅ Réponse</summary>
**B** - Il faut envoyer tous les messages précédents à chaque appel.
```javascript
messages: [
  { role: 'user', content: 'Bonjour' },
  { role: 'assistant', content: 'Salut !' },
  { role: 'user', content: 'Comment tu t\'appelles ?' }
]
```
</details>

---

### ❓ Question 6

Quel est le meilleur prompt ?

A) "Analyse"  
B) "Analyse ces données"  
C) "Analyse ces données de ventes et donne le TOP 3 des produits avec leur CA en JSON"  
D) "Fais une analyse complète détaillée de toutes les données"

<details>
<summary>✅ Réponse</summary>
**C** - Spécifique, format défini, actionable.
</details>

---

### ❓ Question 7

Que faire si Ollama retourne `ECONNREFUSED` ?

A) Réinstaller Node.js  
B) Redémarrer l'ordinateur  
C) Lancer `ollama serve`  
D) Changer de modèle

<details>
<summary>✅ Réponse</summary>
**C** - L'erreur signifie qu'Ollama n'est pas démarré.
</details>

---

### ❓ Question 8

Combien de RAM minimum pour `llama3.2:3b` ?

A) 2 GB  
B) 4 GB  
C) 8 GB  
D) 16 GB

<details>
<summary>✅ Réponse</summary>
**C** - 8 GB minimum recommandé (modèle = 2 GB + système).
</details>

---

### ❓ Question 9

Comment limiter la longueur de la réponse ?

A) Ajouter `max_tokens: 100` dans les options  
B) Le spécifier dans le prompt "Réponds en 50 mots max"  
C) Couper la réponse après  
D) Ce n'est pas possible

<details>
<summary>✅ Réponse</summary>
**B** - Le plus simple est de l'indiquer dans le prompt.
</details>

---

### ❓ Question 10

Quelle est la meilleure pratique pour les erreurs ?

```javascript
// A
const response = await ollama.chat({...});

// B
try {
  const response = await ollama.chat({...});
} catch (error) {
  console.log('Erreur');
}

// C
try {
  const response = await ollama.chat({...});
} catch (error) {
  if (error.code === 'ECONNREFUSED') {
    throw new Error('Ollama pas démarré');
  }
  throw error;
}
```

<details>
<summary>✅ Réponse</summary>
**C** - Toujours gérer les erreurs spécifiques avec des messages clairs.
</details>

---

## 📊 RÉSULTATS

**Score :** ___ / 10

- **9-10** : Excellent ! Vous maîtrisez l'IA 🏆
- **7-8** : Très bien ! Relire les points faibles 👍
- **5-6** : Bien, mais revoir certaines sections 📖
- **< 5** : Reprendre le cours depuis le début 🔄

---

## 🎓 PROCHAINES ÉTAPES

Vous avez terminé le Cours 4 ! 🎉

**Continuez vers :**
- ✅ **COURS 5** : Base de données PostgreSQL
- 🔜 **COURS 7** : Fine-tuning et auto-apprentissage

**Compétences acquises :**
- ✅ Comprendre les LLMs
- ✅ Installer et utiliser Ollama
- ✅ Appeler l'IA depuis Node.js
- ✅ Écrire des prompts efficaces
- ✅ Parser les réponses
- ✅ Gérer les erreurs

---

**Félicitations ! 🚀**
