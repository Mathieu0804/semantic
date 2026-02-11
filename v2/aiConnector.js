import axios from 'axios';
import logger from '../utils/logger.js';

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3:8b';

/**
 * Système prompts selon le type de conversation
 */
const SYSTEM_PROMPTS = {
  site_creation: `Tu es un expert en création de sites web pour PME/PMI. Tu aides les utilisateurs à concevoir leur site en posant des questions pertinentes sur leur activité, leurs besoins, leur audience cible. Tu proposes des suggestions de design, de structure et de contenu adaptées à leur secteur. Tu es créatif, professionnel et à l'écoute.`,
  
  identity: `Tu es un consultant en stratégie de marque et identité d'entreprise. Tu aides les PME à définir leur mission, vision, valeurs, positionnement unique. Tu poses des questions profondes pour comprendre l'essence de l'entreprise et suggères des mots-clés SEO pertinents. Tu es stratégique et inspirant.`,
  
  product: `Tu es un expert en marketing produit et gestion de catalogue. Tu aides à optimiser les fiches produits, suggérer des descriptions attractives, organiser les catégories. Tu comprends les enjeux du e-commerce et du référencement produit.`,
  
  support: `Tu es un assistant de support technique amical et efficace. Tu aides les utilisateurs à résoudre leurs problèmes, réponds à leurs questions sur la plateforme. Tu es patient, clair dans tes explications et proactif.`,
  
  general: `Tu es un assistant IA polyvalent pour les PME/PMI. Tu aides sur tous les aspects de leur présence en ligne : site web, marketing, SEO, produits, stratégie. Tu es professionnel, créatif et orienté solutions.`
};

/**
 * Formater l'historique de conversation pour Ollama
 */
function formatConversationHistory(history) {
  return history.map(msg => ({
    role: msg.role,
    content: msg.content
  }));
}

/**
 * Construire le contexte entreprise pour l'IA
 */
function buildCompanyContext(companyData) {
  if (!companyData || Object.keys(companyData).length === 0) {
    return '';
  }

  const parts = [];
  
  if (companyData.name) {
    parts.push(`Nom de l'entreprise: ${companyData.name}`);
  }
  if (companyData.industry) {
    parts.push(`Secteur d'activité: ${companyData.industry}`);
  }
  if (companyData.mission) {
    parts.push(`Mission: ${companyData.mission}`);
  }
  if (companyData.vision) {
    parts.push(`Vision: ${companyData.vision}`);
  }
  if (companyData.brand_voice) {
    parts.push(`Ton de la marque: ${companyData.brand_voice}`);
  }

  if (parts.length === 0) return '';

  return `\n\nContexte de l'entreprise:\n${parts.join('\n')}`;
}

/**
 * Appeler l'IA locale avec Ollama
 */
export async function chatWithAI(
  userMessage,
  conversationHistory = [],
  conversationType = 'general',
  companyContext = {}
) {
  try {
    const startTime = Date.now();

    // Construire le système prompt
    const systemPrompt = SYSTEM_PROMPTS[conversationType] || SYSTEM_PROMPTS.general;
    const contextAddition = buildCompanyContext(companyContext);
    
    const fullSystemPrompt = systemPrompt + contextAddition;

    // Formater l'historique
    const messages = [
      { role: 'system', content: fullSystemPrompt },
      ...formatConversationHistory(conversationHistory),
      { role: 'user', content: userMessage }
    ];

    logger.info(`Envoi requête à Ollama - Model: ${OLLAMA_MODEL}`);

    // Appel à l'API Ollama
    const response = await axios.post(
      `${OLLAMA_URL}/api/chat`,
      {
        model: OLLAMA_MODEL,
        messages: messages,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          top_k: 40
        }
      },
      {
        timeout: 60000, // 60 secondes timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    logger.info(`Réponse Ollama reçue en ${responseTime}ms`);

    return {
      content: response.data.message.content,
      model: OLLAMA_MODEL,
      tokens: {
        prompt: response.data.prompt_eval_count || 0,
        completion: response.data.eval_count || 0,
        total: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
      },
      responseTime
    };
  } catch (error) {
    logger.error('Erreur lors de l\'appel à Ollama:', error.message);
    
    // Gestion d'erreur avec fallback
    if (error.code === 'ECONNREFUSED') {
      throw new Error('IA locale non accessible. Vérifiez qu\'Ollama est démarré.');
    }
    
    if (error.response?.status === 404) {
      throw new Error(`Modèle ${OLLAMA_MODEL} non trouvé. Installez-le avec: ollama pull ${OLLAMA_MODEL}`);
    }

    throw new Error(`Erreur IA: ${error.message}`);
  }
}

/**
 * Générer du contenu SEO avec l'IA
 */
export async function generateSEOContent(productOrPageData, contentType = 'meta_description') {
  try {
    let prompt = '';
    
    switch (contentType) {
      case 'meta_description':
        prompt = `Génère une meta description SEO optimisée (150-160 caractères) pour ce produit/page:\n${JSON.stringify(productOrPageData, null, 2)}`;
        break;
      case 'keywords':
        prompt = `Génère 10 mots-clés SEO pertinents pour:\n${JSON.stringify(productOrPageData, null, 2)}`;
        break;
      case 'product_description':
        prompt = `Rédige une description produit convaincante et optimisée SEO pour:\n${JSON.stringify(productOrPageData, null, 2)}`;
        break;
      case 'ld_json':
        prompt = `Génère le code LD-JSON (Schema.org) pour:\n${JSON.stringify(productOrPageData, null, 2)}`;
        break;
    }

    const response = await chatWithAI(prompt, [], 'general', {});
    return response.content;
  } catch (error) {
    logger.error('Erreur génération SEO:', error);
    throw error;
  }
}

/**
 * Analyser un comportement et suggérer des améliorations
 */
export async function analyzeAndSuggest(analyticsData, analysisType = 'general') {
  try {
    const prompt = `En tant qu'expert analytics et UX, analyse ces données et propose 3-5 suggestions d'amélioration concrètes:\n\nType d'analyse: ${analysisType}\n\nDonnées:\n${JSON.stringify(analyticsData, null, 2)}`;

    const response = await chatWithAI(prompt, [], 'general', {});
    return response.content;
  } catch (error) {
    logger.error('Erreur analyse comportement:', error);
    throw error;
  }
}

/**
 * Vérifier la santé de la connexion Ollama
 */
export async function checkOllamaHealth() {
  try {
    const response = await axios.get(`${OLLAMA_URL}/api/tags`, {
      timeout: 5000
    });
    
    return {
      status: 'healthy',
      models: response.data.models || [],
      url: OLLAMA_URL
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
      url: OLLAMA_URL
    };
  }
}

export default {
  chatWithAI,
  generateSEOContent,
  analyzeAndSuggest,
  checkOllamaHealth
};
