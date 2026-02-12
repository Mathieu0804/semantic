'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Loader2, 
  Sparkles, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  Clock,
  Lightbulb
} from 'lucide-react';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Pattern {
  id: string;
  type: string;
  category?: string;
  insights?: string;
  confidence?: number;
  frequency: number;
  suggestions?: string;
  status: string;
  createdAt: string;
}

export function PatternsList() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const response = await fetch('/api/analytics?type=patterns');
      const data = await response.json();
      setPatterns(data.patterns || []);
    } catch {
      console.error('Failed to fetch patterns');
    } finally {
      setIsLoading(false);
    }
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'analyze' })
      });
      const data = await response.json();
      
      if (data.pattern) {
        setPatterns(prev => [data.pattern, ...prev]);
        toast.success('Analyse terminee avec succes');
      }
    } catch {
      toast.error('Erreur lors de l\'analyse');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'product_interest':
        return <TrendingUp className="h-4 w-4" />;
      case 'service_demand':
        return <TrendingUp className="h-4 w-4" />;
      case 'navigation':
        return <Clock className="h-4 w-4" />;
      case 'conversion':
        return <CheckCircle className="h-4 w-4" />;
      case 'ai_analysis':
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      active: { label: 'Actif', className: 'bg-green-500/10 text-green-500' },
      reviewed: { label: 'Revu', className: 'bg-blue-500/10 text-blue-500' },
      implemented: { label: 'Implemente', className: 'bg-purple-500/10 text-purple-500' }
    };
    const variant = variants[status] || variants.active;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  const parseSuggestions = (suggestions?: string) => {
    if (!suggestions) return [];
    try {
      return JSON.parse(suggestions);
    } catch {
      return suggestions.split('\n').filter(s => s.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Analysis Button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Patterns et Insights</h3>
          <p className="text-sm text-muted-foreground">
            Analyse automatique des comportements utilisateurs
          </p>
        </div>
        <Button onClick={runAnalysis} disabled={isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Sparkles className="h-4 w-4 mr-2" />
          )}
          Lancer l'analyse IA
        </Button>
      </div>

      {/* Patterns List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : patterns.length === 0 ? (
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>Aucun pattern detecte</AlertTitle>
          <AlertDescription>
            Lancez une analyse IA pour detecter des patterns dans les donnees de votre site.
          </AlertDescription>
        </Alert>
      ) : (
        <ScrollArea className="h-[500px]">
          <div className="space-y-4 pr-4">
            {patterns.map((pattern) => (
              <Card key={pattern.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getTypeIcon(pattern.type)}
                      <span className="capitalize">
                        {pattern.type.replace(/_/g, ' ')}
                      </span>
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {pattern.confidence && (
                        <Badge variant="outline">
                          {(pattern.confidence * 100).toFixed(0)}% confiance
                        </Badge>
                      )}
                      {getStatusBadge(pattern.status)}
                    </div>
                  </div>
                  {pattern.category && (
                    <CardDescription>
                      Categorie: {pattern.category}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Insights */}
                  {pattern.insights && (
                    <div>
                      <p className="text-sm font-medium mb-1">Insights</p>
                      <div className="text-sm bg-muted p-3 rounded-lg">
                        {pattern.insights}
                      </div>
                    </div>
                  )}

                  {/* Suggestions */}
                  {pattern.suggestions && (
                    <div>
                      <p className="text-sm font-medium mb-2">Recommandations</p>
                      <div className="space-y-1">
                        {parseSuggestions(pattern.suggestions).map((suggestion: string, idx: number) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 mt-0.5 text-green-500 shrink-0" />
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Meta */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Frequence: {pattern.frequency}</span>
                    <span>
                      Detecte le {new Date(pattern.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
