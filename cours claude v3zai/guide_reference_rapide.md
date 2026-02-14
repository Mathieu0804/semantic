# 📚 Guide de Référence Rapide - v3zai
## Antisèches et Commandes Essentielles

---

## 🚀 Démarrage Rapide

### Installation Complète

```bash
# 1. Cloner le projet
git clone https://github.com/Mathieu0804/v3zai.git
cd v3zai

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# 4. Initialiser la base de données
bun prisma db push

# 5. Lancer en développement
bun run dev

# Ouvrir http://localhost:3000
```

---

## 📝 Commandes NPM/Bun

### Développement

```bash
bun run dev          # Lancer serveur dev (port 3000)
bun run build        # Compiler pour production
bun run start        # Lancer en production
bun run lint         # Vérifier qualité code
bun run type-check   # Vérifier types TypeScript
```

### Base de Données (Prisma)

```bash
bun prisma studio           # Interface graphique BDD
bun prisma db push          # Sync schéma sans migration
bun prisma migrate dev      # Créer migration (dev)
bun prisma migrate deploy   # Appliquer migrations (prod)
bun prisma migrate reset    # ⚠️ Reset BDD complète
bun prisma generate         # Régénérer Prisma Client
bun prisma format           # Formater schema.prisma
```

---

## 🗂️ Structure des Fichiers

### Dossiers Clés

```
v3zai/
├── src/
│   ├── app/                # 🌐 Routes (pages + API)
│   ├── components/         # 🎨 Composants React
│   └── lib/                # 🛠️ Helpers & utils
├── prisma/
│   └── schema.prisma       # 🗄️ Schéma BDD
├── public/                 # 📂 Fichiers statiques
└── package.json            # 📦 Dépendances
```

### Fichiers de Configuration

| Fichier | Rôle |
|---------|------|
| `next.config.ts` | Config Next.js |
| `tsconfig.json` | Config TypeScript |
| `tailwind.config.ts` | Config Tailwind |
| `prisma/schema.prisma` | Schéma BDD |
| `.env` | Variables d'environnement |
| `ecosystem.config.js` | Config PM2 (production) |

---

## 🎨 Next.js App Router

### Créer une Page

```typescript
// src/app/about/page.tsx
export default function AboutPage() {
  return <h1>À propos</h1>
}
// → Route: /about
```

### Créer un Layout

```typescript
// src/app/dashboard/layout.tsx
export default function DashboardLayout({ children }) {
  return (
    <div>
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### Créer une API Route

```typescript
// src/app/api/hello/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello' })
}
// → Endpoint: GET /api/hello
```

### Route Dynamique

```typescript
// src/app/blog/[slug]/page.tsx
export default function PostPage({ params }: { params: { slug: string } }) {
  return <h1>Post: {params.slug}</h1>
}
// → Route: /blog/:slug
```

---

## 🗄️ Prisma ORM

### Modèle de Base

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  posts     Post[]   // Relation 1-N
  
  @@index([email])
  @@map("users")
}
```

### Requêtes CRUD

```typescript
import { prisma } from '@/lib/db'

// CREATE
const user = await prisma.user.create({
  data: { email: 'test@test.com', name: 'Test' }
})

// READ
const user = await prisma.user.findUnique({
  where: { id: 'user123' }
})

const users = await prisma.user.findMany({
  where: { email: { contains: '@gmail.com' } },
  orderBy: { createdAt: 'desc' },
  take: 10
})

// UPDATE
await prisma.user.update({
  where: { id: 'user123' },
  data: { name: 'Nouveau nom' }
})

// DELETE
await prisma.user.delete({
  where: { id: 'user123' }
})

// COUNT
const count = await prisma.user.count()
```

### Relations

```typescript
// Inclure relations
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  include: {
    posts: true,
    profile: true
  }
})

// Créer avec relation
const user = await prisma.user.create({
  data: {
    email: 'test@test.com',
    profile: {
      create: { bio: 'Hello' }
    }
  }
})
```

---

## 🎨 Tailwind CSS

### Classes Utiles

```html
<!-- Layout -->
<div class="flex items-center justify-between">
<div class="grid grid-cols-3 gap-4">
<div class="container mx-auto px-4">

<!-- Spacing -->
<div class="p-4 m-2">          <!-- padding + margin -->
<div class="px-4 py-2">        <!-- horizontal + vertical -->
<div class="space-y-4">        <!-- gap vertical entre enfants -->

<!-- Sizing -->
<div class="w-full h-screen">  <!-- largeur + hauteur -->
<div class="max-w-md">         <!-- largeur max -->

<!-- Typography -->
<h1 class="text-4xl font-bold text-gray-900">
<p class="text-sm text-gray-600">

<!-- Colors -->
<div class="bg-blue-500 text-white">
<div class="bg-gray-100 hover:bg-gray-200">

<!-- Responsive -->
<div class="hidden md:block">         <!-- caché mobile, visible desktop -->
<div class="grid grid-cols-1 md:grid-cols-3">
```

---

## 🤖 IA Locale

### Chat Simple

```typescript
import { aiChat } from '@/lib/ai'

const response = await aiChat({
  messages: [
    { role: 'user', content: 'Génère un bouton React' }
  ]
})

console.log(response.content)
```

### Génération de Composant

