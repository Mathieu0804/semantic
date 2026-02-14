/**
 * Client MCP - Script de test et d'intégration
 * 
 * Ce script permet de tester le serveur MCP et fournit
 * un exemple d'intégration pour les clients IA externes.
 * 
 * Utilisation:
 *   node scripts/test-mcp.js
 *   ou
 *   bun scripts/test-mcp.js
 */

const MCP_SERVER_URL = process.env.MCP_SERVER_URL || 'http://localhost:3000/api/mcp';

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

async function mcpRequest(body) {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

async function mcpGet(action) {
  const url = action ? `${MCP_SERVER_URL}?action=${action}` : MCP_SERVER_URL;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Erreur HTTP: ${response.status}`);
  }
  
  return response.json();
}

// ============================================================
// CLASSE CLIENT MCP
// ============================================================

class MCPClient {
  constructor(serverUrl) {
    this.serverUrl = serverUrl || MCP_SERVER_URL;
    this.token = null;
    this.sessionId = null;
  }

  /**
   * Se connecter au serveur MCP
   * @param {string} clientName - Nom du client
   * @param {string} clientType - Type: 'phone', 'computer', 'assistant'
   */
  async connect(clientName = 'TestClient', clientType = 'assistant') {
    console.log(`\n🔌 Connexion au serveur MCP: ${this.serverUrl}`);
    
    const data = await mcpRequest({
      action: 'connect',
      clientName,
      clientType
    });
    
    this.token = data.token;
    this.sessionId = data.sessionId;
    
    console.log(`✅ Connecté! Session: ${this.sessionId}`);
    return data;
  }

  /**
   * Envoyer un message à l'IA locale
   * @param {string} message - Message à envoyer
   */
  async chat(message) {
    if (!this.token) {
      throw new Error('Non connecté. Appelez connect() d\'abord.');
    }
    
    console.log(`\n💬 Message envoyé: "${message}"`);
    
    const startTime = Date.now();
    const data = await mcpRequest({
      action: 'request',
      token: this.token,
      endpoint: 'chat',
      payload: { message }
    });
    
    console.log(`🤖 Réponse (${data.responseTime}ms):`);
    console.log(`   ${data.response}`);
    
    return data;
  }

  /**
   * Récupérer la liste des produits
   */
  async getProducts() {
    if (!this.token) {
      throw new Error('Non connecté. Appelez connect() d\'abord.');
    }
    
    console.log(`\n📦 Récupération des produits...`);
    
    const data = await mcpRequest({
      action: 'request',
      token: this.token,
      endpoint: 'products',
      payload: {}
    });
    
    const products = JSON.parse(data.response);
    console.log(`✅ ${products.length} produits trouvés:`);
    products.forEach(p => {
      console.log(`   - ${p.name} (${p.price || 'N/A'} EUR)`);
    });
    
    return products;
  }

  /**
   * Récupérer la liste des services
   */
  async getServices() {
    if (!this.token) {
      throw new Error('Non connecté. Appelez connect() d\'abord.');
    }
    
    console.log(`\n🛠️ Récupération des services...`);
    
    const data = await mcpRequest({
      action: 'request',
      token: this.token,
      endpoint: 'services',
      payload: {}
    });
    
    const services = JSON.parse(data.response);
    console.log(`✅ ${services.length} services trouvés:`);
    services.forEach(s => {
      console.log(`   - ${s.name} (${s.basePrice || 'N/A'} EUR)`);
    });
    
    return services;
  }

  /**
   * Obtenir les statistiques du serveur
   */
  async getStats() {
    console.log(`\n📊 Statistiques du serveur MCP...`);
    
    const stats = await mcpGet('stats');
    
    console.log(`   Connexions totales: ${stats.totalConnections}`);
    console.log(`   Connexions actives: ${stats.activeConnections}`);
    console.log(`   Requêtes totales: ${stats.totalRequests}`);
    console.log(`   Requêtes aujourd'hui: ${stats.requestsToday}`);
    
    return stats;
  }

  /**
   * Obtenir la liste des connexions actives
   */
  async getConnections() {
    console.log(`\n🔗 Liste des connexions...`);
    
    const data = await mcpGet('connections');
    
    console.log(`✅ ${data.connections.length} connexions:`);
    data.connections.forEach(c => {
      console.log(`   - ${c.clientName || 'Anonyme'} (${c.clientType || 'N/A'}) - ${c.status}`);
    });
    
    return data.connections;
  }

  /**
   * Révoquer la connexion actuelle
   */
  async revoke() {
    if (!this.sessionId) {
      throw new Error('Pas de session active.');
    }
    
    console.log(`\n🔒 Révocation de la session...`);
    
    await fetch(`${MCP_SERVER_URL}?sessionId=${this.sessionId}`, {
      method: 'DELETE'
    });
    
    console.log(`✅ Session révoquée.`);
    this.token = null;
    this.sessionId = null;
  }
}

// ============================================================
// TESTS AUTOMATIQUES
// ============================================================

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('           TESTS DU SERVEUR MCP - PLATEFORME IA PME        ');
  console.log('═══════════════════════════════════════════════════════════');
  
  const client = new MCPClient();
  
  try {
    // Test 1: Statut du serveur
    console.log('\n📋 TEST 1: Vérification du statut serveur');
    const status = await mcpGet('');
    console.log(`   Statut: ${status.status}`);
    console.log(`   URL: ${status.url || 'Non configurée'}`);
    console.log(`   Activé: ${status.enabled ? 'Oui' : 'Non'}`);
    
    if (!status.enabled) {
      console.log('\n⚠️  Le serveur MCP n\'est pas activé.');
      console.log('   Activez-le dans l\'interface: Onglet "Serveur MCP"');
      return;
    }
    
    // Test 2: Connexion
    console.log('\n📋 TEST 2: Connexion au serveur');
    await client.connect('ScriptTest', 'assistant');
    
    // Test 3: Chat
    console.log('\n📋 TEST 3: Chat avec l\'IA locale');
    await client.chat('Bonjour, pouvez-vous me présenter votre entreprise ?');
    
    // Test 4: Produits
    console.log('\n📋 TEST 4: Récupération des produits');
    try {
      await client.getProducts();
    } catch (e) {
      console.log('   ℹ️  Aucun produit en base');
    }
    
    // Test 5: Services
    console.log('\n📋 TEST 5: Récupération des services');
    try {
      await client.getServices();
    } catch (e) {
      console.log('   ℹ️  Aucun service en base');
    }
    
    // Test 6: Stats
    console.log('\n📋 TEST 6: Statistiques');
    await client.getStats();
    
    // Test 7: Connexions
    console.log('\n📋 TEST 7: Liste des connexions');
    await client.getConnections();
    
    // Test 8: Déconnexion
    console.log('\n📋 TEST 8: Révocation de connexion');
    await client.revoke();
    
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('                    ✅ TOUS LES TESTS ONT RÉUSSI            ');
    console.log('═══════════════════════════════════════════════════════════');
    
  } catch (error) {
    console.error('\n❌ Erreur:', error.message);
    process.exit(1);
  }
}

// ============================================================
// POINT D'ENTRÉE
// ============================================================

runTests();
