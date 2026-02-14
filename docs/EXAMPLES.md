# 💡 EXEMPLES CONCRETS - AI BUILDER

## Cas d'Usage Réels avec Résultats Attendus

---

## 🎨 Modifications d'Interface

### Exemple 1 : Ajouter un Bouton

**Commande :**
```
Ajoute un bouton rouge "Contactez-nous" en haut de la page d'accueil
```

**Ce que l'IA génère :**
```typescript
// src/app/page.tsx
<Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg">
  Contactez-nous
</Button>
```

**Résultat :** Bouton rouge cliquable sur la page d'accueil

---

### Exemple 2 : Changer une Couleur

**Commande :**
```
Change la couleur du header en vert foncé
```

**Ce que l'IA génère :**
```typescript
// Modifie className de l'élément header
<header className="bg-green-800 text-white shadow">
```

**Résultat :** Header devient vert foncé

---

### Exemple 3 : Ajouter une Image

**Commande :**
```
Ajoute un logo en haut à gauche de la page
```

**Ce que l'IA génère :**
```typescript
<div className="flex items-center gap-4">
  <img src="/logo.png" alt="Logo" className="h-12 w-auto" />
  <h1>Mon Entreprise</h1>
</div>
```

**Résultat :** Emplacement pour logo (vous devez ajouter le fichier logo.png)

---

## 📄 Création de Pages

### Exemple 4 : Page À Propos

**Commande :**
```
Crée une page "À Propos" avec notre histoire d'entreprise
```

**Ce que l'IA génère :**
```typescript
// src/app/a-propos/page.tsx
'use client'

import Link from 'next/link'

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600">← Retour</Link>
          <h1 className="text-2xl font-bold mt-1">À Propos</h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Notre Histoire</h2>
        <p className="text-lg text-gray-700 mb-4">
          Fondée en 2020, notre entreprise s'est donnée pour mission...
        </p>
        {/* Plus de contenu */}
      </main>
    </div>
  )
}
```

**Résultat :** Page `/a-propos` accessible avec structure complète

---

### Exemple 5 : Page FAQ

**Commande :**
```
Crée une page FAQ avec 5 questions fréquentes
```

**Ce que l'IA génère :**
```typescript
// src/app/faq/page.tsx
// Structure complète avec accordion pour chaque question
```

**Contenu généré :**
- Q1: Comment vous contacter ?
- Q2: Quels sont vos horaires ?
- Q3: Acceptez-vous les cartes bancaires ?
- Q4: Livrez-vous à domicile ?
- Q5: Avez-vous un service après-vente ?

**Résultat :** Page `/faq` interactive

---

## 📝 Modifications de Formulaires

### Exemple 6 : Ajouter un Champ

**Commande :**
```
Ajoute un champ "Site web" au formulaire entreprise
```

**Ce que l'IA génère :**
```typescript
// Dans formData
const [formData, setFormData] = useState({
  // ... existant
  siteWeb: ''
})

// Dans le JSX
<div>
  <label className="block text-sm font-medium mb-2">Site web</label>
  <Input
    type="url"
    value={formData.siteWeb}
    onChange={e => setFormData({...formData, siteWeb: e.target.value})}
    placeholder="https://mon-site.fr"
  />
</div>

// Dans le handleSubmit
// Ajout de siteWeb dans l'envoi API
```

**Résultat :** Nouveau champ "Site web" dans le formulaire

---

### Exemple 7 : Validation Obligatoire

**Commande :**
```
Rends le champ email obligatoire avec validation
```

**Ce que l'IA génère :**
```typescript
<Input
  type="email"
  value={formData.email}
  onChange={e => setFormData({...formData, email: e.target.value})}
  required
  pattern="[^@]+@[^@]+\.[^@]+"
  placeholder="email@exemple.fr"
/>
```

**Résultat :** Champ email obligatoire avec validation HTML5

---

## 🔧 Ajout de Fonctionnalités

### Exemple 8 : Compteur de Visiteurs

**Commande :**
```
Ajoute un compteur de visiteurs en bas de la page d'accueil
```

