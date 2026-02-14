'use client'

// src/app/builder/page.tsx
// Interface AI Builder pour modifier l'application

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function BuilderPage() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  const generateCode = async () => {
    if (!prompt.trim() || loading) return

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          applyImmediately: false // Prévisualisation d'abord
        })
      })

      const data = await response.json()

      if (data.success) {
        setResult(data.data)
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const applyCode = async () => {
    if (!result) return

    setLoading(true)

    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          applyImmediately: true
        })
      })

      const data = await response.json()

      if (data.success) {
        alert('✅ Modification appliquée avec succès !')
        setHistory([...history, {
          prompt,
          result: data.data,
          timestamp: new Date()
        }])
        setResult(null)
        setPrompt('')
      } else {
        alert('Erreur: ' + data.error)
      }
    } catch (error: any) {
      alert('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Link href="/" className="text-white/80 hover:text-white">← Retour</Link>
          <h1 className="text-3xl font-bold mt-2">🤖 AI Builder</h1>
          <p className="text-white/90 mt-1">L'application qui se construit elle-même</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Alert Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900 mb-2">💡 Comment ça marche ?</h3>
          <p className="text-blue-800 text-sm">
            Décrivez ce que vous voulez modifier dans votre application en langage naturel.
            L'IA génère le code, vous prévisualisez, puis vous appliquez.
          </p>
          <div className="mt-3 space-y-1 text-sm text-blue-700">
            <p>• <strong>Exemples :</strong></p>
            <p className="ml-4">"Ajoute un bouton rouge sur la page d'accueil"</p>
            <p className="ml-4">"Crée une nouvelle page /temoignages"</p>
            <p className="ml-4">"Modifie le formulaire entreprise pour ajouter un champ fax"</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Colonne Gauche - Input */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4">💬 Votre Demande</h2>
              
              <textarea
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Décrivez ce que vous voulez modifier...

Exemples:
- Ajoute un bouton 'Contactez-nous' en haut de la page
- Crée une page FAQ
- Change la couleur du header en vert
- Ajoute un champ 'site web' au formulaire entreprise"
                className="w-full h-40 rounded-md border border-gray-300 p-3 text-sm"
                disabled={loading}
              />

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={generateCode}
                  disabled={loading || !prompt.trim()}
                  className="flex-1"
                >
                  {loading ? 'Génération...' : '🎨 Générer le Code'}
                </Button>
              </div>
            </div>

            {/* Historique */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-semibold mb-3">📜 Historique ({history.length})</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {history.slice().reverse().map((item, i) => (
                    <div key={i} className="text-sm p-2 bg-gray-50 rounded">
                      <p className="font-medium text-gray-900">{item.prompt}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {item.result.filePath} • {item.result.action}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Colonne Droite - Résultat */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">👁️ Prévisualisation</h2>

            {!result ? (
              <div className="flex items-center justify-center h-96 text-gray-400">
                <div className="text-center">
                  <p className="text-4xl mb-4">🎨</p>
                  <p>Le code généré apparaîtra ici</p>
                  <p className="text-sm mt-2">Décrivez votre modification et cliquez sur "Générer"</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Info */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="font-semibold text-green-900">✅ Code Généré</p>
                  <p className="text-green-800 text-sm mt-1">{result.explanation}</p>
                  <div className="mt-2 text-sm text-green-700">
                    <p><strong>Fichier :</strong> {result.filePath}</p>
                    <p><strong>Action :</strong> {result.action}</p>
                  </div>
                </div>

                {/* Code */}
                <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                  <pre className="text-green-400 text-xs">
                    <code>{result.code}</code>
                  </pre>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    onClick={applyCode}
                    disabled={loading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {loading ? 'Application...' : '✅ Appliquer'}
                  </Button>
                  <Button
                    onClick={() => setResult(null)}
                    disabled={loading}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Annuler
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  ⚠️ Vérifiez le code avant d'appliquer
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
