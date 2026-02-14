# 📚 Cours 4 : Serveur MCP - Communication Inter-IA
## Model Context Protocol et Architecture d'Agent IA

---

## 🎯 Objectifs d'Apprentissage

À la fin de ce cours, vous comprendrez :
- Ce qu'est le Model Context Protocol (MCP)
- L'architecture du serveur MCP dans v3zai
- Comment les IA externes dialoguent avec l'IA locale
- La gestion des sessions et l'authentification
- Les cas d'usage concrets du MCP

---

## 🤖 Qu'est-ce que le MCP ?

**MCP (Model Context Protocol)** est un protocole qui permet à des **IA externes** (comme Claude, GPT-4, etc.) de dialoguer avec votre **IA locale**.

### Analogie Simple

Imaginez que votre IA locale est un **employé expert** dans votre entreprise :

```
┌──────────────────────────────────────────────────────────┐
│  IA EXTERNE (Claude, GPT-4, etc.)                        │
│  "Je suis un assistant qui aide l'utilisateur"           │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ MCP Request
                 │ "Peux-tu générer un design de homepage ?"
                 │
┌────────────────▼─────────────────────────────────────────┐
│  SERVEUR MCP (v3zai)                                     │
│  "Je gère les demandes et vérifie l'authentification"   │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Transmet à
                 │
┌────────────────▼─────────────────────────────────────────┐
│  IA LOCALE (z-ai-web-dev-sdk)                            │
│  "Je suis l'expert en création de sites web"            │
│  → Génère le code HTML/CSS/JS                            │
└────────────────┬─────────────────────────────────────────┘
                 │
                 │ Résultat
                 │
┌────────────────▼─────────────────────────────────────────┐
│  UTILISATEUR                                             │
│  Reçoit le code généré par l'IA locale                   │
└──────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture du Serveur MCP

### Structure des Fichiers

```
src/
└── app/
    └── api/
        └── mcp/
            └── route.ts    # Endpoint principal du serveur MCP
```

### Le Flux Complet

```
┌─────────────────────────────────────────────────────────────┐
│ 1. IA EXTERNE envoie une requête                            │
│    POST https://v3zai.com/api/mcp?action=connect            │
│    Body: { clientName: "Claude", clientType: "assistant" }  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. SERVEUR MCP vérifie et authentifie                       │
│    - Génère un token de session                             │
│    - Enregistre la session en BDD                           │
│    - Retourne le token + sessionId                          │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 3. IA EXTERNE utilise le token pour envoyer des requêtes    │
│    POST https://v3zai.com/api/mcp?action=request            │
│    Headers: { Authorization: "Bearer TOKEN" }               │
│    Body: { endpoint: "chat", payload: { message: "..." } }  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 4. SERVEUR MCP transmet à l'IA LOCALE                       │
│    - Valide le token                                        │
│    - Route vers le bon endpoint (chat, generate, analyze)   │
│    - IA locale traite la demande                            │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. RETOUR de la réponse à l'IA EXTERNE                      │
│    Response: { success: true, data: { ... } }               │
└─────────────────────────────────────────────────────────────┘
```

---

## 💻 Code du Serveur MCP

### Structure du Fichier `route.ts`

```typescript
// src/app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import crypto from 'crypto'
import { z } from 'zod'

// ════════════════════════════════════════════════════════════
// 1. SCHÉMAS DE VALIDATION
// ════════════════════════════════════════════════════════════

const connectSchema = z.object({
  clientName: z.string().min(1).max(100),
  clientType: z.enum(['assistant', 'agent', 'tool']),
  metadata: z.record(z.any()).optional()
})

const requestSchema = z.object({
  token: z.string().length(64),  // SHA256 = 64 caractères hex
  endpoint: z.enum(['chat', 'generate', 'analyze']),
  payload: z.record(z.any())
})

// ════════════════════════════════════════════════════════════
// 2. UTILITAIRES
// ════════════════════════════════════════════════════════════

/**
 * Génère un token sécurisé
 */
