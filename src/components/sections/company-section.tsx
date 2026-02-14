// src/components/sections/company-section.tsx
// Formulaire complet pour l'identité entreprise avec sauvegarde

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ============================================
// TYPES
// ============================================

interface CompanyData {
  id?: string
  name: string
  slogan: string
  description: string
  email: string
  phone: string
  address: string
  city: string
  postalCode: string
  country: string
  website: string
  primaryColor: string
  secondaryColor: string
  metaTitle: string
  metaDescription: string
}

// ============================================
// COMPOSANT PRINCIPAL
// ============================================

export function CompanySection() {
  // États
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  // Données du formulaire
  const [formData, setFormData] = useState<CompanyData>({
    name: '',
    slogan: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    website: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    metaTitle: '',
    metaDescription: ''
  })

  // ============================================
  // CHARGEMENT INITIAL
  // ============================================

  useEffect(() => {
    loadCompany()
  }, [])

  const loadCompany = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/company')
      const result = await response.json()
      
      if (result.success && result.company) {
        setFormData({
          name: result.company.name || '',
          slogan: result.company.slogan || '',
          description: result.company.description || '',
          email: result.company.email || '',
          phone: result.company.phone || '',
          address: result.company.address || '',
          city: result.company.city || '',
          postalCode: result.company.postalCode || '',
          country: result.company.country || 'France',
          website: result.company.website || '',
          primaryColor: result.company.primaryColor || '#3B82F6',
          secondaryColor: result.company.secondaryColor || '#1E40AF',
          metaTitle: result.company.metaTitle || '',
          metaDescription: result.company.metaDescription || ''
        })
      }
    } catch (error) {
      console.error('Erreur chargement:', error)
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // SAUVEGARDE
  // ============================================

  const handleSave = async () => {
    setSaving(true)
    setToast(null)

    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setToast({ message: '✅ Paramètres enregistrés avec succès !', type: 'success' })
      } else {
        throw new Error(result.error || 'Erreur lors de la sauvegarde')
      }
    } catch (error) {
      setToast({ 
        message: `❌ ${error instanceof Error ? error.message : 'Erreur de sauvegarde'}`, 
        type: 'error' 
      })
    } finally {
      setSaving(false)
      
      // Auto-hide toast après 4 secondes
      setTimeout(() => setToast(null), 4000)
    }
  }

  // ============================================
  // GESTION DES CHAMPS
  // ============================================

  const handleChange = (field: keyof CompanyData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
          <span className="text-xl">{toast.type === 'success' ? '✅' : '❌'}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-4 hover:opacity-80">✕</button>
        </div>
      )}

      {/* Titre */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Identité de l'Entreprise</h2>
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6"
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Enregistrement...
            </>
          ) : (
            <>
              💾 Enregistrer
            </>
          )}
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <span className="animate-spin text-4xl">⏳</span>
          <p className="mt-2 text-gray-400">Chargement...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CARTE 1 : Informations générales */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🏢 Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Nom de l'entreprise *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Mon Entreprise SARL"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Slogan
                </label>
                <Input
                  value={formData.slogan}
                  onChange={(e) => handleChange('slogan', e.target.value)}
                  placeholder="Votre partenaire de confiance"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Décrivez votre activité..."
                  rows={3}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARTE 2 : Contact */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📞 Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="contact@monentreprise.fr"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Téléphone
                </label>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+33 1 23 45 67 89"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Site web
                </label>
                <Input
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.monentreprise.fr"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARTE 3 : Adresse */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                📍 Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Adresse
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="123 Rue de la Paix"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Code postal
                  </label>
                  <Input
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="75001"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Ville
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Paris"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Pays
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange('country', e.target.value)}
                  placeholder="France"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </CardContent>
          </Card>

          {/* CARTE 4 : Identité Visuelle */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🎨 Identité Visuelle
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Couleur principale
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Couleur secondaire
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white flex-1"
                  />
                </div>
              </div>

              {/* Aperçu des couleurs */}
              <div className="mt-4 p-4 rounded-lg" style={{ backgroundColor: formData.primaryColor }}>
                <p style={{ color: formData.secondaryColor }}>
                  Aperçu des couleurs
                </p>
              </div>
            </CardContent>
          </Card>

          {/* CARTE 5 : SEO */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                🔍 Référencement (SEO)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Meta Title (titre pour Google)
                </label>
                <Input
                  value={formData.metaTitle}
                  onChange={(e) => handleChange('metaTitle', e.target.value)}
                  placeholder="Mon Entreprise - Votre partenaire de confiance"
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaTitle.length}/60 caractères recommandés
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Meta Description
                </label>
                <textarea
                  value={formData.metaDescription}
                  onChange={(e) => handleChange('metaDescription', e.target.value)}
                  placeholder="Décrivez votre entreprise en une phrase..."
                  rows={2}
                  className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.metaDescription.length}/160 caractères recommandés
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Bouton sauvegarde en bas */}
      <div className="flex justify-end pt-4 border-t border-gray-700">
        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
        >
          {saving ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Enregistrement en cours...
            </>
          ) : (
            <>
              ✅ Sauvegarder tous les paramètres
            </>
          )}
        </Button>
      </div>
    </div>
  )
}