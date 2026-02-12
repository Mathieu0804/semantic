'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles, Copy, Check, Code } from 'lucide-react';
import { toast } from 'sonner';

export function LDJsonPreview() {
  const [isLoading, setIsLoading] = useState(false);
  const [ldJson, setLdJson] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generateLDJson = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'ldjson' })
      });
      
      const result = await response.json();
      if (result.ldJson) {
        // Try to format the JSON
        try {
          const parsed = JSON.parse(result.ldJson);
          setLdJson(JSON.stringify(parsed, null, 2));
        } catch {
          setLdJson(result.ldJson);
        }
        toast.success('LD-JSON genere avec succes');
      }
    } catch {
      toast.error('Erreur lors de la generation du LD-JSON');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    if (!ldJson) return;
    await navigator.clipboard.writeText(ldJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('LD-JSON copie dans le presse-papier');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          Schema.org LD-JSON
        </CardTitle>
        <CardDescription>
          Donnees structurees pour ameliorer votre referencement
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={generateLDJson}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            Generer LD-JSON
          </Button>
          {ldJson && (
            <Button variant="outline" onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {ldJson && (
          <div className="relative">
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-64 font-mono">
              {ldJson}
            </pre>
          </div>
        )}

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Le format LD-JSON permet aux moteurs de recherche de mieux comprendre 
            votre entreprise et d&apos;afficher des informations enrichies dans les resultats de recherche.
          </p>
          <p>
            Placez ce code dans la section &lt;head&gt; de votre site web.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
