# 📚 Cours 5 : Intégration de l'IA Locale
## z-ai-web-dev-sdk et Génération de Code Intelligente

---

## 🎯 Objectifs d'Apprentissage

À la fin de ce cours, vous comprendrez :
- L'architecture de l'IA locale dans v3zai
- Comment intégrer le SDK z-ai-web-dev-sdk
- Les prompts engineering pour la génération de code
- La gestion du contexte et de la mémoire
- L'optimisation des performances IA

---

## 🤖 Qu'est-ce que l'IA Locale ?

**IA Locale** = Modèle d'intelligence artificielle qui **s'exécute sur votre serveur**, sans appel à des APIs cloud (OpenAI, Anthropic, etc.)

### Avantages vs Cloud AI

| Critère | IA Locale | Cloud AI (GPT-4, Claude) |
|---------|-----------|--------------------------|
| **Coût** | Gratuit après achat | Par token (~$0.01-0.10/1K) |
| **Latence** | Faible (local) | Variable (réseau) |
| **Privacy** | Totale | Données envoyées au cloud |
| **Disponibilité** | 100% (offline) | Dépend de l'API |
| **Personnalisation** | Fine-tuning possible | Limitée |
| **Performance** | Modèle plus petit | État de l'art |

---

## 📦 Le SDK z-ai-web-dev-sdk

### Installation

```bash
# Installer le SDK (exemple fictif - adapter selon le vrai SDK)
bun add z-ai-web-dev-sdk

# Télécharger le modèle (si nécessaire)
bun run download-ai-model
```

### Configuration

```typescript
// src/lib/ai.ts

import { ZAIClient } from 'z-ai-web-dev-sdk'
import fs from 'fs'
import path from 'path'

// ══════════════════════════════════════════════════════════
// 1. INITIALISATION DU CLIENT IA
// ══════════════════════════════════════════════════════════

const aiClient = new ZAIClient({
  // 🧠 Chemin vers le modèle (téléchargé localement)
  modelPath: path.join(process.cwd(), 'models', 'z-ai-web-dev.gguf'),
  
  // ⚙️ Paramètres du modèle
  config: {
    temperature: 0.7,      // Créativité (0 = déterministe, 1 = créatif)
    maxTokens: 4096,       // Longueur max de réponse
    topP: 0.9,             // Nucleus sampling
    topK: 40,              // Limite des tokens considérés
    repeatPenalty: 1.1,    // Pénalité pour répétitions
    contextSize: 8192      // Taille de contexte (mémoire)
  },
  
  // 🚀 Options de performance
  performance: {
    threads: 4,            // Threads CPU
    gpu: true,             // Utiliser GPU si disponible
    batchSize: 512,        // Tokens traités en parallèle
    mlock: true            // Garder modèle en RAM (ne pas swap)
  }
})

// ══════════════════════════════════════════════════════════
// 2. SYSTÈME DE PROMPTS
// ══════════════════════════════════════════════════════════

const SYSTEM_PROMPTS = {
  webDev: `Tu es un expert développeur web spécialisé dans Next.js, React, et Tailwind CSS.
Tu génères du code propre, type-safe, et suivant les best practices.
Tu utilises UNIQUEMENT les composants Shadcn/ui disponibles.
Tu commentes ton code de manière claire et concise.`,

  seo: `Tu es un expert SEO. Tu analyses les pages web et fournis des recommandations
pour améliorer le référencement naturel. Tu génères des métadonnées optimisées
et du contenu structuré (LD-JSON).`,

  design: `Tu es un designer UI/UX. Tu crées des interfaces modernes, accessibles,
et responsive. Tu utilises les principes de design moderne et les bonnes pratiques
d'accessibilité (WCAG AA).`
}

// ══════════════════════════════════════════════════════════
// 3. FONCTIONS HELPER
// ══════════════════════════════════════════════════════════

/**
 * Chat simple avec l'IA
 */
export async function aiChat(options: {
  messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }>
  temperature?: number
  maxTokens?: number
}) {
  const response = await aiClient.chat({
    messages: options.messages,
    temperature: options.temperature || 0.7,
    maxTokens: options.maxTokens || 2048
  })
  
  return {
    content: response.choices[0].message.content,
    tokensUsed: response.usage.totalTokens,
    finishReason: response.choices[0].finishReason
  }
}

/**
 * Génération de composant React
 */
