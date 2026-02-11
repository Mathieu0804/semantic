import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './SiteCreator.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SiteCreator = () => {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [siteConfig, setSiteConfig] = useState({
    name: '',
    colors: {
      primary: '#3B82F6',
      secondary: '#10B981',
      accent: '#F59E0B'
    },
    fonts: {
      heading: 'Inter',
      body: 'Inter'
    }
  });
  const [previewMode, setPreviewMode] = useState(false);

  const messagesEndRef = useRef(null);
  const token = localStorage.getItem('auth_token');

  useEffect(() => {
    loadConversations();
    loadTemplates();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/chat/conversations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Erreur chargement conversations:', error);
    }
  };

  const loadTemplates = () => {
    // Templates prédéfinis
    setTemplates([
      {
        id: 'modern',
        name: 'Moderne & Minimaliste',
        description: 'Design épuré, parfait pour services professionnels',
        thumbnail: '/templates/modern.jpg'
      },
      {
        id: 'ecommerce',
        name: 'E-commerce',
        description: 'Optimisé pour la vente en ligne',
        thumbnail: '/templates/ecommerce.jpg'
      },
      {
        id: 'restaurant',
        name: 'Restaurant & Café',
        description: 'Ambiance chaleureuse pour l\'hospitalité',
        thumbnail: '/templates/restaurant.jpg'
      },
      {
        id: 'portfolio',
        name: 'Portfolio Créatif',
        description: 'Mettez en valeur vos créations',
        thumbnail: '/templates/portfolio.jpg'
      }
    ]);
  };

  const createNewConversation = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/chat/conversations`,
        {
          title: 'Nouvelle création de site',
          type: 'site_creation'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const newConv = response.data;
      setConversations([newConv, ...conversations]);
      setCurrentConversation(newConv);
      setMessages([]);
      
      // Message de bienvenue
      const welcomeMessage = {
        role: 'assistant',
        content: `🎨 Bonjour ! Je suis votre assistant pour créer votre site web.

Pour commencer, j'aimerais en savoir plus sur votre projet :

1. Quel est le nom de votre entreprise ?
2. Quel type de site souhaitez-vous créer ? (vitrine, e-commerce, portfolio, blog...)
3. Qui est votre public cible ?
4. Avez-vous des préférences de couleurs ou de style ?

