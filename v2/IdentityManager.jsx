import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './IdentityManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const IdentityManager = () => {
  const [identity, setIdentity] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    mission: '',
    vision: '',
    values: [],
    target_audience: '',
    unique_selling_points: [],
    brand_voice: 'professional',
    brand_tone: 'formal',
    primary_color: '#3B82F6',
    secondary_color: '#10B981'
  });
  const [newValue, setNewValue] = useState('');
  const [newUSP, setNewUSP] = useState('');
  const [keywords, setKeywords] = useState([]);
  const [ldJson, setLdJson] = useState(null);
  const [activeTab, setActiveTab] = useState('identity');

  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    loadIdentity();
  }, []);

  const loadIdentity = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/identity`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.identity) {
        setIdentity(response.data.identity);
        setFormData(response.data.identity);
      } else {
        setIsEditing(true); // Créer si n'existe pas
      }
    } catch (error) {
      console.error('Erreur chargement identité:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await axios.post(
        `${API_URL}/api/identity`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Identité enregistrée avec succès ! 🎉');
      setIsEditing(false);
      loadIdentity();
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const generateKeywords = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/identity/generate-keywords`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setKeywords(response.data.keywords);
      setActiveTab('seo');
    } catch (error) {
      console.error('Erreur génération mots-clés:', error);
      alert('Erreur lors de la génération des mots-clés');
    } finally {
      setIsSaving(false);
    }
  };

  const generateLdJson = async () => {
    setIsSaving(true);
    try {
      const response = await axios.post(
        `${API_URL}/api/identity/generate-ldjson`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLdJson(response.data.ldJson);
      setActiveTab('seo');
    } catch (error) {
      console.error('Erreur génération LD-JSON:', error);
      alert('Erreur lors de la génération du LD-JSON');
    } finally {
      setIsSaving(false);
    }
  };

  const addValue = () => {
    if (newValue.trim()) {
      setFormData({
        ...formData,
        values: [...(formData.values || []), newValue.trim()]
      });
      setNewValue('');
    }
  };

  const removeValue = (index) => {
    setFormData({
      ...formData,
      values: formData.values.filter((_, i) => i !== index)
    });
  };

  const addUSP = () => {
    if (newUSP.trim()) {
      setFormData({
        ...formData,
        unique_selling_points: [...(formData.unique_selling_points || []), newUSP.trim()]
      });
      setNewUSP('');
    }
  };

  const removeUSP = (index) => {
    setFormData({
      ...formData,
      unique_selling_points: formData.unique_selling_points.filter((_, i) => i !== index)
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copié dans le presse-papiers !');
  };

  return (
    <div className="identity-manager">
      {/* Header */}
      <header className="header">
        <h1>🏢 Identité de l'Entreprise</h1>
        <div className="header-actions">
          {!isEditing && identity && (
            <button className="btn-secondary" onClick={() => setIsEditing(true)}>
              ✏️ Modifier
            </button>
          )}
          {isEditing && (
            <>
              <button className="btn-secondary" onClick={() => setIsEditing(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={isSaving}>
                {isSaving ? '⏳ Enregistrement...' : '💾 Enregistrer'}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'identity' ? 'active' : ''}`}
          onClick={() => setActiveTab('identity')}
        >
          📋 Identité
        </button>
        <button
          className={`tab ${activeTab === 'brand' ? 'active' : ''}`}
          onClick={() => setActiveTab('brand')}
        >
          🎨 Marque
        </button>
        <button
          className={`tab ${activeTab === 'seo' ? 'active' : ''}`}
          onClick={() => setActiveTab('seo')}
        >
          🔍 SEO
        </button>
      </div>

      {/* Content */}
      <div className="content">
        {/* Onglet Identité */}
        {activeTab === 'identity' && (
          <div className="tab-content">
            <div className="form-section">
              <h2>Mission</h2>
              <p className="help-text">Pourquoi votre entreprise existe-t-elle ?</p>
              {isEditing ? (
                <textarea
                  rows="4"
                  value={formData.mission}
                  onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                  placeholder="Ex: Aider les PME à digitaliser leur activité de manière souveraine"
                />
              ) : (
                <div className="display-value">{identity?.mission || 'Non définie'}</div>
              )}
            </div>

            <div className="form-section">
              <h2>Vision</h2>
              <p className="help-text">Où voulez-vous être dans 5-10 ans ?</p>
              {isEditing ? (
                <textarea
                  rows="4"
                  value={formData.vision}
                  onChange={(e) => setFormData({ ...formData, vision: e.target.value })}
                  placeholder="Ex: Devenir le leader français de la digitalisation souveraine pour PME"
                />
              ) : (
                <div className="display-value">{identity?.vision || 'Non définie'}</div>
              )}
            </div>

            <div className="form-section">
              <h2>Valeurs</h2>
              <p className="help-text">Quelles sont vos valeurs fondamentales ?</p>
              <div className="values-list">
                {(isEditing ? formData.values : identity?.values || []).map((value, index) => (
                  <div key={index} className="value-tag">
                    {value}
                    {isEditing && (
                      <button onClick={() => removeValue(index)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="add-value">
                  <input
                    type="text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    placeholder="Ajouter une valeur..."
                    onKeyPress={(e) => e.key === 'Enter' && addValue()}
                  />
                  <button onClick={addValue}>Ajouter</button>
                </div>
              )}
            </div>

            <div className="form-section">
              <h2>Public Cible</h2>
              <p className="help-text">Qui sont vos clients idéaux ?</p>
              {isEditing ? (
                <textarea
                  rows="3"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="Ex: PME et PMI de 5 à 50 employés sensibles à la souveraineté numérique"
                />
              ) : (
                <div className="display-value">{identity?.target_audience || 'Non défini'}</div>
              )}
            </div>

            <div className="form-section">
              <h2>Points Forts Uniques (USP)</h2>
              <p className="help-text">Qu'est-ce qui vous rend unique ?</p>
              <div className="values-list">
                {(isEditing ? formData.unique_selling_points : identity?.unique_selling_points || []).map((usp, index) => (
                  <div key={index} className="value-tag">
                    {usp}
                    {isEditing && (
                      <button onClick={() => removeUSP(index)}>✕</button>
                    )}
                  </div>
                ))}
              </div>
              {isEditing && (
                <div className="add-value">
                  <input
                    type="text"
                    value={newUSP}
                    onChange={(e) => setNewUSP(e.target.value)}
                    placeholder="Ajouter un point fort..."
                    onKeyPress={(e) => e.key === 'Enter' && addUSP()}
                  />
                  <button onClick={addUSP}>Ajouter</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Onglet Marque */}
        {activeTab === 'brand' && (
          <div className="tab-content">
            <div className="form-section">
              <h2>Ton de Communication</h2>
              {isEditing ? (
                <select
                  value={formData.brand_voice}
                  onChange={(e) => setFormData({ ...formData, brand_voice: e.target.value })}
                >
                  <option value="professional">Professionnel</option>
                  <option value="friendly">Amical</option>
                  <option value="technical">Technique</option>
                  <option value="casual">Décontracté</option>
                  <option value="enthusiastic">Enthousiaste</option>
                </select>
              ) : (
                <div className="display-value">{identity?.brand_voice || 'Professionnel'}</div>
              )}
            </div>

            <div className="form-section">
              <h2>Style de Communication</h2>
              {isEditing ? (
                <select
                  value={formData.brand_tone}
                  onChange={(e) => setFormData({ ...formData, brand_tone: e.target.value })}
                >
                  <option value="formal">Formel</option>
                  <option value="casual">Casual</option>
                  <option value="humorous">Humoristique</option>
                  <option value="serious">Sérieux</option>
                  <option value="inspiring">Inspirant</option>
                </select>
              ) : (
                <div className="display-value">{identity?.brand_tone || 'Formel'}</div>
              )}
            </div>

            <div className="form-section">
              <h2>Couleurs de Marque</h2>
              <div className="color-pickers">
                <div className="color-picker">
                  <label>Couleur Primaire</label>
                  {isEditing ? (
                    <input
                      type="color"
                      value={formData.primary_color}
                      onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                    />
                  ) : (
                    <div className="color-display" style={{ background: identity?.primary_color }} />
                  )}
                  <span>{isEditing ? formData.primary_color : identity?.primary_color}</span>
                </div>
                <div className="color-picker">
                  <label>Couleur Secondaire</label>
                  {isEditing ? (
                    <input
                      type="color"
                      value={formData.secondary_color}
                      onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                    />
                  ) : (
                    <div className="color-display" style={{ background: identity?.secondary_color }} />
                  )}
                  <span>{isEditing ? formData.secondary_color : identity?.secondary_color}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Onglet SEO */}
        {activeTab === 'seo' && (
          <div className="tab-content">
            <div className="seo-actions">
              <button className="btn-primary" onClick={generateKeywords} disabled={isSaving}>
                🤖 Générer Mots-Clés SEO
              </button>
              <button className="btn-primary" onClick={generateLdJson} disabled={isSaving}>
                🤖 Générer LD-JSON
              </button>
            </div>

            {keywords.length > 0 && (
              <div className="form-section">
                <h2>Mots-Clés SEO Générés</h2>
                <div className="keywords-grid">
                  {keywords.map((keyword, index) => (
                    <div key={index} className="keyword-tag">
                      {keyword}
                    </div>
                  ))}
                </div>
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(keywords.join(', '))}
                >
                  📋 Copier tous les mots-clés
                </button>
              </div>
            )}

            {ldJson && (
              <div className="form-section">
                <h2>LD-JSON Schema.org</h2>
                <pre className="json-display">
                  {JSON.stringify(ldJson, null, 2)}
                </pre>
                <button
                  className="btn-copy"
                  onClick={() => copyToClipboard(JSON.stringify(ldJson, null, 2))}
                >
                  📋 Copier le LD-JSON
                </button>
                <p className="help-text">
                  Copiez ce code et ajoutez-le dans la section &lt;head&gt; de votre site
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default IdentityManager;
