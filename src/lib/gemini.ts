// src/lib/gemini.ts
// Client pour Google Gemini API (remplace Ollama pour déploiement cloud)

import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'

export interface Message {
  role: 'user' | 'model'  // Gemini utilise 'model' au lieu de 'assistant'
  parts: string
}

export interface ChatOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>
  temperature?: number
  context?: string
}

/**
 * Client Gemini pour dialoguer avec l'IA cloud
 */
class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      this.model = this.genAI.getGenerativeModel({ model: GEMINI_MODEL })
    } else {
      console.warn('⚠️ GEMINI_API_KEY non définie')
    }
  }

  /**
   * Vérifie si Gemini est configuré
   */
  isAvailable(): boolean {
    return !!this.genAI && !!GEMINI_API_KEY
  }

  /**
   * Chat avec Gemini (non-streaming)
   */
  async chat(options: ChatOptions): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini non configuré. Vérifiez GEMINI_API_KEY')
    }

    try {
      // Convertir le format des messages pour Gemini
      const history = this.formatMessages(options.messages)
      
      // Créer une session de chat
      const chat = this.model.startChat({
        history: history.slice(0, -1), // Tous sauf le dernier
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: parseInt(process.env.AI_MAX_TOKENS || '2048'),
        },
      })

      // Envoyer le dernier message
      const lastMessage = history[history.length - 1]
      const result = await chat.sendMessage(lastMessage.parts)
      const response = await result.response
      
      return response.text()
    } catch (error: any) {
      console.error('Erreur Gemini:', error)
      throw new Error(`Gemini error: ${error.message}`)
    }
  }

  /**
   * Chat avec streaming (réponse progressive)
   */
  async *chatStream(options: ChatOptions): AsyncGenerator<string> {
    if (!this.model) {
      throw new Error('Gemini non configuré')
    }

    try {
      const history = this.formatMessages(options.messages)
      
      const chat = this.model.startChat({
        history: history.slice(0, -1),
        generationConfig: {
          temperature: options.temperature || 0.7,
        },
      })

      const lastMessage = history[history.length - 1]
      const result = await chat.sendMessageStream(lastMessage.parts)

      for await (const chunk of result.stream) {
        const text = chunk.text()
        if (text) {
          yield text
        }
      }
    } catch (error: any) {
      console.error('Erreur Gemini stream:', error)
      throw error
    }
  }

  /**
   * Génère une complétion simple
   */
  async generate(prompt: string, temperature: number = 0.7): Promise<string> {
    return this.chat({
      messages: [
        { role: 'user', content: prompt }
      ],
      temperature
    })
  }

  /**
   * Convertit les messages au format Gemini
   */
  private formatMessages(
    messages: Array<{ role: string; content: string }>
  ): Array<{ role: 'user' | 'model'; parts: string }> {
    return messages
      .filter(msg => msg.role !== 'system') // Gemini n'a pas de role 'system' dans l'historique
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: msg.content
      }))
  }
}

// Export singleton
export const gemini = new GeminiClient()

/**
 * Prompts système pour différents contextes
 * (Identiques à ollama.ts pour compatibilité)
 */
export const SYSTEM_PROMPTS = {
  generationSite: `Tu es un expert développeur web et designer UX/UI spécialisé dans la création de sites web pour PME/PMI.

RÔLE:
- Poser des questions pertinentes pour comprendre les besoins
- Proposer des solutions adaptées au contexte métier
- Générer du code HTML/CSS moderne et responsive
- Assurer l'accessibilité (WCAG AA)
- Optimiser pour le SEO

STYLE DE RÉPONSE:
- Professionnel mais accessible
- Questions claires et concises
- Suggestions constructives
- Exemples concrets

CONTRAINTES:
- Code vanilla (HTML5, CSS3, JavaScript moderne)
- Mobile-first responsive design
- Performance optimale
- Sécurité (pas de failles XSS, injection)`,

  gestionCatalogue: `Tu es un assistant spécialisé dans la gestion de catalogue produits/services pour PME/PMI.

RÔLE:
- Aider à importer des données produits depuis différents formats
- Structurer les informations de manière cohérente
- Suggérer des améliorations (descriptions, catégorisation)
- Détecter les incohérences (prix, stock)

STYLE DE RÉPONSE:
- Guidant et pédagogique
- Suggestions d'amélioration proactives
- Validation des données saisies

CONTRAINTES:
- Respecter la structure de données existante
- Valider les prix (positifs, cohérents)
- Vérifier les stocks (alertes si bas)`,

  analyse: `Tu es un analyste business spécialisé dans l'optimisation commerciale pour PME/PMI.

RÔLE:
- Analyser les données de ventes et interactions
- Détecter des patterns et tendances
- Proposer des recommandations actionnables
- Prioriser les actions selon l'impact

STYLE DE RÉPONSE:
- Analytique mais accessible
- Chiffres et exemples concrets
- Recommandations claires avec justification

CAPACITÉS:
- Analyse de sentiment (emails clients)
- Détection de produits populaires/en déclin
- Recommandations de stock
- Optimisations UX site web`,

  reponseEmail: `Tu es un assistant qui aide à rédiger des réponses professionnelles aux emails clients.

RÔLE:
- Comprendre la demande du client
- Proposer une réponse adaptée et professionnelle
- Ton courtois et empathique
- Appeler à l'action si nécessaire

STYLE:
- Poli et professionnel
- Empathique face aux problèmes
- Clair et concis

CONTRAINTES:
- Toujours proposer un brouillon (validation humaine requise)
- Inclure coordonnées de contact
- S'adapter au ton du client`
}

/**
 * Helper pour formater les conversations
 */
export function formatConversationHistory(
  messages: Array<{ role: string; content: string }>,
  maxMessages: number = 10
): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> {
  const recent = messages.slice(-maxMessages)
  
  return recent.map(msg => ({
    role: msg.role as 'user' | 'assistant' | 'system',
    content: msg.content
  }))
}

/**
 * Extrait du JSON depuis une réponse textuelle
 */
export function extractJSON(text: string): any | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    return null
  }
}
