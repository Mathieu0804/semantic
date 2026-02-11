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

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

// Import des modules métier
const DataImporter = require('./modules/data-importer');
const BrandDNAManager = require('./modules/brand-dna-manager');
const TestEnvironment = require('./modules/test-environment');
const DeploymentManager = require('./modules/deployment-manager');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configuration Multer pour upload de fichiers
const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max
  fileFilter: (req, file, cb) => {
    // Accepter tous types de fichiers pour flexibilité
    cb(null, true);
  }
});

// Initialisation des services
const dataImporter = new DataImporter();
const brandDNA = new BrandDNAManager();
const testEnv = new TestEnvironment();
const deployer = new DeploymentManager();

// ============================================================================
// ROUTES - IMPORT DE DONNÉES PRODUITS
// ============================================================================

/**
 * POST /api/import/analyze
 * -------------------------
 * RÔLE : Analyser un fichier de données (n'importe quel format)
 *        L'IA détecte automatiquement le format et la structure
 * 
 * BODY : FormData avec fichier
 * 
 * UTILISATION : Le marketeur upload son catalogue existant
 *               (CSV, Excel, JSON, XML, base SQL export, etc.)
 */
app.post('/api/import/analyze', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    console.log(`📊 Analyse du fichier : ${req.file.originalname}`);

    // L'IA analyse le fichier et détecte sa structure
    const analysis = await dataImporter.analyzeFile({
      path: req.file.path,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    res.json({
      success: true,
      analysis: {
        format: analysis.detectedFormat,
        confidence: analysis.confidence,
        structure: analysis.schema,
        sampleData: analysis.preview,
        estimatedProducts: analysis.rowCount,
        recommendations: analysis.suggestions
      }
    });

  } catch (error) {
    console.error('Erreur analyse fichier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/import/transform
 * ---------------------------
 * RÔLE : Transformer les données brutes en format SemanticDNA
 *        L'IA mappe automatiquement les champs
 * 
 * BODY : {
 *   fileId: string,
 *   mappingHints: object (optionnel),
 *   aiInstructions: string (prompt libre du marketeur)
 * }
 * 
 * EXEMPLE d'aiInstructions :
 * "Nos produits sont des cosmétiques bio haut de gamme.
 *  Pour chaque produit, génère un pitch vendeur qui met en avant
 *  la naturalité des ingrédients et les certifications.
 *  Ton élégant mais accessible. Ne jamais promettre de résultats
 *  instantanés."
 */
app.post('/api/import/transform', async (req, res) => {
  try {
    const { fileId, mappingHints, aiInstructions } = req.body;

    if (!fileId) {
      return res.status(400).json({
        success: false,
        error: 'fileId requis'
      });
    }

    console.log(`🔄 Transformation des données avec instructions IA...`);

    // L'IA transforme les données brutes
    const transformation = await dataImporter.transformData({
      fileId: fileId,
      hints: mappingHints,
      instructions: aiInstructions || 'Mode automatique'
    });

    res.json({
      success: true,
      preview: transformation.preview,
      stats: {
        totalProducts: transformation.productCount,
        successfulTransforms: transformation.successCount,
        warnings: transformation.warnings,
        errors: transformation.errors
      },
      transformationId: transformation.id
    });

  } catch (error) {
    console.error('Erreur transformation:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/import/validate
 * --------------------------
 * RÔLE : Valider les données transformées
 */
app.post('/api/import/validate', async (req, res) => {
  try {
    const { transformationId } = req.body;

    const validation = await dataImporter.validate(transformationId);

    res.json({
      success: true,
      isValid: validation.isValid,
      errors: validation.errors,
      warnings: validation.warnings,
      quality: {
        completeness: validation.completeness, // % champs remplis
        consistency: validation.consistency,   // Cohérence interne
        richness: validation.richness          // Richesse des descriptions
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/import/commit
 * ------------------------
 * RÔLE : Importer définitivement les données en base
 */
app.post('/api/import/commit', async (req, res) => {
  try {
    const { transformationId, targetEnvironment } = req.body;

    // targetEnvironment: 'test' ou 'production'
    const result = await dataImporter.commit({
      transformationId,
      environment: targetEnvironment || 'test'
    });

    res.json({
      success: true,
      imported: result.importedCount,
      environment: targetEnvironment,
      message: `${result.importedCount} produits importés en ${targetEnvironment}`
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ROUTES - GESTION ADN DE MARQUE (Prompt libre)
// ============================================================================

/**
 * GET /api/brand-dna
 * ------------------
 * RÔLE : Récupérer l'ADN actuel
 */
app.get('/api/brand-dna', async (req, res) => {
  try {
    const dna = await brandDNA.get();
    res.json({ success: true, dna });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/brand-dna/update
 * ---------------------------
 * RÔLE : Mettre à jour l'ADN via prompt libre
 * 
 * BODY : {
 *   prompt: string (texte libre du marketeur)
 * }
 * 
 * EXEMPLE de prompt :
 * "Notre marque s'appelle LuxeÉthique. Nous vendons des cosmétiques
 *  biologiques haut de gamme. Notre ton est élégant mais accessible,
 *  scientifique sans être pompeux. Nos valeurs principales sont :
 *  la durabilité, la transparence radicale, l'innovation botanique.
 *  
 *  Nous ne promettons JAMAIS de résultats instantanés ou miraculeux.
 *  Nous évitons les mots 'chimique', 'artificiel', 'bon marché'.
 *  Nous préférons 'naturel', 'scientifique', 'durable', 'certifié'.
 *  
 *  Nos produits sont certifiés Cosmos Organic, B Corp, et Leaping Bunny.
 *  
 *  Quand l'IA parle de nos produits, elle doit mettre en avant :
 *  - L'origine des ingrédients (traçabilité)
 *  - Les études cliniques (crédibilité scientifique)
 *  - L'impact environnemental positif
 *  - Le commerce équitable avec nos partenaires"
 */
app.post('/api/brand-dna/update',
  [body('prompt').notEmpty().withMessage('Prompt requis')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { prompt } = req.body;

      console.log(`🧬 Génération ADN à partir du prompt...`);
      console.log(`Prompt : ${prompt.substring(0, 100)}...`);

      // L'IA extrait l'ADN structuré du prompt libre
      const generatedDNA = await brandDNA.generateFromPrompt(prompt);

      res.json({
        success: true,
        dna: generatedDNA,
        message: 'ADN généré avec succès',
        preview: {
          name: generatedDNA.identity.name,
          tone: generatedDNA.identity.tone,
          values: generatedDNA.identity.values,
          prohibitedClaims: generatedDNA.identity.prohibitedClaims
        }
      });

    } catch (error) {
      console.error('Erreur génération ADN:', error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * POST /api/brand-dna/validate
 * -----------------------------
 * RÔLE : Valider l'ADN généré avant sauvegarde
 */
app.post('/api/brand-dna/validate', async (req, res) => {
  try {
    const { dna } = req.body;

    const validation = await brandDNA.validate(dna);

    res.json({
      success: true,
      isValid: validation.isValid,
      score: validation.score,
      errors: validation.errors,
      warnings: validation.warnings,
      suggestions: validation.suggestions
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/brand-dna/save
 * -------------------------
 * RÔLE : Sauvegarder l'ADN (après validation)
 */
app.post('/api/brand-dna/save', async (req, res) => {
  try {
    const { dna, environment } = req.body;

    // environment: 'test' ou 'production'
    const saved = await brandDNA.save(dna, environment || 'test');

    res.json({
      success: true,
      version: saved.version,
      environment: environment,
      message: `ADN sauvegardé en ${environment}`
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ROUTES - ENVIRONNEMENT DE TEST
// ============================================================================

/**
 * POST /api/test/create-session
 * ------------------------------
 * RÔLE : Créer une session de test isolée
 * 
 * Permet de tester les modifications sans affecter la production
 */
app.post('/api/test/create-session', async (req, res) => {
  try {
    const session = await testEnv.createSession({
      createdBy: req.body.userId || 'anonymous',
      description: req.body.description
    });

    res.json({
      success: true,
      sessionId: session.id,
      testUrl: session.url,
      expiresAt: session.expiresAt
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/test/simulate-visitor
 * --------------------------------
 * RÔLE : Simuler un visiteur avec un profil spécifique
 * 
 * BODY : {
 *   sessionId: string,
 *   visitorProfile: {
 *     persona: 'scientific' | 'emotional' | 'practical',
 *     language: 'fr' | 'en' | ...,
 *     country: 'FR' | 'US' | ...,
 *     device: 'mobile' | 'desktop'
 *   }
 * }
 */
app.post('/api/test/simulate-visitor', async (req, res) => {
  try {
    const { sessionId, visitorProfile } = req.body;

    const simulation = await testEnv.simulateVisitor({
      sessionId,
      profile: visitorProfile
    });

    res.json({
      success: true,
      renderedPage: simulation.html,
      adaptations: simulation.appliedChanges,
      performance: {
        loadTime: simulation.metrics.loadTime,
        aiResponseTime: simulation.metrics.aiTime
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/test/simulate-chatbot
 * --------------------------------
 * RÔLE : Simuler une requête chatbot (Phase 2)
 * 
 * BODY : {
 *   sessionId: string,
 *   query: string,
 *   agentType: 'chatgpt' | 'claude' | 'gemini'
 * }
 */
app.post('/api/test/simulate-chatbot', async (req, res) => {
  try {
    const { sessionId, query, agentType } = req.body;

    const simulation = await testEnv.simulateChatbot({
      sessionId,
      query,
      agent: agentType
    });

    res.json({
      success: true,
      agentResponse: simulation.response,
      usedBrandDNA: simulation.dnaApplied,
      tone: simulation.detectedTone,
      compliance: {
        respectsDNA: simulation.compliance.respectsDNA,
        violations: simulation.compliance.violations
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/test/sessions/:sessionId/metrics
 * ------------------------------------------
 * RÔLE : Obtenir les métriques d'une session de test
 */
app.get('/api/test/sessions/:sessionId/metrics', async (req, res) => {
  try {
    const metrics = await testEnv.getMetrics(req.params.sessionId);

    res.json({
      success: true,
      metrics: {
        totalSimulations: metrics.count,
        conversionRate: metrics.conversionRate,
        averageEngagement: metrics.avgEngagement,
        byPersona: metrics.personaBreakdown
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ROUTES - DÉPLOIEMENT
// ============================================================================

/**
 * POST /api/deploy/prepare
 * -------------------------
 * RÔLE : Préparer un déploiement (vérifications pre-flight)
 */
app.post('/api/deploy/prepare', async (req, res) => {
  try {
    const { sourceSessionId } = req.body;

    const preparation = await deployer.prepare(sourceSessionId);

    res.json({
      success: true,
      ready: preparation.isReady,
      checks: preparation.preflightChecks,
      warnings: preparation.warnings,
      estimatedDowntime: preparation.downtimeEstimate
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/deploy/execute
 * -------------------------
 * RÔLE : Déployer en production
 */
app.post('/api/deploy/execute', async (req, res) => {
  try {
    const { sourceSessionId, rollbackOnError } = req.body;

    console.log(`🚀 Déploiement en production...`);

    const deployment = await deployer.execute({
      sessionId: sourceSessionId,
      autoRollback: rollbackOnError !== false
    });

    res.json({
      success: true,
      deploymentId: deployment.id,
      status: deployment.status,
      timestamp: deployment.timestamp,
      changes: deployment.changesSummary
    });

  } catch (error) {
    console.error('Erreur déploiement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/deploy/rollback
 * --------------------------
 * RÔLE : Revenir à la version précédente
 */
app.post('/api/deploy/rollback', async (req, res) => {
  try {
    const { deploymentId } = req.body;

    const rollback = await deployer.rollback(deploymentId);

    res.json({
      success: true,
      message: 'Rollback effectué',
      restoredVersion: rollback.version
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ROUTES - ANALYTICS
// ============================================================================

/**
 * GET /api/analytics/dashboard
 * -----------------------------
 * RÔLE : Dashboard marketeur avec métriques clés
 */
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const { period } = req.query; // 'today', 'week', 'month'

    const analytics = await brandDNA.getAnalytics(period || 'week');

    res.json({
      success: true,
      data: {
        visitors: {
          total: analytics.visitors.total,
          byPersona: analytics.visitors.breakdown
        },
        conversions: {
          rate: analytics.conversions.rate,
          improvement: analytics.conversions.vsBaseline
        },
        topProducts: analytics.products.top10,
        aiPerformance: {
          chatbotQueries: analytics.chatbot.queries,
          chatbotConversions: analytics.chatbot.conversions
        }
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// HEALTH CHECK
// ============================================================================

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    services: {
      dataImporter: dataImporter.isHealthy(),
      brandDNA: brandDNA.isHealthy(),
      testEnv: testEnv.isHealthy()
    }
  });
});

// ============================================================================
// DÉMARRAGE
// ============================================================================

app.listen(PORT, async () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║  🧬 SEMANTIC PLATFORM - Backend Principal                 ║
║  ══════════════════════════════════════════════════════    ║
║  Port : ${PORT}                                            ║
║  Status : ✅ Opérationnel                                  ║
║                                                            ║
║  Fonctionnalités :                                         ║
║  ✓ Import données (IA multi-format)                       ║
║  ✓ Gestion ADN (prompt libre)                             ║
║  ✓ Environnement de test                                  ║
║  ✓ Déploiement sécurisé                                   ║
╚════════════════════════════════════════════════════════════╝
  `);

  // Initialiser les services
  await dataImporter.initialize();
  await brandDNA.initialize();
  await testEnv.initialize();
  
  console.log('✅ Tous les services initialisés');
});

module.exports = app;
