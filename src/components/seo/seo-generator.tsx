'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Loader2, Sparkles, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface SEOData {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
}

export function SEOGenerator() {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [seoData, setSeoData] = useState<SEOData>({
    metaTitle: '',
    metaDescription: '',
    keywords: ''
  });

  const generateKeywords = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'keywords', data: seoData })
      });
      
      const result = await response.json();
      if (result.keywords) {
        setSeoData(prev => ({ ...prev, keywords: result.keywords }));
        toast.success('Mots-cles generes avec succes');
      }
    } catch {
      toast.error('Erreur lors de la generation des mots-cles');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch('/api/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seoData)
      });
      toast.success('Configuration SEO sauvegardee');
    } catch {
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copie dans le presse-papier');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Configuration SEO
          </CardTitle>
          <CardDescription>
            Optimisez votre referencement avec des metadonnees personnalisees
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaTitle">Titre Meta</Label>
              <Badge variant="outline">{seoData.metaTitle?.length || 0}/60</Badge>
            </div>
            <div className="flex gap-2">
              <Input
                id="metaTitle"
                value={seoData.metaTitle || ''}
                onChange={(e) => setSeoData(prev => ({ ...prev, metaTitle: e.target.value }))}
                placeholder="Titre de votre page pour les moteurs de recherche"
                maxLength={60}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(seoData.metaTitle || '', 'title')}
              >
                {copied === 'title' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Le titre optimal est entre 50-60 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="metaDescription">Description Meta</Label>
              <Badge variant="outline">{seoData.metaDescription?.length || 0}/160</Badge>
            </div>
            <div className="flex gap-2">
              <Textarea
                id="metaDescription"
                value={seoData.metaDescription || ''}
                onChange={(e) => setSeoData(prev => ({ ...prev, metaDescription: e.target.value }))}
                placeholder="Description de votre page pour les moteurs de recherche"
                maxLength={160}
                rows={3}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(seoData.metaDescription || '', 'description')}
              >
                {copied === 'description' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              La description optimale est entre 150-160 caracteres
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="keywords">Mots-cles</Label>
              <Button 
                variant="outline" 
                size="sm"
                onClick={generateKeywords}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4 mr-2" />
                )}
                Generer par IA
              </Button>
            </div>
            <div className="flex gap-2">
              <Textarea
                id="keywords"
                value={seoData.keywords || ''}
                onChange={(e) => setSeoData(prev => ({ ...prev, keywords: e.target.value }))}
                placeholder="mot-cle1, mot-cle2, mot-cle3..."
                rows={2}
              />
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => copyToClipboard(seoData.keywords || '', 'keywords')}
              >
                {copied === 'keywords' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button onClick={handleSave} className="w-full">
            Sauvegarder la configuration SEO
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
