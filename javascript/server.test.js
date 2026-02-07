/**
 * ========================================
 * TESTS UNITAIRES
 * ========================================
 * 
 * Tests pour le serveur de marketing sémantique
 * Framework : Jest + Supertest
 */

const request = require('supertest');
const app = require('./server');
const { Brand, Analytics, connectDB, mongoose } = require('./database');

// ==========================================
// CONFIGURATION DES TESTS
// ==========================================

beforeAll(async () => {
    // Connexion à la base de test
    await connectDB();
});

afterAll(async () => {
    // Nettoyage et fermeture
    await Brand.deleteMany({});
    await Analytics.deleteMany({});
    await mongoose.connection.close();
});

// ==========================================
// TESTS DES ROUTES API
// ==========================================

describe('API Endpoints - Brands', () => {
    
    let testBrandId;
    
    describe('GET /api/brands', () => {
        it('devrait retourner la liste des marques', async () => {
            const res = await request(app)
                .get('/api/brands')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
    });
    
    describe('POST /api/brands', () => {
        it('devrait créer une nouvelle marque', async () => {
            const newBrand = {
                name: 'Test Brand',
                identity: {
                    description: 'Une marque de test pour les tests unitaires',
                    url: 'https://www.testbrand.com',
                    aiInstructions: {
                        role: 'Tu es l\'ambassadeur de Test Brand, une marque innovante',
                        tone: ['Innovant', 'Dynamique'],
                        values: ['Innovation', 'Qualité'],
                        prohibitedClaims: ['Pas de fausses promesses'],
                        keyMessages: ['100% innovant', 'Qualité garantie']
                    },
                    communicationStyle: {
                        vocabulary: {
                            preferred: ['innovant', 'moderne'],
                            avoid: ['dépassé', 'ancien']
                        }
                    }
                },
                products: [
                    {
                        name: 'Produit Test',
                        category: 'Test',
                        price: 99.99,
                        description: 'Un produit de test',
                        aiPitch: 'Recommandé pour les tests unitaires et d\'intégration'
                    }
                ]
            };
            
            const res = await request(app)
                .post('/api/brands')
                .send(newBrand)
                .expect(201);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.name).toBe('Test Brand');
            
            testBrandId = res.body.data.id;
        });
        
        it('devrait rejeter une marque sans données requises', async () => {
            const invalidBrand = {
                name: 'Incomplete Brand'
                // Manque identity et products
            };
            
            const res = await request(app)
                .post('/api/brands')
                .send(invalidBrand)
                .expect(400);
            
            expect(res.body.success).toBe(false);
        });
    });
    
    describe('GET /api/brands/:id', () => {
        it('devrait récupérer une marque spécifique', async () => {
            const res = await request(app)
                .get(`/api/brands/${testBrandId}`)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.id).toBe(testBrandId);
        });
        
        it('devrait retourner 404 pour une marque inexistante', async () => {
            const res = await request(app)
                .get('/api/brands/nonexistent-id')
                .expect(404);
            
            expect(res.body.success).toBe(false);
        });
    });
    
    describe('GET /api/brands/:id/jsonld', () => {
        it('devrait retourner le JSON-LD correct', async () => {
            const res = await request(app)
                .get(`/api/brands/${testBrandId}/jsonld`)
                .expect(200)
                .expect('Content-Type', /application\/ld\+json/);
            
            expect(res.body['@context']).toBe('https://schema.org');
            expect(res.body['@type']).toBe('Organization');
            expect(res.body.brandIdentity).toBeDefined();
        });
    });
    
    describe('PUT /api/brands/:id', () => {
        it('devrait mettre à jour une marque', async () => {
            const update = {
                identity: {
                    aiInstructions: {
                        tone: ['Nouveau ton', 'Mis à jour']
                    }
                }
            };
            
            const res = await request(app)
                .put(`/api/brands/${testBrandId}`)
                .send(update)
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.version).not.toBe('1.0.0'); // Version incrémentée
        });
    });
});

describe('API Endpoints - Products', () => {
    describe('GET /api/products/search', () => {
        it('devrait rechercher des produits par query', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ query: 'serum' })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(Array.isArray(res.body.data)).toBe(true);
        });
        
        it('devrait filtrer par prix maximum', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ maxPrice: 60 })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            res.body.data.forEach(product => {
                expect(product.price).toBeLessThanOrEqual(60);
            });
        });
        
        it('devrait filtrer par score de durabilité', async () => {
            const res = await request(app)
                .get('/api/products/search')
                .query({ minSustainability: 9 })
                .expect(200);
            
            expect(res.body.success).toBe(true);
            res.body.data.forEach(product => {
                expect(product.sustainabilityScore).toBeGreaterThanOrEqual(9);
            });
        });
    });
});