function generateToken(): string {
  // 🔐 Génère 32 bytes aléatoires → hash SHA256
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash un token avec SHA256
 */
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Vérifie la validité d'un token
 */
async function verifyToken(token: string): Promise<boolean> {
  const hashedToken = hashToken(token)
  
  const session = await prisma.mcpSession.findUnique({
    where: { token: hashedToken }
  })
  
  if (!session) return false
  
  // ⏰ Vérifier l'expiration (ex: 1 heure)
  const now = new Date()
  const expiresAt = new Date(session.createdAt)
  expiresAt.setHours(expiresAt.getHours() + 1)
  
  return now < expiresAt
}

// ════════════════════════════════════════════════════════════
// 3. HANDLER GET - Statut du serveur
// ════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'online',
    version: '1.0.0',
    endpoints: ['connect', 'request', 'disconnect']
  })
}

// ════════════════════════════════════════════════════════════
// 4. HANDLER POST - Actions MCP
// ════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    // 🔍 Récupérer le paramètre action
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    // ══════════════════════════════════════════════════════════
    // ACTION: connect - Créer une nouvelle session
    // ══════════════════════════════════════════════════════════
    if (action === 'connect') {
      const body = await request.json()
      
      // ✅ Valider les données
      const validatedData = connectSchema.parse(body)
      
      // 🔐 Générer un token unique
      const token = generateToken()
      const hashedToken = hashToken(token)
      
      // 💾 Créer la session en BDD
      const session = await prisma.mcpSession.create({
        data: {
          token: hashedToken,
          clientName: validatedData.clientName,
          clientType: validatedData.clientType,
          metadata: validatedData.metadata || {},
          active: true
        }
      })
      
      // 📊 Logger la connexion
      console.log(`[MCP] New connection: ${validatedData.clientName}`)
      
      // 📤 Retourner le token (NON hashé) au client
      return NextResponse.json({
        success: true,
        token,  // ⚠️ Le client garde ce token secret
        sessionId: session.id,
        expiresIn: 3600  // 1 heure en secondes
      })
    }
    
    // ══════════════════════════════════════════════════════════
    // ACTION: request - Envoyer une requête à l'IA locale
    // ══════════════════════════════════════════════════════════
    if (action === 'request') {
      const body = await request.json()
      
      // ✅ Valider
      const validatedData = requestSchema.parse(body)
      
      // 🔐 Vérifier le token
      const isValid = await verifyToken(validatedData.token)
      if (!isValid) {
        return NextResponse.json(
          { error: 'Token invalide ou expiré' },
          { status: 401 }
        )
      }
      
      // 🎯 Router vers le bon endpoint
      let result
      
      switch (validatedData.endpoint) {
        case 'chat':
          result = await handleChatRequest(validatedData.payload)
          break
        
        case 'generate':
          result = await handleGenerateRequest(validatedData.payload)
          break
        
        case 'analyze':
          result = await handleAnalyzeRequest(validatedData.payload)
          break
        
        default:
          return NextResponse.json(
            { error: 'Endpoint inconnu' },
            { status: 400 }
          )
      }
      
      return NextResponse.json({
        success: true,
        data: result
      })
    }
    
    // ══════════════════════════════════════════════════════════
    // ACTION: disconnect - Fermer une session
    // ══════════════════════════════════════════════════════════
    if (action === 'disconnect') {
      const body = await request.json()
      const token = body.token
      
      const hashedToken = hashToken(token)
      
      await prisma.mcpSession.update({
        where: { token: hashedToken },
        data: { active: false }
      })
      
      return NextResponse.json({ success: true })
    }
    
    // Action inconnue
    return NextResponse.json(
      { error: 'Action inconnue' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('[MCP] Error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// ════════════════════════════════════════════════════════════
// 5. HANDLERS SPÉCIFIQUES PAR ENDPOINT
// ════════════════════════════════════════════════════════════

/**
 * Handler pour l'endpoint "chat"
 * Envoie un message à l'IA locale et retourne la réponse
 */
async function handleChatRequest(payload: any) {
  // 🤖 Importer le SDK IA locale
  const { aiChat } = await import('@/lib/ai')
  
  const message = payload.message
  
  // 💬 Envoyer à l'IA locale
  const response = await aiChat({
    messages: [
      { role: 'user', content: message }
    ]
  })
  
  return {
    reply: response.content,
    tokensUsed: response.tokensUsed
  }
}

/**
 * Handler pour l'endpoint "generate"
 * Génère du code/contenu selon les spécifications
 */
async function handleGenerateRequest(payload: any) {
  const { aiGenerate } = await import('@/lib/ai')
  
  const { type, specifications } = payload
  // type: 'webpage', 'component', 'api', etc.
  
  const generated = await aiGenerate({
    type,
    specifications
  })
  
  return {
    code: generated.code,
    language: generated.language,
    explanation: generated.explanation
  }
}

/**
 * Handler pour l'endpoint "analyze"
 * Analyse du contenu/code existant
 */
async function handleAnalyzeRequest(payload: any) {
  const { aiAnalyze } = await import('@/lib/ai')
  
  const analysis = await aiAnalyze({
    content: payload.content,
    analysisType: payload.type  // 'seo', 'performance', 'security'
  })
  
  return analysis
}
```

---

## 🔐 Modèle Prisma pour MCP

```prisma
// prisma/schema.prisma

model McpSession {
  id         String   @id @default(cuid())
  token      String   @unique  // Hash SHA256 du token
  clientName String               // Ex: "Claude", "GPT-4"
  clientType String               // "assistant", "agent", "tool"
  metadata   Json     @default("{}")
  active     Boolean  @default(true)
  createdAt  DateTime @default(now())
  
  // Relations
  requests   McpRequest[]
  
  @@index([token])
  @@index([active])
  @@map("mcp_sessions")
}

model McpRequest {
  id        String   @id @default(cuid())
  sessionId String
  endpoint  String              // "chat", "generate", "analyze"
  payload   Json
  response  Json?
  duration  Int?                // Millisecondes
  createdAt DateTime @default(now())
  
  session   McpSession @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId])
  @@index([createdAt])
  @@map("mcp_requests")
}
```

---

## 📡 Utilisation Côté Client (IA Externe)

### Exemple avec Claude (via API Anthropic)

```typescript
// Script côté IA externe (Claude, GPT-4, etc.)

class McpClient {
  private token: string | null = null
  private sessionId: string | null = null
  private baseUrl: string
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }
  
  // ══════════════════════════════════════════════════════════
  // 1. Se connecter au serveur MCP
  // ══════════════════════════════════════════════════════════
  async connect(clientName: string, clientType: string) {
    const response = await fetch(`${this.baseUrl}/api/mcp?action=connect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName,
        clientType,
        metadata: {
          version: '1.0.0',
          capabilities: ['chat', 'generate']
        }
      })
    })
    
    const data = await response.json()
    
    if (data.success) {
      this.token = data.token
      this.sessionId = data.sessionId
      console.log('✅ Connecté au serveur MCP')
    } else {
      throw new Error('Connexion échouée')
    }
  }
  
  // ══════════════════════════════════════════════════════════
  // 2. Envoyer une requête
  // ══════════════════════════════════════════════════════════
  async request(endpoint: string, payload: any) {
    if (!this.token) {
      throw new Error('Non connecté')
    }
    
    const response = await fetch(`${this.baseUrl}/api/mcp?action=request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: this.token,
        endpoint,
        payload
      })
    })
    
    const data = await response.json()
    
    if (!data.success) {
      throw new Error(data.error)
    }
    
    return data.data
  }
  
  // ══════════════════════════════════════════════════════════
  // 3. Se déconnecter
  // ══════════════════════════════════════════════════════════
  async disconnect() {
    if (!this.token) return
    
    await fetch(`${this.baseUrl}/api/mcp?action=disconnect`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: this.token })
    })
    
    this.token = null
    this.sessionId = null
    console.log('🔌 Déconnecté')
  }
}

