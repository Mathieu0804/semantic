// src/app/page.tsx - Page d'accueil avec navigation
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
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-green-900 mb-2">✅ Application Déployée !</h2>
          <p className="text-green-800">
            Votre application est en ligne et fonctionnelle. Cliquez sur les cartes ci-dessous pour accéder aux différentes fonctionnalités.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link 
            href="/entreprise" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">🏢</div>
            <h3 className="text-xl font-semibold mb-2">1. Configurer l'Entreprise</h3>
            <p className="text-gray-600">Définissez votre identité : nom, logo, coordonnées, couleurs...</p>
            <p className="text-blue-600 mt-2 font-medium">→ Cliquez pour configurer</p>
          </Link>

          <Link 
            href="/generateur-site" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">🎨</div>
            <h3 className="text-xl font-semibold mb-2">2. Générer le Site Web</h3>
            <p className="text-gray-600">Dialoguez avec l'IA pour créer un site web personnalisé</p>
            <p className="text-blue-600 mt-2 font-medium">→ Cliquez pour générer</p>
          </Link>

          <Link 
            href="/catalogue" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">📦</div>
            <h3 className="text-xl font-semibold mb-2">3. Gérer le Catalogue</h3>
            <p className="text-gray-600">Importez et gérez vos produits/services avec l'IA</p>
            <p className="text-blue-600 mt-2 font-medium">→ Cliquez pour gérer</p>
          </Link>

          <Link 
            href="/analytics" 
            className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow"
          >
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-xl font-semibold mb-2">4. Analytics & Rapports</h3>
            <p className="text-gray-600">Consultez les analyses et recommandations de l'IA</p>
            <p className="text-blue-600 mt-2 font-medium">→ Cliquez pour consulter</p>
          </Link>
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🚀 Comment ça marche ?</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">1.</span>
              <span>Configurez votre entreprise (identité, coordonnées, style)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">2.</span>
              <span>Dialoguez avec l'IA pour générer un site web adapté à votre activité</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">3.</span>
              <span>Importez votre catalogue produits/services (CSV, Excel, JSON...)</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-blue-600 mr-2">4.</span>
              <span>L'IA analyse en continu et vous propose des optimisations</span>
            </li>
          </ol>
        </div>
      </main>
    </div>
  )
}
