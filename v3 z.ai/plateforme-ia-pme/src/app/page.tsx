'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Package,
  Building2,
  Server,
  BarChart3,
  Menu,
  X,
  Settings,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Import des composants de section
import { ChatSection } from '@/components/chat/chat-interface';
import { CatalogSection } from '@/components/catalog/product-table';
import { SEOSection } from '@/components/seo/company-form';
import { MCPSection } from '@/components/mcp/mcp-status';
import { AnalyticsSection } from '@/components/analytics/dashboard';

const navigation = [
  { id: 'chat', label: 'Créateur de Site', icon: MessageSquare, description: 'Créez votre site avec l\'IA' },
  { id: 'catalog', label: 'Catalogue', icon: Package, description: 'Gérez vos produits et services' },
  { id: 'seo', label: 'Identité & SEO', icon: Building2, description: 'Configurez votre entreprise' },
  { id: 'mcp', label: 'Serveur MCP', icon: Server, description: 'Connexions IA-to-IA' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Statistiques et insights' },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [companyName, setCompanyName] = useState('Ma Plateforme IA');

  // Charger le nom de l'entreprise
  useEffect(() => {
    fetch('/api/company')
      .then(res => res.json())
      .then(data => {
        if (data.company?.name) {
          setCompanyName(data.company.name);
        }
      })
      .catch(console.error);
  }, []);

  const renderSection = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatSection />;
      case 'catalog':
        return <CatalogSection />;
      case 'seo':
        return <SEOSection onCompanyUpdate={(name) => setCompanyName(name)} />;
      case 'mcp':
        return <MCPSection />;
      case 'analytics':
        return <AnalyticsSection />;
      default:
        return <ChatSection />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-400" />
            <span className="font-semibold text-white">{companyName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white"
          >
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 backdrop-blur-sm border-r border-slate-700 transform transition-transform duration-300 lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-white">{companyName}</h1>
                <p className="text-xs text-slate-400">Plateforme IA PME</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left",
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive && "text-blue-400")} />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-slate-400">{item.description}</div>
                  </div>
                </button>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-700">
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Settings className="w-4 h-4" />
              <span>Version 1.0.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
