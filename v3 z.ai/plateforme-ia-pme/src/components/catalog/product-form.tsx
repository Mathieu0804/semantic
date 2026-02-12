'use client';

import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

interface Product {
  id?: string;
  name: string;
  description?: string;
  shortDescription?: string;
  reference?: string;
  price?: number;
  category?: string;
  stock?: number;
  stockStatus?: string;
  status?: string;
}

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Product) => Promise<void>;
  initialData?: Product | null;
  isLoading: boolean;
}

export function ProductForm({ open, onOpenChange, onSubmit, initialData, isLoading }: ProductFormProps) {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<Product>({
    defaultValues: initialData || {
      name: '',
      description: '',
      shortDescription: '',
      reference: '',
      price: 0,
      category: '',
      stock: 0,
      stockStatus: 'in_stock',
      status: 'active'
    }
  });

  const handleFormSubmit = async (data: Product) => {
    await onSubmit(data);
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {initialData ? 'Modifier le produit' : 'Ajouter un produit'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                {...register('name', { required: 'Le nom est requis' })}
                placeholder="Nom du produit"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input
                id="reference"
                {...register('reference')}
                placeholder="REF-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Prix (EUR)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register('price')}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categorie</Label>
              <Input
                id="category"
                {...register('category')}
                placeholder="Categorie"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                {...register('stock')}
                placeholder="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stockStatus">Statut Stock</Label>
              <Select 
                value={watch('stockStatus')} 
                onValueChange={(v) => setValue('stockStatus', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">En stock</SelectItem>
                  <SelectItem value="out_of_stock">Rupture</SelectItem>
                  <SelectItem value="on_order">Sur commande</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Statut</Label>
              <Select 
                value={watch('status')} 
                onValueChange={(v) => setValue('status', v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Actif</SelectItem>
                  <SelectItem value="inactive">Inactif</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="shortDescription">Description courte</Label>
              <Input
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="Description courte"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Description detaillee du produit"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {initialData ? 'Modifier' : 'Ajouter'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
