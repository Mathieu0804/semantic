'use client'

// src/app/catalogue/page.tsx - Gestion du catalogue produits
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CataloguePage() {
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    nom: '',
    description: '',
    prix: '',
    stock: '',
    categorie: '',
  })

  useEffect(() => {
    loadProduits()
  }, [])

  const loadProduits = async () => {
    try {
      const response = await fetch('/api/produits')
      const data = await response.json()
      if (data.success) {
        setProduits(data.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement produits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/produits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setShowForm(false)
        setFormData({ nom: '', description: '', prix: '', stock: '', categorie: '' })
        loadProduits()
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
            <h1 className="text-2xl font-bold text-gray-900 mt-1">📦 Gestion du Catalogue</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Annuler' : '+ Nouveau Produit'}
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Nouveau Produit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nom *</label>
                <Input
                  value={formData.nom}
                  onChange={e => setFormData({...formData, nom: e.target.value})}
                  placeholder="Nom du produit"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <textarea
                  className="w-full rounded-md border border-gray-300 p-3"
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  placeholder="Description du produit"
                  required
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Prix (€) *</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.prix}
                    onChange={e => setFormData({...formData, prix: e.target.value})}
                    placeholder="19.99"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Stock</label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={e => setFormData({...formData, stock: e.target.value})}
                    placeholder="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Catégorie</label>
                  <Input
                    value={formData.categorie}
                    onChange={e => setFormData({...formData, categorie: e.target.value})}
                    placeholder="Vêtements"
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? 'Ajout...' : 'Ajouter le produit'}
              </Button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">
              Mes Produits ({produits.length})
            </h2>
          </div>

          {loading && produits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chargement...
            </div>
          ) : produits.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="text-4xl mb-4">📦</p>
              <p className="mb-2">Aucun produit pour le moment</p>
              <p className="text-sm">Cliquez sur "Nouveau Produit" pour commencer</p>
            </div>
          ) : (
            <div className="divide-y">
              {produits.map((produit) => (
                <div key={produit.id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{produit.nom}</h3>
                      <p className="text-gray-600 text-sm mt-1">{produit.description}</p>
                      <div className="flex gap-4 mt-3 text-sm text-gray-500">
                        <span>💰 {produit.prix}€</span>
                        <span>📦 Stock: {produit.stock}</span>
                        {produit.categorie && <span>🏷️ {produit.categorie}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
