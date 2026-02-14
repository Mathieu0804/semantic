# 📚 Cours 1 : Architecture Globale du Projet v3zai
## Comprendre la Structure d'une Application Next.js Moderne

---

## 🎯 Objectifs d'Apprentissage

À la fin de ce cours, vous comprendrez :
- La philosophie d'architecture d'une application Next.js 15
- Le rôle de chaque dossier et fichier
- Le flux de données dans l'application
- Les choix technologiques et leurs raisons

---

## 🏗️ Vue d'Ensemble de l'Architecture

### Schéma Conceptuel

```
┌─────────────────────────────────────────────────────────────┐
│                    NAVIGATEUR (Client)                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          Interface Utilisateur React                  │  │
│  │  (Components + Pages + Hooks)                        │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │ HTTP Requests
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   SERVEUR NEXT.JS                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  App Router (Next.js 15)                             │  │
│  │  • /app/page.tsx           → Page d'accueil          │  │
│  │  • /app/dashboard/page.tsx → Dashboard               │  │
│  │  • /app/api/*              → API Routes              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  API Routes (Endpoints Backend)                      │  │
│  │  • /api/chat      → IA locale                        │  │
│  │  • /api/mcp       → Serveur MCP                      │  │
│  │  • /api/products  → CRUD Produits                    │  │
│  │  • /api/analytics → Statistiques                     │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   COUCHE MÉTIER                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Services & Logique Métier                           │  │
│  │  • z-ai-web-dev-sdk   → IA locale                    │  │
│  │  • Prisma Client      → ORM Base de données          │  │
│  │  • Générateur LD-JSON → SEO structuré                │  │
│  └────────────────────┬─────────────────────────────────┘  │
└────────────────────────┼─────────────────────────────────────┘
                         │
┌────────────────────────▼─────────────────────────────────────┐
│                   BASE DE DONNÉES                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  SQLite (Production) / PostgreSQL (Recommandé)       │  │
│  │  • 15 Tables Prisma                                  │  │
│  │  • Relations entre entités                           │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 Structure des Dossiers Expliquée

### Racine du Projet

```
v3zai/
│
├── .zscripts/              # Scripts d'automatisation personnalisés
│   └── (outils CLI, migrations, etc.)
│
├── db/                     # Fichiers de base de données
│   └── prod.db            # SQLite en production (⚠️ à migrer vers PostgreSQL)
│
├── download/               # Fichiers téléchargeables (guides, templates)
│   └── GUIDE-DEPLOIEMENT.md
│
├── examples/               # Exemples de code
│   └── websocket/         # Exemple WebSocket (temps réel)
│
├── logs/                   # Logs de l'application
│   └── (fichiers .log)
│
├── mini-services/          # Micro-services autonomes
│   └── (services indépendants, workers)
│
├── prisma/                 # 🔑 Configuration ORM
│   ├── schema.prisma      # Schéma de base de données (15 tables)
│   └── migrations/        # Historique des migrations
│
├── public/                 # Fichiers statiques (accessibles publiquement)
│   ├── images/
│   ├── icons/
│   └── favicon.ico
│
├── scripts/                # Scripts utilitaires
│   └── test-mcp.js        # Test du serveur MCP
│
├── skills/                 # "Compétences" de l'IA (prompts, templates)
│   └── (fichiers de configuration IA)
│
├── src/                    # 🔑 CODE SOURCE PRINCIPAL
│   ├── app/               # App Router Next.js 15
│   ├── components/        # Composants React réutilisables
│   └── lib/               # Bibliothèques et helpers
│
├── .env                    # ⚠️ Variables d'environnement (NE JAMAIS COMMITER)
├── .env.example            # Template des variables
├── package.json            # Dépendances Node.js
├── tsconfig.json           # Configuration TypeScript
├── next.config.ts          # Configuration Next.js
├── tailwind.config.ts      # Configuration Tailwind CSS
├── ecosystem.config.js     # Configuration PM2 (production)
└── README.md               # Documentation
```

---

## 🔍 Analyse Détaillée : Dossier `src/`

Le dossier `src/` contient **tout le code applicatif**. Voici sa structure :

```
src/
│
├── app/                    # 🚀 App Router (Next.js 15)
│   ├── layout.tsx         # Layout global (HTML, fonts, providers)
│   ├── page.tsx           # Page d'accueil "/"
│   ├── globals.css        # Styles globaux
│   │
│   ├── dashboard/         # Route "/dashboard"
│   │   └── page.tsx
│   │
│   ├── api/               # 🔑 API Routes (Backend)
│   │   ├── chat/
│   │   │   └── route.ts   # POST /api/chat
│   │   ├── mcp/
│   │   │   └── route.ts   # GET/POST /api/mcp
│   │   ├── products/
│   │   │   └── route.ts   # CRUD /api/products
│   │   └── analytics/
│   │       └── route.ts   # GET /api/analytics
│   │
│   └── (autres routes)
│
├── components/             # 🎨 Composants React
│   ├── ui/                # Composants UI de base (Shadcn)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── chat/              # Composants spécifiques au chat IA
│   │   ├── ChatInterface.tsx
│   │   ├── MessageBubble.tsx
│   │   └── ...
│   │
│   ├── catalog/           # Gestion catalogue produits
│   │   ├── ProductList.tsx
│   │   ├── ProductForm.tsx
│   │   └── ...
│   │
│   └── analytics/         # Dashboard analytics
│       ├── ChartComponent.tsx
│       └── ...
│
└── lib/                    # 🛠️ Bibliothèques et helpers
    ├── db.ts              # Prisma Client (connexion BDD)
    ├── ai.ts              # Helper IA (z-ai-web-dev-sdk)
    ├── utils.ts           # Fonctions utilitaires
    ├── validations.ts     # Schémas de validation (Zod)
    └── types.ts           # Types TypeScript personnalisés
