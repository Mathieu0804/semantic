'use client';

import { useState, useEffect } from 'react';
import {
  Building2,
  Save,
  Sparkles,
  Globe,
  Mail,
  Phone,
  MapPin,
  Palette,
  Cpu,
  Code,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

interface CompanyData {
  id: string;
  name: string;
  description?: string;
  slogan?: string;
  logo?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  website?: string;
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  instagram?: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ldJson?: string;
  businessType?: string;
  aiPersonality?: string;
  aiTone?: string;
  aiExpertise?: string;
}

interface SEOSectionProps {
  onCompanyUpdate?: (name: string) => void;
}

export function SEOSection({ onCompanyUpdate }: SEOSectionProps) {
  const [company, setCompany] = useState<CompanyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingSeo, setGeneratingSeo] = useState(false);
  const [generatingLdJson, setGeneratingLdJson] = useState(false);

  const [formData, setFormData] = useState<Partial<CompanyData>>({
    name: '',
    description: '',
    slogan: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    accentColor: '#10B981',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    country: 'France',
    website: '',
    facebook: '',
    twitter: '',
    linkedin: '',
    instagram: '',
    metaTitle: '',
    metaDescription: '',
    keywords: '',
    businessType: 'LocalBusiness',
    aiPersonality: '',
    aiTone: 'professionnel',
    aiExpertise: '',
  });

  useEffect(() => {
    fetchCompany();
  }, []);

  const fetchCompany = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/company');
      const data = await response.json();
      if (data.company) {
        setCompany(data.company);
        setFormData(data.company);
      }
    } catch (error) {
      console.error('Error fetching company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.company) {
        setCompany(data.company);
        onCompanyUpdate?.(data.company.name);
      }
    } catch (error) {
      console.error('Error saving company:', error);
    } finally {
      setSaving(false);
    }
  };

  const generateSEO = async () => {
    setGeneratingSeo(true);
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-seo' }),
      });
      const data = await response.json();
      if (data.keywords) {
        setFormData({ ...formData, keywords: data.keywords.join(', ') });
        if (data.company) setCompany(data.company);
      }
    } catch (error) {
      console.error('Error generating SEO:', error);
    } finally {
      setGeneratingSeo(false);
    }
  };

  const generateLDJson = async () => {
    setGeneratingLdJson(true);
    try {
      const response = await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate-ldjson' }),
      });
      const data = await response.json();
      if (data.ldJson) {
        setFormData({ ...formData, ldJson: JSON.stringify(data.ldJson, null, 2) });
        if (data.company) setCompany(data.company);
      }
    } catch (error) {
      console.error('Error generating LD-JSON:', error);
    } finally {
      setGeneratingLdJson(false);
    }
  };

  const updateField = (field: keyof CompanyData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 overflow-y-auto max-h-screen">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Identité Entreprise & SEO</h2>
            <p className="text-slate-400">Configurez votre entreprise et optimisez votre référencement</p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>

        <Tabs defaultValue="identity" className="space-y-6">
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="identity" className="data-[state=active]:bg-blue-600">
              <Building2 className="w-4 h-4 mr-2" />
              Identité
            </TabsTrigger>
            <TabsTrigger value="contact" className="data-[state=active]:bg-blue-600">
              <MapPin className="w-4 h-4 mr-2" />
              Contact
            </TabsTrigger>
            <TabsTrigger value="seo" className="data-[state=active]:bg-blue-600">
              <Globe className="w-4 h-4 mr-2" />
              SEO
            </TabsTrigger>
            <TabsTrigger value="ai" className="data-[state=active]:bg-blue-600">
              <Cpu className="w-4 h-4 mr-2" />
              IA
            </TabsTrigger>
          </TabsList>

          {/* Identity Tab */}
          <TabsContent value="identity">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Informations générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Nom de l'entreprise *</Label>
                    <Input
                      value={formData.name || ''}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Mon Entreprise"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Slogan</Label>
                    <Input
                      value={formData.slogan || ''}
                      onChange={(e) => updateField('slogan', e.target.value)}
                      placeholder="Votre slogan accrocheur"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Description</Label>
                    <Textarea
                      value={formData.description || ''}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Décrivez votre entreprise..."
                      rows={4}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Type d'entreprise</Label>
                    <select
                      value={formData.businessType || 'LocalBusiness'}
                      onChange={(e) => updateField('businessType', e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white"
                    >
                      <option value="LocalBusiness">Commerce local</option>
                      <option value="ProfessionalService">Service professionnel</option>
                      <option value="Restaurant">Restaurant</option>
                      <option value="Store">Boutique</option>
                      <option value="Organization">Organisation</option>
                      <option value="Corporation">Entreprise</option>
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Palette className="w-5 h-5" />
                    Identité visuelle
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Couleur primaire</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.primaryColor || '#3B82F6'}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="w-12 h-10 p-1 bg-slate-700 border-slate-600"
                        />
                        <Input
                          value={formData.primaryColor || '#3B82F6'}
                          onChange={(e) => updateField('primaryColor', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Secondaire</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.secondaryColor || '#1E40AF'}
                          onChange={(e) => updateField('secondaryColor', e.target.value)}
                          className="w-12 h-10 p-1 bg-slate-700 border-slate-600"
                        />
                        <Input
                          value={formData.secondaryColor || '#1E40AF'}
                          onChange={(e) => updateField('secondaryColor', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Accent</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={formData.accentColor || '#10B981'}
                          onChange={(e) => updateField('accentColor', e.target.value)}
                          className="w-12 h-10 p-1 bg-slate-700 border-slate-600"
                        />
                        <Input
                          value={formData.accentColor || '#10B981'}
                          onChange={(e) => updateField('accentColor', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Preview */}
                  <div className="mt-4 p-4 rounded-lg border border-slate-600">
                    <p className="text-sm text-slate-400 mb-2">Aperçu</p>
                    <div className="flex gap-2">
                      <div
                        className="w-16 h-8 rounded"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                      <div
                        className="w-16 h-8 rounded"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                      <div
                        className="w-16 h-8 rounded"
                        style={{ backgroundColor: formData.accentColor }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">URL du logo</Label>
                    <Input
                      value={formData.logo || ''}
                      onChange={(e) => updateField('logo', e.target.value)}
                      placeholder="https://..."
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Coordonnées</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email
                    </Label>
                    <Input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="contact@entreprise.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Téléphone
                    </Label>
                    <Input
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Site web</Label>
                    <Input
                      value={formData.website || ''}
                      onChange={(e) => updateField('website', e.target.value)}
                      placeholder="https://www.entreprise.com"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Adresse
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Adresse</Label>
                    <Input
                      value={formData.address || ''}
                      onChange={(e) => updateField('address', e.target.value)}
                      placeholder="123 Rue Exemple"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Ville</Label>
                      <Input
                        value={formData.city || ''}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Paris"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Code postal</Label>
                      <Input
                        value={formData.postalCode || ''}
                        onChange={(e) => updateField('postalCode', e.target.value)}
                        placeholder="75001"
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Pays</Label>
                    <Input
                      value={formData.country || ''}
                      onChange={(e) => updateField('country', e.target.value)}
                      placeholder="France"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-white">Réseaux sociaux</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Facebook</Label>
                      <Input
                        value={formData.facebook || ''}
                        onChange={(e) => updateField('facebook', e.target.value)}
                        placeholder="https://facebook.com/..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Twitter/X</Label>
                      <Input
                        value={formData.twitter || ''}
                        onChange={(e) => updateField('twitter', e.target.value)}
                        placeholder="https://twitter.com/..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">LinkedIn</Label>
                      <Input
                        value={formData.linkedin || ''}
                        onChange={(e) => updateField('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Instagram</Label>
                      <Input
                        value={formData.instagram || ''}
                        onChange={(e) => updateField('instagram', e.target.value)}
                        placeholder="https://instagram.com/..."
                        className="bg-slate-700 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo">
            <div className="grid gap-6">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Méta-données SEO</CardTitle>
                      <CardDescription className="text-slate-400">
                        Optimisez le référencement de votre site
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={generateSEO}
                      disabled={generatingSeo}
                      className="border-slate-600 text-slate-300"
                    >
                      <Sparkles className="w-4 h-4 mr-2" />
                      {generatingSeo ? 'Génération...' : 'Générer mots-clés'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Titre SEO (meta title)</Label>
                    <Input
                      value={formData.metaTitle || ''}
                      onChange={(e) => updateField('metaTitle', e.target.value)}
                      placeholder="Titre de votre page - Max 60 caractères"
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      {(formData.metaTitle || '').length}/60 caractères
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Description SEO (meta description)</Label>
                    <Textarea
                      value={formData.metaDescription || ''}
                      onChange={(e) => updateField('metaDescription', e.target.value)}
                      placeholder="Description de votre page pour les moteurs de recherche - Max 160 caractères"
                      rows={2}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <p className="text-xs text-slate-500">
                      {(formData.metaDescription || '').length}/160 caractères
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Mots-clés</Label>
                    <Textarea
                      value={formData.keywords || ''}
                      onChange={(e) => updateField('keywords', e.target.value)}
                      placeholder="mot-clé 1, mot-clé 2, mot-clé 3..."
                      rows={2}
                      className="bg-slate-700 border-slate-600 text-white"
                    />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(formData.keywords || '').split(',').filter(k => k.trim()).map((keyword, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {keyword.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        LD-JSON Schema.org
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Données structurées pour les moteurs de recherche
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      onClick={generateLDJson}
                      disabled={generatingLdJson}
                      className="border-slate-600 text-slate-300"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${generatingLdJson ? 'animate-spin' : ''}`} />
                      {generatingLdJson ? 'Génération...' : 'Générer LD-JSON'}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={formData.ldJson || ''}
                    onChange={(e) => updateField('ldJson', e.target.value)}
                    placeholder='{\n  "@context": "https://schema.org",\n  "@type": "LocalBusiness",\n  ...\n}'
                    rows={10}
                    className="bg-slate-700 border-slate-600 text-white font-mono text-sm"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* AI Tab */}
          <TabsContent value="ai">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Cpu className="w-5 h-5" />
                  Configuration de l'IA locale
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Personnalisez le comportement de l'IA pour qu'elle représente votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-slate-300">Ton de l'IA</Label>
                  <select
                    value={formData.aiTone || 'professionnel'}
                    onChange={(e) => updateField('aiTone', e.target.value)}
                    className="w-full px-3 py-2 rounded-md bg-slate-700 border border-slate-600 text-white"
                  >
                    <option value="professionnel">Professionnel</option>
                    <option value="amical">Amical</option>
                    <option value="formel">Formel</option>
                    <option value="decontracte">Décontracté</option>
                    <option value="technique">Technique</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Personnalité de l'IA</Label>
                  <Textarea
                    value={formData.aiPersonality || ''}
                    onChange={(e) => updateField('aiPersonality', e.target.value)}
                    placeholder="Décrivez comment l'IA doit se comporter, son style, ses valeurs..."
                    rows={4}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Exemple: "Tu es un expert en restauration, passionné par la gastronomie française. Tu parles avec enthousiasme des plats et conseils les clients avec bienveillance."
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Domaines d'expertise</Label>
                  <Textarea
                    value={formData.aiExpertise || ''}
                    onChange={(e) => updateField('aiExpertise', e.target.value)}
                    placeholder="Listez les domaines d'expertise de votre entreprise..."
                    rows={3}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                  <p className="text-xs text-slate-500">
                    Exemple: "Cuisine française traditionnelle, Vins et accords mets-vins, Organisation d'événements privés"
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