// ══════════════════════════════════════════════════════════
// UTILISATION
// ══════════════════════════════════════════════════════════

const client = new McpClient('https://v3zai.com')

// 1. Connexion
await client.connect('Claude', 'assistant')

// 2. Envoyer un message de chat
const chatResponse = await client.request('chat', {
  message: 'Génère une page d\'accueil pour un restaurant'
})
console.log(chatResponse.reply)

// 3. Générer du code
const generateResponse = await client.request('generate', {
  type: 'webpage',
  specifications: {
    title: 'Restaurant La Bella Vita',
    sections: ['hero', 'menu', 'contact'],
    style: 'modern',
    colors: ['#FF6B6B', '#4ECDC4']
  }
})
console.log(generateResponse.code)

// 4. Analyser du contenu
const analyzeResponse = await client.request('analyze', {
  content: '<html>...</html>',
  type: 'seo'
})
console.log(analyzeResponse)

// 5. Déconnexion
await client.disconnect()
```

---

## 🎯 Cas d'Usage du MCP

### 1. Chatbot Multi-IA

```
Utilisateur: "Crée-moi un site e-commerce"
   ↓
Claude (IA Externe):
   - Comprend la demande
   - Pose des questions de clarification
   - Une fois les specs claires...
   ↓
Claude → MCP → IA Locale v3zai:
   - Génère le code HTML/CSS/JS
   - Structure de la BDD
   - Configuration Stripe
   ↓