export async function generateComponent(spec: {
  name: string
  description: string
  props?: string[]
  styling?: 'tailwind' | 'css'
}): Promise<string> {
  const prompt = `Génère un composant React avec ces spécifications :

Nom: ${spec.name}
Description: ${spec.description}
Props: ${spec.props?.join(', ') || 'Aucune'}
Styling: ${spec.styling || 'tailwind'}

RÈGLES :
- Utilise TypeScript avec types stricts
- Utilise 'use client' si nécessaire (interactivité)
- Utilise Tailwind pour le style (pas de CSS inline)
- Utilise les composants Shadcn/ui quand approprié
- Documente les props avec JSDoc
- Rends le composant accessible (ARIA labels)

RETOURNE UNIQUEMENT LE CODE, sans markdown ni explication.`

  const response = await aiClient.chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.webDev },
      { role: 'user', content: prompt }
    ],
    temperature: 0.5,  // Moins de créativité pour code
    maxTokens: 3000
  })
  
  return response.choices[0].message.content
}

/**
 * Génération de page complète
 */
export async function generatePage(spec: {
  title: string
  description: string
  sections: string[]
  style: 'modern' | 'minimal' | 'corporate'
}): Promise<{
  code: string
  metadata: {
    title: string
    description: string
    keywords: string[]
  }
}> {
  const prompt = `Génère une page Next.js complète avec :

Titre: ${spec.title}
Description: ${spec.description}
Sections: ${spec.sections.join(', ')}
Style: ${spec.style}

STRUCTURE :
- Utilise Next.js 15 App Router (Server Component si possible)
- Inclus les métadonnées SEO (export metadata)
- Utilise des sections sémantiques (<section>, <article>, etc.)
- Design responsive (mobile-first)
- Accessibilité WCAG AA

RETOURNE au format JSON :
{
  "code": "le code de la page",
  "metadata": {
    "title": "...",
    "description": "...",
    "keywords": ["..."]
  }
}`

  const response = await aiClient.chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.webDev },
      { role: 'user', content: prompt }
    ],
    temperature: 0.6,
    maxTokens: 4096
  })
  
  // Parser la réponse JSON
  const content = response.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('Réponse invalide de l\'IA')
  }
  
  return JSON.parse(jsonMatch[0])
}

/**
 * Analyse SEO d'une page
 */
export async function analyzeSEO(html: string): Promise<{
  score: number
  issues: Array<{ severity: 'error' | 'warning', message: string }>
  suggestions: string[]
}> {
  const prompt = `Analyse cette page HTML pour le SEO :

\`\`\`html
${html}
\`\`\`

ANALYSE :
1. Présence de balises meta (title, description)
2. Structure des headings (H1, H2, etc.)
3. Alt text sur les images
4. Ratio texte/HTML
5. Mobile-friendliness
6. Performance (taille, ressources)

RETOURNE au format JSON :
{
  "score": 0-100,
  "issues": [
    { "severity": "error" | "warning", "message": "..." }
  ],
  "suggestions": ["..."]
}`

  const response = await aiClient.chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.seo },
      { role: 'user', content: prompt }
    ],
    temperature: 0.3,  // Très déterministe pour analyse
    maxTokens: 2048
  })
  
  const content = response.choices[0].message.content
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  
  if (!jsonMatch) {
    throw new Error('Réponse invalide')
  }
  
  return JSON.parse(jsonMatch[0])
}

/**
 * Génération LD-JSON pour SEO
 */
export async function generateLDJSON(data: {
  type: 'LocalBusiness' | 'Article' | 'Product' | 'Organization'
  content: Record<string, any>
}): Promise<string> {
  const prompt = `Génère un schéma LD-JSON pour :

Type: ${data.type}
Données: ${JSON.stringify(data.content, null, 2)}

RÈGLES :
- Utilise schema.org
- Inclus toutes les propriétés obligatoires
- Optimise pour Google Rich Snippets

RETOURNE uniquement le JSON, sans markdown.`

  const response = await aiClient.chat({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.seo },
      { role: 'user', content: prompt }
    ],
    temperature: 0.2,
    maxTokens: 1024
  })
  
  return response.choices[0].message.content
}

// ══════════════════════════════════════════════════════════
// 4. GESTION DU CONTEXTE (Mémoire conversationnelle)
// ══════════════════════════════════════════════════════════

interface ConversationContext {
  sessionId: string
  messages: Array<{ role: string, content: string }>
  metadata: {
    projectType?: string
    techStack?: string[]
    userPreferences?: Record<string, any>
  }
}

const conversations = new Map<string, ConversationContext>()

/**
 * Créer une nouvelle conversation
 */
export function createConversation(sessionId: string, metadata?: any): void {
  conversations.set(sessionId, {
    sessionId,
    messages: [],
    metadata: metadata || {}
  })
}

/**
 * Chat avec contexte (mémoire)
 */
