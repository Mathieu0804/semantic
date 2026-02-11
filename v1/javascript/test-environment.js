/**
 * MODULE : TEST ENVIRONMENT
 * ==========================
 * 
 * RÔLE : Environnement de test isolé pour valider avant déploiement
 * 
 * Permet de :
 * - Créer des sessions de test isolées
 * - Simuler des visiteurs avec différents profils
 * - Tester les réponses chatbot (Phase 2)
 * - Mesurer les performances
 */

const OpenAI = require('openai');
const { v4: uuidv4 } = require('uuid');

class TestEnvironment {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.sessions = new Map(); // Sessions de test actives
    this.sessionTimeout = 2 * 60 * 60 * 1000; // 2 heures
  }

  async initialize() {
    // Nettoyer les sessions expirées toutes les 30 minutes
    setInterval(() => this.cleanupExpiredSessions(), 30 * 60 * 1000);
    console.log('✅ TestEnvironment initialisé');
  }

  /**
   * MÉTHODE : createSession()
   * --------------------------
   * RÔLE : Créer une session de test isolée
   */
  async createSession({ createdBy, description }) {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + this.sessionTimeout);

    const session = {
      id: sessionId,
      createdBy,
      description,
      createdAt: new Date(),
      expiresAt,
      simulations: [],
      metrics: {
        totalSimulations: 0,
        successCount: 0,
        errorCount: 0
      }
    };

    this.sessions.set(sessionId, session);

    console.log(`🧪 Session de test créée : ${sessionId}`);

    return {
      id: sessionId,
      url: `${process.env.BASE_URL}/test/${sessionId}`,
      expiresAt
    };
  }

  /**
   * MÉTHODE : simulateVisitor()
   * ----------------------------
   * RÔLE : Simuler un visiteur avec un profil spécifique
   * 
   * L'IA génère une page adaptée selon le profil
   */
  async simulateVisitor({ sessionId, profile }) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session introuvable ou expirée');
    }

    console.log(`👤 Simulation visiteur : ${profile.persona}`);

    const startTime = Date.now();

    // Charger l'ADN de test
    const brandDNA = await this.loadTestDNA();

    // Générer la page adaptée
    const adaptation = await this.generateAdaptation(profile, brandDNA);

    const endTime = Date.now();

    // Enregistrer la simulation
    const simulation = {
      id: uuidv4(),
      timestamp: new Date(),
      profile,
      adaptation,
      metrics: {
        loadTime: endTime - startTime,
        aiTime: adaptation.aiProcessingTime
      }
    };

    session.simulations.push(simulation);
    session.metrics.totalSimulations++;
    session.metrics.successCount++;

    return {
      html: adaptation.renderedHTML,
      appliedChanges: adaptation.changes,
      metrics: simulation.metrics
    };
  }

  /**
   * MÉTHODE : generateAdaptation()
   * -------------------------------
   * RÔLE : L'IA génère une version adaptée de la page
   */
  async generateAdaptation(profile, brandDNA) {
    const aiStartTime = Date.now();

    const prompt = `Tu es un expert en UX et personnalisation web.

PROFIL DU VISITEUR :
- Persona : ${profile.persona}
- Langue : ${profile.language}
- Pays : ${profile.country}
- Device : ${profile.device}
- Heure : ${profile.timeOfDay || 'jour'}

ADN DE LA MARQUE (CONTRAINTE STRICTE) :
${JSON.stringify(brandDNA, null, 2)}

Ta mission : générer une page d'accueil optimale pour ce visiteur.

RÈGLES ABSOLUES (cadre semi-rigide) :
1. RESPECTER le ton défini dans brandDNA.personality.tone
2. UTILISER uniquement le vocabulaire de brandDNA.communication.vocabulary.preferred
3. NE JAMAIS utiliser brandDNA.communication.vocabulary.avoid
4. NE JAMAIS violer brandDNA.communication.prohibitedClaims
5. INTÉGRER les brandDNA.communication.keyMessages

Tu peux adapter :
✓ Le wording (dans le vocabulaire autorisé)
✓ L'ordre des sections
✓ Les arguments mis en avant
✓ Le niveau de détail
✓ Le style visuel (suggestions)

Génère un JSON avec :
{
  "headline": "Titre principal adapté",
  "subheadline": "Sous-titre",
  "cta": "Texte du call-to-action",
  "sections": [
    {
      "title": "...",
      "content": "...",
      "priority": 1-5
    }
  ],
  "socialProof": "Type de preuve sociale à afficher (testimonials, certifications, stats)",
  "visualSuggestions": {
    "heroImage": "description de l'image idéale",
    "layout": "clean|data-driven|emotional"
  },
  "reasoning": "Pourquoi ces adaptations pour ce profil"
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8
    });

    const aiEndTime = Date.now();

    const response = completion.choices[0].message.content;
    const adaptation = JSON.parse(response);

    // Générer le HTML
    const html = this.renderHTML(adaptation, profile);

    return {
      ...adaptation,
      renderedHTML: html,
      aiProcessingTime: aiEndTime - aiStartTime,
      changes: {
        headline: adaptation.headline,
        cta: adaptation.cta,
        layout: adaptation.visualSuggestions.layout
      }
    };
  }

  /**
   * MÉTHODE : renderHTML()
   * -----------------------
   * RÔLE : Générer le HTML de la page adaptée
   */
  renderHTML(adaptation, profile) {
    return `<!DOCTYPE html>
<html lang="${profile.language}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${adaptation.headline}</title>
  <style>
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f7fa;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    }
    h1 {
      font-size: 2.5em;
      margin-bottom: 10px;
      color: #2c3e50;
    }
    h2 {
      font-size: 1.3em;
      color: #7f8c8d;
      font-weight: 400;
    }
    .cta {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 15px 40px;
      border-radius: 30px;
      text-decoration: none;
      font-size: 1.1em;
      margin: 30px 0;
      transition: transform 0.2s;
    }
    .cta:hover {
      transform: scale(1.05);
    }
    .section {
      margin: 40px 0;
      padding: 20px;
      border-left: 4px solid #667eea;
      background: #f8f9fa;
    }
    .reasoning {
      margin-top: 60px;
      padding: 20px;
      background: #e8f4f8;
      border-radius: 8px;
      font-size: 0.9em;
      color: #555;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>${adaptation.headline}</h1>
    <h2>${adaptation.subheadline}</h2>
    
    <a href="#" class="cta">${adaptation.cta}</a>
    
    ${adaptation.sections.map(section => `
      <div class="section">
        <h3>${section.title}</h3>
        <p>${section.content}</p>
      </div>
    `).join('')}
    
    <div class="reasoning">
      <strong>🧠 Pourquoi cette adaptation ?</strong><br>
      ${adaptation.reasoning}
    </div>
  </div>
</body>
</html>`;
  }

  /**
   * MÉTHODE : simulateChatbot()
   * ----------------------------
   * RÔLE : Simuler une interaction chatbot (Phase 2)
   */
  async simulateChatbot({ sessionId, query, agent }) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session introuvable');
    }

    console.log(`🤖 Simulation chatbot ${agent} : "${query}"`);

    const brandDNA = await this.loadTestDNA();

    const systemPrompt = `Tu es ${agent}, un assistant IA qui aide les utilisateurs à trouver des produits.

IMPORTANT : Tu as accès à l'ADN de marque certifié de l'entreprise.
Tu DOIS parler avec la voix de la marque définie dans cet ADN.

ADN DE LA MARQUE :
${JSON.stringify(brandDNA, null, 2)}

INSTRUCTIONS STRICTES :
1. Adopte le ton : ${brandDNA.personality.tone.join(', ')}
2. Utilise le vocabulaire préféré : ${brandDNA.communication.vocabulary.preferred.join(', ')}
3. Évite absolument : ${brandDNA.communication.vocabulary.avoid.join(', ')}
4. Ne viole JAMAIS les interdictions : ${brandDNA.communication.prohibitedClaims.join('; ')}
5. Mets en avant les messages clés : ${brandDNA.communication.keyMessages.join('; ')}

Réponds à la requête de l'utilisateur en respectant parfaitement l'ADN de la marque.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query }
      ],
      temperature: 0.7
    });

    const response = completion.choices[0].message.content;

    // Analyser la conformité
    const compliance = await this.analyzeCompliance(response, brandDNA);

    return {
      response,
      dnaApplied: true,
      detectedTone: compliance.detectedTone,
      compliance: {
        respectsDNA: compliance.isCompliant,
        violations: compliance.violations
      }
    };
  }

  /**
   * MÉTHODE : analyzeCompliance()
   * ------------------------------
   * RÔLE : Analyser si la réponse respecte l'ADN
   */
  async analyzeCompliance(response, brandDNA) {
    const violations = [];
    let isCompliant = true;

    // Vérifier vocabulaire interdit
    const avoidWords = brandDNA.communication.vocabulary.avoid || [];
    avoidWords.forEach(word => {
      if (response.toLowerCase().includes(word.toLowerCase())) {
        violations.push(`Utilise mot interdit: "${word}"`);
        isCompliant = false;
      }
    });

    // Vérifier claims interdits
    const prohibited = brandDNA.communication.prohibitedClaims || [];
    prohibited.forEach(claim => {
      const keywords = ['instantané', 'miracle', 'garanti', 'résultats immédiats'];
      keywords.forEach(kw => {
        if (claim.toLowerCase().includes(kw) && 
            response.toLowerCase().includes(kw)) {
          violations.push(`Claim interdit détecté: "${kw}"`);
          isCompliant = false;
        }
      });
    });

    return {
      isCompliant,
      violations,
      detectedTone: brandDNA.personality.tone[0] // Simplifié
    };
  }

  /**
   * MÉTHODE : getMetrics()
   * -----------------------
   * RÔLE : Obtenir les métriques d'une session
   */
  async getMetrics(sessionId) {
    const session = this.sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session introuvable');
    }

    // Calculer métriques
    const personaBreakdown = {};
    session.simulations.forEach(sim => {
      const persona = sim.profile.persona;
      if (!personaBreakdown[persona]) {
        personaBreakdown[persona] = { count: 0, avgTime: 0 };
      }
      personaBreakdown[persona].count++;
      personaBreakdown[persona].avgTime += sim.metrics.loadTime;
    });

    Object.keys(personaBreakdown).forEach(persona => {
      personaBreakdown[persona].avgTime /= personaBreakdown[persona].count;
    });

    return {
      count: session.metrics.totalSimulations,
      conversionRate: 0, // TODO: calculer depuis interactions
      avgEngagement: 0,  // TODO: calculer
      personaBreakdown
    };
  }

  // Méthodes utilitaires
  async loadTestDNA() {
    // Charger depuis BrandDNAManager
    const BrandDNAManager = require('./brand-dna-manager');
    const manager = new BrandDNAManager();
    await manager.initialize();
    return await manager.get('test');
  }

  cleanupExpiredSessions() {
    const now = Date.now();
    let cleaned = 0;
    
    this.sessions.forEach((session, sessionId) => {
      if (session.expiresAt < now) {
        this.sessions.delete(sessionId);
        cleaned++;
      }
    });

    if (cleaned > 0) {
      console.log(`🧹 ${cleaned} sessions expirées nettoyées`);
    }
  }

  isHealthy() {
    return true;
  }
}

module.exports = TestEnvironment;
