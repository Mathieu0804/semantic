// src/lib/ollama.ts
// Client pour communiquer avec Ollama (IA locale type Llama3)

const OLLAMA_API_URL = process.env.OLLAMA_API_URL || 'http://localhost:11434'
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3'

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatOptions {
  messages: Message[]
  temperature?: number
  stream?: boolean
  context?: string
}

export interface ChatResponse {
  message: {
    role: string
    content: string
  }
  done: boolean
  total_duration?: number
  load_duration?: number
  prompt_eval_count?: number
  eval_count?: number
}

/**
 * Client Ollama pour dialoguer avec l'IA locale
 */
class OllamaClient {
  private baseUrl: string
  private model: string

  constructor() {
    this.baseUrl = OLLAMA_API_URL
    this.model = OLLAMA_MODEL
  }

  /**
   * Vérifie si Ollama est accessible
   */
  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET'
      })
      return response.ok
    } catch (error) {
      console.error('Ollama non accessible:', error)
      return false
    }
  }

  /**
   * Liste les modèles disponibles
   */
  async listModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`)
      const data = await response.json()
      return data.models?.map((m: any) => m.name) || []
    } catch (error) {
      console.error('Erreur listage modèles:', error)
      return []
    }
  }

  /**
   * Chat avec l'IA (non-streaming)
   */
  async chat(options: ChatOptions): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: options.messages,
          stream: false,
          options: {
            temperature: options.temperature || 0.7,
            num_predict: parseInt(process.env.AI_MAX_TOKENS || '2048')
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`)
      }

      const data: ChatResponse = await response.json()
      return data.message.content
    } catch (error) {
      console.error('Erreur chat Ollama:', error)
      throw error
    }
  }

  /**
   * Chat avec streaming (réponse progressive)
   */
  async *chatStream(options: ChatOptions): AsyncGenerator<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: options.messages,
          stream: true,
          options: {
            temperature: options.temperature || 0.7
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Ollama error: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())

        for (const line of lines) {
          try {
            const data: ChatResponse = JSON.parse(line)
            if (data.message?.content) {
              yield data.message.content
            }
          } catch (e) {
            // Ignorer les lignes mal formées
          }
        }
      }
    } catch (error) {
      console.error('Erreur chat stream:', error)
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
}

// Export singleton
export const ollama = new OllamaClient()

/**
 * Prompts système pour différents contextes
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
): Message[] {
  // Garder seulement les N derniers messages pour économiser les tokens
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
    // Chercher un bloc JSON dans la réponse
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }
    return null
  } catch (error) {
    return null
  }
}
