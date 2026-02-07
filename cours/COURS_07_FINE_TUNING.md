# 🎓 COURS 7 : FINE-TUNING & AUTO-APPRENTISSAGE

## Entraîner l'IA à devenir experte de votre domaine

**Durée :** 2 heures  
**Niveau :** Avancé  
**Prérequis :** Cours 4, 6

---

## 📋 SOMMAIRE

1. [Qu'est-ce que le fine-tuning ?](#1-concept)
2. [Auto-apprentissage expliqué](#2-auto-apprentissage)
3. [Collecte de données](#3-collecte)
4. [Préparation du dataset](#4-preparation)
5. [Fine-tuning avec Ollama](#5-ollama)
6. [Évaluation du modèle](#6-evaluation)
7. [Déploiement](#7-deploiement)
8. [Exercices](#8-exercices)
9. [Quiz](#9-quiz)

---

## 1. QU'EST-CE QUE LE FINE-TUNING ? {#1-concept}

### 🎯 Définition simple

**Fine-tuning** = Affiner un modèle IA existant pour qu'il soit **expert** dans un domaine spécifique.

**Analogie :**
```
Modèle de base (Llama) = Médecin généraliste
Fine-tuning = Formation pour devenir cardiologue

Le médecin connaît déjà la médecine générale
On l'entraîne sur des cas spécifiques de cardiologie
→ Il devient expert en cardiologie
```

### 🔄 Avant vs Après

**AVANT (modèle de base) :**
```
Vous : "Analyse cette campagne marketing pour notre marque de cosmétiques"
IA : "Voici une analyse générale du marketing..."
```

**APRÈS (fine-tuning) :**
```
Vous : "Analyse cette campagne marketing pour notre marque de cosmétiques"
IA : "Cette campagne respecte votre ADN de marque axé sur le naturel.
      Le ton correspond à votre cible féminine 25-45 ans.
      Je recommande d'augmenter la présence sur Instagram de 30%
      basé sur vos précédentes campagnes réussies."
```

### 📊 Types de fine-tuning

| Type | Description | Usage |
|------|-------------|-------|
| **Supervised** | Avec exemples entrée/sortie | Classification, Q&A |
| **Instruction** | Avec instructions | Chatbot, assistant |
| **RLHF** | Avec feedback humain | Qualité des réponses |
| **Domain-specific** | Données d'un domaine | Médical, légal, etc. |

**Nous utilisons : Supervised + Instruction**

---

## 2. AUTO-APPRENTISSAGE EXPLIQUÉ {#2-auto-apprentissage}

### 🤖 Concept

L'**auto-apprentissage** est un système où l'IA :
1. Reçoit des interactions utilisateurs
2. Stocke les bonnes réponses
3. S'entraîne automatiquement
4. S'améliore avec le temps

### 🔄 Cycle d'auto-apprentissage

```
┌──────────────────────────────────────┐
│  1. INTERACTION UTILISATEUR          │
│  User: "Analyse ce produit"          │
│  IA: "Voici l'analyse..."            │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  2. FEEDBACK UTILISATEUR             │
│  👍 Bonne réponse (score 5/5)        │
│  ou                                  │
│  👎 Mauvaise réponse (score 1/5)     │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  3. STOCKAGE EN BASE                 │
│  training_data:                      │
│    - input: "Analyse ce produit"     │
│    - output: "Voici l'analyse..."    │
│    - score: 5                        │
│    - timestamp: 2024-02-06           │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  4. ACCUMULATION                     │
│  Attendre 1000 interactions          │
│  avec score > 4/5                    │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  5. PRÉPARATION DATASET              │
│  Transformer en format JSONL         │
│  pour fine-tuning                    │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  6. FINE-TUNING                      │
│  Créer un nouveau modèle             │
│  "llama3-semantic-v2"                │
└─────────────┬────────────────────────┘
              │
              ↓
┌──────────────────────────────────────┐
│  7. DÉPLOIEMENT                      │
│  Remplacer l'ancien modèle           │
│  par le nouveau                      │
└─────────────┬────────────────────────┘
              │
              └──────┐ Retour à 1
                     ↓
              Amélioration continue
```

### 💾 Structure de la base de données

```sql
CREATE TABLE training_interactions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    
    -- L'interaction
    input TEXT NOT NULL,              -- Question/prompt
    output TEXT NOT NULL,             -- Réponse de l'IA
    context JSONB,                    -- Contexte (brand_id, etc.)
    
    -- Feedback
    score INTEGER CHECK (score BETWEEN 1 AND 5),
    feedback_text TEXT,
    user_edited_output TEXT,          -- Si user corrige
    
    -- Métadonnées
    model_version VARCHAR(50),
    response_time_ms INTEGER,
    tokens_used INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    feedback_at TIMESTAMP,
    
    -- Flags
    used_for_training BOOLEAN DEFAULT false,
    quality_verified BOOLEAN DEFAULT false
);

-- Index pour performance
CREATE INDEX idx_training_score ON training_interactions(score);
CREATE INDEX idx_training_used ON training_interactions(used_for_training);
CREATE INDEX idx_training_date ON training_interactions(created_at);
```

---

## 3. COLLECTE DE DONNÉES {#3-collecte}

### 📊 Module AutoLearning

**fichier : modules/AutoLearning.js**
```javascript
const pool = require('../config/database');

class AutoLearning {
  constructor() {
    this.minScore = 4;  // Score minimum pour training
    this.batchSize = 1000;  // Taille du batch
  }
  
  // Méthode 1 : Sauvegarder une interaction
  async saveInteraction(data) {
    const { userId, sessionId, input, output, context, modelVersion } = data;
    
    const result = await pool.query(
      `INSERT INTO training_interactions 
       (user_id, session_id, input, output, context, model_version)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [userId, sessionId, input, output, JSON.stringify(context), modelVersion]
    );
    
    return result.rows[0].id;
  }
  
  // Méthode 2 : Enregistrer le feedback
  async saveFeedback(interactionId, score, feedbackText) {
    await pool.query(
      `UPDATE training_interactions
       SET score = $1,
           feedback_text = $2,
           feedback_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [score, feedbackText, interactionId]
    );
    
    // Si bon score, marquer pour training
    if (score >= this.minScore) {
      await this.markForTraining(interactionId);
    }
  }
  
  // Méthode 3 : Marquer pour training
  async markForTraining(interactionId) {
    await pool.query(
      `UPDATE training_interactions
       SET used_for_training = true
       WHERE id = $1`,
      [interactionId]
    );
  }
  
  // Méthode 4 : Compter les données prêtes
  async countReadyData() {
    const result = await pool.query(
      `SELECT COUNT(*) as count
       FROM training_interactions
       WHERE score >= $1
       AND used_for_training = false`,
      [this.minScore]
    );
    
    return parseInt(result.rows[0].count);
  }
  
  // Méthode 5 : Récupérer les données pour training
  async getTrainingData(limit = 1000) {
    const result = await pool.query(
      `SELECT 
        input,
        output,
        context,
        score
       FROM training_interactions
       WHERE score >= $1
       AND used_for_training = false
       ORDER BY score DESC, created_at DESC
       LIMIT $2`,
      [this.minScore, limit]
    );
    
    return result.rows;
  }
}

module.exports = AutoLearning;
```

### 🔌 Intégration dans les routes

**fichier : routes/ai.js**
```javascript
const express = require('express');
const ollama = require('../config/ollama');
const AutoLearning = require('../modules/AutoLearning');

const router = express.Router();
const autoLearning = new AutoLearning();

// Route de chat avec tracking
router.post('/chat', async (req, res) => {
  try {
    const { message, sessionId, userId, brandId } = req.body;
    
    // Appeler l'IA
    const response = await ollama.chat({
      model: 'llama3.2:3b',
      messages: [{ role: 'user', content: message }]
    });
    
    const output = response.message.content;
    
    // Sauvegarder l'interaction
    const interactionId = await autoLearning.saveInteraction({
      userId,
      sessionId,
      input: message,
      output: output,
      context: { brandId },
      modelVersion: 'llama3.2:3b'
    });
    
    res.json({
      response: output,
      interactionId  // Retourner l'ID pour le feedback
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route de feedback
router.post('/feedback', async (req, res) => {
  try {
    const { interactionId, score, feedback } = req.body;
    
    await autoLearning.saveFeedback(interactionId, score, feedback);
    
    res.json({ message: 'Feedback enregistré' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route pour voir le statut du training
router.get('/training/status', async (req, res) => {
  try {
    const count = await autoLearning.countReadyData();
    
    res.json({
      ready: count,
      threshold: 1000,
      percentage: (count / 1000 * 100).toFixed(1)
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 🎨 Frontend avec feedback

**fichier : public/dashboard.html**
```html
<div id="chat-container">
  <div id="messages"></div>
  <input type="text" id="user-input" placeholder="Votre message...">
  <button onclick="sendMessage()">Envoyer</button>
</div>

<script>
let currentInteractionId = null;

async function sendMessage() {
  const input = document.getElementById('user-input');
  const message = input.value;
  
  // Envoyer à l'API
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      sessionId: 'session123',
      userId: 1,
      brandId: 1
    })
  });
  
  const data = await response.json();
  
  // Afficher la réponse
  displayMessage('IA', data.response);
  
  // Sauvegarder l'ID pour le feedback
  currentInteractionId = data.interactionId;
  
  // Afficher les boutons de feedback
  showFeedbackButtons();
  
  input.value = '';
}

function showFeedbackButtons() {
  const feedbackHTML = `
    <div id="feedback-${currentInteractionId}">
      <p>Cette réponse vous a-t-elle aidé ?</p>
      <button onclick="sendFeedback(5)">👍 Excellente</button>
      <button onclick="sendFeedback(4)">🙂 Bonne</button>
      <button onclick="sendFeedback(3)">😐 Moyenne</button>
      <button onclick="sendFeedback(2)">😕 Mauvaise</button>
      <button onclick="sendFeedback(1)">👎 Très mauvaise</button>
    </div>
  `;
  
  document.getElementById('messages').innerHTML += feedbackHTML;
}

async function sendFeedback(score) {
  await fetch('/api/ai/feedback', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      interactionId: currentInteractionId,
      score,
      feedback: ''
    })
  });
  
  // Supprimer les boutons
  document.getElementById(`feedback-${currentInteractionId}`).remove();
}
</script>
```

---

## 4. PRÉPARATION DU DATASET {#4-preparation}

### 📝 Format JSONL

Le format pour fine-tuning Ollama est **JSONL** (JSON Lines) :

```jsonl
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
{"messages": [{"role": "user", "content": "..."}, {"role": "assistant", "content": "..."}]}
```

### 🔄 Module DatasetPreparer

**fichier : modules/DatasetPreparer.js**
```javascript
const fs = require('fs').promises;
const path = require('path');
const AutoLearning = require('./AutoLearning');

class DatasetPreparer {
  constructor() {
    this.autoLearning = new AutoLearning();
    this.outputDir = './datasets';
  }
  
  // Préparer le dataset
  async prepareDataset(limit = 1000) {
    console.log('📊 Préparation du dataset...');
    
    // 1. Récupérer les données
    const data = await this.autoLearning.getTrainingData(limit);
    
    console.log(`✅ ${data.length} interactions récupérées`);
    
    // 2. Convertir en JSONL
    const jsonl = this.convertToJSONL(data);
    
    // 3. Sauvegarder
    const filename = await this.saveDataset(jsonl);
    
    // 4. Statistiques
    const stats = this.calculateStats(data);
    
    return {
      filename,
      count: data.length,
      stats
    };
  }
  
  // Convertir en JSONL
  convertToJSONL(data) {
    return data.map(item => {
      // Ajouter le contexte dans le prompt si disponible
      let userContent = item.input;
      
      if (item.context) {
        const ctx = typeof item.context === 'string' 
          ? JSON.parse(item.context) 
          : item.context;
          
        if (ctx.brandId) {
          userContent = `[Brand ID: ${ctx.brandId}] ${item.input}`;
        }
      }
      
      return JSON.stringify({
        messages: [
          {
            role: 'user',
            content: userContent
          },
          {
            role: 'assistant',
            content: item.output
          }
        ]
      });
    }).join('\n');
  }
  
  // Sauvegarder le dataset
  async saveDataset(jsonl) {
    // Créer le dossier si n'existe pas
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Nom du fichier avec timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `training-${timestamp}.jsonl`;
    const filepath = path.join(this.outputDir, filename);
    
    // Écrire le fichier
    await fs.writeFile(filepath, jsonl, 'utf8');
    
    console.log(`✅ Dataset sauvegardé : ${filepath}`);
    
    return filepath;
  }
  
  // Calculer des statistiques
  calculateStats(data) {
    const scores = data.map(d => d.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    const inputLengths = data.map(d => d.input.length);
    const avgInputLength = inputLengths.reduce((a, b) => a + b, 0) / inputLengths.length;
    
    const outputLengths = data.map(d => d.output.length);
    const avgOutputLength = outputLengths.reduce((a, b) => a + b, 0) / outputLengths.length;
    
    return {
      avgScore: avgScore.toFixed(2),
      avgInputLength: Math.round(avgInputLength),
      avgOutputLength: Math.round(avgOutputLength),
      scoreDistribution: {
        score5: scores.filter(s => s === 5).length,
        score4: scores.filter(s => s === 4).length
      }
    };
  }
  
  // Valider le dataset
  async validateDataset(filepath) {
    const content = await fs.readFile(filepath, 'utf8');
    const lines = content.split('\n').filter(l => l.trim());
    
    const errors = [];
    
    lines.forEach((line, index) => {
      try {
        const obj = JSON.parse(line);
        
        // Vérifier la structure
        if (!obj.messages || !Array.isArray(obj.messages)) {
          errors.push(`Ligne ${index + 1}: 'messages' manquant ou invalide`);
        }
        
        if (obj.messages.length !== 2) {
          errors.push(`Ligne ${index + 1}: doit avoir exactement 2 messages`);
        }
        
        // Vérifier les rôles
        if (obj.messages[0].role !== 'user') {
          errors.push(`Ligne ${index + 1}: premier message doit être 'user'`);
        }
        
        if (obj.messages[1].role !== 'assistant') {
          errors.push(`Ligne ${index + 1}: deuxième message doit être 'assistant'`);
        }
        
      } catch (error) {
        errors.push(`Ligne ${index + 1}: JSON invalide`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors,
      linesCount: lines.length
    };
  }
}

module.exports = DatasetPreparer;
```

### 🚀 Utilisation

```javascript
const DatasetPreparer = require('./modules/DatasetPreparer');

async function prepareTraining() {
  const preparer = new DatasetPreparer();
  
  // Préparer le dataset
  const result = await preparer.prepareDataset(1000);
  
  console.log('Dataset préparé :');
  console.log(`- Fichier : ${result.filename}`);
  console.log(`- Nombre : ${result.count} interactions`);
  console.log(`- Score moyen : ${result.stats.avgScore}/5`);
  
  // Valider
  const validation = await preparer.validateDataset(result.filename);
  
  if (validation.valid) {
    console.log('✅ Dataset valide !');
  } else {
    console.error('❌ Erreurs :');
    validation.errors.forEach(err => console.error(`  - ${err}`));
  }
  
  return result.filename;
}

prepareTraining();
```

---

## 5. FINE-TUNING AVEC OLLAMA {#5-ollama}

### 🎓 Lancer le fine-tuning

**Créer un Modelfile :**

**fichier : Modelfile-semantic**
```
FROM llama3.2:3b

# Charger le dataset
ADAPTER ./datasets/training-2024-02-06.jsonl

# Paramètres de training
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1

# Instructions système
SYSTEM You are a semantic marketing AI assistant specialized in brand DNA analysis and content generation. You have been trained on real interactions from the Semantic Platform.
```

**Lancer le fine-tuning :**
```bash
ollama create llama3-semantic-v1 -f Modelfile-semantic
```

### ⚙️ Paramètres importants

| Paramètre | Description | Valeur recommandée |
|-----------|-------------|-------------------|
| `temperature` | Créativité (0-2) | 0.7 (équilibré) |
| `top_p` | Diversité | 0.9 |
| `repeat_penalty` | Éviter répétitions | 1.1 |
| `num_ctx` | Taille contexte | 4096 |

### 🔄 Module FineTuner

**fichier : modules/FineTuner.js**
```javascript
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs').promises;

const execPromise = util.promisify(exec);

class FineTuner {
  constructor() {
    this.modelBaseName = 'llama3-semantic';
  }
  
  // Créer un Modelfile
  async createModelfile(datasetPath, version) {
    const modelfile = `
FROM llama3.2:3b

ADAPTER ${datasetPath}

PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER repeat_penalty 1.1
PARAMETER num_ctx 4096

SYSTEM You are a semantic marketing AI assistant specialized in brand DNA analysis and content generation. You have been trained on ${version} interactions from the Semantic Platform.
`;

    const filename = `Modelfile-${this.modelBaseName}-v${version}`;
    await fs.writeFile(filename, modelfile, 'utf8');
    
    return filename;
  }
  
  // Lancer le fine-tuning
  async train(datasetPath, version) {
    console.log(`🎓 Démarrage fine-tuning v${version}...`);
    
    try {
      // 1. Créer le Modelfile
      const modelfile = await this.createModelfile(datasetPath, version);
      console.log(`✅ Modelfile créé : ${modelfile}`);
      
      // 2. Lancer ollama create
      const modelName = `${this.modelBaseName}-v${version}`;
      const command = `ollama create ${modelName} -f ${modelfile}`;
      
      console.log(`⚙️ Commande : ${command}`);
      
      const { stdout, stderr } = await execPromise(command);
      
      console.log(stdout);
      if (stderr) console.error(stderr);
      
      console.log(`✅ Modèle créé : ${modelName}`);
      
      return {
        success: true,
        modelName,
        version
      };
      
    } catch (error) {
      console.error('❌ Erreur fine-tuning :', error);
      throw error;
    }
  }
  
  // Tester le modèle
  async testModel(modelName) {
    const ollama = require('../config/ollama');
    
    const testCases = [
      "Analyse cette campagne marketing",
      "Génère un titre accrocheur",
      "Quelle est notre ADN de marque ?"
    ];
    
    console.log(`🧪 Test du modèle ${modelName}...\n`);
    
    for (const testCase of testCases) {
      console.log(`Question : ${testCase}`);
      
      const response = await ollama.chat({
        model: modelName,
        messages: [{ role: 'user', content: testCase }]
      });
      
      console.log(`Réponse : ${response.message.content}\n`);
    }
  }
  
  // Comparer ancien vs nouveau modèle
  async compareModels(oldModel, newModel, testCases) {
    const ollama = require('../config/ollama');
    
    const results = [];
    
    for (const testCase of testCases) {
      console.log(`\n📊 Test : ${testCase}\n`);
      
      // Ancien modèle
      const oldResponse = await ollama.chat({
        model: oldModel,
        messages: [{ role: 'user', content: testCase }]
      });
      
      // Nouveau modèle
      const newResponse = await ollama.chat({
        model: newModel,
        messages: [{ role: 'user', content: testCase }]
      });
      
      console.log(`${oldModel} :`);
      console.log(oldResponse.message.content);
      
      console.log(`\n${newModel} :`);
      console.log(newResponse.message.content);
      
      results.push({
        test: testCase,
        old: oldResponse.message.content,
        new: newResponse.message.content
      });
    }
    
    return results;
  }
}

module.exports = FineTuner;
```

### 🚀 Script de fine-tuning automatique

**fichier : scripts/auto-finetune.js**
```javascript
const DatasetPreparer = require('../modules/DatasetPreparer');
const FineTuner = require('../modules/FineTuner');
const AutoLearning = require('../modules/AutoLearning');

async function autoFineTune() {
  console.log('🤖 Auto Fine-Tuning Démarré\n');
  
  const autoLearning = new AutoLearning();
  const preparer = new DatasetPreparer();
  const tuner = new FineTuner();
  
  try {
    // 1. Vérifier qu'on a assez de données
    const count = await autoLearning.countReadyData();
    console.log(`📊 Données disponibles : ${count}`);
    
    if (count < 1000) {
      console.log(`⏳ Pas assez de données (minimum 1000)`);
      console.log(`   Encore ${1000 - count} à collecter`);
      return;
    }
    
    // 2. Préparer le dataset
    console.log('\n📝 Préparation dataset...');
    const dataset = await preparer.prepareDataset(count);
    
    // 3. Valider
    const validation = await preparer.validateDataset(dataset.filename);
    
    if (!validation.valid) {
      console.error('❌ Dataset invalide');
      validation.errors.forEach(err => console.error(`  - ${err}`));
      return;
    }
    
    // 4. Fine-tuning
    console.log('\n🎓 Fine-tuning...');
    const version = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const result = await tuner.train(dataset.filename, version);
    
    // 5. Tester
    console.log('\n🧪 Test du nouveau modèle...');
    await tuner.testModel(result.modelName);
    
    // 6. Comparer
    console.log('\n📊 Comparaison...');
    const comparison = await tuner.compareModels(
      'llama3.2:3b',
      result.modelName,
      [
        "Analyse cette campagne marketing",
        "Génère un slogan pour notre marque"
      ]
    );
    
    console.log('\n✅ Fine-tuning terminé !');
    console.log(`   Nouveau modèle : ${result.modelName}`);
    
  } catch (error) {
    console.error('\n❌ Erreur :', error);
  }
}

// Lancer
autoFineTune();
```

---

## 6. ÉVALUATION DU MODÈLE {#6-evaluation}

### 📊 Métriques à mesurer

```javascript
class ModelEvaluator {
  async evaluate(modelName, testSet) {
    const results = {
      accuracy: 0,
      avgResponseTime: 0,
      avgTokens: 0,
      scores: []
    };
    
    for (const test of testSet) {
      const start = Date.now();
      
      const response = await ollama.chat({
        model: modelName,
        messages: [{ role: 'user', content: test.input }]
      });
      
      const responseTime = Date.now() - start;
      const output = response.message.content;
      
      // Calculer un score de similarité
      const similarity = this.calculateSimilarity(
        output,
        test.expectedOutput
      );
      
      results.scores.push(similarity);
      results.avgResponseTime += responseTime;
      results.avgTokens += response.eval_count;
    }
    
    results.avgResponseTime /= testSet.length;
    results.avgTokens /= testSet.length;
    results.accuracy = 
      results.scores.reduce((a, b) => a + b) / results.scores.length;
    
    return results;
  }
  
  // Calculer similarité (simple)
  calculateSimilarity(text1, text2) {
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    
    const common = words1.filter(w => words2.includes(w));
    
    return common.length / Math.max(words1.length, words2.length);
  }
}
```

---

## 7. DÉPLOIEMENT {#7-deploiement}

### 🚀 Déployer le nouveau modèle

```javascript
// config/ollama.js
const modelVersion = process.env.MODEL_VERSION || 'llama3.2:3b';

const ollama = new Ollama({
  host: 'http://localhost:11434',
  model: modelVersion  // Peut être changé via variable d'env
});
```

**Changer le modèle en production :**
```bash
# .env
MODEL_VERSION=llama3-semantic-v20240206
```

### 🔄 Déploiement progressif (A/B Testing)

```javascript
class ModelRouter {
  constructor() {
    this.models = {
      stable: 'llama3.2:3b',
      beta: 'llama3-semantic-v20240206'
    };
    this.betaPercentage = 10;  // 10% en beta
  }
  
  getModel(userId) {
    // 10% des users → beta
    // 90% des users → stable
    const isBeta = (userId % 100) < this.betaPercentage;
    
    return isBeta ? this.models.beta : this.models.stable;
  }
}
```

---

## 8. EXERCICES {#8-exercices}

### ✏️ Exercice 1 : Système de feedback (Moyen)

**Consigne :**
Créez une route qui permet aux users de donner un feedback thumbs up/down.

<details>
<summary>💡 Voir la solution</summary>

```javascript
router.post('/feedback/:interactionId', async (req, res) => {
  const { interactionId } = req.params;
  const { thumbs } = req.body;  // 'up' ou 'down'
  
  const score = thumbs === 'up' ? 5 : 1;
  
  await autoLearning.saveFeedback(interactionId, score, '');
  
  res.json({ message: 'Merci pour votre feedback !' });
});
```
</details>

---

### ✏️ Exercice 2 : Statistiques d'apprentissage (Difficile)

**Consigne :**
Créez un dashboard qui affiche :
- Nombre d'interactions total
- Nombre d'interactions prêtes pour training
- Score moyen
- Graphique des scores

<details>
<summary>💡 Voir la solution</summary>

```javascript
router.get('/stats/learning', async (req, res) => {
  const stats = await pool.query(`
    SELECT 
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE score >= 4) as ready,
      AVG(score) as avg_score,
      COUNT(*) FILTER (WHERE score = 5) as score_5,
      COUNT(*) FILTER (WHERE score = 4) as score_4,
      COUNT(*) FILTER (WHERE score = 3) as score_3,
      COUNT(*) FILTER (WHERE score = 2) as score_2,
      COUNT(*) FILTER (WHERE score = 1) as score_1
    FROM training_interactions
    WHERE score IS NOT NULL
  `);
  
  res.json(stats.rows[0]);
});
```
</details>

---

## 9. QUIZ {#9-quiz}

### ❓ Question 1

Qu'est-ce que le fine-tuning ?

A) Réinstaller le modèle  
B) Affiner un modèle sur des données spécifiques  
C) Augmenter la taille du modèle  
D) Changer de modèle

<details>
<summary>✅ Réponse</summary>
**B** - Fine-tuning = entraîner un modèle existant sur vos données.
</details>

---

### ❓ Question 2

Combien de données minimum pour un bon fine-tuning ?

A) 10  
B) 100  
C) 1000+  
D) 10000+

<details>
<summary>✅ Réponse</summary>
**C** - Minimum 1000 exemples de qualité recommandé.
</details>

---

## 🎓 FÉLICITATIONS !

Vous avez terminé le Cours 7 ! 🎉

**Continuez vers :**
- ✅ **COURS 8** : Frontend

**Compétences acquises :**
- ✅ Comprendre le fine-tuning
- ✅ Auto-apprentissage
- ✅ Collecte de données
- ✅ Préparation de datasets
- ✅ Fine-tuning Ollama
- ✅ Évaluation de modèles

**Félicitations ! 🚀**
