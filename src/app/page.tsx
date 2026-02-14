// src/app/page.tsx
// Page principale avec navigation et intégration des sections

'use client'

import { useState } from 'react'

type TabType = 'company' | 'catalog' | 'chat' | 'mcp' | 'analytics'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>('company')

  const tabs = [
    { id: 'company' as TabType, label: 'Identité', emoji: '🏢' },
    { id: 'catalog' as TabType, label: 'Catalogue', emoji: '📦' },
    { id: 'chat' as TabType, label: 'Chat IA', emoji: '💬' },
    { id: 'mcp' as TabType, label: 'MCP', emoji: '🔌' },
    { id: 'analytics' as TabType, label: 'Stats', emoji: '📊' },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🤖 Plateforme IA PME
          </h1>
          <span className="text-sm text-muted-foreground">
            Gestion simplifiée pour PME/PMI
          </span>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 min-h-screen bg-card border-r border-border p-4">
          <ul className="space-y-2">
            {tabs.map(tab => (
              <li key={tab.id}>
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors
                    flex items-center gap-3
                    ${activeTab === tab.id 
                      ? 'bg-primary text-primary-foreground' 
                      : 'text-foreground hover:bg-accent'}
                  `}
                >
                  <span className="text-xl">{tab.emoji}</span>
                  <span>{tab.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenu principal */}
        <main className="flex-1 p-6">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">🏢 Identité de l'Entreprise</h2>
              <p className="text-muted-foreground">Configuration de votre entreprise et SEO</p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  Formulaire d'identité entreprise à implémenter...
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📦 Catalogue</h2>
              <p className="text-muted-foreground">Gestion des produits et services</p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  Gestionnaire de catalogue à implémenter...
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'chat' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">💬 Chat IA</h2>
              <p className="text-muted-foreground">Assistant intelligent pour votre entreprise</p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  Interface de chat à implémenter...
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'mcp' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">🔌 Serveur MCP</h2>
              <p className="text-muted-foreground">Interconnexion IA-to-IA</p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  Configuration MCP à implémenter...
                </p>
              </div>
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">📊 Statistiques</h2>
              <p className="text-muted-foreground">Tableau de bord analytics</p>
              
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-muted-foreground">
                  Dashboard analytics à implémenter...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}