import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CatalogManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CatalogManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    description: '',
    short_description: '',
    category: '',
    price: '',
    currency: 'EUR',
    stock_quantity: 0,
    is_active: true
  });

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search: searchTerm,
          category: filterCategory
        }
      });
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(response.data.categories || []);
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (selectedProduct) {
        // Mise à jour
        await axios.put(
          `${API_URL}/api/products/${selectedProduct.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Produit mis à jour !');
      } else {
        // Création
        await axios.post(
          `${API_URL}/api/products`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Produit créé !');
      }
      
      closeModal();
      loadProducts();
    } catch (error) {
      console.error('Erreur sauvegarde produit:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const deleteProduct = async (productId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Produit supprimé !');
      loadProducts();
    } catch (error) {
      console.error('Erreur suppression produit:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setSelectedProduct(product);
      setFormData(product);
    } else {
      setSelectedProduct(null);
      setFormData({
        name: '',
        sku: '',
        description: '',
        short_description: '',
        category: '',
        price: '',
        currency: 'EUR',
        stock_quantity: 0,
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setIsImporting(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/products/import`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      alert(`${response.data.imported} produits importés !`);
      loadProducts();
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'importation');
    } finally {
      setIsImporting(false);
    }
  };

  const handleExport = async (format = 'csv') => {
    try {
      const response = await axios.get(
        `${API_URL}/api/products/export`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { format },
          responseType: 'blob'
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       product.sku?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = !filterCategory || product.category === filterCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="catalog-manager">
      {/* Header */}
      <header className="header">
        <h1>📦 Gestion du Catalogue</h1>
        <div className="header-actions">
          <label className="btn-import">
            📥 Importer
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              onChange={handleImport}
              style={{ display: 'none' }}
              disabled={isImporting}
            />
          </label>
          <button className="btn-secondary" onClick={() => handleExport('csv')}>
            📤 Exporter CSV
          </button>
          <button className="btn-primary" onClick={() => openModal()}>
            ➕ Nouveau Produit
          </button>
        </div>
      </header>

      {/* Filtres */}
      <div className="filters">
        <input
          type="text"
          placeholder="🔍 Rechercher par nom ou SKU..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="category-filter"
        >
          <option value="">Toutes les catégories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>{cat.name}</option>
          ))}
        </select>
        <div className="results-count">
          {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste produits */}
      <div className="products-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-image">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} />
              ) : (
                <div className="no-image">📦</div>
              )}
            </div>
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="product-sku">SKU: {product.sku || 'N/A'}</p>
              <p className="product-category">{product.category || 'Sans catégorie'}</p>
              <div className="product-price">
                {product.price} {product.currency}
              </div>
              <div className="product-stock">
                Stock: {product.stock_quantity}
              </div>
              <div className="product-status">
                <span className={`status-badge ${product.is_active ? 'active' : 'inactive'}`}>
                  {product.is_active ? '✓ Actif' : '✗ Inactif'}
                </span>
              </div>
            </div>
            <div className="product-actions">
              <button
                className="btn-edit"
                onClick={() => openModal(product)}
              >
                ✏️ Modifier
              </button>
              <button
                className="btn-delete"
                onClick={() => deleteProduct(product.id)}
              >
                🗑️ Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <p>Aucun produit trouvé</p>
          <button className="btn-primary" onClick={() => openModal()}>
            Créer votre premier produit
          </button>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProduct ? 'Modifier le produit' : 'Nouveau produit'}</h2>
              <button className="btn-close" onClick={closeModal}>✕</button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nom du produit *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>SKU</label>
                  <input
                    type="text"
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description courte</label>
                  <input
                    type="text"
                    value={formData.short_description}
                    onChange={(e) => setFormData({...formData, short_description: e.target.value})}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description complète</label>
                  <textarea
                    rows="4"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="form-group">
                  <label>Catégorie</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="">Sélectionner...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Prix *</label>
                  <div className="price-input">
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                    />
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    >
                      <option value="EUR">EUR</option>
                      <option value="USD">USD</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Stock</label>
                  <input
                    type="number"
                    value={formData.stock_quantity}
                    onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                  />
                </div>

                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Produit actif
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {selectedProduct ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatalogManager;