Claude récupère et présente à l'utilisateur
```

### 2. Assistance Contextuelle

```
Utilisateur travaille dans Claude Code (IDE)
   ↓
Claude Code détecte le contexte du projet
   ↓
Via MCP, demande à l'IA locale v3zai:
   "Génère un composant Navbar pour ce projet Next.js"
   ↓
Reçoit le code adapté au style du projet
```

### 3. Pipeline de Validation

```
IA Externe génère du code
   ↓
Via MCP, envoie à IA Locale pour analyse:
   - Performance
   - Sécurité
   - Conformité best practices
   ↓
Retour des suggestions d'amélioration
```

---

## ⚠️ Considérations de Sécurité

### 1. Rate Limiting

```typescript
// Ajouter un middleware de rate limiting

import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Max 100 requêtes par fenêtre
  message: 'Trop de requêtes, réessayez plus tard'
})

// Appliquer sur les routes MCP
```

### 2. Validation d'Origine

```typescript
// Vérifier que les requêtes viennent de sources autorisées

const ALLOWED_ORIGINS = [
  'https://claude.ai',
  'https://api.anthropic.com'
]

function verifyOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin')
  return ALLOWED_ORIGINS.includes(origin || '')
}
```

### 3. Chiffrement des Payloads

```typescript
// Pour données sensibles

import crypto from 'crypto'

function encryptPayload(data: any, key: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', key)
  let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex')
  encrypted += cipher.final('hex')
  return encrypted
}
```

---

## 🧪 Tests du Serveur MCP

### Script de Test

```typescript
// scripts/test-mcp.ts

import { McpClient } from './mcp-client'

async function testMcp() {
  const client = new McpClient('http://localhost:3000')
  
  try {
    console.log('🔌 Test de connexion...')
    await client.connect('TestClient', 'tool')
    console.log('✅ Connexion réussie')
    
    console.log('\n💬 Test endpoint chat...')
    const chatRes = await client.request('chat', {
      message: 'Bonjour !'
    })
    console.log('✅ Réponse:', chatRes.reply)
    
    console.log('\n🎨 Test endpoint generate...')
    const genRes = await client.request('generate', {
      type: 'component',
      specifications: { name: 'Button' }
    })
    console.log('✅ Code généré')
    
    console.log('\n🔌 Déconnexion...')
    await client.disconnect()
    console.log('✅ Tests terminés')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  }
}

testMcp()
```

---

## 📊 Monitoring des Sessions MCP

### Dashboard Admin

```typescript
// src/app/admin/mcp/page.tsx

import { prisma } from '@/lib/db'

export default async function McpDashboard() {
  const sessions = await prisma.mcpSession.findMany({
    include: {
      _count: {
        select: { requests: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50
  })
  
  return (
    <div>
      <h1>Sessions MCP</h1>
      <table>
        <thead>
          <tr>
            <th>Client</th>
            <th>Type</th>
            <th>Requêtes</th>
            <th>Statut</th>
            <th>Créé le</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map(session => (
            <tr key={session.id}>
              <td>{session.clientName}</td>
              <td>{session.clientType}</td>
              <td>{session._count.requests}</td>
              <td>{session.active ? '🟢 Actif' : '🔴 Inactif'}</td>
              <td>{session.createdAt.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

---

## 🎯 Points Clés à Retenir

1. **MCP = Bridge** entre IA externes et IA locale
2. **Token-based auth** avec expiration
3. **Endpoints multiples** (chat, generate, analyze)
4. **Type-safety** avec Zod pour validation
5. **Logging** pour monitoring et debug
6. **Rate limiting** essentiel pour sécurité

---

## 📚 Prochains Cours

- **Cours 5** : Intégration IA Locale (z-ai-web-dev-sdk)
- **Cours 6** : Authentification et Sécurité
- **Cours 7** : Déploiement et Monitoring

---

**🎓 Fin du Cours 4**

Le MCP ouvre la porte à des architectures multi-agents ! Prêt pour l'IA locale ?