export async function chatWithContext(
  sessionId: string,
  userMessage: string
): Promise<string> {
  const context = conversations.get(sessionId)
  
  if (!context) {
    throw new Error('Session introuvable')
  }
  
  // Ajouter le message utilisateur
  context.messages.push({
    role: 'user',
    content: userMessage
  })
  
  // Construire le prompt avec contexte
  const systemPrompt = `${SYSTEM_PROMPTS.webDev}

CONTEXTE DU PROJET :
${JSON.stringify(context.metadata, null, 2)}

HISTORIQUE DE CONVERSATION :
${context.messages.slice(-5).map(m => `${m.role}: ${m.content}`).join('\n')}`

  const response = await aiClient.chat({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.7,
    maxTokens: 2048
  })
  
  const assistantMessage = response.choices[0].message.content
  
  // Ajouter la réponse à l'historique
  context.messages.push({
    role: 'assistant',
    content: assistantMessage
  })
  
  // Limiter l'historique (économiser tokens)
  if (context.messages.length > 20) {
    context.messages = context.messages.slice(-20)
  }
  
  return assistantMessage
}

/**
 * Effacer une conversation
 */
export function clearConversation(sessionId: string): void {
  conversations.delete(sessionId)
}

// ══════════════════════════════════════════════════════════
// 5. STREAMING (Réponses progressives)
// ══════════════════════════════════════════════════════════