```

---

## 🔑 Fichiers Clés à Comprendre

### 1. `package.json` - Le Manifeste de l'Application

```json
{
  "name": "v3zai",
  "version": "1.0.0",
  "description": "Plateforme IA PME - Création de sites web par IA",
  
  // 📦 Scripts NPM (commandes exécutables)
  "scripts": {
    "dev": "next dev",              // Lancer en développement (http://localhost:3000)
    "build": "next build",          // Compiler pour production
    "start": "next start",          // Lancer en production
    "lint": "next lint",            // Vérifier qualité du code
    "db:push": "prisma db push",    // Synchroniser schéma BDD
    "db:studio": "prisma studio"    // Interface graphique BDD
  },
  
  // 📚 Dépendances de production
  "dependencies": {
    "next": "^15.0.0",              // Framework React
    "react": "^19.0.0",             // Bibliothèque UI
    "react-dom": "^19.0.0",         // React pour le DOM
    "@prisma/client": "^5.0.0",     // ORM base de données
    "tailwindcss": "^3.4.0",        // Framework CSS
    "shadcn-ui": "latest",          // Composants UI
    "z-ai-web-dev-sdk": "^1.0.0"    // IA locale (SDK propriétaire)
  },
  
  // 🛠️ Dépendances de développement
  "devDependencies": {
    "typescript": "^5.0.0",         // Superset de JavaScript
    "prisma": "^5.0.0",             // CLI Prisma
    "eslint": "^8.0.0",             // Linter (qualité code)
    "@types/node": "^20.0.0",       // Types TypeScript pour Node.js
    "@types/react": "^19.0.0"       // Types TypeScript pour React
  }
}
```

**Pourquoi ces dépendances ?**

| Dépendance | Rôle | Pourquoi ? |
|------------|------|------------|
| **Next.js 15** | Framework React avec SSR | SEO, performance, routing automatique |
| **React 19** | Bibliothèque UI | Composants réactifs, Virtual DOM |
| **Prisma** | ORM | Type-safety, migrations auto, dev experience |
| **Tailwind** | Framework CSS | Utility-first, pas de CSS personnalisé |
| **Shadcn/ui** | Composants UI | Accessibles, customisables, pas de dépendance lourde |
| **z-ai-web-dev-sdk** | IA locale | Pas de coûts API cloud, privacy |

---

### 2. `tsconfig.json` - Configuration TypeScript

```json
{
  "compilerOptions": {
    // 🎯 Version JavaScript cible (ES2020 = compatible moderne)
    "target": "ES2020",
    
    // 📦 Système de modules (ESNext = import/export moderne)
    "module": "ESNext",
    
    // 🔍 Résolution des modules (Node.js style)
    "moduleResolution": "node",
    
    // ✅ Strictness (qualité de code maximale)
    "strict": true,                  // Active tous les checks stricts
    "noImplicitAny": true,           // Interdit le type 'any' implicite
    "strictNullChecks": true,        // null/undefined doivent être explicites
    
    // 📂 Chemins d'import raccourcis
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],            // import { Button } from '@/components/ui/button'
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"]
    },
    
    // 🔧 Interopérabilité
    "esModuleInterop": true,         // Import de modules CommonJS
    "allowSyntheticDefaultImports": true,
    
    // 🎨 JSX (React)
    "jsx": "preserve",               // Next.js gère la compilation JSX
    
    // 📝 Génération de fichiers .d.ts (déclarations TypeScript)
    "declaration": true,
    
    // 🗂️ Dossier de sortie
    "outDir": "./dist"
  },
  
  // 📁 Fichiers à inclure
  "include": [
    "src/**/*",
    "next-env.d.ts"
  ],
  
  // 🚫 Fichiers à exclure
  "exclude": [
    "node_modules",
    "dist",
    ".next"
  ]
}
```

**Points importants :**

1. **Strict Mode Activé** : Force à écrire du code TypeScript "propre"
   - Pas de `any` implicite
   - Gestion explicite des `null`/`undefined`
   - Meilleure détection d'erreurs

2. **Chemins Raccourcis** : 
   ```typescript
   // ❌ Sans paths
   import { Button } from '../../../../components/ui/button'
   
   // ✅ Avec paths
   import { Button } from '@/components/ui/button'
   ```

3. **JSX Preserve** : Next.js compile le JSX, pas TypeScript

---

### 3. `next.config.ts` - Configuration Next.js

```typescript
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 🔧 Mode de sortie
  output: 'standalone',  // Génère un serveur autonome (idéal pour Docker/VPS)
  
  // 🗜️ Compression
  compress: true,        // Active la compression gzip
  
  // 🖼️ Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],  // Formats modernes (meilleure compression)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,  // Cache 60 secondes minimum
  },
  
  // 🔒 Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'  // Empêche l'iframe (protection clickjacking)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'  // Empêche MIME sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  
  // ⚡ Optimisations de build
  swcMinify: true,       // Utilise SWC pour minification (+ rapide que Terser)
  
  // 🌍 Internationalisation (si besoin)
  // i18n: {
  //   locales: ['fr', 'en'],
  //   defaultLocale: 'fr'
  // },
  
  // 📦 Variables d'environnement exposées au client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }
}

