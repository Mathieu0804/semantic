/**
 * MODULE : SEMANTIC VALIDATOR
 * ============================
 * 
 * RÔLE : Valider la cohérence sémantique de l'ADN de marque
 * 
 * RESPONSABILITÉS :
 * 1. Vérifier la structure des données (schéma JSON)
 * 2. Valider la cohérence sémantique (ton vs valeurs)
 * 3. Détecter les contradictions dans les instructions
 * 4. Analyser la qualité du contenu IA
 * 5. Générer un score de qualité sémantique
 * 
 * FONCTIONNEMENT :
 * - Analyse multi-niveaux (structure → cohérence → qualité)
 * - Détection d'incohérences (ex: ton "agressif" + valeur "bienveillance")
 * - Suggestions d'amélioration
 * - Scoring basé sur des métriques de qualité
 */

const Ajv = require('ajv');
const addFormats = require('ajv-formats');

class SemanticValidator {
    constructor() {
        // Initialiser le validateur JSON Schema
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
        
        // Charger le schéma de validation
        this.schema = this.getSchema();
        this.validateSchema = this.ajv.compile(this.schema);
        
        // Dictionnaires pour analyse sémantique
        this.tonePositive = ['accessible', 'bienveillant', 'chaleureux', 'amical', 'empathique'];
        this.toneNegative = ['agressif', 'condescendant', 'froid', 'distant'];
        this.toneProfessional = ['professionnel', 'formel', 'technique', 'scientifique'];
        this.toneCasual = ['décontracté', 'informel', 'ludique', 'spontané'];
    }

    /**
     * MÉTHODE : validate()
     * --------------------
     * RÔLE : Validation complète de l'ADN de marque
     * 
     * PARAMÈTRES :
     * - dna : Objet ADN de marque à valider
     * 
     * ÉTAPES :
     * 1. Validation structurelle (JSON Schema)
     * 2. Validation sémantique (cohérence interne)
     * 3. Validation qualitative (richesse du contenu)
     * 4. Génération du score global
     * 
     * RETOUR : {
     *   isValid: boolean,
     *   errors: array,
     *   warnings: array,
     *   score: number (0-100),
     *   suggestions: array
     * }
     */
    async validate(dna) {
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            score: 100,
            suggestions: []
        };

        // 1. VALIDATION STRUCTURELLE
        const structuralValidation = this.validateStructure(dna);
        if (!structuralValidation.isValid) {
            result.isValid = false;
            result.errors.push(...structuralValidation.errors);
            result.score -= 30;
        }

        // 2. VALIDATION SÉMANTIQUE
        const semanticValidation = this.validateSemantics(dna);
        if (semanticValidation.errors.length > 0) {
            result.errors.push(...semanticValidation.errors);
            result.score -= semanticValidation.errors.length * 5;
        }
        result.warnings.push(...semanticValidation.warnings);

        // 3. VALIDATION QUALITATIVE
        const qualityValidation = this.validateQuality(dna);
        result.warnings.push(...qualityValidation.warnings);
        result.suggestions.push(...qualityValidation.suggestions);
        result.score -= qualityValidation.scorePenalty;

        // 4. VALIDATION DES PRODUITS
        const productValidation = this.validateProducts(dna.products || []);
        result.warnings.push(...productValidation.warnings);
        result.score -= productValidation.scorePenalty;

        // Score ne peut pas être négatif
        result.score = Math.max(0, result.score);

