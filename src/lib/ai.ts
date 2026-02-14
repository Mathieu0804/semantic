// src/lib/ai.ts
// Configuration pour Gemini AI - Sans fichier de config externe

// ============================================
// CONFIGURATION DIRECTE VIA VARIABLES D'ENVIRONNEMENT
// ============================================

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash'

// URL de l'API Gemini
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`

// ============================================
// INTERFACES
// ============================================

interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
      role: string
    }
    finishReason: string
  }[]
  promptFeedback?: {
    blockReason?: string
  }
}

// ============================================
// FONCTION : Réponses démo (fallback)
// ============================================

function getDemoResponse(prompt: string): string {
  const lowerPrompt = prompt.toLowerCase()
  
  if (lowerPrompt.includes('bonjour') || lowerPrompt.includes('salut') || lowerPrompt.includes('hello')) {
    return "Bonjour ! Je suis l'assistant IA de cette PME. Comment puis-je vous aider aujourd'hui ?"
  }
  
  if (lowerPrompt.includes('produit')) {
    return "Nous proposons une gamme de produits et services de qualité. Consultez notre catalogue pour plus de détails."
  }
  
  if (lowerPrompt.includes('service')) {
    return "Nos services sont conçus pour répondre à vos besoins professionnels. N'hésitez pas à nous contacter."
  }
  
  if (lowerPrompt.includes('prix') || lowerPrompt.includes('tarif')) {
    return "Nos tarifs sont adaptés à chaque projet. Contactez-nous pour un devis personnalisé."
  }
  
  if (lowerPrompt.includes('contact')) {
    return "Vous pouvez nous contacter par email ou téléphone. Nos coordonnées sont disponibles dans la section Contact."
  }
  
  return "Je suis là pour vous aider ! Posez-moi une question sur nos produits, services ou sur la création de votre site web."
}

// ============================================
// FONCTION PRINCIPALE : Appeler Gemini
// ============================================

async function callGemini(
  prompt: string,
  systemInstruction?: string
): Promise<string> {
  // Mode démo si pas de clé API
  if (!GEMINI_API_KEY) {
    console.log('[IA] Mode démo activé - Pas de clé API Gemini')
    return getDemoResponse(prompt)
  }

  try {
    console.log('[IA] Appel Gemini avec modèle:', GEMINI_MODEL)
    
    const requestBody: any = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
        topP: 0.95,
        topK: 40
      }
    }

    // Ajouter les instructions système si fournies
    if (systemInstruction) {
      requestBody.systemInstruction = {
        parts: [{ text: systemInstruction }]
      }
    }

    const url = `${GEMINI_URL}?key=${GEMINI_API_KEY}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[IA] Gemini API error:', response.status, errorText)
      
      // Fallback vers mode démo en cas d'erreur
      if (response.status === 400) {
        return "Erreur de configuration IA. Vérifiez votre clé API Gemini."
      }
      return getDemoResponse(prompt)
    }

    const data: GeminiResponse = await response.json()

    // Vérifier si le contenu a été bloqué
    if (data.promptFeedback?.blockReason) {
      console.warn('[IA] Content blocked:', data.promptFeedback.blockReason)
      return "Désolé, je ne peux pas répondre à cette demande."
    }

    // Extraire le texte de la réponse
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    if (!text) {
      console.warn('[IA] Pas de texte dans la réponse')
      return getDemoResponse(prompt)
    }
    
    console.log('[IA] Réponse reçue, longueur:', text.length)
    return text

  } catch (error) {
    console.error('[IA] Gemini call error:', error)
    return getDemoResponse(prompt)
  }
}

// ============================================
// EXPORT : Chat avec l'IA
// ============================================

export async function chatWithAI(
  messages: Array<{ role: string; content: string }>,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  // Filtrer et convertir les messages
  const userMessages = messages.filter(m => m.role === 'user')
  const systemMessage = messages.find(m => m.role === 'system')
  
  // Prendre le dernier message utilisateur
  const lastUserMessage = userMessages[userMessages.length - 1]
  
  if (!lastUserMessage) {
    return "Je n'ai pas reçu de message."
  }

  // Construire le contexte si historique
  let prompt = lastUserMessage.content
  
  if (userMessages.length > 1) {
    const history = userMessages.slice(0, -1)
      .map(m => `Utilisateur: ${m.content}`)
      .join('\n')
    
    prompt = `Conversation précédente:\n${history}\n\nUtilisateur: ${lastUserMessage.content}\n\nRéponds à la dernière question en tenant compte du contexte.`
  }

  return callGemini(prompt, systemMessage?.content)
}

