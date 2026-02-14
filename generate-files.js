#!/usr/bin/env node
// generate-files.js - Génère tous les fichiers source nécessaires

const fs = require('fs');
const path = require('path');

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

console.log('🔧 Génération des fichiers source...\n');

// ============================================================
// 1. LAYOUT PRINCIPAL
// ============================================================
console.log('📄 Création de src/app/layout.tsx...');
ensureDir('src/app');
fs.writeFileSync('src/app/layout.tsx', `import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PME IA Assistant',
  description: 'Assistant IA local pour PME/PMI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">{children}</body>
    </html>
  )
}
`);

// ============================================================
// 2. PAGE D'ACCUEIL
// ============================================================
console.log('📄 Création de src/app/page.tsx...');
fs.writeFileSync('src/app/page.tsx', `import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🤖 PME IA Assistant</h1>
          <p className="text-gray-600">Assistant IA local pour PME/PMI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">👋 Bienvenue !</h2>
          <p className="text-blue-800">
            Cette application vous aide à créer et gérer votre présence en ligne avec l'aide d'une IA locale.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/entreprise" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-semibold mb-2">1. Configurer l'Entreprise</h3>
            <p className="text-gray-600">Définissez votre identité : nom, logo, coordonnées, couleurs...</p>
          </Link>

          <Link href="/generateur-site" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold mb-2">2. Générer le Site Web</h3>
            <p className="text-gray-600">Dialoguez avec l'IA pour créer un site web personnalisé</p>
          </Link>

          <Link href="/catalogue" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-xl font-semibold mb-2">3. Gérer le Catalogue</h3>
            <p className="text-gray-600">Importez et gérez vos produits/services avec l'IA</p>
          </Link>

          <Link href="/analytics" className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">4. Analytics & Rapports</h3>
            <p className="text-gray-600">Consultez les analyses et recommandations de l'IA</p>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">🚀 Comment ça marche ?</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">1.</span>
              <span>Configurez votre entreprise (identité, coordonnées, style)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">2.</span>
              <span>Dialoguez avec l'IA pour générer un site web adapté à votre activité</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">3.</span>
              <span>Importez votre catalogue produits/services (CSV, Excel, JSON...)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary mr-2">4.</span>
              <span>L'IA analyse en continu et vous propose des optimisations</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
`);

// ============================================================
// 3. COMPOSANT CHATBOT
// ============================================================
console.log('📄 Création de src/components/ChatBot.tsx...');
ensureDir('src/components');
fs.writeFileSync('src/components/ChatBot.tsx', `'use client'

import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBotProps {
  context: string
  onCodeGenerated?: (code: string) => void
}

export function ChatBot({ context, onCodeGenerated }: ChatBotProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await fetch('/api/ollama/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          context
        })
      })

      if (!response.ok) throw new Error('Erreur API')

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response
      }

      setMessages(prev => [...prev, assistantMessage])

      // Si du code est généré et un callback existe
      if (onCodeGenerated && data.code) {
        onCodeGenerated(data.code)
      }
    } catch (error) {
      console.error('Erreur:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '❌ Désolé, une erreur est survenue. Vérifiez qu\\'Ollama est bien démarré.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg">
      <div className="bg-primary text-white p-4 rounded-t-lg">
        <h3 className="font-semibold">💬 Assistant IA</h3>
        <p className="text-sm opacity-90">Propulsé par Llama3 (local)</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-2xl mb-2">👋</p>
            <p>Bonjour ! Comment puis-je vous aider aujourd\\'hui ?</p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={\`chat-message \${
              msg.role === 'user'
                ? 'ml-auto max-w-[80%]'
                : 'mr-auto max-w-[80%]'
            }\`}
          >
            <div
              className={\`p-3 rounded-lg \${
                msg.role === 'user'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-900'
              }\`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="mr-auto max-w-[80%]">
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Tapez votre message..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  )
}
`);

// ============================================================
// 4. API ROUTE OLLAMA
// ============================================================
console.log('📄 Création de src/app/api/ollama/chat/route.ts...');
ensureDir('src/app/api/ollama/chat');
fs.writeFileSync('src/app/api/ollama/chat/route.ts', `import { NextRequest, NextResponse } from 'next/server'
import { ollama, SYSTEM_PROMPTS } from '@/lib/ollama'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    // Sélectionner le prompt système selon le contexte
    const systemPrompt = SYSTEM_PROMPTS[context as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.generationSite

    // Préparer les messages avec le contexte système
    const fullMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...messages
    ]

    // Appeler Ollama
    const response = await ollama.chat({
      messages: fullMessages,
      temperature: 0.7
    })

    return NextResponse.json({
      success: true,
      response
    })
  } catch (error: any) {
    console.error('Erreur Ollama:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}
`);

// ============================================================
// 5. PAGE GÉNÉRATEUR SITE
// ============================================================
console.log('📄 Création de src/app/generateur-site/page.tsx...');
ensureDir('src/app/generateur-site');
fs.writeFileSync('src/app/generateur-site/page.tsx', `'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChatBot } from '@/components/ChatBot'

export default function GenerateurSitePage() {
  const [generatedCode, setGeneratedCode] = useState<string>('')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-primary hover:underline">← Retour</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">🎨 Générateur de Site Web</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          <div className="h-full">
            <ChatBot
              context="generation_site"
              onCodeGenerated={(code) => setGeneratedCode(code)}
            />
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">👁️ Prévisualisation</h2>

            {generatedCode ? (
              <iframe
                srcDoc={generatedCode}
                className="w-full h-[calc(100%-60px)] border rounded"
                title="Prévisualisation"
              />
            ) : (
              <div className="flex items-center justify-center h-[calc(100%-60px)] text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-4">🎨</p>
                  <p>Le code généré apparaîtra ici</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
`);

// ============================================================
// 6. POSTCSS CONFIG
// ============================================================
console.log('📄 Création de postcss.config.mjs...');
fs.writeFileSync('postcss.config.mjs', `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`);

// ============================================================
// 7. GITIGNORE
// ============================================================
console.log('📄 Création de .gitignore...');
fs.writeFileSync('.gitignore', `# Dependencies
node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Next.js
/.next/
/out/

# Production
/build

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Prisma
prisma/*.db
prisma/*.db-journal
`);

console.log('\n✅ Tous les fichiers ont été générés avec succès !\n');
console.log('Prochaines étapes:');
console.log('1. npm install');
console.log('2. npm run db:push');
console.log('3. npm run dev');
console.log('\n📖 Consultez README.md pour plus d'informations\n');
