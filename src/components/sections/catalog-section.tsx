// src/components/sections/catalog-section.tsx
// Gestion complète des produits et services avec CRUD

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ============================================
// TYPES
// ============================================

interface Product {
  id: string
  name: string
  description: string
  price: number | null
  stock: number | null
  status: string
  sku: string | null
}

interface Service {
  id: string
  name: string
  description: string
  basePrice: number | null
  duration: string | null
  status: string
}

type TabType = 'products' | 'services'

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function CatalogSection() {
  // États
  const [activeTab, setActiveTab] = useState<TabType>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Formulaire produit
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: ''
  })
  
  // Formulaire service
  const [serviceForm, setServiceForm] = useState({
    name: '',
    description: '',
    basePrice: '',
    duration: ''
  })

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Charger produits
      const productsRes = await fetch('/api/products')
      const productsData = await productsRes.json()
      if (productsData.success) {
        setProducts(productsData.products || [])
      }

      // Charger services
      const servicesRes = await fetch('/api/services')
      const servicesData = await servicesRes.json()
      if (servicesData.success) {
        setServices(servicesData.services || [])
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // GESTION DES PRODUITS
  // ============================================

  const handleAddProduct = async () => {
    if (!productForm.name.trim()) {
      setToast({ message: '❌ Le nom du produit est requis', type: 'error' })
      return
    }

    setSaving(true)
    setToast(null)

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: productForm.name,
          description: productForm.description,
          price: productForm.price ? parseFloat(productForm.price) : null,
          stock: productForm.stock ? parseInt(productForm.stock) : 0,
          sku: productForm.sku || null
        })
      })

      const result = await response.json()

      if (result.success) {
        setProducts(prev => [...prev, result.product])
        setProductForm({ name: '', description: '', price: '', stock: '', sku: '' })
        setToast({ message: '✅ Produit ajouté avec succès !', type: 'success' })
      } else {
        throw new Error(result.error || 'Erreur')
      }
    } catch (error) {
      setToast({ 
        message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 
        type: 'error' 
      })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return

    try {
      const response = await fetch(`/api/products?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setProducts(prev => prev.filter(p => p.id !== id))
        setToast({ message: '✅ Produit supprimé', type: 'success' })
      }
    } catch (error) {
      setToast({ message: '❌ Erreur lors de la suppression', type: 'error' })
    }
    
    setTimeout(() => setToast(null), 4000)
  }

  // ============================================
  // GESTION DES SERVICES
  // ============================================

  const handleAddService = async () => {
    if (!serviceForm.name.trim()) {
      setToast({ message: '❌ Le nom du service est requis', type: 'error' })
      return
    }

    setSaving(true)
    setToast(null)

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serviceForm.name,
          description: serviceForm.description,
          basePrice: serviceForm.basePrice ? parseFloat(serviceForm.basePrice) : null,
          duration: serviceForm.duration || null
        })
      })

      const result = await response.json()

      if (result.success) {
        setServices(prev => [...prev, result.service])
        setServiceForm({ name: '', description: '', basePrice: '', duration: '' })
        setToast({ message: '✅ Service ajouté avec succès !', type: 'success' })
      } else {
        throw new Error(result.error || 'Erreur')
      }
    } catch (error) {
      setToast({ 
        message: `❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 
        type: 'error' 
      })
    } finally {
      setSaving(false)
      setTimeout(() => setToast(null), 4000)
    }
  }

  const handleDeleteService = async (id: string) => {
    if (!confirm('Supprimer ce service ?')) return

    try {
      const response = await fetch(`/api/services?id=${id}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        setServices(prev => prev.filter(s => s.id !== id))
        setToast({ message: '✅ Service supprimé', type: 'success' })
      }
    } catch (error) {
      setToast({ message: '❌ Erreur lors de la suppression', type: 'error' })
    }
    
    setTimeout(() => setToast(null), 4000)
  }

  // ============================================
  // RENDU
  // ============================================

  return (
    <div className="space-y-6 p-4">
      {/* Toast de notification */}
      {toast && (
        <div className={`
          fixed top-4 right-4 z-50 px-6 py-4 rounded-lg shadow-xl
          animate-slide-in flex items-center gap-3
          ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}
        `}>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-80">✕</button>
        </div>
      )}

      {/* Titre */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">📦 Catalogue</h2>
        <Button onClick={loadData} disabled={loading} variant="outline">
          🔄 Actualiser
        </Button>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-gray-700 pb-2">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'products' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          📦 Produits ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`px-4 py-2 rounded-t-lg font-medium transition-colors ${
            activeTab === 'services' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          🔧 Services ({services.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="animate-spin text-4xl">⏳</span>
          <p className="mt-2 text-gray-400">Chargement...</p>
        </div>
      ) : (
        <>
          {/* ONGLET PRODUITS */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Formulaire ajout */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">➕ Ajouter un Produit</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom *</label>
                      <Input
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du produit"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Prix (€)</label>
                      <Input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        placeholder="0.00"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Stock</label>
                      <Input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: e.target.value }))}
                        placeholder="0"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">SKU / Référence</label>
                      <Input
                        value={productForm.sku}
                        onChange={(e) => setProductForm(prev => ({ ...prev, sku: e.target.value }))}
                        placeholder="REF-001"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <Input
                        value={productForm.description}
                        onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du produit"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleAddProduct}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? '⏳ Ajout...' : '➕ Ajouter le produit'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des produits */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    Aucun produit. Ajoutez votre premier produit !
                  </div>
                ) : (
                  products.map(product => (
                    <Card key={product.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{product.name}</h3>
                            {product.description && (
                              <p className="text-gray-400 text-sm mt-1">{product.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-400 hover:text-red-300 text-xl"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="mt-3 flex gap-4 text-sm">
                          {product.price !== null && (
                            <span className="text-green-400 font-bold">
                              {product.price} €
                            </span>
                          )}
                          {product.stock !== null && (
                            <span className={product.stock > 0 ? 'text-blue-400' : 'text-red-400'}>
                              Stock: {product.stock}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ONGLET SERVICES */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Formulaire ajout */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">➕ Ajouter un Service</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Nom *</label>
                      <Input
                        value={serviceForm.name}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nom du service"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Prix de base (€)</label>
                      <Input
                        type="number"
                        value={serviceForm.basePrice}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, basePrice: e.target.value }))}
                        placeholder="0.00"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">Durée estimée</label>
                      <Input
                        value={serviceForm.duration}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="1 heure, 2 jours..."
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                    
                    <div className="md:col-span-3">
                      <label className="block text-sm text-gray-400 mb-1">Description</label>
                      <Input
                        value={serviceForm.description}
                        onChange={(e) => setServiceForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du service"
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleAddService}
                      disabled={saving}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {saving ? '⏳ Ajout...' : '➕ Ajouter le service'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Liste des services */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    Aucun service. Ajoutez votre premier service !
                  </div>
                ) : (
                  services.map(service => (
                    <Card key={service.id} className="bg-gray-800 border-gray-700">
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{service.name}</h3>
                            {service.description && (
                              <p className="text-gray-400 text-sm mt-1">{service.description}</p>
                            )}
                          </div>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="text-red-400 hover:text-red-300 text-xl"
                          >
                            🗑️
                          </button>
                        </div>
                        
                        <div className="mt-3 flex gap-4 text-sm">
                          {service.basePrice !== null && (
                            <span className="text-green-400 font-bold">
                              À partir de {service.basePrice} €
                            </span>
                          )}
                          {service.duration && (
                            <span className="text-blue-400">
                              ⏱️ {service.duration}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}