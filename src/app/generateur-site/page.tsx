'use client'

// src/app/generateur-site/page.tsx - Générateur de site avec chatbot
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
            <Link href="/" className="text-blue-600 hover:underline">← Retour</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">🎨 Générateur de Site Web</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 h-[calc(100vh-200px)]">
          {/* Chatbot */}
          <div className="h-full">
            <ChatBot
              context="generationSite"
              onCodeGenerated={(code) => setGeneratedCode(code)}
            />
          </div>

          {/* Prévisualisation */}
          <div className="bg-white rounded-lg shadow-lg p-6 overflow-auto">
            <h2 className="text-xl font-semibold mb-4">👁️ Prévisualisation</h2>

            {generatedCode ? (
              <div className="border rounded-lg overflow-hidden">
                <iframe
                  srcDoc={generatedCode}
                  className="w-full h-[calc(100%-60px)] min-h-[600px]"
                  title="Prévisualisation du site"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[calc(100%-60px)] text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-4">💬</p>
                  <p className="text-lg mb-2">Commencez à discuter avec l'IA</p>
                  <p className="text-sm">Le code généré apparaîtra ici</p>
                  <div className="mt-6 text-left bg-gray-50 p-4 rounded-lg max-w-md mx-auto">
                    <p className="font-semibold mb-2">Exemples de demandes :</p>
                    <ul className="space-y-1 text-sm">
                      <li>• "Crée-moi un site pour mon restaurant"</li>
                      <li>• "Je veux un site pour ma boutique de vêtements"</li>
                      <li>• "Génère un site vitrine pour mon entreprise"</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
