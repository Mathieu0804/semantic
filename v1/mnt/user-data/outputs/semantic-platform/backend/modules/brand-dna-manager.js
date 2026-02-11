/**
 * MODULE : BRAND DNA MANAGER (Enhanced)
 * ======================================
 * 
 * RÔLE : Gérer l'ADN de marque avec génération depuis prompt libre
 * 
 * Le marketeur écrit simplement un texte décrivant sa marque,
 * et l'IA génère automatiquement l'ADN structuré
 */

const fs = require('fs').promises;
const path = require('path');
const OpenAI = require('openai');

class BrandDNAManager {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.dataDir = path.join(__dirname, '../data/brand-dna');
    this.currentDNA = null;
    this.testDNA = null;
  }

  async initialize() {
    await fs.mkdir(this.dataDir, { recursive: true });
    
    // Charger l'ADN de production s'il existe
    try {
      const productionPath = path.join(this.dataDir, 'production.json');
      const content = await fs.readFile(productionPath, 'utf-8');
      this.currentDNA = JSON.parse(content);
      console.log('✅ ADN de production chargé');
    } catch (error) {
      console.log('ℹ️  Aucun ADN de production existant');
      this.currentDNA = this.getDefaultDNA();
    }

    console.log('✅ BrandDNAManager initialisé');
  }

  /**
   * MÉTHODE : generateFromPrompt()
   * -------------------------------
   * RÔLE : Générer l'ADN structuré depuis un prompt libre
   * 
   * Le marketeur écrit en langage naturel, l'IA structure
   */
  async generateFromPrompt(prompt) {
    console.log('🧬 Génération ADN depuis prompt...');

    const systemPrompt = `Tu es un expert en branding et architecture de marque.

Ta mission : extraire et structurer l'identité de marque depuis un texte libre.

Le marketeur va te décrire sa marque en langage naturel.
Tu dois générer un JSON structuré avec :

1. IDENTITÉ
   - name: nom de la marque
   - description: description courte
   - industry: secteur d'activité
   - targetAudience: cible principale

2. PERSONNALITÉ (Tone & Voice)
   - tone: array de 3-5 adjectifs décrivant le ton
   - voiceAttributes: caractéristiques de la voix de marque
   - writingStyle: style d'écriture

3. VALEURS
   - coreValues: 3-5 valeurs fondamentales
   - mission: mission de l'entreprise
   - vision: vision long terme

4. COMMUNICATION
   - vocabulary.preferred: mots à privilégier
   - vocabulary.avoid: mots à éviter
   - keyMessages: 3-5 messages clés
   - prohibitedClaims: ce qu'on ne doit jamais promettre

5. VISUELS (optionnel)
   - colorPalette: couleurs de la marque
   - imagery: style d'images préféré

Réponds UNIQUEMENT avec un JSON valide (pas de markdown, pas de backticks).

Structure exacte :
{
  "identity": {
    "name": "...",
    "description": "...",
    "industry": "...",
    "targetAudience": "..."
  },
  "personality": {
    "tone": ["...", "...", "..."],
    "voiceAttributes": ["...", "..."],
    "writingStyle": "..."
  },
  "values": {
    "coreValues": ["...", "...", "..."],
    "mission": "...",
    "vision": "..."
  },
  "communication": {
    "vocabulary": {
      "preferred": ["...", "..."],
      "avoid": ["...", "..."]
    },
    "keyMessages": ["...", "...", "..."],
    "prohibitedClaims": ["...", "..."],
    "examplePhrases": ["...", "..."]
  },
  "visual": {
    "colorPalette": ["...", "..."],
    "imagery": "..."
  }
}`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      });

      const response = completion.choices[0].message.content;
      const dna = JSON.parse(response);

      // Ajouter métadonnées
      dna.metadata = {
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        sourcePrompt: prompt,
        generatedBy: 'ai'
      };

      return dna;

    } catch (error) {
      console.error('Erreur génération ADN:', error);
      throw new Error(`Impossible de générer l'ADN: ${error.message}`);
    }
  }

  /**
   * MÉTHODE : validate()
   * ---------------------
   * RÔLE : Valider un ADN généré
   */
  async validate(dna) {
    const errors = [];
    const warnings = [];
    const suggestions = [];
    let score = 100;

    // Vérifications structurelles
    if (!dna.identity?.name) {
      errors.push('Nom de la marque manquant');
      score -= 30;
    }

    if (!dna.personality?.tone || dna.personality.tone.length < 2) {
      warnings.push('Ton insuffisamment défini (minimum 2 attributs recommandés)');
      score -= 10;
    }

    if (!dna.values?.coreValues || dna.values.coreValues.length < 3) {
      warnings.push('Valeurs insuffisamment définies (minimum 3 recommandées)');
      score -= 10;
    }

    if (!dna.communication?.keyMessages || dna.communication.keyMessages.length === 0) {
      warnings.push('Aucun message clé défini');
      score -= 15;
    }

    // Vérifications sémantiques
    if (dna.communication?.vocabulary) {
      const preferred = dna.communication.vocabulary.preferred || [];
      const avoid = dna.communication.vocabulary.avoid || [];
      
      // Détecter mots dans les deux listes
      const overlap = preferred.filter(word => 
        avoid.some(avoidWord => 
          word.toLowerCase() === avoidWord.toLowerCase()
        )
      );
      
      if (overlap.length > 0) {
        errors.push(`Mots présents dans "preferred" ET "avoid": ${overlap.join(', ')}`);
        score -= 20;
      }
    }

    // Suggestions d'amélioration
    if (!dna.communication?.examplePhrases || dna.communication.examplePhrases.length < 3) {
      suggestions.push('Ajoutez 3+ exemples de phrases pour illustrer le style');
    }

    if (!dna.visual?.colorPalette) {
      suggestions.push('Définissez une palette de couleurs pour cohérence visuelle');
    }

    return {
      isValid: errors.length === 0,
      score: Math.max(0, score),
      errors,
      warnings,
      suggestions
    };
  }

  /**
   * MÉTHODE : save()
   * -----------------
   * RÔLE : Sauvegarder l'ADN
   */
  async save(dna, environment = 'test') {
    const filename = `${environment}.json`;
    const filepath = path.join(this.dataDir, filename);

    // Ajouter version si absente
    if (!dna.metadata) {
      dna.metadata = {
        version: '1.0.0',
        updatedAt: new Date().toISOString()
      };
    } else {
      dna.metadata.updatedAt = new Date().toISOString();
    }

    await fs.writeFile(filepath, JSON.stringify(dna, null, 2));

    if (environment === 'production') {
      this.currentDNA = dna;
    } else {
      this.testDNA = dna;
    }

    console.log(`✅ ADN sauvegardé en ${environment}`);

    return {
      version: dna.metadata.version,
      environment
    };
  }

  /**
   * MÉTHODE : get()
   * ----------------
   * RÔLE : Récupérer l'ADN actuel
   */
  async get(environment = 'production') {
    if (environment === 'production') {
      return this.currentDNA;
    } else {
      return this.testDNA || this.currentDNA;
    }
  }

  /**
   * MÉTHODE : getAnalytics()
   * -------------------------
   * RÔLE : Obtenir les analytics (stub pour l'instant)
   */
  async getAnalytics(period = 'week') {
    // TODO: Implémenter avec vraie DB
    return {
      visitors: {
        total: 12543,
        breakdown: {
          scientific: 3421,
          emotional: 5876,
          practical: 3246
        }
      },
      conversions: {
        rate: 18.7,
        vsBaseline: +32 // % d'amélioration vs baseline
      },
      products: {
        top10: [
          { id: 'serum-aurore', recommendations: 342, conversions: 89 },
          { id: 'creme-nuit', recommendations: 198, conversions: 54 }
        ]
      },
      chatbot: {
        queries: 456,
        conversions: 87
      }
    };
  }

  /**
   * MÉTHODE : getDefaultDNA()
   * --------------------------
   * RÔLE : ADN par défaut si aucun n'existe
   */
  getDefaultDNA() {
    return {
      identity: {
        name: 'Ma Marque',
        description: 'Décrivez votre marque ici',
        industry: 'Non défini',
        targetAudience: 'À définir'
      },
      personality: {
        tone: ['Professionnel', 'Accessible'],
        voiceAttributes: ['Claire', 'Directe'],
        writingStyle: 'Conversationnel'
      },
      values: {
        coreValues: ['Qualité', 'Innovation', 'Service client'],
        mission: 'À définir',
        vision: 'À définir'
      },
      communication: {
        vocabulary: {
          preferred: [],
          avoid: []
        },
        keyMessages: [],
        prohibitedClaims: [],
        examplePhrases: []
      },
      metadata: {
        version: '1.0.0',
        createdAt: new Date().toISOString()
      }
    };
  }

  isHealthy() {
    return this.currentDNA !== null;
  }
}

module.exports = BrandDNAManager;