**Ce que l'IA génère :**
```typescript
'use client'

import { useState, useEffect } from 'react'

export default function HomePage() {
  const [visitors, setVisitors] = useState(0)
  
  useEffect(() => {
    // Simuler compteur (en vrai, utiliser API)
    const count = parseInt(localStorage.getItem('visitors') || '0') + 1
    localStorage.setItem('visitors', count.toString())
    setVisitors(count)
  }, [])
  
  return (
    // ... page existante
    <footer className="text-center py-4 text-gray-600">
      <p>👥 {visitors} visiteurs</p>
    </footer>
  )
}
```

**Résultat :** Compteur fonctionnel (localStorage)

---

### Exemple 9 : Système de Notation

**Commande :**
```
Ajoute un système de notation 5 étoiles
```

**Ce que l'IA génère :**
```typescript
'use client'

import { useState } from 'react'

function StarRating() {
  const [rating, setRating] = useState(0)
  
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          onClick={() => setRating(star)}
          className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
        >
          ★
        </button>
      ))}
      <span className="ml-2 text-gray-600">{rating}/5</span>
    </div>
  )
}
```

**Résultat :** Composant étoiles cliquable

---

## 🎨 Personnalisation Avancée

### Exemple 10 : Dark Mode

**Commande :**
```
Ajoute un bouton pour activer le mode sombre
```

**Ce que l'IA génère :**
```typescript
'use client'

import { useState } from 'react'

function DarkModeToggle() {
  const [dark, setDark] = useState(false)
  
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [dark])
  
  return (
    <button
      onClick={() => setDark(!dark)}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {dark ? '🌙' : '☀️'}
    </button>
  )
}
```

**Résultat :** Bouton toggle dark mode

---

### Exemple 11 : Animation au Scroll

**Commande :**
```
Ajoute une animation fade-in quand on scroll vers le bas
```

**Ce que l'IA génère :**
```typescript
'use client'

import { useEffect, useRef } from 'react'

function FadeInSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0')
          entry.target.classList.remove('opacity-0', 'translate-y-10')
        }
      },
      { threshold: 0.1 }
    )
    
    if (ref.current) observer.observe(ref.current)
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <div
      ref={ref}
      className="opacity-0 translate-y-10 transition-all duration-700"
    >
      {children}
    </div>
  )
}
```

**Résultat :** Sections apparaissent au scroll

---

## 🗄️ Gestion de Données

### Exemple 12 : Ajouter Table BDD

**Commande :**
```
Ajoute une table "Temoignages" dans la base de données
```

**Ce que l'IA génère :**
```prisma
// prisma/schema.prisma
model Temoignage {
  id          String   @id @default(cuid())
  auteur      String
  contenu     String
  note        Int
  datePublication DateTime @default(now())
  
  @@map("temoignages")
}
```

**⚠️ Ensuite il faut :**
```bash
npx prisma db push
npx prisma generate
```

**Résultat :** Nouvelle table en BDD

---

### Exemple 13 : API Route

**Commande :**
```
Crée une API pour récupérer les témoignages
```

**Ce que l'IA génère :**
```typescript
// src/app/api/temoignages/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const temoignages = await prisma.temoignage.findMany({
      orderBy: { datePublication: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: temoignages
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
```

**Résultat :** API `/api/temoignages` fonctionnelle

---

## 🌐 Intégrations

### Exemple 14 : Google Maps

**Commande :**
```
Ajoute une carte Google Maps sur la page contact
```

**Ce que l'IA génère :**
```typescript
<div className="mt-8">
  <h3 className="text-xl font-semibold mb-4">📍 Où nous trouver</h3>
  <div className="aspect-video rounded-lg overflow-hidden">
    <iframe
      src="https://www.google.com/maps/embed?pb=!1m18!..."
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
    />
  </div>
</div>
```

**Résultat :** Carte Google Maps intégrée

---

## 📱 Responsive

### Exemple 15 : Menu Mobile

**Commande :**
```
Ajoute un menu hamburger pour mobile
```

