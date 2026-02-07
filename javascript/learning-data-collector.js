/**
 * MODULE : LEARNING DATA COLLECTOR
 * ==================================
 * 
 * RÔLE : Collecter les données pour améliorer l'IA locale
 * 
 * Collecte :
 * 1. Chaque génération de contenu par l'IA
 * 2. La réaction du visiteur (clics, temps, conversion)
 * 3. Les patterns qui fonctionnent le mieux
 * 
 * Utilisation :
 * - Auto-apprentissage continu
 * - Fine-tuning de l'IA locale
 * - Amélioration des prompts
 */

const fs = require('fs').promises;
const path = require('path');

class LearningDataCollector {
  constructor() {
    this.dataDir = path.join(__dirname, '../data/learning');
    this.interactionsFile = path.join(this.dataDir, 'interactions.jsonl');
    this.feedbackFile = path.join(this.dataDir, 'feedback.jsonl');
  }

  async initialize() {
    await fs.mkdir(this.dataDir, { recursive: true });
    console.log('✅ LearningDataCollector initialisé');
  }

  /**
   * MÉTHODE : recordInteraction()
   * ------------------------------
   * RÔLE : Enregistrer chaque interaction IA ↔ Visiteur
   * 
   * FORMAT JSONL (JSON Lines) :
   * Une ligne = une interaction
   * Compatible avec fine-tuning Llama/Mistral
   */
  async recordInteraction({
    visitorProfile,
    aiPrompt,
    aiResponse,
    timestamp = new Date()
  }) {
    const interaction = {
      timestamp: timestamp.toISOString(),
      
      // Profil du visiteur
      visitor: {
        persona: visitorProfile.persona,
        language: visitorProfile.language,
        country: visitorProfile.country,
        device: visitorProfile.device,
        previousVisits: visitorProfile.previousVisits || 0
      },
      
      // Ce que l'IA a généré
      ai: {
        prompt: aiPrompt,
        response: aiResponse,
        model: 'llama3.1:8b'
      },
      
      // Métadonnées
      metadata: {
        sessionId: this.generateSessionId(),
        interactionId: this.generateId()
      }
    };

    // Écrire en JSONL (une ligne par interaction)
    await this.appendToFile(this.interactionsFile, interaction);

    return interaction.metadata.interactionId;
  }

  /**
   * MÉTHODE : recordFeedback()
   * ---------------------------
   * RÔLE : Enregistrer le retour du visiteur
   * 
   * C'est LA donnée critique pour l'apprentissage :
   * - A-t-il cliqué sur le CTA ?
   * - A-t-il ajouté au panier ?
   * - A-t-il acheté ?
   * - Combien de temps est-il resté ?
   */
  async recordFeedback({
    interactionId,
    clicked = false,
    addedToCart = false,
    purchased = false,
    timeOnPage = 0,
    scrollDepth = 0
  }) {
    const feedback = {
      interactionId,
      timestamp: new Date().toISOString(),
      
      // Signaux de succès (du plus faible au plus fort)
      signals: {
        timeOnPage,        // Secondes
        scrollDepth,       // Pourcentage (0-100)
        clicked,           // Booléen
        addedToCart,       // Booléen
        purchased          // Booléen (JACKPOT)
      },
      
      // Score de succès calculé (0-100)
      successScore: this.calculateSuccessScore({
        clicked,
        addedToCart,
        purchased,
        timeOnPage,
        scrollDepth
      })
    };

    await this.appendToFile(this.feedbackFile, feedback);

    // Si conversion, marquer pour fine-tuning prioritaire
    if (purchased) {
      await this.markForFineTuning(interactionId, 'high_priority');
    }
  }

  /**
   * MÉTHODE : calculateSuccessScore()
   * ----------------------------------
   * RÔLE : Calculer un score de succès (0-100)
   * 
   * Pondération :
   * - Achat = 100 points (objectif ultime)
   * - Ajout panier = 60 points
   * - Clic CTA = 30 points
   * - Temps > 30s = +10 points
   * - Scroll > 50% = +10 points
   */
  calculateSuccessScore({ clicked, addedToCart, purchased, timeOnPage, scrollDepth }) {
    let score = 0;

    if (purchased) score = 100;
    else if (addedToCart) score = 60;
    else if (clicked) score = 30;

    // Bonus pour engagement
    if (timeOnPage > 30) score += 10;
    if (scrollDepth > 50) score += 10;

    return Math.min(score, 100);
  }

