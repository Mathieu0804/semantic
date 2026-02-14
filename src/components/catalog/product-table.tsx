'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Upload,
  Package,
  Briefcase,
  Filter,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description?: string;
  price?: number;
  category?: string;
  stock?: number;
  stockStatus?: string;
  status: string;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  description?: string;
  basePrice?: number;
  category?: string;
  pricingType?: string;
  status: string;
  createdAt: string;
}

export function CatalogSection() {
  const [activeTab, setActiveTab] = useState<'products' | 'services'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<Product | Service | null>(null);
  const [importOpen, setImportOpen] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    status: 'active',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, servicesRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/services'),
      ]);
      const productsData = await productsRes.json();
      const servicesData = await servicesRes.json();
      setProducts(productsData.products || []);
      setServices(servicesData.services || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name) return;

    const endpoint = activeTab === 'products' ? '/api/products' : '/api/services';
    const body = activeTab === 'products'
      ? {
          ...(editItem?.id && { id: editItem.id }),
          name: formData.name,
          description: formData.description,
          price: formData.price,
          category: formData.category,
          stock: formData.stock,
          status: formData.status,
        }
      : {
          ...(editItem?.id && { id: editItem.id }),
          name: formData.name,
          description: formData.description,
          basePrice: formData.price,
          category: formData.category,
          status: formData.status,
        };

    try {
      const method = editItem ? 'PUT' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        fetchData();
        closeDialog();
      }
    } catch (error) {
      console.error('Error saving:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet élément ?')) return;

    const endpoint = activeTab === 'products' ? `/api/products?id=${id}` : `/api/services?id=${id}`;
    try {
      await fetch(endpoint, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  const handleImport = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', activeTab);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      alert(`Import terminé: ${data.imported} éléments importés, ${data.errors} erreurs`);
      fetchData();
      setImportOpen(false);
    } catch (error) {
      console.error('Error importing:', error);
      alert('Erreur lors de l\'import');
    }
  };

  const openDialog = (item?: Product | Service) => {
    if (item) {
      setEditItem(item);
      setFormData({
        name: item.name,
        description: item.description || '',
        price: String((item as Product).price || (item as Service).basePrice || ''),
        category: item.category || '',
        stock: String((item as Product).stock || ''),
        status: item.status,
      });
    } else {
      setEditItem(null);
      setFormData({ name: '', description: '', price: '', category: '', stock: '', status: 'active' });
    }
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditItem(null);
    setFormData({ name: '', description: '', price: '', category: '', stock: '', status: 'active' });
  };

  const getStockBadge = (status?: string) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />En stock</Badge>;
      case 'out_of_stock':
        return <Badge className="bg-red-600"><XCircle className="w-3 h-3 mr-1" />Rupture</Badge>;
      case 'on_order':
        return <Badge className="bg-yellow-600"><AlertCircle className="w-3 h-3 mr-1" />Sur commande</Badge>;
      default:
        return <Badge variant="secondary">N/A</Badge>;
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredServices = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Catalogue</h2>
            <p className="text-slate-400">Gérez vos produits et services</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setImportOpen(true)}
              className="border-slate-600 text-slate-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importer
            </Button>
            <Button
              onClick={() => openDialog()}
              className="bg-gradient-to-r from-blue-600 to-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'products' | 'services')}>
          <TabsList className="bg-slate-800 border border-slate-700">
            <TabsTrigger value="products" className="data-[state=active]:bg-blue-600">
              <Package className="w-4 h-4 mr-2" />
              Produits ({products.length})
            </TabsTrigger>
            <TabsTrigger value="services" className="data-[state=active]:bg-blue-600">
              <Briefcase className="w-4 h-4 mr-2" />
              Services ({services.length})
            </TabsTrigger>
          </TabsList>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 my-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <Button variant="outline" className="border-slate-600 text-slate-300">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
          </div>

          {/* Products Table */}
          <TabsContent value="products">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800">
                        <TableHead className="text-slate-300">Nom</TableHead>
                        <TableHead className="text-slate-300">Catégorie</TableHead>
                        <TableHead className="text-slate-300">Prix</TableHead>
                        <TableHead className="text-slate-300">Stock</TableHead>
                        <TableHead className="text-slate-300">Statut</TableHead>
                        <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Chargement...
                          </TableCell>
                        </TableRow>
                      ) : filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Aucun produit trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow key={product.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white font-medium">{product.name}</TableCell>
                            <TableCell className="text-slate-300">{product.category || '-'}</TableCell>
                            <TableCell className="text-slate-300">
                              {product.price ? `${product.price} EUR` : '-'}
                            </TableCell>
                            <TableCell>
                              {getStockBadge(product.stockStatus)}
                            </TableCell>
                            <TableCell>
                              <Badge variant={product.status === 'active' ? 'default' : 'secondary'}>
                                {product.status === 'active' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-slate-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem onClick={() => openDialog(product)} className="text-slate-300">
                                    <Edit className="w-4 h-4 mr-2" /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(product.id)}
                                    className="text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Services Table */}
          <TabsContent value="services">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-700 hover:bg-slate-800">
                        <TableHead className="text-slate-300">Nom</TableHead>
                        <TableHead className="text-slate-300">Catégorie</TableHead>
                        <TableHead className="text-slate-300">Prix de base</TableHead>
                        <TableHead className="text-slate-300">Type</TableHead>
                        <TableHead className="text-slate-300">Statut</TableHead>
                        <TableHead className="text-slate-300 text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Chargement...
                          </TableCell>
                        </TableRow>
                      ) : filteredServices.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-slate-400 py-8">
                            Aucun service trouvé
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredServices.map((service) => (
                          <TableRow key={service.id} className="border-slate-700 hover:bg-slate-800/50">
                            <TableCell className="text-white font-medium">{service.name}</TableCell>
                            <TableCell className="text-slate-300">{service.category || '-'}</TableCell>
                            <TableCell className="text-slate-300">
                              {service.basePrice ? `${service.basePrice} EUR` : '-'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {service.pricingType === 'fixed' ? 'Fixe' : service.pricingType === 'hourly' ? 'Horaire' : 'Devis'}
                            </TableCell>
                            <TableCell>
                              <Badge variant={service.status === 'active' ? 'default' : 'secondary'}>
                                {service.status === 'active' ? 'Actif' : 'Inactif'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-slate-400">
                                    <MoreHorizontal className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                  <DropdownMenuItem onClick={() => openDialog(service)} className="text-slate-300">
                                    <Edit className="w-4 h-4 mr-2" /> Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(service.id)}
                                    className="text-red-400"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" /> Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Add/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={closeDialog}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>
                {editItem ? 'Modifier' : 'Ajouter'} {activeTab === 'products' ? 'un produit' : 'un service'}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-slate-800 border-slate-600"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Prix (EUR)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              </div>
              {activeTab === 'products' && (
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="bg-slate-800 border-slate-600"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={closeDialog} className="border-slate-600 text-slate-300">
                Annuler
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <Dialog open={importOpen} onOpenChange={setImportOpen}>
          <DialogContent className="bg-slate-900 border-slate-700 text-white">
            <DialogHeader>
              <DialogTitle>Importer des {activeTab === 'products' ? 'produits' : 'services'}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-slate-400 text-sm mb-4">
                Importez vos données depuis un fichier CSV ou JSON. Le fichier doit contenir les colonnes : name, description, price, category, stock.
              </p>
              <Input
                type="file"
                accept=".csv,.json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                }}
                className="bg-slate-800 border-slate-600"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