export default nextConfig
```

**Explication des choix :**

| Option | Pourquoi | Impact |
|--------|----------|--------|
| `output: 'standalone'` | Crée un serveur autonome | Déploiement simplifié (VPS, Docker) |
| `compress: true` | Compresse les réponses HTTP | -70% taille, chargement plus rapide |
| `formats: ['avif', 'webp']` | Formats images modernes | -50% poids vs JPEG/PNG |
| `swcMinify: true` | Minification ultra-rapide | Build 3-5x plus rapide |
| Headers sécurité | Protection contre XSS, clickjacking | Sécurité renforcée |

---

## 🌊 Flux de Données dans l'Application

### Exemple : Création d'un Produit

```
┌─────────────────────────────────────────────────────────────┐
│ 1. UTILISATEUR clique "Ajouter Produit"                     │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 2. COMPOSANT React (ProductForm.tsx)                        │
│    • Formulaire contrôlé (useState)                         │
│    • Validation Zod                                         │
│    • onSubmit() → fetch('/api/products', ...)               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP POST
┌────────────────────▼────────────────────────────────────────┐
│ 3. API ROUTE (/app/api/products/route.ts)                   │
│    • export async function POST(request) {                  │
│    •   const body = await request.json()                    │
│    •   // Validation Zod                                    │
│    •   const product = await prisma.product.create({...})   │
│    •   return Response.json(product)                        │
│    • }                                                       │
└────────────────────┬────────────────────────────────────────┘
                     │ Prisma Query
