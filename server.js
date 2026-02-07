/**
 * SERVEUR BACKEND - MARKETING SÉMANTIQUE
 * =======================================
 * 
 * Ce serveur gère l'architecture du marketing sémantique pour permettre
 * aux IA de comprendre et représenter fidèlement les marques.
 * 
 * RÔLE : Point d'entrée principal du système backend
 * 
 * FONCTIONS PRINCIPALES :
 * 1. Servir les données d'ADN de marque aux IA
 * 2. Gérer les mises à jour du profil sémantique
 * 3. Logger les interactions IA pour analytics
 * 4. Valider l'intégrité des données
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { body, validationResult } = require('express-validator');

// Import des modules métier
const BrandDNAManager = require('./modules/brand-dna-manager');
const SemanticValidator = require('./modules/semantic-validator');
const AIInteractionLogger = require('./modules/ai-interaction-logger');
const CertificationService = require('./modules/certification-service');

// Configuration
const PORT = process.env.PORT || 3000;
const app = express();

// ============================================================================
// MIDDLEWARE DE SÉCURITÉ
// ============================================================================

// 1. HELMET - Protection des headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
        }
    }
}));

// 2. CORS - Contrôle des origines autorisées
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            'https://votre-site.com',
            'https://agent-ia-client.com',
            'http://localhost:3000' // Pour développement
        ];
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Non autorisé par CORS'));
        }
    },
    credentials: true
};
app.use(cors(corsOptions));

// 3. RATE LIMITING - Protection contre les abus
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limite à 100 requêtes par IP
    message: 'Trop de requêtes, réessayez plus tard'
});
app.use('/api/', limiter);

// 4. PARSING & LOGGING
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined')); // Logs des requêtes

// ============================================================================
// INITIALISATION DES SERVICES
// ============================================================================

const brandDNA = new BrandDNAManager();
const validator = new SemanticValidator();
const logger = new AIInteractionLogger();
const certifier = new CertificationService();

// ============================================================================
// ROUTES - ADN DE MARQUE
// ============================================================================

/**
 * GET /api/brand-dna
 * ------------------
 * RÔLE : Fournir l'ADN complet de la marque aux agents IA
 * 
 * RÉPONSE : Profil sémantique structuré avec :
 *   - Identité de marque
 *   - Instructions de communication
 *   - Catalogue produits enrichi
 *   - Règles d'interaction
 *   - Certifications
 * 
 * UTILISATION : Agent IA appelle cette route pour "apprendre" la marque
 */
app.get('/api/brand-dna', async (req, res) => {
    try {
        const version = req.query.version || 'latest';
        const dna = await brandDNA.getDNA(version);
        
        // Ajouter la signature de certification
        const certified = await certifier.signData(dna);
        
        // Logger l'accès
        await logger.logAccess({
            type: 'dna_access',
            userAgent: req.headers['user-agent'],
            ip: req.ip,
            timestamp: new Date()
        });
        
        res.json({
            success: true,
            data: certified,
            metadata: {
                version: dna.version,
                lastUpdated: dna.lastUpdated,
                schemaVersion: '1.0.0'
            }
        });
    } catch (error) {
        console.error('Erreur récupération ADN:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur serveur',
            message: 'Impossible de récupérer l\'ADN de marque'
        });
    }
});

/**
 * GET /api/brand-dna/products
 * ---------------------------
 * RÔLE : Fournir uniquement le catalogue produits enrichi
 * 
 * PARAMÈTRES :
 *   - category (optionnel) : Filtrer par catégorie
 *   - inStock (optionnel) : Seulement produits en stock
 * 
 * UTILISATION : Optimisé pour les recommandations rapides
 */
app.get('/api/brand-dna/products', async (req, res) => {
    try {
        const { category, inStock } = req.query;
        const products = await brandDNA.getProducts({ category, inStock });
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/analytics/interaction
 * --------------------------------
 * RÔLE : Enregistrer une interaction IA pour analytics
 */
app.post('/api/analytics/interaction', async (req, res) => {
    try {
        const { agentId, actionType, productId, metadata } = req.body;
        
        await logger.logInteraction({
            agentId,
            actionType,
            productId,
            metadata,
            timestamp: new Date()
        });
        
        res.json({
            success: true,
            message: 'Interaction enregistrée'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// GET /health
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// Route non trouvée
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route non trouvée'
    });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Erreur serveur interne'
    });
});

// DÉMARRAGE DU SERVEUR
app.listen(PORT, () => {
    console.log(`🧬 Serveur Marketing Sémantique - Port ${PORT}`);
    brandDNA.initialize();
    certifier.initialize();
    logger.initialize();
});

module.exports = app;