N'hésitez pas à me poser des questions à tout moment !`,
        created_at: new Date().toISOString()
      };
      
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error('Erreur création conversation:', error);
    }
  };

  const loadConversation = async (conversationId) => {
    try {
      const response = await axios.get(
        `${API_URL}/api/chat/conversations/${conversationId}/messages`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const conv = conversations.find(c => c.id === conversationId);
      setCurrentConversation(conv);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Erreur chargement conversation:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${API_URL}/api/chat/conversations/${currentConversation.id}/messages`,
        { message: userMessage },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setMessages([
        ...messages,
        response.data.userMessage,
        response.data.aiMessage
      ]);
    } catch (error) {
      console.error('Erreur envoi message:', error);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
    setSiteConfig({
      ...siteConfig,
      template: template.id
    });
  };

  const updateColor = (colorType, value) => {
    setSiteConfig({
      ...siteConfig,
      colors: {
        ...siteConfig.colors,
        [colorType]: value
      }
    });
  };

  const generateSite = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(
        `${API_URL}/api/websites`,
        {
          name: siteConfig.name || 'Mon Site',
          template: selectedTemplate?.id || 'modern',
          colors: siteConfig.colors,
          fonts: siteConfig.fonts,
          conversationId: currentConversation?.id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      alert('Site généré avec succès ! 🎉');
      setPreviewMode(true);
    } catch (error) {
      console.error('Erreur génération site:', error);
      alert('Erreur lors de la génération du site');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="site-creator">
      {/* Header */}
      <header className="header">
        <h1>🎨 Créateur de Site Web</h1>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => setPreviewMode(!previewMode)}>
            {previewMode ? '✏️ Mode Édition' : '👁️ Aperçu'}
          </button>
          <button className="btn-primary" onClick={generateSite} disabled={!selectedTemplate}>
            🚀 Générer le Site
          </button>
        </div>
      </header>

      <div className="main-content">
        {/* Sidebar - Conversations */}
        <aside className="sidebar">
          <button className="btn-new-chat" onClick={createNewConversation}>
            ➕ Nouvelle Conversation
          </button>
          
          <div className="conversations-list">
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`conversation-item ${currentConversation?.id === conv.id ? 'active' : ''}`}
                onClick={() => loadConversation(conv.id)}
              >
                <div className="conv-title">{conv.title}</div>
                <div className="conv-date">
                  {new Date(conv.created_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Centre - Chat IA */}
        <section className="chat-section">
          {!currentConversation ? (
            <div className="empty-state">
              <h2>👋 Bienvenue dans le Créateur de Site</h2>
              <p>Créez une nouvelle conversation pour commencer à concevoir votre site web avec l'aide de l'IA</p>
              <button className="btn-primary" onClick={createNewConversation}>
                Commencer
              </button>
            </div>
          ) : (
            <>
              <div className="messages-container">
                {messages.map((msg, index) => (
                  <div key={index} className={`message ${msg.role}`}>
                    <div className="message-avatar">
                      {msg.role === 'assistant' ? '🤖' : '👤'}
                    </div>
                    <div className="message-content">
                      <div className="message-text">{msg.content}</div>
                      <div className="message-time">
                        {new Date(msg.created_at).toLocaleTimeString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message assistant">
                    <div className="message-avatar">🤖</div>
                    <div className="message-content">
                      <div className="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="chat-input-container">
                <textarea
                  className="chat-input"
                  placeholder="Décrivez votre site, posez vos questions..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  rows="3"
                  disabled={isLoading}
                />
                <button
                  className="btn-send"
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  {isLoading ? '⏳' : '📤'} Envoyer
                </button>
              </div>
            </>
          )}
        </section>

        {/* Panneau droit - Configuration */}
        <aside className="config-panel">
          <h3>⚙️ Configuration</h3>

          {/* Templates */}
          <div className="config-section">
            <h4>Modèles</h4>
            <div className="templates-grid">
              {templates.map(template => (
                <div
                  key={template.id}
                  className={`template-card ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                  onClick={() => selectTemplate(template)}
                >
                  <div className="template-thumb">
                    <span className="template-icon">🎨</span>
                  </div>
                  <div className="template-name">{template.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Couleurs */}
          <div className="config-section">
            <h4>Couleurs</h4>
            <div className="color-picker">
              <label>
                Primaire
                <input
                  type="color"
                  value={siteConfig.colors.primary}
                  onChange={(e) => updateColor('primary', e.target.value)}
                />
                <span>{siteConfig.colors.primary}</span>
              </label>
              <label>
                Secondaire
                <input
                  type="color"
                  value={siteConfig.colors.secondary}
                  onChange={(e) => updateColor('secondary', e.target.value)}
                />
                <span>{siteConfig.colors.secondary}</span>
              </label>
              <label>
                Accent
                <input
                  type="color"
                  value={siteConfig.colors.accent}
                  onChange={(e) => updateColor('accent', e.target.value)}
                />
                <span>{siteConfig.colors.accent}</span>
              </label>
            </div>
          </div>

          {/* Polices */}
          <div className="config-section">
            <h4>Polices</h4>
            <select
              value={siteConfig.fonts.heading}
              onChange={(e) => setSiteConfig({
                ...siteConfig,
                fonts: { ...siteConfig.fonts, heading: e.target.value }
              })}
            >
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
              <option value="Poppins">Poppins</option>
              <option value="Playfair Display">Playfair Display</option>
            </select>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SiteCreator;
