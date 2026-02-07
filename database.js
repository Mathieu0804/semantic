/**
 * ========================================
 * MODULE BASE DE DONNÉES - MongoDB
 * ========================================
 * 
 * Gestion de la persistance des données de marque
 * avec MongoDB et Mongoose
 */

const mongoose = require('mongoose');

// ==========================================
// SCHÉMAS MONGOOSE
// ==========================================

/**
 * Schéma pour les instructions IA
 */
const aiInstructionsSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true,
        minlength: 20
    },
    tone: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: 'Au moins 2 éléments de ton requis'
        }
    },
    values: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: 'Au moins 2 valeurs requises'
        }
    },
    prohibitedClaims: [String],
    keyMessages: [String]
}, { _id: false });

/**
 * Schéma pour le style de communication
 */
const communicationStyleSchema = new mongoose.Schema({
    vocabulary: {
        preferred: [String],
        avoid: [String]
    },
    examplePhrases: [String]
}, { _id: false });

/**
 * Schéma pour l'identité de marque
 */
const brandIdentitySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 500
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: function(v) {
                return /^https?:\/\/.+/.test(v);
            },
            message: 'URL invalide'
        }
    },
    aiInstructions: {
        type: aiInstructionsSchema,
        required: true
    },
    communicationStyle: communicationStyleSchema
}, { _id: false });

/**
 * Schéma pour les produits
 */
const productSchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        index: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'EUR',
        enum: ['EUR', 'USD', 'GBP', 'CHF']
    },
    description: {
        type: String,
        required: true
    },
    aiPitch: {
        type: String,
        required: true,
        minlength: 30
    },
    ingredients: [String],
    certifications: [String],
    sustainabilityScore: {
        type: Number,
        min: 0,
        max: 10
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    images: [String],
    tags: [String]
}, { _id: false });

/**
 * Schéma pour les règles d'interaction IA
 */
const aiInteractionRulesSchema = new mongoose.Schema({
    whenRecommending: String,
    whenComparing: String,
    whenNegotiating: String,
    whenAnsweringConcerns: String
}, { _id: false });

/**
 * Schéma principal pour une marque
 */
const brandSchema = new mongoose.Schema({
    brandId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    version: {
        type: String,
        default: '1.0.0'
    },
    status: {
        type: String,
        enum: ['draft', 'active', 'archived'],
        default: 'draft'
    },
    identity: {
        type: brandIdentitySchema,
        required: true
    },
    products: {
        type: [productSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'Au moins un produit requis'
        }
    },
    aiInteractionRules: aiInteractionRulesSchema,
    
    // Métadonnées
    createdBy: String,
    updatedBy: String,
    
    // Analytics
    viewCount: {
        type: Number,
        default: 0
    },
    lastAccessed: Date
}, {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ==========================================
// INDEX POUR PERFORMANCES
// ==========================================

brandSchema.index({ name: 'text', 'identity.description': 'text' });
brandSchema.index({ status: 1, updatedAt: -1 });
brandSchema.index({ 'products.category': 1 });

// ==========================================
// MÉTHODES VIRTUELLES
// ==========================================

brandSchema.virtual('productCount').get(function() {
    return this.products ? this.products.length : 0;
});

brandSchema.virtual('isActive').get(function() {
    return this.status === 'active';
});

// ==========================================
// MÉTHODES D'INSTANCE
// ==========================================

/**
 * Incrémente la version (patch)
 */
brandSchema.methods.incrementVersion = function() {
    const parts = this.version.split('.');
    parts[2] = parseInt(parts[2]) + 1;
    this.version = parts.join('.');
    return this.version;
};

/**
 * Active la marque
 */
brandSchema.methods.activate = function() {
    this.status = 'active';
    return this.save();
};

/**
 * Archive la marque
 */
brandSchema.methods.archive = function() {
    this.status = 'archived';
    return this.save();
};

/**
 * Enregistre une vue
 */
brandSchema.methods.recordView = function() {
    this.viewCount += 1;
    this.lastAccessed = new Date();
    return this.save();
};

/**
 * Convertit en JSON-LD
 */
brandSchema.methods.toJSONLD = function() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `https://api.semantic-marketing.example/brands/${this.brandId}`,
        'name': this.name,
        'description': this.identity.description,
        'url': this.identity.url,
        'version': this.version,
        'dateModified': this.updatedAt,
        
        'brandIdentity': {
            '@type': 'BrandGuidelines',
            'aiInstructions': this.identity.aiInstructions,
            'communicationStyle': this.identity.communicationStyle
        },
        
        'hasOfferCatalog': {
            '@type': 'OfferCatalog',
            'itemListElement': this.products.map((product, index) => ({
                '@type': 'Offer',
                'position': index + 1,
                'itemOffered': {
                    '@type': 'Product',
                    'name': product.name,
                    'description': product.description,
                    'category': product.category,
                    'offers': {
                        '@type': 'Offer',
                        'price': product.price,
                        'priceCurrency': product.currency,
                        'availability': product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock'
                    },
                    'additionalProperty': [
                        {
                            '@type': 'PropertyValue',
                            'name': 'aiPitch',
                            'value': product.aiPitch
                        },
                        {
                            '@type': 'PropertyValue',
                            'name': 'sustainabilityScore',
                            'value': product.sustainabilityScore
                        }
                    ]
                }
            }))
        },
        
        'aiInteractionRules': this.aiInteractionRules
    };
};

// ==========================================
// MÉTHODES STATIQUES
// ==========================================

/**
 * Recherche des marques par texte
 */
brandSchema.statics.searchByText = function(query) {
    return this.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
};

/**
 * Récupère les marques actives
 */
brandSchema.statics.findActive = function() {
    return this.find({ status: 'active' });
};

/**
 * Statistiques globales
 */
brandSchema.statics.getStats = async function() {
    const stats = await this.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalProducts: { $sum: { $size: '$products' } },
                avgViews: { $avg: '$viewCount' }
            }
        }
    ]);
    
    return stats;
};

// ==========================================
// SCHÉMA POUR LES ANALYTICS
// ==========================================

const analyticsSchema = new mongoose.Schema({
    event: {
        type: String,
        required: true,
        index: true
    },
    brandId: {
        type: String,
        index: true
    },
    userId: String,
    userAgent: String,
    ipAddress: String,
    metadata: mongoose.Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
});

// Index pour analytics
analyticsSchema.index({ event: 1, timestamp: -1 });
analyticsSchema.index({ brandId: 1, timestamp: -1 });

// ==========================================
// MODÈLES
// ==========================================

const Brand = mongoose.model('Brand', brandSchema);
const Analytics = mongoose.model('Analytics', analyticsSchema);

// ==========================================
// CONNEXION À LA BASE DE DONNÉES
// ==========================================

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/semantic-marketing';
        
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ MongoDB connecté avec succès');
        
        // Créer les index
        await Brand.createIndexes();
        await Analytics.createIndexes();
        
        console.log('✅ Index créés avec succès');
        
    } catch (error) {
        console.error('❌ Erreur de connexion MongoDB:', error.message);
        process.exit(1);
    }
};

// Gestion des événements de connexion
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB déconnecté');
});

mongoose.connection.on('error', (err) => {
    console.error('❌ Erreur MongoDB:', err);
});

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
    connectDB,
    Brand,
    Analytics,
    mongoose
};
