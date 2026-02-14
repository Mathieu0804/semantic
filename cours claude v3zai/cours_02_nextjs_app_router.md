# 📚 Cours 2 : Next.js App Router - Le Cœur de l'Application
## Comprendre le Routing, le Rendering et les Layouts

---

## 🎯 Objectifs d'Apprentissage

À la fin de ce cours, vous saurez :
- Comment fonctionne le routing basé sur les fichiers
- La différence entre Server Components et Client Components
- Le rôle des layouts, loading et error
- Les API Routes et leur utilisation
- Le data fetching moderne avec Next.js 15

---

## 🗂️ App Router : Routing Basé sur les Fichiers

### Concept Fondamental

```
Dans Next.js, la STRUCTURE DES DOSSIERS = ROUTES de l'application
```

**Exemple :**

```
src/app/
├── page.tsx                  → Route: /
├── about/
│   └── page.tsx             → Route: /about
├── dashboard/
│   ├── page.tsx             → Route: /dashboard
│   └── settings/
│       └── page.tsx         → Route: /dashboard/settings
└── blog/
    ├── page.tsx             → Route: /blog
    └── [slug]/
        └── page.tsx         → Route: /blog/:slug (dynamique)
```

---

## 📄 Fichiers Spéciaux dans App Router

Next.js reconnaît des **noms de fichiers spéciaux** qui ont des rôles précis :

| Fichier | Rôle | Quand l'utiliser |
|---------|------|------------------|
| `page.tsx` | Page accessible via URL | Toujours (obligatoire pour une route) |
| `layout.tsx` | Enveloppe commune à plusieurs pages | Partager header, sidebar, etc. |
| `loading.tsx` | UI pendant le chargement | Améliorer UX sur data fetching |
| `error.tsx` | Gestion d'erreurs | Capturer erreurs + afficher UI de secours |
| `route.ts` | API endpoint | Créer des routes API (GET, POST, etc.) |
| `template.tsx` | Comme layout mais re-monte à chaque navigation | Animations, analytics |
| `not-found.tsx` | Page 404 personnalisée | Remplacer la 404 par défaut |

---

## 🏗️ Layouts : La Structure Imbriquée

### Layout Racine (`app/layout.tsx`)

C'est le **layout global** qui enveloppe TOUTES les pages.

```typescript
// src/app/layout.tsx

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

// 🔤 Configuration de la police (optimisée automatiquement)
const inter = Inter({ subsets: ['latin'] })

// 📊 Métadonnées SEO (peuvent être surchargées par page)
export const metadata: Metadata = {
  title: {
    default: 'v3zai - Plateforme IA PME',
    template: '%s | v3zai'  // Ex: "Dashboard | v3zai"
  },
  description: 'Créez votre site web avec l\'IA locale',
  keywords: ['IA', 'PME', 'création site web', 'automatisation'],
  authors: [{ name: 'v3zai Team' }],
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://v3zai.com',
    siteName: 'v3zai',
  }
}

// 🎨 Composant Layout Racine
export default function RootLayout({
  children,  // Les pages enfants seront injectées ici
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      {/* 
        🔍 Pourquoi <html> ici ?
        - Next.js gère le <html> et <body>
        - Permet de contrôler lang, className, etc.
      */}
      <body className={inter.className}>
        {/* 🎭 Providers globaux (si besoin) */}
        {/* <ThemeProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </ThemeProvider> */}
        
        {children}
        
        {/* 🍪 Scripts globaux (analytics, etc.) */}
        {/* <Script src="https://analytics.example.com/script.js" /> */}
      </body>
    </html>
  )
}
```

**Points importants :**

1. **`children` prop** : C'est là que les pages s'injectent
2. **Font Optimization** : Next.js télécharge et optimise automatiquement
3. **Metadata** : Génère les balises `<meta>`, `<title>`, etc.

---

### Layout Imbriqué (exemple : Dashboard)

