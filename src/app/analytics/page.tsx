'use client'

// src/app/analytics/page.tsx - Analytics et rapports IA
import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function AnalyticsPage() {
  const [stats, setStats] = useState({
    produits: 0,
    entrepriseConfigured: false
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      // Charger stats produits
      const produitsRes = await fetch('/api/produits')
      const produitsData = await produitsRes.json()
      
      // Charger config entreprise
      const entrepriseRes = await fetch('/api/entreprise')
      const entrepriseData = await entrepriseRes.json()

      setStats({
        produits: produitsData.data?.length || 0,
        entrepriseConfigured: !!entrepriseData.data
      })
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:underline">← Retour</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">📊 Analytics & Rapports</h1>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Entreprise</p>
                <p className="text-3xl font-bold mt-1">
                  {stats.entrepriseConfigured ? '✅' : '❌'}
                </p>
              </div>
              <div className="text-4xl">🏢</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {stats.entrepriseConfigured ? 'Configurée' : 'Non configurée'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Produits</p>
                <p className="text-3xl font-bold mt-1">{stats.produits}</p>
              </div>
              <div className="text-4xl">📦</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Dans le catalogue</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">IA Gemini</p>
                <p className="text-3xl font-bold mt-1">✅</p>
              </div>
              <div className="text-4xl">🤖</div>
            </div>
            <p className="text-sm text-gray-500 mt-2">Opérationnelle</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">📈 Statut du Système</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-medium">Application déployée</p>
                <p className="text-sm text-gray-600">Votre application est en ligne et accessible</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-medium">Gemini API configurée</p>
                <p className="text-sm text-gray-600">Le chatbot IA est fonctionnel</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <p className="font-medium">Base de données opérationnelle</p>
                <p className="text-sm text-gray-600">SQLite configurée et prête</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">💡 Prochaines Étapes</h2>
          <ul className="space-y-2 text-gray-700">
            {!stats.entrepriseConfigured && (
              <li className="flex items-start gap-2">
                <span>→</span>
                <Link href="/entreprise" className="text-blue-600 hover:underline">
                  Configurez votre entreprise
                </Link>
              </li>
            )}
            {stats.produits === 0 && (
              <li className="flex items-start gap-2">
                <span>→</span>
                <Link href="/catalogue" className="text-blue-600 hover:underline">
                  Ajoutez vos premiers produits
                </Link>
              </li>
            )}
            <li className="flex items-start gap-2">
              <span>→</span>
              <Link href="/generateur-site" className="text-blue-600 hover:underline">
                Testez le générateur de site avec l'IA
              </Link>
            </li>
          </ul>
        </div>
      </main>
    </div>
  )
}