describe('API Endpoints - Analytics', () => {
    describe('GET /api/analytics', () => {
        it('devrait retourner les statistiques', async () => {
            const res = await request(app)
                .get('/api/analytics')
                .expect(200);
            
            expect(res.body.success).toBe(true);
            expect(res.body.data.totalRequests).toBeDefined();
            expect(res.body.data.requestsByEvent).toBeDefined();
        });
    });
});

// ==========================================
// TESTS DES VALIDATEURS
// ==========================================

const { validateBrand, validateSemanticQuality } = require('./validators');

describe('Validators', () => {
    describe('validateBrand', () => {
        it('devrait accepter des données valides', () => {
            const validBrand = {
                name: 'Valid Brand',
                identity: {
                    description: 'Une description valide',
                    url: 'https://www.valid.com',
                    aiInstructions: {
                        role: 'Un rôle suffisamment long pour être valide',
                        tone: ['Ton 1', 'Ton 2'],
                        values: ['Valeur 1', 'Valeur 2']
                    }
                },
                products: [
                    {
                        name: 'Product 1',
                        category: 'Category',
                        price: 49.99,
                        description: 'Une description',
                        aiPitch: 'Un pitch suffisamment détaillé pour l\'IA'
                    }
                ]
            };
            
            const result = validateBrand(validBrand);
            expect(result.isValid).toBe(true);
            expect(result.errors).toHaveLength(0);
        });
        
        it('devrait rejeter des données invalides', () => {
            const invalidBrand = {
                name: 'X', // Trop court
                identity: {
                    description: 'Court', // Trop court
                    url: 'not-a-url', // URL invalide
                    aiInstructions: {
                        role: 'Court', // Trop court
                        tone: ['Un seul'], // Pas assez d'éléments
                        values: ['Une seule'] // Pas assez d'éléments
                    }
                },
                products: [] // Vide
            };
            
            const result = validateBrand(invalidBrand);
            expect(result.isValid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
        });
    });
    
    describe('validateSemanticQuality', () => {
        it('devrait détecter un rôle IA trop court', () => {
            const brand = {
                name: 'Test',
                identity: {
                    aiInstructions: {
                        role: 'Trop court',
                        values: ['Val1', 'Val2'],
                        keyMessages: ['Msg1', 'Msg2']
                    }
                },
                products: []
            };
            
            const result = validateSemanticQuality(brand);
            expect(result.warnings.length).toBeGreaterThan(0);
        });
        
        it('devrait détecter un aiPitch trop court', () => {
            const brand = {
                name: 'Test',
                identity: {
                    aiInstructions: {
                        role: 'Un rôle suffisamment long',
                        values: [],
                        keyMessages: []
                    }
                },
                products: [
                    {
                        name: 'Produit',
                        aiPitch: 'Court'
                    }
                ]
            };
            
            const result = validateSemanticQuality(brand);
            expect(result.warnings).toContain(
                expect.stringContaining('aiPitch est trop court')
            );
        });
    });
});

// ==========================================
// TESTS DE PERFORMANCE
// ==========================================

describe('Performance Tests', () => {
    it('devrait gérer 100 requêtes concurrentes', async () => {
        const promises = [];
        
        for (let i = 0; i < 100; i++) {
            promises.push(
                request(app).get('/api/brands')
            );
        }
        
        const results = await Promise.all(promises);
        
        results.forEach(res => {
            expect(res.status).toBe(200);
        });
    }, 10000); // Timeout de 10 secondes
});

// ==========================================
// TESTS DE SÉCURITÉ
// ==========================================

describe('Security Tests', () => {
    it('devrait bloquer les injections XSS', async () => {
        const xssPayload = {
            name: '<script>alert("XSS")</script>',
            identity: {
                description: 'Normal description',
                url: 'https://test.com',
                aiInstructions: {
                    role: 'Normal role for testing',
                    tone: ['Tone 1', 'Tone 2'],
                    values: ['Value 1', 'Value 2']
                }
            },
            products: [
                {
                    name: 'Product',
                    category: 'Cat',
                    price: 10,
                    description: 'Desc',
                    aiPitch: 'A pitch for testing purposes'
                }
            ]
        };
        
        const res = await request(app)
            .post('/api/brands')
            .send(xssPayload);
        
        // Le nom ne devrait pas contenir de balises script
        if (res.status === 201) {
            expect(res.body.data.name).not.toContain('<script>');
        }
    });
    
    it('devrait limiter le rate limiting', async () => {
        const promises = [];
        
        // Dépasser la limite de requêtes
        for (let i = 0; i < 150; i++) {
            promises.push(
                request(app).get('/api/brands')
            );
        }
        
        const results = await Promise.all(promises);
        
        // Au moins une requête devrait être rejetée (429)
        const rateLimited = results.some(res => res.status === 429);
        expect(rateLimited).toBe(true);
    }, 30000);
});