```typescript
// src/app/dashboard/layout.tsx

import { Sidebar } from '@/components/dashboard/Sidebar'
import { Header } from '@/components/dashboard/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen">
      {/* 📱 Sidebar (toujours visible dans /dashboard/*) */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        {/* 🎯 Header (toujours visible dans /dashboard/*) */}
        <Header />
        
        {/* 📄 Contenu de la page spécifique */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Hiérarchie des Layouts :**

```
/dashboard/settings
│
├── app/layout.tsx           (Layout racine)
│   └── app/dashboard/layout.tsx    (Layout dashboard)
│       └── app/dashboard/settings/page.tsx  (Page)
```

**Rendu final :**
```html
<html>
  <body>
    <!-- Layout racine -->
    <div class="flex h-screen">
      <!-- Layout dashboard -->
      <Sidebar />
      <div>
        <Header />
        <main>
          <!-- Page settings -->
          <h1>Paramètres</h1>
        </main>
      </div>
    </div>
  </body>
</html>
```

---

## 📄 Pages : Le Contenu

### Page Simple

```typescript
// src/app/page.tsx (Route: /)

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">
        Bienvenue sur v3zai
      </h1>
    </div>
  )
}
```

### Page avec Métadonnées Personnalisées

```typescript
// src/app/dashboard/page.tsx

import type { Metadata } from 'next'

// 📊 Métadonnées spécifiques à cette page
export const metadata: Metadata = {
  title: 'Dashboard',  // Devient "Dashboard | v3zai" grâce au template
  description: 'Gérez vos sites et analytics',
}

export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>
      {/* Contenu */}
    </div>
  )
}
```

---

## ⚡ Server Components vs Client Components

**NOUVELLE PHILOSOPHIE Next.js 15** : **Par défaut, tout est Server Component**

### Server Component (Par Défaut)

```typescript
// src/app/products/page.tsx
// ✅ Server Component (par défaut, pas de 'use client')

import { prisma } from '@/lib/db'

// 🔥 Fonction async directement dans le composant !
export default async function ProductsPage() {
  // 🗄️ Fetch directement depuis la BDD (côté serveur)
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  
  return (
    <div>
      <h1>Produits</h1>
      <ul>
        {products.map(product => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </div>
  )
}
```

**Avantages Server Component :**
- ✅ Accès direct à la BDD (pas d'API route nécessaire)
- ✅ Pas de JavaScript envoyé au client (page ultra légère)
- ✅ SEO parfait (HTML complet généré côté serveur)
- ✅ Secrets sécurisés (clés API jamais exposées)

**Limitations :**
- ❌ Pas d'interactivité (onClick, useState, useEffect interdits)
- ❌ Pas d'accès aux APIs navigateur (localStorage, window)

---

### Client Component (Opt-in avec `'use client'`)

```typescript
// src/components/ProductForm.tsx
'use client'  // 🔑 Directive obligatoire

import { useState } from 'react'

export function ProductForm() {
  // ✅ useState autorisé (Client Component)
  const [name, setName] = useState('')
  
  // ✅ Event handlers autorisés
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 📡 Fetch vers API route (pas d'accès direct BDD)
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name }),
      headers: { 'Content-Type': 'application/json' }
    })
    
    if (response.ok) {
      setName('')  // Reset
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nom du produit"
      />
      <button type="submit">Créer</button>
    </form>
  )
}
```

**Quand utiliser Client Component ?**
- ✅ Formulaires avec état local
- ✅ Interactivité (modales, accordions)
- ✅ Hooks React (useState, useEffect, etc.)
- ✅ APIs navigateur (localStorage, geolocation)
- ✅ Librairies tierces qui utilisent window/document

**Best Practice :** Minimiser les Client Components
```
❌ Toute la page en 'use client'
✅ Uniquement le formulaire en 'use client'
```

---

## 🔄 Composition : Mélanger Server et Client

```typescript
// src/app/products/page.tsx
// ✅ Server Component

import { ProductForm } from '@/components/ProductForm'  // Client Component
import { prisma } from '@/lib/db'

