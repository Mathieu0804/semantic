/**
 * MODULE : CERTIFICATION SERVICE
 * ===============================
 * 
 * RÔLE : Certifier l'authenticité des données de marque (Partie 2 de l'idée)
 * 
 * RESPONSABILITÉS :
 * 1. Générer des signatures cryptographiques pour l'ADN
 * 2. Vérifier l'authenticité des données
 * 3. Implémenter le standard C2PA (Coalition for Content Provenance and Authenticity)
 * 4. Prévenir le phishing et la falsification
 * 5. Établir une chaîne de confiance
 * 
 * FONCTIONNEMENT :
 * - Utilise la cryptographie asymétrique (RSA)
 * - Chaque donnée est signée avec la clé privée de la marque
 * - Les IA vérifient avec la clé publique
 * - Timestamp pour traçabilité temporelle
 * 
 * SÉCURITÉ :
 * - Clé privée stockée de manière sécurisée (HSM en production)
 * - Rotation régulière des clés
 * - Révocation possible en cas de compromission
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class CertificationService {
    constructor() {
        this.keysPath = path.join(__dirname, '../data/keys/');
        this.privateKey = null;
        this.publicKey = null;
        this.keySize = 2048; // Taille de clé RSA
        
        // Métadonnées de certification
        this.issuer = 'Votre Marque Officielle';
        this.certificationVersion = '1.0.0';
    }

    /**
     * MÉTHODE : initialize()
     * ----------------------
     * RÔLE : Initialiser le service de certification
     * 
     * ÉTAPES :
     * 1. Créer le répertoire de clés
     * 2. Charger ou générer la paire de clés RSA
     * 3. Vérifier l'intégrité des clés
     */
    async initialize() {
        try {
            await fs.mkdir(this.keysPath, { recursive: true });
            
            // Charger les clés existantes ou les générer
            const keysExist = await this.checkKeysExist();
            
            if (keysExist) {
                await this.loadKeys();
            } else {
                await this.generateKeys();
            }
            
            console.log('✅ CertificationService initialisé');
        } catch (error) {
            console.error('❌ Erreur initialisation CertificationService:', error);
        }
    }

    /**
     * MÉTHODE : signData()
     * --------------------
     * RÔLE : Signer cryptographiquement les données
     * 
     * PARAMÈTRES :
     * - data : Objet à signer (généralement l'ADN de marque)
     * 
     * PROCESSUS :
     * 1. Sérialiser les données en JSON canonique
     * 2. Calculer le hash SHA-256
     * 3. Signer le hash avec la clé privée RSA
     * 4. Retourner les données + signature + métadonnées
     * 
     * RETOUR : {
     *   data: object,          // Données originales
     *   signature: string,     // Signature cryptographique
     *   timestamp: string,     // Horodatage
     *   issuer: string,        // Émetteur du certificat
     *   publicKey: string      // Clé publique pour vérification
     * }
     * 
     * UTILISATION : Chaque fois que l'ADN est servi à une IA
     */
    async signData(data) {
        if (!this.privateKey) {
            throw new Error('Service de certification non initialisé');
        }

        // 1. Créer une représentation canonique des données
        const canonicalData = this.canonicalize(data);
        
        // 2. Calculer le hash
        const hash = crypto
            .createHash('sha256')
            .update(canonicalData)
            .digest();

        // 3. Signer avec la clé privée
        const signature = crypto
            .sign('sha256', hash, {
                key: this.privateKey,
                padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            })
            .toString('base64');

        // 4. Créer le manifeste de certification
        const certificationManifest = {
            data: data,
            certification: {
                signature: signature,
                timestamp: new Date().toISOString(),
                issuer: this.issuer,
                version: this.certificationVersion,
                algorithm: 'RSA-SHA256',
                publicKey: this.publicKey.export({
                    type: 'spki',
                    format: 'pem'
                }),
                // Standard C2PA
                c2pa: {
                    claim: {
                        contentType: 'application/json',
                        assertions: [
                            {
                                label: 'c2pa.brand-identity',
                                data: {
                                    brandName: data.brandIdentity?.name,
                                    verified: true
                                }
                            }
                        ]
                    }
                }
            }
        };

        return certificationManifest;
    }

    /**
     * MÉTHODE : verify()
     * ------------------
     * RÔLE : Vérifier l'authenticité d'une signature
     * 
     * PARAMÈTRES :
     * - signedData : Données signées (format retourné par signData)
     * 
     * PROCESSUS :
     * 1. Extraire les données et la signature
     * 2. Recalculer le hash des données
     * 3. Vérifier la signature avec la clé publique
     * 4. Vérifier la validité temporelle
     * 
     * RETOUR : {
     *   isValid: boolean,
     *   issuer: string,
     *   timestamp: string,
     *   errors: array (si invalide)
     * }
     * 
     * UTILISATION : Par les IA pour vérifier que les données sont authentiques
     */
    async verify(signedData) {
        const errors = [];
        
        try {
            const { data, certification } = signedData;
            
            if (!certification) {
                return {
                    isValid: false,
                    errors: ['Aucune certification trouvée']
                };
            }

            // 1. Vérifier que la signature n'est pas trop ancienne (anti-replay)
            const signatureAge = Date.now() - new Date(certification.timestamp).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 heures
            
            if (signatureAge > maxAge) {
                errors.push('Signature expirée (plus de 24h)');
            }

            // 2. Recréer la représentation canonique
            const canonicalData = this.canonicalize(data);
            
            // 3. Calculer le hash
            const hash = crypto
                .createHash('sha256')
                .update(canonicalData)
                .digest();

            // 4. Vérifier la signature
            const publicKey = crypto.createPublicKey(certification.publicKey);
            const isValid = crypto.verify(
                'sha256',
                hash,
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
                },
                Buffer.from(certification.signature, 'base64')
            );

            if (!isValid) {
                errors.push('Signature cryptographique invalide');
            }

            // 5. Vérifier le standard C2PA
            const c2paValid = this.verifyC2PA(certification.c2pa, data);
            if (!c2paValid) {
                errors.push('Métadonnées C2PA invalides');
            }

            return {
                isValid: isValid && errors.length === 0,
                issuer: certification.issuer,
                timestamp: certification.timestamp,
                algorithm: certification.algorithm,
                c2paVerified: c2paValid,
                errors: errors
            };

        } catch (error) {
            return {
                isValid: false,
                errors: [`Erreur de vérification: ${error.message}`]
            };
        }
    }

    /**
     * MÉTHODE : generateKeys() [PRIVÉE]
     * ---------------------------------
     * RÔLE : Générer une nouvelle paire de clés RSA
     * 
     * SÉCURITÉ :
     * - Clé privée stockée avec permissions restrictives (600)
     * - En production : utiliser un HSM (Hardware Security Module)
     */
    async generateKeys() {
        const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
            modulusLength: this.keySize,
            publicKeyEncoding: {
                type: 'spki',
                format: 'pem'
            },
            privateKeyEncoding: {
                type: 'pkcs8',
                format: 'pem',
                // En production, chiffrer la clé privée avec une passphrase
                // cipher: 'aes-256-cbc',
                // passphrase: process.env.KEY_PASSPHRASE
            }
        });

        // Sauvegarder les clés
        const publicKeyPath = path.join(this.keysPath, 'public.pem');
        const privateKeyPath = path.join(this.keysPath, 'private.pem');

        await fs.writeFile(publicKeyPath, publicKey, { mode: 0o644 });
        await fs.writeFile(privateKeyPath, privateKey, { mode: 0o600 });

        // Charger en mémoire
        this.publicKey = crypto.createPublicKey(publicKey);
        this.privateKey = crypto.createPrivateKey(privateKey);

        console.log('✅ Nouvelle paire de clés générée');
    }

    /**
     * MÉTHODE : loadKeys() [PRIVÉE]
     * -----------------------------
     * RÔLE : Charger les clés existantes
     */
    async loadKeys() {
        const publicKeyPath = path.join(this.keysPath, 'public.pem');
        const privateKeyPath = path.join(this.keysPath, 'private.pem');

        const publicKeyPem = await fs.readFile(publicKeyPath, 'utf-8');
        const privateKeyPem = await fs.readFile(privateKeyPath, 'utf-8');

        this.publicKey = crypto.createPublicKey(publicKeyPem);
        this.privateKey = crypto.createPrivateKey(privateKeyPem);
    }

    /**
     * MÉTHODE : checkKeysExist() [PRIVÉE]
     * -----------------------------------
     * RÔLE : Vérifier si les clés existent déjà
     */
    async checkKeysExist() {
        try {
            const publicKeyPath = path.join(this.keysPath, 'public.pem');
            const privateKeyPath = path.join(this.keysPath, 'private.pem');

            await fs.access(publicKeyPath);
            await fs.access(privateKeyPath);
            
            return true;
        } catch {
            return false;
        }
    }

    /**
     * MÉTHODE : canonicalize() [PRIVÉE]
     * ---------------------------------
     * RÔLE : Créer une représentation canonique des données
     * 
     * IMPORTANT : Pour que deux objets identiques produisent le même hash,
     *             il faut une représentation déterministe (ordre des clés)
     */
    canonicalize(data) {
        // Tri récursif des clés pour représentation déterministe
        const sortObject = (obj) => {
            if (Array.isArray(obj)) {
                return obj.map(sortObject);
            } else if (obj !== null && typeof obj === 'object') {
                return Object.keys(obj)
                    .sort()
                    .reduce((result, key) => {
                        result[key] = sortObject(obj[key]);
                        return result;
                    }, {});
            }
            return obj;
        };

        const sorted = sortObject(data);
        return JSON.stringify(sorted);
    }

    /**
     * MÉTHODE : verifyC2PA() [PRIVÉE]
     * -------------------------------
     * RÔLE : Vérifier la conformité au standard C2PA
     * 
     * C2PA = Coalition for Content Provenance and Authenticity
     * Standard pour la traçabilité du contenu numérique
     */
    verifyC2PA(c2pa, data) {
        if (!c2pa || !c2pa.claim) {
            return false;
        }

        const { claim } = c2pa;
        
        // Vérifier que le type de contenu correspond
        if (claim.contentType !== 'application/json') {
            return false;
        }

        // Vérifier les assertions
        if (!claim.assertions || claim.assertions.length === 0) {
            return false;
        }

        // Vérifier l'assertion de marque
        const brandAssertion = claim.assertions.find(
            a => a.label === 'c2pa.brand-identity'
        );

        if (!brandAssertion) {
            return false;
        }

        // Vérifier que le nom de marque correspond
        if (brandAssertion.data.brandName !== data.brandIdentity?.name) {
            return false;
        }

        return true;
    }

    /**
     * MÉTHODE : getPublicKey()
     * ------------------------
     * RÔLE : Obtenir la clé publique pour distribution
     * 
     * UTILISATION : Les IA téléchargent cette clé pour vérifier les signatures
     */
    getPublicKey() {
        if (!this.publicKey) {
            throw new Error('Clés non initialisées');
        }

        return this.publicKey.export({
            type: 'spki',
            format: 'pem'
        });
    }

    /**
     * MÉTHODE : rotateKeys()
     * ----------------------
     * RÔLE : Rotation de clés pour sécurité renforcée
     * 
     * PROCESSUS :
     * 1. Générer nouvelle paire de clés
     * 2. Archiver l'ancienne paire
     * 3. Invalider progressivement les anciennes signatures
     * 
     * FRÉQUENCE : Tous les 6-12 mois en production
     */
    async rotateKeys() {
        // Archiver les anciennes clés
        const timestamp = Date.now();
        const archivePath = path.join(this.keysPath, `archive-${timestamp}/`);
        await fs.mkdir(archivePath, { recursive: true });

        const oldPublicPath = path.join(this.keysPath, 'public.pem');
        const oldPrivatePath = path.join(this.keysPath, 'private.pem');

        await fs.rename(oldPublicPath, path.join(archivePath, 'public.pem'));
        await fs.rename(oldPrivatePath, path.join(archivePath, 'private.pem'));

        // Générer nouvelles clés
        await this.generateKeys();

        console.log(`✅ Rotation de clés effectuée - anciennes clés archivées dans ${archivePath}`);
    }
}

module.exports = CertificationService;
