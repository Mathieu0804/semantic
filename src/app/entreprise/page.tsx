'use client'

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

  // Charger le nom persistant
  const [entrepriseName, setEntrepriseName] = useState('')

  useEffect(() => {
    fetch('/api/entreprise')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setFormData(prev => ({ ...prev, ...data.data }))
          setEntrepriseName(data.data.nom)
          localStorage.setItem('entrepriseName', data.data.nom)
        } else {
          const savedName = localStorage.getItem('entrepriseName')
          if (savedName) setEntrepriseName(savedName)
        }
      })
      .catch(err => console.error(err))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/entreprise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await res.json()

      if (data.success) {
        setSaved(true)
        setEntrepriseName(data.data.nom)
        localStorage.setItem('entrepriseName', data.data.nom)
      } else {
        alert('Erreur : ' + data.error)
      }
    } catch (err: any) {
      alert('Erreur : ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Retour
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mt-1">
              {entrepriseName || 'PME IA Assistant'}
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Nom de l'entreprise *</label>
              <Input
                value={formData.nom}
                onChange={e => setFormData({ ...formData, nom: e.target.value })}
                placeholder="Ma Super Entreprise"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Slogan</label>
              <Input
                value={formData.slogan || ''}
                onChange={e => setFormData({ ...formData, slogan: e.target.value })}
                placeholder="Votre slogan accrocheur"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@entreprise.fr"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Téléphone *</label>
                <Input
                  type="tel"
                  value={formData.telephone}
                  onChange={e => setFormData({ ...formData, telephone: e.target.value })}
                  placeholder="+33 1 23 45 67 89"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Sauvegarde...' : 'Sauvegarder la configuration'}
            </Button>
          </form>
        </div>
      </main>

      {/* Popup succès */}
      {saved && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg p-6 w-80 text-center shadow-lg">
            <p className="text-green-800 font-semibold mb-4">
              ✅ Enregistrement effectué avec succès !
            </p>
            <button
              onClick={() => {
                setSaved(false)
                window.location.href = '/'
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