┌────────────────────▼────────────────────────────────────────┐
│ 4. PRISMA CLIENT (/src/lib/db.ts)                           │
│    • Traduction en SQL                                      │
│    • INSERT INTO products (name, price, ...) VALUES (...)   │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│ 5. BASE DE DONNÉES SQLite                                   │
│    • Enregistrement dans db/prod.db                         │
│    • Retour de l'objet créé avec ID                         │
└────────────────────┬────────────────────────────────────────┘
                     │ Response
┌────────────────────▼────────────────────────────────────────┐
│ 6. RETOUR au Composant React                                │
│    • État mis à jour (setProducts([...products, newOne]))   │
│    • Re-render automatique                                  │
│    • Notification "Produit créé avec succès"                │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Pourquoi Tailwind CSS ?

### Comparaison Approches CSS

**❌ CSS Traditionnel :**
```css
/* styles.css */
.button-primary {
  background-color: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 600;
}

.button-primary:hover {
  background-color: #2563eb;
}
```

```tsx
<button className="button-primary">Cliquez</button>
```

**✅ Tailwind CSS :**
```tsx
<button className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
  Cliquez
</button>
```

**Avantages :**
1. **Pas de fichier CSS séparé** : Tout dans le JSX
2. **Pas de nommage** : Fini les `.button-primary-large-variant-disabled`
3. **Intellisense** : Autocomplétion dans VS Code
4. **Purge automatique** : Supprime les classes non utilisées (bundle léger)
5. **Responsive facile** : `md:bg-red-500 lg:bg-blue-500`

---

## 🧩 Composants Shadcn/ui

Shadcn n'est **pas une bibliothèque NPM** classique !

**❌ Autres librairies UI :**
```bash
npm install material-ui  # 2 MB dans node_modules
```

**✅ Shadcn :**
```bash
npx shadcn-ui add button  # Copie le code dans src/components/ui/button.tsx
```

**Avantages :**
- Vous **possédez le code** → customisation totale
- **Pas de dépendance** lourde
- **Accessible** (ARIA labels, clavier)
- **Type-safe** (TypeScript)

---

## 📝 Exercices Pratiques

### Exercice 1 : Explorer la Structure
1. Clonez le repository
2. Listez tous les fichiers dans `src/app/`
3. Identifiez combien de routes API existent
4. Dessinez le schéma des pages (/, /dashboard, etc.)

### Exercice 2 : Comprendre les Imports
```typescript
// Dans src/app/page.tsx, vous voyez :
import { Button } from '@/components/ui/button'
import { prisma } from '@/lib/db'

// Questions :
// 1. Où se trouve réellement button.tsx ?
// 2. Quelle configuration permet d'utiliser '@/' ?
// 3. Que contient db.ts ?
```

### Exercice 3 : Tracer un Flux
Tracez le flux complet pour :
1. Afficher la liste des produits sur la page d'accueil
2. Supprimer un produit
3. Générer du contenu avec l'IA

---

## 🎯 Points Clés à Retenir

1. **Next.js = React + Serveur** : Une application qui fait frontend ET backend
2. **App Router** : Dossier `app/` = routes automatiques
3. **API Routes** : `app/api/*/route.ts` = endpoints REST
4. **Prisma** : ORM type-safe pour la base de données
5. **Tailwind** : Utility-first CSS (pas de fichiers CSS séparés)
6. **TypeScript** : Détection d'erreurs avant exécution

---

## 📚 Prochains Cours

- **Cours 2** : Next.js App Router en profondeur
- **Cours 3** : Prisma ORM et modélisation BDD
- **Cours 4** : API Routes et gestion d'état
- **Cours 5** : Intégration IA locale (z-ai-web-dev-sdk)
- **Cours 6** : Serveur MCP et communication inter-IA
- **Cours 7** : Déploiement et optimisation

---

**🎓 Fin du Cours 1**

Prêt pour le Cours 2 ? Nous allons plonger dans le fonctionnement de l'App Router !
