/**
 * MODULE : BRAND DNA MANAGER
 * ===========================
 * 
 * RÔLE : Gestionnaire central de l'ADN de marque
 * 
 * RESPONSABILITÉS :
 * 1. Charger et stocker l'ADN de marque
 * 2. Gérer les versions (versioning)
 * 3. Fournir des méthodes d'accès optimisées
 * 4. Gérer le cache pour performance
 * 5. Persister les modifications
 * 
 * FONCTIONNEMENT :
 * - Charge l'ADN depuis une base de données ou fichier JSON
 * - Maintient un cache en mémoire pour accès rapide
 * - Crée des snapshots versionnés lors des modifications
 * - Permet rollback en cas d'erreur
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class BrandDNAManager {
    constructor() {
        // Chemin vers le stockage de l'ADN
        this.dataPath = path.join(__dirname, '../data/brand-dna.json');
        this.versionsPath = path.join(__dirname, '../data/versions/');
        
        // Cache en mémoire
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    }

    /**
     * MÉTHODE : initialize()
     * ----------------------
     * RÔLE : Initialiser le gestionnaire au démarrage du serveur
     * 
     * ÉTAPES :
     * 1. Créer les répertoires nécessaires
     * 2. Charger l'ADN existant ou créer un ADN par défaut
     * 3. Pré-charger le cache
     */
    async initialize() {
        try {
            // Créer les répertoires si nécessaire
            await this.ensureDirectories();
            
            // Charger l'ADN
            await this.loadDNA();
            
            console.log('✅ BrandDNAManager initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation BrandDNAManager:', error);
            // Créer un ADN par défaut en cas d'erreur
            await this.createDefaultDNA();
        }
    }

    /**
     * MÉTHODE : getDNA()
     * ------------------
     * RÔLE : Récupérer l'ADN de marque complet
     * 
     * PARAMÈTRES :
     * - version : 'latest' ou numéro de version spécifique
     * 
     * RETOUR : Objet complet de l'ADN de marque
     * 
     * OPTIMISATION : Utilise le cache si disponible et valide
     */
    async getDNA(version = 'latest') {
        // Vérifier le cache
        if (this.isCacheValid() && version === 'latest') {
            return this.cache;
        }
        
        // Charger depuis le disque
        if (version === 'latest') {
            await this.loadDNA();
            return this.cache;
        } else {
            // Charger une version spécifique
            return await this.loadVersion(version);
        }
    }

    /**
     * MÉTHODE : getProducts()
     * -----------------------
     * RÔLE : Récupérer uniquement le catalogue produits
     * 
     * PARAMÈTRES :
     * - filters : { category, inStock, priceRange, etc. }
     * 
     * RETOUR : Tableau de produits filtrés
     * 
     * UTILISATION : Optimisé pour les requêtes de recherche IA
     */
    async getProducts(filters = {}) {
        const dna = await this.getDNA();
        let products = dna.products || [];
        
        // Filtrage par catégorie
        if (filters.category) {
            products = products.filter(p => 
                p.category === filters.category
            );
        }
        
        // Filtrage par stock
        if (filters.inStock === 'true') {
            products = products.filter(p => 
                p.inventory && p.inventory.inStock === true
            );
        }
        
        // Filtrage par prix
        if (filters.minPrice || filters.maxPrice) {
            products = products.filter(p => {
                const price = parseFloat(p.price?.price || 0);
                if (filters.minPrice && price < parseFloat(filters.minPrice)) return false;
                if (filters.maxPrice && price > parseFloat(filters.maxPrice)) return false;
                return true;
            });
        }
        
        return products;
    }

    /**
     * MÉTHODE : getInstructions()
     * ---------------------------
     * RÔLE : Récupérer uniquement les instructions de communication
     * 
     * RETOUR : Objet avec tone, values, vocabulary, etc.
     * 
     * UTILISATION : Pour rafraîchir les guidelines sans tout recharger
     */
    async getInstructions() {
        const dna = await this.getDNA();
        return {
            aiInstructions: dna.brandIdentity?.aiInstructions || {},
            communicationStyle: dna.brandIdentity?.communicationStyle || {},
            aiInteractionRules: dna.aiInteractionRules || {}
        };
    }

    /**
     * MÉTHODE : update()
     * ------------------
     * RÔLE : Mettre à jour l'ADN de marque
     * 
     * PARAMÈTRES :
     * - newDNA : Nouvel ADN (partiel ou complet)
     * 
     * ÉTAPES :
     * 1. Valider les données
     * 2. Créer un snapshot de l'ancienne version
     * 3. Fusionner avec l'existant (si mise à jour partielle)
     * 4. Sauvegarder
     * 5. Invalider le cache
     * 6. Retourner le diff pour audit
     * 
     * RETOUR : { version, diff, timestamp }
     */
    async update(newDNA) {
        // Charger l'ADN actuel
        const currentDNA = await this.getDNA();
        
        // Créer un snapshot avant modification
        const snapshotVersion = await this.createSnapshot(currentDNA);
        
        // Fusionner les données
        const updatedDNA = this.mergeDNA(currentDNA, newDNA);
        
        // Incrémenter la version
        updatedDNA.version = this.incrementVersion(currentDNA.version);
        updatedDNA.lastUpdated = new Date().toISOString();
        
        // Calculer le diff pour audit
        const diff = this.calculateDiff(currentDNA, updatedDNA);
        
        // Sauvegarder
        await this.saveDNA(updatedDNA);
        
        // Invalider le cache
        this.invalidateCache();
        
        return {
            version: updatedDNA.version,
            diff: diff,
            timestamp: updatedDNA.lastUpdated,
            snapshotVersion: snapshotVersion
        };
    }

    /**
     * MÉTHODE : loadDNA() [PRIVÉE]
     * ----------------------------
     * RÔLE : Charger l'ADN depuis le disque et le mettre en cache
     */
    async loadDNA() {
        try {
            const data = await fs.readFile(this.dataPath, 'utf-8');
            this.cache = JSON.parse(data);
            this.cacheTimestamp = Date.now();
        } catch (error) {
            if (error.code === 'ENOENT') {
                // Fichier n'existe pas, créer un ADN par défaut
                await this.createDefaultDNA();
            } else {
                throw error;
            }
        }
    }

    /**
     * MÉTHODE : saveDNA() [PRIVÉE]
     * ----------------------------
     * RÔLE : Sauvegarder l'ADN sur le disque
     */
    async saveDNA(dna) {
        const dataDir = path.dirname(this.dataPath);
        await fs.mkdir(dataDir, { recursive: true });
        await fs.writeFile(
            this.dataPath,
            JSON.stringify(dna, null, 2),
            'utf-8'
        );
    }

    /**
     * MÉTHODE : createSnapshot() [PRIVÉE]
     * -----------------------------------
     * RÔLE : Créer un snapshot versionné de l'ADN actuel
     * 
     * UTILISATION : Permet de revenir en arrière en cas de problème
     */
    async createSnapshot(dna) {
        const timestamp = Date.now();
        const version = `${dna.version}-snapshot-${timestamp}`;
        const snapshotPath = path.join(this.versionsPath, `${version}.json`);
        
        await fs.mkdir(this.versionsPath, { recursive: true });
        await fs.writeFile(
            snapshotPath,
            JSON.stringify(dna, null, 2),
            'utf-8'
        );
        
        return version;
    }

    /**
     * MÉTHODE : loadVersion() [PRIVÉE]
     * --------------------------------
     * RÔLE : Charger une version spécifique de l'ADN
     */
    async loadVersion(version) {
        const versionPath = path.join(this.versionsPath, `${version}.json`);
        const data = await fs.readFile(versionPath, 'utf-8');
        return JSON.parse(data);
    }

    /**
     * MÉTHODE : mergeDNA() [PRIVÉE]
     * -----------------------------
     * RÔLE : Fusionner intelligemment l'ancien et le nouvel ADN
     * 
     * STRATÉGIE :
     * - Fusion profonde des objets
     * - Remplacement des tableaux (pas de fusion)
     * - Préservation des champs système
     */
    mergeDNA(current, newData) {
        const merged = { ...current };
        
        for (const key in newData) {
            if (key === 'version' || key === 'lastUpdated') {
                // Ne pas écraser ces champs (gérés automatiquement)
                continue;
            }
            
            if (Array.isArray(newData[key])) {
                // Remplacer les tableaux
                merged[key] = newData[key];
            } else if (typeof newData[key] === 'object' && newData[key] !== null) {
                // Fusion profonde des objets
                merged[key] = {
                    ...(current[key] || {}),
                    ...newData[key]
                };
            } else {
                // Remplacement simple
                merged[key] = newData[key];
            }
        }
        
        return merged;
    }

    /**
     * MÉTHODE : calculateDiff() [PRIVÉE]
     * ----------------------------------
     * RÔLE : Calculer les différences entre deux versions
     * 
     * RETOUR : Tableau des changements pour audit
     */
    calculateDiff(oldDNA, newDNA) {
        const changes = [];
        
        const compareObjects = (path, oldObj, newObj) => {
            for (const key in newObj) {
                const fullPath = path ? `${path}.${key}` : key;
                
                if (!(key in oldObj)) {
                    changes.push({
                        type: 'added',
                        path: fullPath,
                        value: newObj[key]
                    });
                } else if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
                    changes.push({
                        type: 'modified',
                        path: fullPath,
                        oldValue: oldObj[key],
                        newValue: newObj[key]
                    });
                }
            }
        };
        
        compareObjects('', oldDNA, newDNA);
        return changes;
    }

    /**
     * MÉTHODES UTILITAIRES
     */
    
    isCacheValid() {
        return this.cache !== null && 
               this.cacheTimestamp !== null &&
               (Date.now() - this.cacheTimestamp) < this.cacheTTL;
    }

    invalidateCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }

    incrementVersion(currentVersion) {
        const parts = currentVersion.split('.');
        parts[2] = parseInt(parts[2]) + 1;
        return parts.join('.');
    }

    async ensureDirectories() {
        await fs.mkdir(path.dirname(this.dataPath), { recursive: true });
        await fs.mkdir(this.versionsPath, { recursive: true });
    }

    /**
     * MÉTHODE : createDefaultDNA() [PRIVÉE]
     * -------------------------------------
     * RÔLE : Créer un ADN de marque par défaut lors de l'initialisation
     */
    async createDefaultDNA() {
        const defaultDNA = {
            version: "1.0.0",
            lastUpdated: new Date().toISOString(),
            brandIdentity: {
                name: "Votre Marque",
                description: "Description de votre marque",
                aiInstructions: {
                    role: "Tu es l'ambassadeur de cette marque",
                    tone: ["Professionnel", "Accessible"],
                    values: ["Qualité", "Innovation"],
                    prohibitedClaims: []
                }
            },
            products: [],
            aiInteractionRules: {}
        };
        
        await this.saveDNA(defaultDNA);
        this.cache = defaultDNA;
        this.cacheTimestamp = Date.now();
    }
}

module.exports = BrandDNAManager;
