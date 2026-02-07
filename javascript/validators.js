/**
 * ========================================
 * MODULE DE VALIDATION
 * ========================================
 * 
 * Valide les données de marque selon les standards:
 * - Schema.org
 * - Format JSON-LD
 * - Cohérence sémantique
 */

const validator = require('validator');

/**
 * Schéma de validation pour l'ADN de marque
 */
const brandSchema = {
    required: ['name', 'identity', 'products'],
    fields: {
        name: {
            type: 'string',
            minLength: 2,
            maxLength: 100
        },
        identity: {
            type: 'object',
            required: ['description', 'url', 'aiInstructions'],
            fields: {
                description: { type: 'string', minLength: 10, maxLength: 500 },
                url: { type: 'string', validator: 'isURL' },
                aiInstructions: {
                    type: 'object',
                    required: ['role', 'tone', 'values'],
                    fields: {
                        role: { type: 'string', minLength: 20 },
                        tone: { type: 'array', minItems: 2, itemType: 'string' },
                        values: { type: 'array', minItems: 2, itemType: 'string' },
                        prohibitedClaims: { type: 'array', itemType: 'string' },
                        keyMessages: { type: 'array', itemType: 'string' }
                    }
                }
            }
        },
        products: {
            type: 'array',
            minItems: 1,
            itemType: 'object',
            itemFields: {
                name: { type: 'string', required: true },
                category: { type: 'string', required: true },
                price: { type: 'number', min: 0, required: true },
                description: { type: 'string', required: true },
                aiPitch: { type: 'string', required: true }
            }
        }
    }
};

/**
 * Valide un objet contre un schéma
 */