**Ce que l'IA génère :**
```typescript
'use client'

import { useState } from 'react'

function MobileMenu() {
  const [open, setOpen] = useState(false)
  
  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden p-2"
      >
        {open ? '✕' : '☰'}
      </button>
      
      {open && (
        <div className="absolute top-16 left-0 right-0 bg-white shadow-lg md:hidden">
          <nav className="flex flex-col p-4">
            <Link href="/" className="py-2">Accueil</Link>
            <Link href="/entreprise" className="py-2">Entreprise</Link>
            {/* etc */}
          </nav>
        </div>
      )}
    </>
  )
}
```

**Résultat :** Menu hamburger mobile

---

## 🎯 Cas Complexes

### Exemple 16 : Composant Réutilisable

**Commande :**
```
Crée un composant Card réutilisable avec image, titre et description
```

**Ce que l'IA génère :**
```typescript
// src/components/Card.tsx
interface CardProps {
  image?: string
  title: string
  description: string
  onClick?: () => void
}

export function Card({ image, title, description, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow hover:shadow-lg transition cursor-pointer overflow-hidden"
    >
      {image && (
        <img src={image} alt={title} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
```

**Utilisation :**
```typescript
<Card
  image="/produit.jpg"
  title="Produit 1"
  description="Description du produit"
  onClick={() => console.log('Click !')}
/>
```

**Résultat :** Composant Card professionnel

---

## 💬 Commandes Avancées

### Exemple 17 : Refactoring

**Commande :**
```
Extrait le formulaire de la page entreprise dans un composant séparé
```

**Ce que l'IA fait :**
1. Crée `src/components/EntrepriseForm.tsx`
2. Déplace le code du formulaire
3. Met à jour `src/app/entreprise/page.tsx` avec import

**Résultat :** Code plus modulaire

---

### Exemple 18 : Amélioration UX

**Commande :**
```
Ajoute des états de chargement et des messages d'erreur au formulaire
```

**Ce que l'IA génère :**
```typescript
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')

const handleSubmit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')
  
  try {
    const response = await fetch('/api/entreprise', {...})
    if (!response.ok) throw new Error('Erreur serveur')
    // Succès
  } catch (err: any) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

// Dans le JSX
{error && (
  <div className="bg-red-50 border border-red-200 rounded p-4 mb-4">
    <p className="text-red-800">{error}</p>
  </div>
)}

<Button disabled={loading}>
  {loading ? 'Sauvegarde...' : 'Sauvegarder'}
</Button>
```

**Résultat :** UX améliorée avec feedback

---

## 🎨 Templates Complets

### Exemple 19 : Landing Page

**Commande :**
```
Crée une landing page complète avec hero, features, testimonials et CTA
```

**Ce que l'IA génère :**
Structure complète avec :
- Section hero (titre, description, CTA)
- Section features (3 features avec icônes)
- Section testimonials (3 témoignages clients)
- Section CTA finale (formulaire newsletter)

**Résultat :** Landing page professionnelle

---

### Exemple 20 : Dashboard Admin

**Commande :**
```
Crée un dashboard admin avec statistiques et graphiques
```

**Ce que l'IA génère :**
```typescript
// Utilise Recharts (si installé)
import { LineChart, BarChart, PieChart } from 'recharts'

// Structure avec :
// - Cartes de stats (4 KPIs)
// - Graphique de ventes (LineChart)
// - Répartition (PieChart)
// - Tableau dernières transactions
```

**Résultat :** Dashboard complet

---

## 📋 Bonnes Pratiques

### ✅ Commandes Efficaces

**BON :**
- "Ajoute un bouton 'Contactez-nous' rouge en haut à droite"
- "Crée une page FAQ avec structure accordion"
- "Modifie le formulaire entreprise pour ajouter un champ 'SIRET'"

**MOINS BON :**
- "Fais un truc rouge"
- "Change la page"
- "Ajoute des trucs"

### ✅ Itération

Construire progressivement :
1. Créer la structure
2. Ajouter les éléments
3. Affiner les styles
4. Ajouter les interactions

---

**💡 Astuce :** Plus votre demande est précise, meilleur sera le résultat !

**🎯 Objectif :** Devenir efficace avec l'AI Builder en quelques essais.

**🚀 Amusez-vous bien !**
