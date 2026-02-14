// src/lib/gemini.ts - Client Google Gemini API
import { GoogleGenerativeAI } from '@google/generative-ai'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-pro'

export interface Message {
  role: 'user' | 'model'
  parts: string
}

export interface ChatOptions {
  messages: Array<{ role: 'user' | 'assistant' | 'system', content: string }>
  temperature?: number
}

class GeminiClient {
  private genAI: GoogleGenerativeAI | null = null
  private model: any = null

  constructor() {
    if (GEMINI_API_KEY) {
      this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
      this.model = this.genAI.getGenerativeModel({ model: GEMINI_MODEL })
    }
  }

  isAvailable(): boolean {
    return !!this.genAI && !!GEMINI_API_KEY
  }

  async chat(options: ChatOptions): Promise<string> {
    if (!this.model) {
      throw new Error('Gemini non configuré. Vérifiez GEMINI_API_KEY')
    }

    try {
      const history = this.formatMessages(options.messages)
      
      const chat = this.model.startChat({
        history: history.slice(0, -1),
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: 2048,
        },
      })

      const lastMessage = history[history.length - 1]
      const result = await chat.sendMessage(lastMessage.parts)
      const response = await result.response
      
      return response.text()
    } catch (error: any) {
      console.error('Erreur Gemini:', error)
      throw new Error(`Gemini error: ${error.message}`)
    }
  }

  private formatMessages(
    messages: Array<{ role: string; content: string }>
  ): Array<{ role: 'user' | 'model'; parts: string }> {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => ({
        role: msg.role === 'assistant' ? 'model' as const : 'user' as const,
        parts: msg.content
      }))
  }
}

export const gemini = new GeminiClient()

export const SYSTEM_PROMPTS = {
  generationSite: `Tu es un expert développeur web et designer UX/UI spécialisé dans la création de sites web pour PME/PMI.

RÔLE:
- Poser des questions pertinentes pour comprendre les besoins
- Proposer des solutions adaptées au contexte métier
- Générer du code HTML/CSS moderne et responsive
- Assurer l'accessibilité (WCAG AA)
- Optimiser pour le SEO`,

  gestionCatalogue: `Tu es un assistant spécialisé dans la gestion de catalogue produits/services pour PME/PMI.

RÔLE:
- Aider à importer des données produits depuis différents formats
- Structurer les informations de manière cohérente
- Suggérer des améliorations (descriptions, catégorisation)
- Détecter les incohérences (prix, stock)`,

  analyse: `Tu es un analyste business spécialisé dans l'optimisation commerciale pour PME/PMI.

RÔLE:
- Analyser les données de ventes et interactions
- Détecter des patterns et tendances
- Proposer des recommandations actionnables
- Prioriser les actions selon l'impact`
}
