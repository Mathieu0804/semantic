'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileJson, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: Record<string, unknown>[]) => Promise<void>;
}

export function ImportModal({ open, onOpenChange, onImport }: ImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Record<string, unknown>[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Record<string, unknown>[] => {
    const lines = text.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('Le fichier CSV doit contenir au moins une ligne d\'en-tetes et une ligne de donnees');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data: Record<string, unknown>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: Record<string, unknown> = {};
        headers.forEach((header, idx) => {
          row[header] = values[idx];
        });
        data.push(row);
      }
    }

    return data;
  };

  const parseJSON = (text: string): Record<string, unknown>[] => {
    const parsed = JSON.parse(text);
    return Array.isArray(parsed) ? parsed : [parsed];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const isJSON = selectedFile.name.endsWith('.json');
        const data = isJSON ? parseJSON(text) : parseCSV(text);
        setPreview(data.slice(0, 5));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de parsing');
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!preview || preview.length === 0) return;

    setIsLoading(true);
    try {
      await onImport(preview);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Importer des produits</DialogTitle>
          <DialogDescription>
            Importez vos produits depuis un fichier CSV ou JSON
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="file" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="file">
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Fichier
            </TabsTrigger>
            <TabsTrigger value="format">
              <FileJson className="h-4 w-4 mr-2" />
              Format attendu
            </TabsTrigger>
          </TabsList>

          <TabsContent value="file" className="space-y-4">
            <div className="space-y-2">
              <Label>Selectionner un fichier</Label>
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
              <Button
                variant="outline"
                className="w-full h-24 border-dashed"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-6 w-6" />
                  <span>{file ? file.name : 'Cliquez pour selectionner'}</span>
                </div>
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {preview && preview.length > 0 && (
              <div className="space-y-2">
                <Label>Apercu ({preview.length} premiers elements)</Label>
                <div className="max-h-48 overflow-auto rounded-lg border p-2 text-xs bg-muted">
                  <pre>{JSON.stringify(preview, null, 2)}</pre>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="format" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Format CSV attendu</Label>
                <div className="text-xs bg-muted p-3 rounded-lg font-mono">
                  name,price,category,stock,description<br/>
                  "Produit 1",29.99,"Categorie A",100,"Description du produit"<br/>
                  "Produit 2",49.99,"Categorie B",50,"Autre description"
                </div>
              </div>

              <div className="space-y-2">
                <Label>Format JSON attendu</Label>
                <div className="text-xs bg-muted p-3 rounded-lg font-mono max-h-32 overflow-auto">
{`[
  {
    "name": "Produit 1",
    "price": 29.99,
    "category": "Categorie A",
    "stock": 100,
    "description": "Description"
  }
]`}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleImport} 
            disabled={!preview || preview.length === 0 || isLoading}
          >
            Importer {preview ? `(${preview.length} elements)` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