// ============================================
// EXPORT : Chat simple
// ============================================

export async function chat(
  userMessage: string,
  systemPrompt?: string
): Promise<string> {
  const messages = [
    ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
    { role: 'user', content: userMessage }
  ]
  
  return chatWithAI(messages)
}

// ============================================
// EXPORT : Générer du texte
// ============================================

export async function generateText(
  prompt: string,
  options?: {
    temperature?: number
    maxTokens?: number
  }
): Promise<string> {
  return callGemini(prompt)
}

// ============================================
// EXPORT : Générer du contenu pour un site
// ============================================

export async function generateSiteContent(params: {
  siteName: string
  description: string
  theme?: string
}): Promise<{
  title: string
  subtitle: string
  heroContent: string
  sections: Array<{ title: string; content: string }>
  metaDescription: string
  keywords: string[]
}> {
  const prompt = `Tu es un expert en création de sites web pour PME françaises.

Crée du contenu professionnel pour ce site web :
- Nom de l'entreprise : "${params.siteName}"
- Description de l'activité : "${params.description}"
- Style souhaité : "${params.theme || 'moderne et professionnel'}"

Génère un contenu complet en français.

RÉPONDS UNIQUEMENT EN JSON VALIDE :
{
  "title": "Nom de l'entreprise",
  "subtitle": "Slogan accrocheur",
  "heroContent": "Texte d'introduction",
  "sections": [
    {"title": "À propos", "content": "Présentation..."},
    {"title": "Nos Services", "content": "Description..."},
    {"title": "Contact", "content": "Invitation..."}
  ],
  "metaDescription": "Description SEO",
  "keywords": ["mot1", "mot2", "mot3"]
}`

  const response = await callGemini(prompt)
  
  try {
    let cleanResponse = response.trim()
    // Nettoyer le markdown si présent
    cleanResponse = cleanResponse
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()
    
    return JSON.parse(cleanResponse)
  } catch {
    return {
      title: params.siteName,
      subtitle: params.description,
      heroContent: response.substring(0, 500),
      sections: [
        { title: 'Accueil', content: response.substring(0, 300) }
      ],
      metaDescription: params.description.substring(0, 160),
      keywords: ['entreprise', 'services', 'qualité']
    }
  }
}

// ============================================
// EXPORT : Générer des mots-clés SEO
// ============================================

export async function generateSEOKeywords(content: string): Promise<string[]> {
  const prompt = `Analyse ce texte et génère 10 mots-clés SEO pertinents en français.

Texte : "${content}"

Réponds uniquement avec les mots-clés séparés par des virgules.`

  const response = await callGemini(prompt)
  
  return response
    .split(',')
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 2 && k.length < 30)
    .slice(0, 10)
}

// ============================================
// EXPORT : Générer du LD-JSON
// ============================================

export async function generateLDJson(companyData: {
  name: string
  description?: string
  address?: string
  city?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
}): Promise<string> {
  const ldJson = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": companyData.name,
    "description": companyData.description || '',
    "address": {
      "@type": "PostalAddress",
      "streetAddress": companyData.address || '',
      "addressLocality": companyData.city || '',
      "postalCode": companyData.postalCode || ''
    },
    "telephone": companyData.phone || '',
    "email": companyData.email || '',
    "url": companyData.website || ''
  }
  
  return JSON.stringify(ldJson, null, 2)
}

// ============================================
// EXPORT : Analyser les patterns
// ============================================

export async function analyzePatterns(data: any[]): Promise<string> {
  const prompt = `Analyse ces données et trouve des patterns intéressants pour une PME :

 ${JSON.stringify(data.slice(0, 10), null, 2)}

Donne 3 insights clés en français.`

  return callGemini(prompt)
}

// ============================================
// EXPORT : Tester la connexion
// ============================================

export async function testConnection(): Promise<{
  success: boolean
  message: string
  model?: string
  hasApiKey: boolean
}> {
  const hasApiKey = !!GEMINI_API_KEY
  
  if (!hasApiKey) {
    return {
      success: true,
      message: 'Mode démo actif - Clé API Gemini non configurée',
      hasApiKey: false
    }
  }

  try {
    const response = await callGemini('Dis juste "OK".')
    
    if (response) {
      return {
        success: true,
        message: 'Connexion à Gemini réussie !',
        model: GEMINI_MODEL,
        hasApiKey: true
      }
    }
    
    return {
      success: false,
      message: 'Pas de réponse de Gemini',
      hasApiKey: true
    }
  } catch (error) {
    return {
      success: false,
      message: `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
      hasApiKey: true
    }
  }
}