```typescript
import { generateComponent } from '@/lib/ai'

const code = await generateComponent({
  name: 'ProductCard',
  description: 'Carte produit avec image et prix',
  props: ['product', 'onAddToCart']
})

console.log(code)
```

### Chat avec Contexte

```typescript
import { createConversation, chatWithContext } from '@/lib/ai'

// 1. Créer conversation
createConversation('session123')

// 2. Envoyer messages (garde l'historique)
const reply1 = await chatWithContext('session123', 'Bonjour')
const reply2 = await chatWithContext('session123', 'Crée un header')
// L'IA se souvient du contexte précédent
```

---

## 🔌 Serveur MCP

### Se Connecter

```typescript
const response = await fetch('/api/mcp?action=connect', {
  method: 'POST',
  body: JSON.stringify({
    clientName: 'MonApp',
    clientType: 'assistant'
  })
})

const { token, sessionId } = await response.json()
```

### Envoyer une Requête

```typescript
const response = await fetch('/api/mcp?action=request', {
  method: 'POST',
  body: JSON.stringify({
    token,
    endpoint: 'chat',
    payload: { message: 'Hello!' }
  })
})

const { data } = await response.json()
console.log(data.reply)
```

---

## 🔐 Variables d'Environnement

### Fichier `.env`

```bash
# Base de données
DATABASE_URL="file:./db/prod.db"

# URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# IA Locale (si clés nécessaires)
AI_MODEL_PATH="./models/z-ai-web-dev.gguf"

# Secrets (⚠️ NE JAMAIS COMMITER)
JWT_SECRET="votre_secret_ultra_sécurisé_32_chars_min"
ENCRYPTION_KEY="another_secret_key"
```

### Utilisation

```typescript
// Accessible côté serveur ET client
const appUrl = process.env.NEXT_PUBLIC_APP_URL

// Accessible UNIQUEMENT côté serveur
const jwtSecret = process.env.JWT_SECRET
```

---

## 🚀 Déploiement

### VPS avec PM2

```bash
# 1. Sur le serveur
cd /var/www/v3zai
git pull
bun install --production
bun run build

# 2. Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Auto-démarrage au boot

# 3. Commandes PM2 utiles
pm2 status           # Voir les processus
pm2 logs v3zai       # Voir les logs
pm2 restart v3zai    # Redémarrer
pm2 stop v3zai       # Arrêter
```

### Avec Docker

```dockerfile
# Dockerfile
FROM oven/bun:latest

WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --production

COPY . .
RUN bun run build

EXPOSE 3000
CMD ["bun", "run", "start"]
```

```bash
# Build & Run
docker build -t v3zai .
docker run -p 3000:3000 v3zai
```

---

## 🐛 Debugging

### Logs Console

```typescript
console.log('Debug:', data)
console.error('Erreur:', error)
console.warn('Attention:', warning)
console.table(arrayOfObjects)
```

### Prisma Studio

```bash
bun prisma studio
# Ouvrir http://localhost:5555
# Interface graphique pour visualiser/éditer la BDD
```

### Next.js Dev Overlay

En développement, Next.js affiche automatiquement :
- Les erreurs de compilation
- Les erreurs runtime
- Les problèmes de performance

### Vérifier les Types

```bash
bun run type-check
# Vérifie tous les types TypeScript sans compiler
```

---

## 📊 Performance

### Optimiser les Images

```tsx
import Image from 'next/image'

<Image
  src="/photo.jpg"
  alt="Description"
  width={800}
  height={600}
  priority  // Pour images "above the fold"
/>
```

### Lazy Loading

```tsx
import dynamic from 'next/dynamic'

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Chargement...</p>,
  ssr: false  // Ne pas render côté serveur
})
```

### Caching

```typescript
// Route handler avec cache
export async function GET() {
  const data = await fetchData()
  
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, max-age=3600'  // 1 heure
    }
  })
}
```

---

## 🔒 Sécurité

### Sanitize User Input

```typescript
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  age: z.number().min(18)
})

const validated = schema.parse(userInput)
```

### Hash Passwords

```typescript
import bcrypt from 'bcryptjs'

// Hash
const hashed = await bcrypt.hash(password, 10)

// Verify
const isValid = await bcrypt.compare(password, hashed)
```

### JWT

```typescript
import jwt from 'jsonwebtoken'

// Create token
const token = jwt.sign(
  { userId: 'user123' },
  process.env.JWT_SECRET!,
  { expiresIn: '7d' }
)

// Verify token
const decoded = jwt.verify(token, process.env.JWT_SECRET!)
```

---

## 🧪 Tests

### Test Unitaire (Jest)

```typescript
import { add } from './math'

describe('add', () => {
  it('additionne deux nombres', () => {
    expect(add(2, 3)).toBe(5)
  })
})
```

### Test E2E (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test('page d\'accueil', async ({ page }) => {
  await page.goto('http://localhost:3000')
  await expect(page.locator('h1')).toContainText('Bienvenue')
})
```

---

## 🎯 Raccourcis VS Code

| Raccourci | Action |
|-----------|--------|
| `Ctrl+Space` | Autocomplétion |
| `F12` | Aller à la définition |
| `Shift+F12` | Trouver références |
| `Ctrl+.` | Quick fix |
| `Ctrl+Shift+P` | Palette de commandes |

---

## 📚 Ressources

- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Tailwind Docs](https://tailwindcss.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**🎓 Fin du Guide de Référence**

Imprimez cette page pour l'avoir toujours sous les yeux !