export default async function ProductsPage() {
  // 🗄️ Fetch côté serveur
  const products = await prisma.product.findMany()
  
  return (
    <div>
      <h1>Produits</h1>
      
      {/* 🎨 Client Component pour interactivité */}
      <ProductForm />
      
      {/* 📊 Server Component pour l'affichage */}
      <ul>
        {products.map(p => <li key={p.id}>{p.name}</li>)}
      </ul>
    </div>
  )
}
```

**Règle importante :** Server Component peut importer Client Component, **mais pas l'inverse**

```typescript
// ❌ INTERDIT
'use client'
import { ServerComponent } from './ServerComponent'  // Erreur !

// ✅ AUTORISÉ
// Server Component
import { ClientComponent } from './ClientComponent'  // OK
```

---

## 🌊 Data Fetching dans Server Components

### Fetch depuis BDD avec Prisma

```typescript
// src/app/users/page.tsx

import { prisma } from '@/lib/db'

export default async function UsersPage() {
  // ✅ Fetch au moment du render côté serveur
  const users = await prisma.user.findMany({
    include: {
      posts: true,      // Inclure relations
      _count: {
        select: { posts: true }
      }
    }
  })
  
  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <h2>{user.name}</h2>
          <p>{user._count.posts} posts</p>
        </div>
      ))}
    </div>
  )
}
```

### Fetch depuis API Externe

```typescript
// src/app/weather/page.tsx

async function getWeather() {
  // 🌡️ Fetch API externe (côté serveur)
  const response = await fetch('https://api.weather.com/data', {
    // 🔄 Contrôle du cache
    next: { revalidate: 3600 }  // Re-fetch toutes les heures
  })
  
  return response.json()
}

export default async function WeatherPage() {
  const weather = await getWeather()
  
  return <div>Température: {weather.temp}°C</div>
}
```

**Options de Cache :**

| Option | Comportement |
|--------|-------------|
| `{ cache: 'force-cache' }` | Cache permanent (par défaut) |
| `{ cache: 'no-store' }` | Jamais de cache (toujours fresh) |
| `{ next: { revalidate: 60 } }` | Re-valide après 60 secondes |

---

## 🔄 Loading States

### Fichier `loading.tsx`

```typescript
// src/app/products/loading.tsx

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {/* 🔄 Spinner ou Skeleton */}
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900" />
      <p className="mt-4">Chargement des produits...</p>
    </div>
  )
}
```

**Comportement automatique :**
```
1. User navigue vers /products
2. Next.js affiche loading.tsx immédiatement
3. Pendant ce temps, page.tsx fetch les données
4. Dès que les données sont prêtes, affiche page.tsx
```

**Avec Suspense (contrôle fin) :**

```typescript
// src/app/products/page.tsx

import { Suspense } from 'react'
import { ProductList } from '@/components/ProductList'
import { ProductListSkeleton } from '@/components/ProductListSkeleton'

export default function ProductsPage() {
  return (
    <div>
      <h1>Produits</h1>
      
      {/* ⚡ Suspense pour loading granulaire */}
      <Suspense fallback={<ProductListSkeleton />}>
        <ProductList />
      </Suspense>
      
      {/* Le reste de la page s'affiche immédiatement */}
      <p>Autres contenus...</p>
    </div>
  )
}
```

---

## ❌ Error Handling

### Fichier `error.tsx`

```typescript
// src/app/products/error.tsx
'use client'  // ⚠️ Error boundaries doivent être Client Components

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 📊 Logger l'erreur (Sentry, LogRocket, etc.)
    console.error('Error:', error)
  }, [error])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        Oups ! Une erreur est survenue
      </h2>
      <p className="text-gray-600 mb-6">{error.message}</p>
      
      {/* 🔄 Bouton pour réessayer */}
      <button
        onClick={reset}  // Re-render la page
        className="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Réessayer
      </button>
    </div>
  )
}
```

**Cascade d'erreurs :**
```
/dashboard/products/error.tsx  (plus spécifique, prioritaire)
/dashboard/error.tsx
/error.tsx  (global)
```

---

## 🛣️ Routes Dynamiques

### Route avec Paramètre

```typescript
// src/app/blog/[slug]/page.tsx
// Route: /blog/mon-article, /blog/autre-article, etc.