function validateField(value, rules, fieldName = 'field') {
    const errors = [];
    
    // Vérifier le type
    if (rules.type) {
        const actualType = Array.isArray(value) ? 'array' : typeof value;
        if (actualType !== rules.type) {
            errors.push(`${fieldName}: doit être de type ${rules.type}, reçu ${actualType}`);
            return errors; // Arrêter la validation si le type est incorrect
        }
    }
    
    // Validation spécifique selon le type
    if (rules.type === 'string') {
        if (rules.minLength && value.length < rules.minLength) {
            errors.push(`${fieldName}: doit contenir au moins ${rules.minLength} caractères`);
        }
        if (rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${fieldName}: ne doit pas dépasser ${rules.maxLength} caractères`);
        }
        if (rules.validator) {
            if (!validator[rules.validator](value)) {
                errors.push(`${fieldName}: format invalide (${rules.validator})`);
            }
        }
    }
    
    if (rules.type === 'number') {
        if (rules.min !== undefined && value < rules.min) {
            errors.push(`${fieldName}: doit être >= ${rules.min}`);
        }
        if (rules.max !== undefined && value > rules.max) {
            errors.push(`${fieldName}: doit être <= ${rules.max}`);
        }
    }
    
    if (rules.type === 'array') {
        if (rules.minItems && value.length < rules.minItems) {
            errors.push(`${fieldName}: doit contenir au moins ${rules.minItems} élément(s)`);
        }
        if (rules.maxItems && value.length > rules.maxItems) {
            errors.push(`${fieldName}: ne doit pas dépasser ${rules.maxItems} élément(s)`);
        }
        
        // Valider les éléments du tableau
        if (rules.itemType === 'string') {
            value.forEach((item, index) => {
                if (typeof item !== 'string') {
                    errors.push(`${fieldName}[${index}]: doit être une chaîne de caractères`);
                }
            });
        }
        
        if (rules.itemType === 'object' && rules.itemFields) {
            value.forEach((item, index) => {
                const itemErrors = validateObject(item, { fields: rules.itemFields }, `${fieldName}[${index}]`);
                errors.push(...itemErrors);
            });
        }
    }
    
    if (rules.type === 'object' && rules.fields) {
        const objectErrors = validateObject(value, rules, fieldName);
        errors.push(...objectErrors);
    }
    
    return errors;
}

/**
 * Valide un objet complet
 */
function validateObject(obj, schema, prefix = '') {
    const errors = [];
    
    // Vérifier les champs requis
    if (schema.required) {
        schema.required.forEach(field => {
            if (!(field in obj)) {
                errors.push(`${prefix ? prefix + '.' : ''}${field}: champ requis manquant`);
            }
        });
    }
    
    // Valider chaque champ
    if (schema.fields) {
        Object.keys(schema.fields).forEach(field => {
            const fieldPath = prefix ? `${prefix}.${field}` : field;
            
            if (field in obj) {
                const fieldErrors = validateField(obj[field], schema.fields[field], fieldPath);
                errors.push(...fieldErrors);
            } else if (schema.fields[field].required) {
                errors.push(`${fieldPath}: champ requis manquant`);
            }
        });
    }
    
    return errors;
}

/**
 * Valide les données d'une marque
 */
function validateBrand(brandData) {
    const errors = validateObject(brandData, brandSchema);
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Validation sémantique avancée
 * Vérifie la cohérence et la qualité des instructions IA
 */
function validateSemanticQuality(brandData) {
    const warnings = [];
    
    // Vérifier que le rôle IA est suffisamment détaillé
    if (brandData.identity?.aiInstructions?.role) {
        const role = brandData.identity.aiInstructions.role;
        if (role.length < 50) {
            warnings.push('Le rôle IA est trop court. Recommandation: 50+ caractères pour une meilleure contextualisation');
        }
        
        // Vérifier que le rôle mentionne la marque
        if (!role.includes(brandData.name)) {
            warnings.push('Le rôle IA devrait mentionner explicitement le nom de la marque');
        }
    }
    
    // Vérifier la cohérence entre les valeurs et les messages clés
    if (brandData.identity?.aiInstructions?.values && brandData.identity?.aiInstructions?.keyMessages) {
        const values = brandData.identity.aiInstructions.values.join(' ').toLowerCase();
        const messages = brandData.identity.aiInstructions.keyMessages.join(' ').toLowerCase();
        
        // Exemple: si "durable" est une valeur, les messages devraient le refléter
        if (values.includes('durable') && !messages.includes('durable') && !messages.includes('recyclable')) {
            warnings.push('Les messages clés ne semblent pas refléter la valeur "durable"');
        }
    }
    
    // Vérifier que chaque produit a un aiPitch unique et détaillé
    brandData.products?.forEach((product, index) => {
        if (product.aiPitch && product.aiPitch.length < 30) {
            warnings.push(`Produit "${product.name}": le aiPitch est trop court (recommandation: 30+ caractères)`);
        }
        
        if (product.description === product.aiPitch) {
            warnings.push(`Produit "${product.name}": le aiPitch devrait être différent de la description`);
        }
    });
    
    // Vérifier la présence de vocabulaire interdit dans les données
    if (brandData.identity?.aiInstructions?.prohibitedClaims && brandData.products) {
        const prohibitedWords = brandData.identity.communicationStyle?.vocabulary?.avoid || [];
        
        brandData.products.forEach(product => {
            const productText = `${product.name} ${product.description} ${product.aiPitch}`.toLowerCase();
            
            prohibitedWords.forEach(word => {
                if (productText.includes(word.toLowerCase())) {
                    warnings.push(`Produit "${product.name}": contient le mot à éviter "${word}"`);
                }
            });
        });
    }
    
    return {
        hasWarnings: warnings.length > 0,
        warnings
    };
}

/**
 * Validation complète (structure + sémantique)
 */
function validateBrandComplete(brandData) {
    const structureValidation = validateBrand(brandData);
    const semanticValidation = validateSemanticQuality(brandData);
    
    return {
        isValid: structureValidation.isValid,
        errors: structureValidation.errors,
        warnings: semanticValidation.warnings,
        quality: {
            score: calculateQualityScore(structureValidation, semanticValidation),
            suggestions: generateSuggestions(structureValidation, semanticValidation)
        }
    };
}

/**
 * Calcule un score de qualité (0-100)
 */
function calculateQualityScore(structureValidation, semanticValidation) {
    let score = 100;
    
    // -50 points par erreur structurelle
    score -= structureValidation.errors.length * 50;
    
    // -5 points par avertissement sémantique
    score -= semanticValidation.warnings.length * 5;
    
    return Math.max(0, score);
}

/**
 * Génère des suggestions d'amélioration
 */
function generateSuggestions(structureValidation, semanticValidation) {
    const suggestions = [];
    
    if (structureValidation.errors.length > 0) {
        suggestions.push('Corriger les erreurs structurelles avant la publication');
    }
    
    if (semanticValidation.warnings.length > 0) {
        suggestions.push('Améliorer la qualité sémantique pour optimiser les interactions IA');
    }
    
    if (structureValidation.isValid && semanticValidation.warnings.length === 0) {
        suggestions.push('✅ Données optimales pour le marketing sémantique!');
    }
    
    return suggestions;
}

module.exports = {
    validateBrand,
    validateSemanticQuality,
    validateBrandComplete,
    brandSchema
};