        return result;
    }

    /**
     * MÉTHODE : validateStructure() [PRIVÉE]
     * --------------------------------------
     * RÔLE : Valider la structure JSON contre le schéma
     * 
     * VÉRIFIE :
     * - Présence des champs obligatoires
     * - Types de données corrects
     * - Format des valeurs (URLs, emails, etc.)
     */
    validateStructure(dna) {
        const isValid = this.validateSchema(dna);
        const errors = [];

        if (!isValid) {
            this.validateSchema.errors.forEach(err => {
                errors.push({
                    type: 'structural',
                    path: err.instancePath || err.dataPath,
                    message: err.message,
                    severity: 'error'
                });
            });
        }

        // Vérifications supplémentaires
        if (!dna.brandIdentity?.name) {
            errors.push({
                type: 'structural',
                path: 'brandIdentity.name',
                message: 'Le nom de la marque est obligatoire',
                severity: 'error'
            });
        }

        if (!dna.brandIdentity?.aiInstructions?.role) {
            errors.push({
                type: 'structural',
                path: 'brandIdentity.aiInstructions.role',
                message: 'Le rôle de l\'IA doit être défini',
                severity: 'error'
            });
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    /**
     * MÉTHODE : validateSemantics() [PRIVÉE]
     * --------------------------------------
     * RÔLE : Valider la cohérence sémantique interne
     * 
     * ANALYSE :
     * 1. Cohérence ton/valeurs
     * 2. Contradictions dans les instructions
     * 3. Vocabulaire approprié vs vocabulaire interdit
     * 4. Alignement messages clés avec valeurs
     */
    validateSemantics(dna) {
        const errors = [];
        const warnings = [];

        const aiInstructions = dna.brandIdentity?.aiInstructions;
        if (!aiInstructions) return { errors, warnings };

        // 1. ANALYSE COHÉRENCE TON/VALEURS
        const tone = aiInstructions.tone || [];
        const values = aiInstructions.values || [];

        // Détection de contradictions ton/valeurs
        const hasPositiveTone = tone.some(t => 
            this.tonePositive.some(pt => t.toLowerCase().includes(pt))
        );
        const hasNegativeValue = values.some(v => 
            v.toLowerCase().includes('agressivité') || 
            v.toLowerCase().includes('domination')
        );

        if (hasPositiveTone && hasNegativeValue) {
            warnings.push({
                type: 'semantic',
                message: 'Incohérence potentielle : ton positif mais valeurs agressives',
                severity: 'warning',
                suggestion: 'Alignez le ton avec les valeurs de la marque'
            });
        }

        // 2. VÉRIFICATION VOCABULAIRE
        const communicationStyle = dna.brandIdentity?.communicationStyle;
        if (communicationStyle) {
            const preferred = communicationStyle.vocabulary?.preferred || [];
            const avoid = communicationStyle.vocabulary?.avoid || [];

            // Détecter les mots dans les deux listes
            const overlap = preferred.filter(word => 
                avoid.some(avoidWord => 
                    word.toLowerCase() === avoidWord.toLowerCase()
                )
            );

            if (overlap.length > 0) {
                errors.push({
                    type: 'semantic',
                    message: `Mots présents dans "preferred" ET "avoid": ${overlap.join(', ')}`,
                    severity: 'error',
                    suggestion: 'Retirez ces mots d\'une des deux listes'
                });
            }

            // Vérifier que les exemples utilisent le vocabulaire préféré
            const examples = communicationStyle.examplePhrases || [];
            examples.forEach((example, index) => {
                const usesAvoid = avoid.some(word => 
                    example.toLowerCase().includes(word.toLowerCase())
                );
                
                if (usesAvoid) {
                    warnings.push({
                        type: 'semantic',
                        message: `Exemple ${index + 1} utilise du vocabulaire à éviter`,
                        severity: 'warning',
                        suggestion: 'Reformulez cet exemple sans les mots interdits'
                    });
                }
            });
        }

        // 3. VÉRIFICATION DES INTERDICTIONS
        const prohibited = aiInstructions.prohibitedClaims || [];
        const keyMessages = aiInstructions.keyMessages || [];

        keyMessages.forEach((message, index) => {
            // Vérifier si un message clé viole une interdiction
            const violatesProhibition = prohibited.some(prohibition => {
                const prohibitionLower = prohibition.toLowerCase();
                const messageLower = message.toLowerCase();
                
                // Recherche de patterns communs d'interdiction
                if (prohibitionLower.includes('jamais promettre') && 
                    (messageLower.includes('garantit') || messageLower.includes('promis'))) {
                    return true;
                }
                if (prohibitionLower.includes('résultats instantanés') && 
                    (messageLower.includes('instantané') || messageLower.includes('immédiat'))) {
                    return true;
                }
                return false;
            });

            if (violatesProhibition) {
                errors.push({
                    type: 'semantic',
                    message: `Message clé ${index + 1} viole une interdiction définie`,
                    severity: 'error',
                    suggestion: 'Reformulez ce message pour respecter les interdictions'
                });
            }
        });

        return { errors, warnings };
    }

    /**
     * MÉTHODE : validateQuality() [PRIVÉE]
     * ------------------------------------
     * RÔLE : Évaluer la qualité et richesse du contenu
     * 
     * CRITÈRES :
     * - Richesse du vocabulaire
     * - Nombre et qualité des exemples
     * - Spécificité des instructions
     * - Diversité des messages clés
     */
    validateQuality(dna) {
        const warnings = [];
        const suggestions = [];
        let scorePenalty = 0;

        const aiInstructions = dna.brandIdentity?.aiInstructions;
        if (!aiInstructions) return { warnings, suggestions, scorePenalty };

        // 1. VÉRIFIER LA RICHESSE DU TON
        const tone = aiInstructions.tone || [];
        if (tone.length < 2) {
            warnings.push({
                type: 'quality',
                message: 'Ton insuffisamment défini (minimum 2 attributs recommandés)',
                severity: 'warning'
            });
            suggestions.push('Ajoutez plus d\'attributs de ton pour guider l\'IA');
            scorePenalty += 5;
        }

        // 2. VÉRIFIER LES VALEURS
        const values = aiInstructions.values || [];
        if (values.length < 3) {
            warnings.push({
                type: 'quality',
                message: 'Valeurs insuffisamment définies (minimum 3 recommandées)',
                severity: 'warning'
            });
            suggestions.push('Définissez au moins 3 valeurs fondamentales de votre marque');
            scorePenalty += 5;
        }

        // 3. VÉRIFIER LES EXEMPLES DE PHRASES
        const examples = dna.brandIdentity?.communicationStyle?.examplePhrases || [];
        if (examples.length < 3) {
            warnings.push({
                type: 'quality',
                message: 'Pas assez d\'exemples de phrases (minimum 3 recommandés)',
                severity: 'warning'
            });
            suggestions.push('Ajoutez des exemples concrets pour illustrer le style de communication');
            scorePenalty += 10;
        }

        // 4. VÉRIFIER LA SPÉCIFICITÉ DU RÔLE
        const role = aiInstructions.role || '';
        if (role.split(' ').length < 10) {
            warnings.push({
                type: 'quality',
                message: 'Description du rôle IA trop courte',
                severity: 'warning'
            });
            suggestions.push('Enrichissez la description du rôle avec plus de contexte et de détails');
            scorePenalty += 5;
        }

        // 5. VÉRIFIER LES MESSAGES CLÉS
        const keyMessages = aiInstructions.keyMessages || [];
        if (keyMessages.length === 0) {
            warnings.push({
                type: 'quality',
                message: 'Aucun message clé défini',
                severity: 'warning'
            });
            suggestions.push('Ajoutez des messages clés que l\'IA doit promouvoir');
            scorePenalty += 15;
        }

        return { warnings, suggestions, scorePenalty };
    }

    /**
     * MÉTHODE : validateProducts() [PRIVÉE]
     * -------------------------------------
     * RÔLE : Valider la qualité des données produits
     * 
     * VÉRIFIE :
     * - Présence d'un "aiPitch" pour chaque produit
     * - Complétude des informations essentielles
     * - Cohérence des prix
     * - Présence de certifications
     */
    validateProducts(products) {
        const warnings = [];
        let scorePenalty = 0;

        if (products.length === 0) {
            warnings.push({
                type: 'product',
                message: 'Aucun produit défini dans le catalogue',
                severity: 'warning'
            });
            scorePenalty += 20;
            return { warnings, scorePenalty };
        }

        products.forEach((product, index) => {
            // Vérifier le aiPitch
            if (!product.aiPitch || product.aiPitch.length < 50) {
                warnings.push({
                    type: 'product',
                    message: `Produit "${product.name}": aiPitch manquant ou trop court`,
                    severity: 'warning'
                });
                scorePenalty += 2;
            }

            // Vérifier le prix
            if (!product.price || !product.price.price) {
                warnings.push({
                    type: 'product',
                    message: `Produit "${product.name}": prix manquant`,
                    severity: 'warning'
                });
                scorePenalty += 2;
            }

            // Vérifier la description
            if (!product.description || product.description.length < 30) {
                warnings.push({
                    type: 'product',
                    message: `Produit "${product.name}": description trop courte`,
                    severity: 'warning'
                });
                scorePenalty += 1;
            }

            // Recommander des certifications
            if (!product.certifications || product.certifications.length === 0) {
                warnings.push({
                    type: 'product',
                    message: `Produit "${product.name}": aucune certification (recommandé pour la confiance)`,
                    severity: 'info'
                });
            }
        });

        return { warnings, scorePenalty };
    }

    /**
     * MÉTHODE : getSchema() [PRIVÉE]
     * ------------------------------
     * RÔLE : Définir le schéma JSON Schema pour l'ADN de marque
     */
    getSchema() {
        return {
            type: 'object',
            required: ['brandIdentity'],
            properties: {
                version: { type: 'string', pattern: '^\\d+\\.\\d+\\.\\d+$' },
                lastUpdated: { type: 'string', format: 'date-time' },
                brandIdentity: {
                    type: 'object',
                    required: ['name', 'aiInstructions'],
                    properties: {
                        name: { type: 'string', minLength: 1 },
                        description: { type: 'string' },
                        aiInstructions: {
                            type: 'object',
                            required: ['role', 'tone', 'values'],
                            properties: {
                                role: { type: 'string', minLength: 10 },
                                tone: { type: 'array', items: { type: 'string' }, minItems: 1 },
                                values: { type: 'array', items: { type: 'string' }, minItems: 1 },
                                prohibitedClaims: { type: 'array', items: { type: 'string' } },
                                keyMessages: { type: 'array', items: { type: 'string' } }
                            }
                        }
                    }
                },
                products: {
                    type: 'array',
                    items: {
                        type: 'object',
                        required: ['name', 'description'],
                        properties: {
                            name: { type: 'string', minLength: 1 },
                            description: { type: 'string', minLength: 10 },
                            aiPitch: { type: 'string' },
                            price: {
                                type: 'object',
                                properties: {
                                    price: { type: 'string' },
                                    priceCurrency: { type: 'string' }
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}

module.exports = SemanticValidator;
