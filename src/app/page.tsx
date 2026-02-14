import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">🤖 PME IA Assistant</h1>
          <p className="text-gray-600">Assistant IA avec Gemini pour PME/PMI</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-2">👋 Bienvenue !</h2>
          <p className="text-blue-800">
            Application déployée avec succès sur Render.com avec Gemini API !
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-semibold mb-2">Configuration Entreprise</h3>
            <p className="text-gray-600">Définissez votre identité et vos coordonnées</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold mb-2">Générateur de Site</h3>
            <p className="text-gray-600">Créez votre site avec l'IA Gemini</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-xl font-semibold mb-2">Catalogue Produits</h3>
            <p className="text-gray-600">Gérez vos produits et services</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-gray-600">Rapports et recommandations IA</p>
          </div>
        </div>

        <div className="mt-12 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-2">✅ Statut du Système</h3>
          <ul className="space-y-1 text-green-800">
            <li>✅ Application déployée sur Render</li>
            <li>✅ Gemini API configurée</li>
            <li>✅ Base de données SQLite initialisée</li>
          </ul>
        </div>
      </main>
    </div>
  )
}