export async function* streamChat(
  prompt: string
): AsyncGenerator<string, void, unknown> {
  const stream = await aiClient.chatStream({
    messages: [
      { role: 'system', content: SYSTEM_PROMPTS.webDev },
      { role: 'user', content: prompt }
    ],
    temperature: 0.7
  })
  
  for await (const chunk of stream) {
    if (chunk.choices[0]?.delta?.content) {
      yield chunk.choices[0].delta.content
    }
  }
}
```

---

## 💬 Utilisation dans l'Application

### Endpoint API Chat

```typescript
// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { chatWithContext, createConversation } from '@/lib/ai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, isNew } = await request.json()
    
    // Créer nouvelle conversation si nécessaire
    if (isNew) {
      // Récupérer les préférences utilisateur de la BDD
      const userPrefs = await prisma.userPreference.findUnique({
        where: { userId: sessionId }
      })
      
      createConversation(sessionId, {
        projectType: userPrefs?.projectType,
        techStack: userPrefs?.techStack || ['Next.js', 'React', 'Tailwind']
      })
    }
    
    // Envoyer le message à l'IA avec contexte
    const response = await chatWithContext(sessionId, message)
    
    // Sauvegarder en BDD (pour historique)
    await prisma.chatMessage.createMany({
      data: [
        {
          sessionId,
          role: 'user',
          content: message
        },
        {
          sessionId,
          role: 'assistant',
          content: response
        }
      ]
    })
    
    return NextResponse.json({
      success: true,
      response
    })
    
  } catch (error) {
    console.error('[AI Chat] Error:', error)
    return NextResponse.json(
      { error: 'Erreur lors du traitement' },
      { status: 500 }
    )
  }
}
```

### Composant Chat Interface

```typescript
// src/components/ChatInterface.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function ChatInterface({ sessionId }: { sessionId: string }) {
  const [messages, setMessages] = useState<Array<{
    role: 'user' | 'assistant'
    content: string
  }>>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const sendMessage = async () => {
    if (!input.trim()) return
    
    setLoading(true)
    
    // Ajouter message utilisateur à l'UI
    const userMessage = { role: 'user' as const, content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    
    try {
      // Appeler l'API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: input,
          isNew: messages.length === 0
        })
      })
      
      const data = await response.json()
      
      // Ajouter réponse IA à l'UI
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response }
      ])
      
    } catch (error) {
      console.error('Erreur:', error)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-4 rounded-lg ${
              msg.role === 'user'
                ? 'bg-blue-100 ml-auto max-w-[80%]'
                : 'bg-gray-100 mr-auto max-w-[80%]'
            }`}
          >
            <p className="text-sm font-semibold mb-1">
              {msg.role === 'user' ? 'Vous' : 'IA'}
            </p>
            <p className="whitespace-pre-wrap">{msg.content}</p>
          </div>
        ))}
        
        {loading && (
          <div className="bg-gray-100 p-4 rounded-lg mr-auto max-w-[80%]">
            <p className="text-sm">L'IA réfléchit...</p>
          </div>
        )}
      </div>
      
      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Posez votre question..."
          disabled={loading}
        />
        <Button onClick={sendMessage} disabled={loading}>
          Envoyer
        </Button>
      </div>
    </div>
  )
}
```

---

## 🎨 Génération de Code Avancée

### Workflow Complet

```typescript
// src/app/api/generate/page/route.ts

import { generatePage, generateLDJSON } from '@/lib/ai'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  const { userId, specification } = await request.json()
  
  // 1. Générer la page avec l'IA
  const { code, metadata } = await generatePage({
    title: specification.title,
    description: specification.description,
    sections: specification.sections,
    style: specification.style || 'modern'
  })
  
  // 2. Générer le LD-JSON SEO
  const ldJson = await generateLDJSON({
    type: 'Organization',
    content: {
      name: specification.businessName,
      description: specification.description,
      url: specification.url
    }
  })
  
  // 3. Sauvegarder en BDD
  const page = await prisma.generatedPage.create({
    data: {
      userId,
      title: metadata.title,
      description: metadata.description,
      code,
      ldJson,
      metadata: {
        keywords: metadata.keywords,
        sections: specification.sections
      }
    }
  })
  
  // 4. Optionnel : Déployer automatiquement
  // await deployPage(page.id)
  
  return NextResponse.json({
    success: true,
    pageId: page.id,
    preview: `/preview/${page.id}`
  })
}
```

---

## ⚡ Optimisation des Performances

### 1. Cache des Réponses

```typescript
import { LRUCache } from 'lru-cache'

const responseCache = new LRUCache<string, string>({
  max: 100,  // 100 réponses en cache
  ttl: 1000 * 60 * 60  // 1 heure
})

export async function cachedAiChat(prompt: string): Promise<string> {
  // Vérifier le cache
  const cached = responseCache.get(prompt)
  if (cached) return cached
  
  // Sinon, appeler l'IA
  const response = await aiChat({
    messages: [{ role: 'user', content: prompt }]
  })
  
  // Mettre en cache
  responseCache.set(prompt, response.content)
  
  return response.content
}
```

### 2. Queue de Traitement

```typescript
// Pour éviter de surcharger le CPU

import Queue from 'bull'

const aiQueue = new Queue('ai-generation', {
  redis: process.env.REDIS_URL
})

// Traiter les jobs
aiQueue.process(async (job) => {
  const { prompt, userId } = job.data
  
  const response = await aiChat({
    messages: [{ role: 'user', content: prompt }]
  })
  
  // Notifier l'utilisateur (WebSocket, email, etc.)
  await notifyUser(userId, response.content)
})

// Ajouter un job
export function queueAiGeneration(prompt: string, userId: string) {
  return aiQueue.add({
    prompt,
    userId
  }, {
    attempts: 3,  // Retry 3 fois si échec
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  })
}
```

### 3. Monitoring des Temps de Réponse

```typescript
export async function monitoredAiChat(prompt: string) {
  const startTime = Date.now()
  
  try {
    const response = await aiChat({
      messages: [{ role: 'user', content: prompt }]
    })
    
    const duration = Date.now() - startTime
    
    // Logger les métriques
    await prisma.aiMetric.create({
      data: {
        endpoint: 'chat',
        duration,
        tokensUsed: response.tokensUsed,
        success: true
      }
    })
    
    return response
    
  } catch (error) {
    const duration = Date.now() - startTime
    
    await prisma.aiMetric.create({
      data: {
        endpoint: 'chat',
        duration,
        success: false,
        error: error.message
      }
    })
    
    throw error
  }
}
```

---

## 🧪 Tests de l'IA

### Tests Unitaires

```typescript
// __tests__/ai.test.ts

import { generateComponent, analyzeSEO } from '@/lib/ai'

describe('IA Génération', () => {
  it('génère un composant React valide', async () => {
    const code = await generateComponent({
      name: 'TestButton',
      description: 'Un bouton simple',
      props: ['onClick', 'children']
    })
    
    // Vérifier que c'est du code valide
    expect(code).toContain('export')
    expect(code).toContain('TestButton')
    expect(code).toContain('onClick')
  })
  
  it('analyse SEO correctement', async () => {
    const html = '<html><head><title>Test</title></head><body></body></html>'
    
    const analysis = await analyzeSEO(html)
    
    expect(analysis.score).toBeGreaterThan(0)
    expect(analysis.score).toBeLessThanOrEqual(100)
    expect(Array.isArray(analysis.issues)).toBe(true)
  })
})
```

---

## 🎯 Points Clés à Retenir

1. **IA Locale** = Privacy + Cost savings + Offline
2. **Prompts Engineering** = Clé pour qualité du code généré
3. **Contexte conversationnel** = Améliore cohérence
4. **Cache + Queue** = Optimisation performance
5. **Monitoring** = Essentiel pour détecter problèmes

---

## 📚 Ressources Complémentaires

- [Prompt Engineering Guide](https://www.promptingguide.ai/)
- [LangChain Documentation](https://python.langchain.com/)
- [GGUF Model Format](https://github.com/ggerganov/ggml)

---

**🎓 Fin du Cours 5**

Vous maîtrisez l'intégration de l'IA locale ! Un dernier cours sur le déploiement ?
