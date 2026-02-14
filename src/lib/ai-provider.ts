// src/lib/ai-provider.ts
// Détecte automatiquement quel provider IA utiliser (Ollama ou Gemini)

/**
 * Détecte le provider IA disponible
 * Vérifie d'abord Gemini (cloud), puis Ollama (local)
 */
export async function detectAIProvider(): Promise<'gemini' | 'ollama' | null> {
  // 1. Vérifier si Gemini est configuré
  if (process.env.GEMINI_API_KEY) {
    return 'gemini'
  }
  
  // 2. Vérifier si Ollama est accessible (développement local)
  if (typeof window === 'undefined') { // Côté serveur uniquement
    try {
      const ollamaUrl = process.env.OLLAMA_API_URL || 'http://localhost:11434'
      const response = await fetch(`${ollamaUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000) // Timeout 2s
      })
      
      if (response.ok) {
        return 'ollama'
      }
    } catch (error) {
      // Ollama non accessible
    }
  }
  
  return null
}

/**
 * Retourne l'endpoint API à utiliser pour le chat
 */
export function getAIChatEndpoint(): string {
  // En production (Render), utiliser Gemini
  if (process.env.NODE_ENV === 'production') {
    return '/api/gemini/chat'
  }
  
  // En développement, détecter automatiquement
  // Par défaut Gemini si la clé est présente
  if (process.env.NEXT_PUBLIC_GEMINI_AVAILABLE === 'true') {
    return '/api/gemini/chat'
  }
  
  return '/api/ollama/chat'
}

/**
 * Vérifie si un provider IA est disponible
 */
export async function checkAIAvailability(): Promise<{
  available: boolean
  provider: 'gemini' | 'ollama' | null
  message: string
}> {
  const provider = await detectAIProvider()
  
  if (!provider) {
    return {
      available: false,
      provider: null,
      message: 'Aucun provider IA configuré. Configurez GEMINI_API_KEY ou lancez Ollama.'
    }
  }
  
  return {
    available: true,
    provider,
    message: provider === 'gemini' 
      ? 'Gemini API configurée' 
      : 'Ollama accessible localement'
  }
}
