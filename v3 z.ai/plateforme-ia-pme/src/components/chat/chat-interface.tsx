'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Globe, Palette, FileText, Image, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export function ChatSection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`);
  const [siteConfig, setSiteConfig] = useState({
    name: '',
    description: '',
    theme: 'modern',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
  });
  const [showConfig, setShowConfig] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Message de bienvenue
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Bienvenue ! Je suis votre assistant IA pour la création de sites web.

Je peux vous aider à :
- Créer un site web complet à partir de votre description
- Générer du contenu optimisé SEO
- Proposer des designs et couleurs adaptés
- Créer des pages personnalisées

Décrivez votre projet et je vous aiderai à le concrétiser. Vous pouvez par exemple me dire :
"Je veux un site pour mon restaurant italien avec menu, galerie photos et formulaire de contact"`,
        timestamp: new Date(),
      },
    ]);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          sessionId,
          context: { siteConfig },
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Une erreur est survenue. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const generateSite = async () => {
    if (!siteConfig.name || !siteConfig.description) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Veuillez d\'abord configurer le nom et la description de votre site dans les paramètres.',
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setLoading(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: `Génère un site web complet pour "${siteConfig.name}": ${siteConfig.description}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: siteConfig.description,
          companyInfo: siteConfig,
        }),
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Votre site "${data.site?.name || siteConfig.name}" a été créé avec succès !

${data.pages ? `Pages créées : ${data.pages.map((p: { name: string }) => p.name).join(', ')}` : ''}

Vous pouvez maintenant :
1. Aller dans l'onglet "Catalogue" pour ajouter vos produits/services
2. Configurer votre identité dans "Identité & SEO"
3. Consulter les analytics pour suivre les performances

${data.site ? `ID du site : ${data.site.id}` : ''}`,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Site generation error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Erreur lors de la génération du site. Veuillez réessayer.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">Créateur de Site IA</h2>
            <p className="text-sm text-slate-400">Créez votre site web en discutant avec l'IA</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowConfig(!showConfig)}
              className="border-slate-600 text-slate-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Config
            </Button>
            <Button
              size="sm"
              onClick={generateSite}
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Globe className="w-4 h-4 mr-2" />
              Générer le site
            </Button>
          </div>
        </div>
      </div>

      {/* Config Panel */}
      {showConfig && (
        <div className="bg-slate-800/30 border-b border-slate-700 p-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nom du site</label>
              <Input
                value={siteConfig.name}
                onChange={(e) => setSiteConfig({ ...siteConfig, name: e.target.value })}
                placeholder="Mon Entreprise"
                className="bg-slate-800 border-slate-600 text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Thème</label>
              <select
                value={siteConfig.theme}
                onChange={(e) => setSiteConfig({ ...siteConfig, theme: e.target.value })}
                className="w-full px-3 py-2 rounded-md bg-slate-800 border border-slate-600 text-white"
              >
                <option value="modern">Moderne</option>
                <option value="classic">Classique</option>
                <option value="minimal">Minimaliste</option>
                <option value="creative">Créatif</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Couleur primaire</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={siteConfig.primaryColor}
                  onChange={(e) => setSiteConfig({ ...siteConfig, primaryColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-800 border-slate-600"
                />
                <Input
                  value={siteConfig.primaryColor}
                  onChange={(e) => setSiteConfig({ ...siteConfig, primaryColor: e.target.value })}
                  className="flex-1 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Couleur secondaire</label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={siteConfig.secondaryColor}
                  onChange={(e) => setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })}
                  className="w-12 h-10 p-1 bg-slate-800 border-slate-600"
                />
                <Input
                  value={siteConfig.secondaryColor}
                  onChange={(e) => setSiteConfig({ ...siteConfig, secondaryColor: e.target.value })}
                  className="flex-1 bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <label className="block text-sm text-slate-400 mb-1">Description</label>
              <Textarea
                value={siteConfig.description}
                onChange={(e) => setSiteConfig({ ...siteConfig, description: e.target.value })}
                placeholder="Décrivez votre entreprise et ce que vous souhaitez pour votre site..."
                className="bg-slate-800 border-slate-600 text-white"
                rows={2}
              />
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === 'user'
                    ? "bg-blue-600"
                    : "bg-gradient-to-br from-purple-600 to-blue-600"
                )}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-white" />
                )}
              </div>
              <Card
                className={cn(
                  "max-w-[80%] p-4",
                  message.role === 'user'
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-200"
                )}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p
                  className={cn(
                    "text-xs mt-2",
                    message.role === 'user' ? "text-blue-200" : "text-slate-500"
                  )}
                >
                  {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </Card>
            </div>
          ))}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="bg-slate-800 border-slate-700 p-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>L'IA réfléchit...</span>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-slate-800/50 border-t border-slate-700 p-4">
        <div className="max-w-4xl mx-auto flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Décrivez ce que vous souhaitez pour votre site..."
            disabled={loading}
            className="flex-1 bg-slate-800 border-slate-600 text-white placeholder:text-slate-500"
          />
          <Button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 flex flex-wrap gap-2">
          {[
            'Créer un site vitrine',
            'Ajouter une boutique',
            'Formulaire de contact',
            'Galerie photos',
          ].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1 rounded-full bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