  /**
   * MÉTHODE : getTopPerformingExamples()
   * -------------------------------------
   * RÔLE : Récupérer les exemples qui convertissent le mieux
   * 
   * UTILISATION : Pour créer le dataset de fine-tuning
   */
  async getTopPerformingExamples(limit = 1000) {
    // Charger toutes les interactions
    const interactions = await this.loadInteractions();
    
    // Charger tous les feedbacks
    const feedbacks = await this.loadFeedbacks();

    // Joindre interactions + feedbacks
    const joined = interactions.map(interaction => {
      const feedback = feedbacks.find(
        f => f.interactionId === interaction.metadata.interactionId
      );
      
      return {
        ...interaction,
        feedback: feedback || null,
        successScore: feedback ? feedback.successScore : 0
      };
    });

    // Trier par score de succès (desc)
    const sorted = joined.sort((a, b) => b.successScore - a.successScore);

    // Retourner les top N
    return sorted.slice(0, limit);
  }

  /**
   * MÉTHODE : generateFineTuningDataset()
   * --------------------------------------
   * RÔLE : Créer un dataset au format Llama pour fine-tuning
   * 
   * FORMAT ATTENDU :
   * {
   *   "instruction": "Prompt système",
   *   "input": "Requête utilisateur",
   *   "output": "Réponse attendue"
   * }
   */
  async generateFineTuningDataset() {
    const topExamples = await this.getTopPerformingExamples(1000);

    // Filtrer : garder seulement ceux avec score > 50
    const goodExamples = topExamples.filter(ex => ex.successScore >= 50);

    // Convertir au format Llama
    const dataset = goodExamples.map(example => ({
      instruction: "Tu es un expert en marketing pour " + 
                   (example.ai.prompt.match(/marque\s+(\w+)/)?.[1] || "cette marque"),
      input: example.ai.prompt,
      output: example.ai.response
    }));

    // Sauvegarder au format JSONL
    const outputPath = path.join(this.dataDir, 'finetune_dataset.jsonl');
    
    for (const item of dataset) {
      await this.appendToFile(outputPath, item);
    }

    console.log(`✅ Dataset de fine-tuning créé : ${dataset.length} exemples`);
    console.log(`📁 Fichier : ${outputPath}`);

    return {
      totalExamples: dataset.length,
      path: outputPath,
      averageScore: goodExamples.reduce((sum, ex) => sum + ex.successScore, 0) / goodExamples.length
    };
  }

  /**
   * MÉTHODE : analyzePatterns()
   * ----------------------------
   * RÔLE : Analyser les patterns qui fonctionnent
   * 
   * Découvre automatiquement :
   * - Quels mots convertissent mieux
   * - Quel ton marche par persona
   * - Quelle structure de phrase est efficace
   */
  async analyzePatterns() {
    const topExamples = await this.getTopPerformingExamples(500);

    // Analyser par persona
    const byPersona = {};
    topExamples.forEach(ex => {
      const persona = ex.visitor.persona;
      if (!byPersona[persona]) {
        byPersona[persona] = { examples: [], avgScore: 0 };
      }
      byPersona[persona].examples.push(ex);
    });

    // Calculer scores moyens par persona
    Object.keys(byPersona).forEach(persona => {
      const examples = byPersona[persona].examples;
      const avgScore = examples.reduce((sum, ex) => sum + ex.successScore, 0) / examples.length;
      byPersona[persona].avgScore = avgScore;
    });

    // Analyser les mots qui reviennent dans les succès
    const wordFrequency = {};
    topExamples.forEach(ex => {
      const words = ex.ai.response.toLowerCase().split(/\s+/);
      words.forEach(word => {
        if (word.length > 4) { // Ignorer mots courts
          wordFrequency[word] = (wordFrequency[word] || 0) + 1;
        }
      });
    });

    // Top 20 mots qui convertissent
    const topWords = Object.entries(wordFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return {
      byPersona,
      topWords,
      totalExamples: topExamples.length
    };
  }

  // Méthodes utilitaires
  async appendToFile(filepath, data) {
    const line = JSON.stringify(data) + '\n';
    await fs.appendFile(filepath, line, 'utf-8');
  }

  async loadInteractions() {
    try {
      const content = await fs.readFile(this.interactionsFile, 'utf-8');
      return content.split('\n').filter(Boolean).map(JSON.parse);
    } catch {
      return [];
    }
  }

  async loadFeedbacks() {
    try {
      const content = await fs.readFile(this.feedbackFile, 'utf-8');
      return content.split('\n').filter(Boolean).map(JSON.parse);
    } catch {
      return [];
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  generateId() {
    return `int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async markForFineTuning(interactionId, priority) {
    const markFile = path.join(this.dataDir, `priority_${priority}.txt`);
    await fs.appendFile(markFile, interactionId + '\n', 'utf-8');
  }
}

module.exports = LearningDataCollector;