import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'

// 🎯 Props contient les paramètres de route
export default async function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  // 📖 Fetch l'article par son slug
  const post = await prisma.post.findUnique({
    where: { slug: params.slug }
  })
  
  // ❌ Si pas trouvé, affiche 404
  if (!post) {
    notFound()
  }
  
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content }} />
    </article>
  )
}

// 🚀 Génération statique (ISR - Incremental Static Regeneration)
export async function generateStaticParams() {
  // 📊 Pré-générer les pages pour les 100 articles les plus récents
  const posts = await prisma.post.findMany({
    select: { slug: true },
    take: 100
  })
  
  return posts.map(post => ({
    slug: post.slug
  }))
}
```

**Variantes :**

```
[slug]        → /blog/:slug           (1 paramètre)
[...slug]     → /blog/:slug/*         (catch-all, tableau)
[[...slug]]   → /blog/:slug/* ou /blog (catch-all optionnel)
```

---

## 🔌 API Routes

### Créer un Endpoint

```typescript
// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

// 📊 Schéma de validation
const createProductSchema = z.object({
  name: z.string().min(3).max(100),
  price: z.number().positive(),
  description: z.string().optional()
})

// 📥 GET /api/products
export async function GET(request: NextRequest) {
  try {
    // 🔍 Query parameters (ex: ?category=electronics)
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    
    const products = await prisma.product.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

// 📤 POST /api/products
export async function POST(request: NextRequest) {
  try {
    // 📦 Parser le body
    const body = await request.json()
    
    // ✅ Valider avec Zod
    const validatedData = createProductSchema.parse(body)
    
    // 💾 Créer en BDD
    const product = await prisma.product.create({
      data: validatedData
    })
    
    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      // ❌ Erreur de validation
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
```

### Route Dynamique API

```typescript
// src/app/api/products/[id]/route.ts
// Endpoint: /api/products/:id

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const product = await prisma.product.findUnique({
    where: { id: params.id }
  })
  
  if (!product) {
    return NextResponse.json(
      { error: 'Produit introuvable' },
      { status: 404 }
    )
  }
  
  return NextResponse.json(product)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.product.delete({
    where: { id: params.id }
  })
  
  return NextResponse.json({ success: true })
}
```

---

## 🧪 Exercices Pratiques

### Exercice 1 : Créer une Page Blog

```
Objectif: Créer /blog avec liste d'articles
Fichiers à créer:
- src/app/blog/page.tsx
- src/app/blog/layout.tsx (avec sidebar)
- src/app/blog/[slug]/page.tsx
```

### Exercice 2 : API Route avec Authentification

```typescript
// Créer POST /api/auth/login
// - Valider email + password
// - Vérifier en BDD
// - Retourner un token JWT
```

### Exercice 3 : Loading et Error States

```
Ajouter à /products:
- loading.tsx avec skeleton
- error.tsx avec retry
- not-found.tsx personnalisé
```

---

## 🎯 Points Clés à Retenir

1. **Structure = Routes** : Dossiers dans `app/` deviennent des URLs
2. **Server Components par défaut** : Pas de 'use client' = Server Component
3. **Layouts imbriqués** : Structure hiérarchique automatique
4. **Data fetching direct** : `await prisma.X` dans Server Components
5. **API Routes** : `route.ts` avec export `GET`, `POST`, etc.
6. **Loading/Error** : Fichiers spéciaux pour UX améliorée

---

## 📚 Prochains Cours

- **Cours 3** : Prisma ORM - Modélisation et Requêtes
- **Cours 4** : Gestion d'État et Client Components
- **Cours 5** : Authentification et Autorisation
- **Cours 6** : Intégration IA Locale

---

**🎓 Fin du Cours 2**

Vous maîtrisez maintenant le cœur de Next.js ! Prêt pour Prisma ?
