'use client'

// src/app/entreprise/page.tsx - Configuration de l'entreprise
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function EntreprisePage() {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    slogan: '',
    email: '',
    telephone: '',
    adresse: '',
    descriptionBreve: '',
    couleurPrimaire: '#3B82F6',
    couleurSecondaire: '#10B981',
  })

  // Charger les données existantes
  useEffect(() => {
    fetch('/api/entreprise')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFormData(prev => ({ ...prev, ...data.data }))
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    try {
      const response = await fetch('/api/entreprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:underline">← Retour</Link>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">🏢 Configuration Entreprise</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {saved && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">✅ Configuration sauvegardée avec succès !</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'entreprise *</label>
              <Input
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                placeholder="Ma Super Entreprise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slogan</label>
              <Input
                value={formData.slogan || ''}
                onChange={e => setFormData({...formData, slogan: e.target.value})}
                placeholder="Votre slogan accrocheur"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@entreprise.fr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <Input
                  type="tel"
                  value={formData.telephone}
                  onChange={e => setFormData({...formData, telephone: e.target.value})}
                  placeholder="+33 1 23 45 67 89"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Adresse</label>
              <Input
                value={formData.adresse || ''}
                onChange={e => setFormData({...formData, adresse: e.target.value})}
                placeholder="123 Rue de la République, 75001 Paris"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description brève</label>
              <textarea
                className="w-full rounded-md border border-gray-300 p-3"
                rows={3}
                value={formData.descriptionBreve || ''}
                onChange={e => setFormData({...formData, descriptionBreve: e.target.value})}
                placeholder="Décrivez votre entreprise en quelques mots..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Couleur primaire</label>
                <input
                  type="color"
                  value={formData.couleurPrimaire}
                  onChange={e => setFormData({...formData, couleurPrimaire: e.target.value})}
                  className="w-full h-10 rounded border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Couleur secondaire</label>
                <input
                  type="color"
                  value={formData.couleurSecondaire}
                  onChange={e => setFormData({...formData, couleurSecondaire: e.target.value})}
                  className="w-full h-10 rounded border"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}
