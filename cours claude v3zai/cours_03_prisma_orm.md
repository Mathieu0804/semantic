# 📚 Cours 3 : Prisma ORM - Modéliser et Interroger la Base de Données
## Type-Safety, Migrations et Requêtes Avancées

---

## 🎯 Objectifs d'Apprentissage

À la fin de ce cours, vous comprendrez :
- Le schéma Prisma et sa syntaxe
- Les types de données et relations
- Les migrations de base de données
- Les requêtes CRUD avec type-safety
- Les requêtes avancées (filtres, tri, pagination)
- L'optimisation des performances

---

## 🔍 Qu'est-ce que Prisma ?

**Prisma** est un **ORM** (Object-Relational Mapping) nouvelle génération pour TypeScript/JavaScript.

### ORM : Qu'est-ce que c'est ?

**Sans ORM (SQL brut) :**
```typescript
const result = await db.query(
  'SELECT * FROM users WHERE email = $1',
  ['user@example.com']
)
// ❌ Pas de type-safety
// ❌ Risque d'injection SQL
// ❌ Mapping manuel des résultats
```

**Avec Prisma (ORM) :**
```typescript
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
})
// ✅ Type-safety complet
// ✅ Protection contre injections SQL
// ✅ Autocomplétion dans l'IDE
```

---

## 📄 Le Fichier `schema.prisma`

C'est le **cœur** de Prisma. Il définit :
1. La connexion à la base de données
2. Les modèles (tables)
3. Les relations entre modèles

### Structure du Fichier

```prisma
// prisma/schema.prisma

// ════════════════════════════════════════════════════════════
// 1. GÉNÉRATEUR - Comment Prisma génère le client TypeScript
// ════════════════════════════════════════════════════════════
generator client {
  provider = "prisma-client-js"  // Client JavaScript/TypeScript
  // previewFeatures = ["fullTextSearch"]  // Features expérimentales
}

// ════════════════════════════════════════════════════════════
// 2. SOURCE DE DONNÉES - Connexion à la BDD
// ════════════════════════════════════════════════════════════
datasource db {
  provider = "sqlite"              // SQLite (ou "postgresql", "mysql")
  url      = env("DATABASE_URL")   // Lire depuis .env
}

// ════════════════════════════════════════════════════════════
// 3. MODÈLES - Définition des tables
// ════════════════════════════════════════════════════════════

// 👤 Modèle User
model User {
  // Colonnes
  id        String   @id @default(cuid())  // ID unique (CUID)
  email     String   @unique               // Email unique
  name      String?                        // Nom (optionnel avec ?)
  password  String                         // Mot de passe hashé
  role      Role     @default(USER)        // Enum (USER ou ADMIN)
  createdAt DateTime @default(now())       // Date création
  updatedAt DateTime @updatedAt            // Date mise à jour auto
  
  // Relations
  posts     Post[]                         // 1 User → N Posts
  profile   Profile?                       // 1 User → 1 Profile (optionnel)
  
  // Index pour optimisation
  @@index([email])
  @@map("users")  // Nom de la table en BDD (par défaut = "User")
}

// 📝 Modèle Post
model Post {
  id          String   @id @default(cuid())
  title       String
  content     String?  @db.Text           // Type spécifique BDD
  published   Boolean  @default(false)
  viewCount   Int      @default(0)
  authorId    String                      // Foreign Key
  categoryId  String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  author      User     @relation(fields: [authorId], references: [id])
  category    Category? @relation(fields: [categoryId], references: [id])
  tags        Tag[]    @relation("PostToTag")  // Many-to-Many
  
  @@index([authorId])
  @@index([categoryId])
  @@map("posts")
}

// 👨‍💼 Modèle Profile
model Profile {
  id        String  @id @default(cuid())
  bio       String?
  avatar    String?
  userId    String  @unique  // Foreign Key unique (1-to-1)
  
  user      User    @relation(fields: [userId], references: [id])
  
  @@map("profiles")
}

// 🏷️ Modèle Tag
model Tag {
  id    String @id @default(cuid())
  name  String @unique
  
  posts Post[] @relation("PostToTag")  // Many-to-Many
  
  @@map("tags")
}

// 📚 Modèle Category
model Category {
  id    String @id @default(cuid())
  name  String @unique
  slug  String @unique
  
  posts Post[]
  
  @@map("categories")
}

// ════════════════════════════════════════════════════════════
// 4. ENUMS - Types énumérés
// ════════════════════════════════════════════════════════════
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

---

## 🔤 Types de Données Prisma

### Types Scalaires

| Type Prisma | Type TypeScript | Type SQL (PostgreSQL) | Exemple |
|-------------|-----------------|----------------------|---------|
| `String` | `string` | `TEXT` | `"Hello"` |
| `Int` | `number` | `INTEGER` | `42` |
| `Float` | `number` | `DOUBLE PRECISION` | `3.14` |
| `Boolean` | `boolean` | `BOOLEAN` | `true` |
| `DateTime` | `Date` | `TIMESTAMP` | `new Date()` |
| `Json` | `object` | `JSONB` | `{ key: "value" }` |
| `Bytes` | `Buffer` | `BYTEA` | `Buffer.from(...)` |

### Attributs de Champ

```prisma
model Product {
  // @id - Clé primaire
  id        String   @id @default(cuid())
  
  // @unique - Valeur unique dans la table
  sku       String   @unique
  
  // @default - Valeur par défaut
  inStock   Boolean  @default(true)
  createdAt DateTime @default(now())
  
  // @updatedAt - Mise à jour auto du timestamp
  updatedAt DateTime @updatedAt
  
  // @db.X - Type spécifique BDD (surcharge)
  description String  @db.Text      // TEXT au lieu de VARCHAR
  price       Decimal @db.Decimal(10, 2)  // Précision monétaire
  
  // ? - Champ optionnel (nullable)
  discount    Float?
}
```

---

## 🔗 Relations entre Modèles

### 1. One-to-Many (1-N)

**Exemple :** Un utilisateur a plusieurs posts

```prisma
model User {
  id    String @id @default(cuid())
  name  String
  
  posts Post[]  // ← Array = "plusieurs" posts
}

model Post {
  id       String @id @default(cuid())
  title    String
  authorId String  // ← Foreign Key
  
  author   User   @relation(fields: [authorId], references: [id])
  //                        ↑ colonne locale   ↑ colonne cible
}
```

**Explications :**
- `posts Post[]` dans `User` = **côté "many"** (relation virtuelle, pas en BDD)
- `authorId String` dans `Post` = **Foreign Key réelle** (colonne en BDD)
- `@relation(fields: [authorId], references: [id])` = **définit la FK**

**Requête TypeScript :**
```typescript
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  include: { posts: true }  // Inclure les posts de l'utilisateur
})

// user.posts → Post[]
```

---

### 2. One-to-One (1-1)

**Exemple :** Un utilisateur a un profil unique

```prisma
model User {
  id      String   @id @default(cuid())
  name    String
  
  profile Profile?  // ← Optionnel (?) = peut ne pas avoir de profil
}

model Profile {
  id     String @id @default(cuid())
  bio    String
  userId String @unique  // ← @unique = 1-to-1
  
  user   User   @relation(fields: [userId], references: [id])
}
```

**Différence avec 1-N :**
- `@unique` sur `userId` → garantit qu'un User a max 1 Profile
- `Profile?` (optionnel) côté User

---

### 3. Many-to-Many (N-N)

**Exemple :** Un post a plusieurs tags, un tag appartient à plusieurs posts

**Méthode 1 : Implicite (Prisma gère la table intermédiaire)**
```prisma
model Post {
  id    String @id @default(cuid())
  title String
  
  tags  Tag[]
}

model Tag {
  id    String @id @default(cuid())
  name  String
  
  posts Post[]
}
```

Prisma crée automatiquement une table `_PostToTag` :
```sql
CREATE TABLE "_PostToTag" (
  A TEXT NOT NULL REFERENCES "posts"(id),
  B TEXT NOT NULL REFERENCES "tags"(id)
);
```

**Méthode 2 : Explicite (contrôle total de la table intermédiaire)**
```prisma
model Post {
  id    String @id @default(cuid())
  title String
  
  postTags PostTag[]
}

model Tag {
  id   String @id @default(cuid())
  name String
  
  postTags PostTag[]
}

// Table intermédiaire explicite
model PostTag {
  postId String
  tagId  String
  assignedAt DateTime @default(now())  // Info supplémentaire
  
  post Post @relation(fields: [postId], references: [id])
  tag  Tag  @relation(fields: [tagId], references: [id])
  
  @@id([postId, tagId])  // Clé primaire composite
}
```

**Quand utiliser explicite ?**
- Quand vous avez besoin de colonnes supplémentaires (date d'association, etc.)
- Quand vous voulez un contrôle total

---

## 🚀 Migrations de Base de Données

### Workflow de Migration

```bash
# 1. Modifier schema.prisma (ajouter un modèle, champ, etc.)

# 2. Créer une migration
bun prisma migrate dev --name add_product_model

# Ce qui se passe :
# - Génère un fichier SQL dans prisma/migrations/
# - Applique la migration sur la BDD
# - Régénère le Prisma Client

# 3. En production
bun prisma migrate deploy
```

### Exemple de Fichier de Migration

```sql
-- prisma/migrations/20240213120000_add_product_model/migration.sql

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");
```

### Commandes Prisma Utiles

```bash
# Synchroniser le schéma sans migration (dev uniquement)
bun prisma db push

# Ouvrir l'interface graphique de la BDD
bun prisma studio

# Générer le client Prisma (après modif schema.prisma)
bun prisma generate

# Réinitialiser la BDD (⚠️ SUPPRIME TOUTES LES DONNÉES)
bun prisma migrate reset

# Voir l'état des migrations
bun prisma migrate status
```

---

## 📖 Requêtes CRUD avec Prisma

### CREATE - Créer des Enregistrements

```typescript
import { prisma } from '@/lib/db'

// 1. Créer un seul enregistrement
const user = await prisma.user.create({
  data: {
    email: 'john@example.com',
    name: 'John Doe',
    password: 'hashed_password',
    role: 'USER'
  }
})

// 2. Créer avec relations imbriquées
const userWithProfile = await prisma.user.create({
  data: {
    email: 'jane@example.com',
    name: 'Jane Doe',
    password: 'hashed',
    profile: {
      create: {  // Créer le profil en même temps
        bio: 'Software Engineer',
        avatar: 'https://example.com/avatar.jpg'
      }
    }
  },
  include: {
    profile: true  // Retourner le profil dans le résultat
  }
})

// 3. Créer plusieurs (bulk insert)
const products = await prisma.product.createMany({
  data: [
    { name: 'Laptop', price: 999.99 },
    { name: 'Mouse', price: 29.99 },
    { name: 'Keyboard', price: 79.99 }
  ]
})
// ⚠️ createMany ne retourne pas les objets créés (juste le count)
```

---

### READ - Lire des Enregistrements

```typescript
// 1. Trouver un enregistrement unique
const user = await prisma.user.findUnique({
  where: { id: 'user123' }
})

// 2. Trouver ou renvoyer null
const user = await prisma.user.findFirst({
  where: { email: 'test@example.com' }
})

// 3. Trouver plusieurs avec filtres
const users = await prisma.user.findMany({
  where: {
    role: 'ADMIN',
    createdAt: {
      gte: new Date('2024-01-01')  // Greater Than or Equal
    }
  },
  orderBy: {
    createdAt: 'desc'  // Tri décroissant
  },
  take: 10,  // Limiter à 10 résultats
  skip: 0    // Offset (pagination)
})

// 4. Compter
const count = await prisma.user.count({
  where: { role: 'USER' }
})

// 5. Inclure relations
const post = await prisma.post.findUnique({
  where: { id: 'post123' },
  include: {
    author: true,      // Inclure l'auteur complet
    category: true,    // Inclure la catégorie
    tags: true         // Inclure tous les tags
  }
})

// 6. Sélectionner des champs spécifiques
const users = await prisma.user.findMany({
  select: {
    id: true,
    email: true,
    // password: false (par défaut non sélectionné si select utilisé)
  }
})
```

---

### UPDATE - Mettre à Jour

```typescript
// 1. Mettre à jour un enregistrement
const user = await prisma.user.update({
  where: { id: 'user123' },
  data: {
    name: 'John Updated'
  }
})

// 2. Mettre à jour avec incrément
const post = await prisma.post.update({
  where: { id: 'post123' },
  data: {
    viewCount: {
      increment: 1  // viewCount = viewCount + 1
    }
  }
})

// 3. Mettre à jour plusieurs (bulk update)
const result = await prisma.user.updateMany({
  where: {
    role: 'USER'
  },
  data: {
    role: 'MODERATOR'
  }
})
// result.count → nombre de lignes modifiées

// 4. Upsert (update ou create si n'existe pas)
const user = await prisma.user.upsert({
  where: { email: 'new@example.com' },
  update: {
    name: 'Updated Name'
  },
  create: {
    email: 'new@example.com',
    name: 'New User',
    password: 'hashed'
  }
})
```

---

### DELETE - Supprimer

```typescript
// 1. Supprimer un enregistrement
const user = await prisma.user.delete({
  where: { id: 'user123' }
})

// 2. Supprimer plusieurs
const result = await prisma.user.deleteMany({
  where: {
    createdAt: {
      lt: new Date('2023-01-01')  // Less Than
    }
  }
})
```

---

## 🔍 Requêtes Avancées

### Filtres Complexes

```typescript
// AND implicite
const posts = await prisma.post.findMany({
  where: {
    published: true,
    author: {
      role: 'ADMIN'
    }
  }
})

// OR explicite
const users = await prisma.user.findMany({
  where: {
    OR: [
      { email: { contains: '@gmail.com' } },
      { email: { contains: '@yahoo.com' } }
    ]
  }
})

// NOT
const posts = await prisma.post.findMany({
  where: {
    NOT: {
      published: true
    }
  }
})

// Combinaisons
const posts = await prisma.post.findMany({
  where: {
    AND: [
      { published: true },
      {
        OR: [
          { viewCount: { gt: 100 } },
          { author: { role: 'ADMIN' } }
        ]
      }
    ]
  }
})
```

### Opérateurs de Comparaison

```typescript
where: {
  age: { equals: 30 },       // age = 30
  age: { not: 30 },          // age != 30
  age: { gt: 18 },           // age > 18 (greater than)
  age: { gte: 18 },          // age >= 18
  age: { lt: 65 },           // age < 65 (less than)
  age: { lte: 65 },          // age <= 65
  age: { in: [18, 25, 30] }, // age IN (18, 25, 30)
  age: { notIn: [13, 14] },  // age NOT IN (13, 14)
  
  name: { contains: 'John' },      // LIKE '%John%'
  name: { startsWith: 'J' },       // LIKE 'J%'
  name: { endsWith: 'Doe' },       // LIKE '%Doe'
  name: { mode: 'insensitive' },   // Case-insensitive (PostgreSQL)
}
```

### Pagination

```typescript
async function getPaginatedPosts(page: number, pageSize: number = 10) {
  const skip = (page - 1) * pageSize
  
  const [posts, totalCount] = await Promise.all([
    prisma.post.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.post.count()
  ])
  
  return {
    posts,
    totalPages: Math.ceil(totalCount / pageSize),
    currentPage: page
  }
}
```

### Agrégations

```typescript
// Compter, moyenne, somme, min, max
const stats = await prisma.product.aggregate({
  _count: { id: true },
  _avg: { price: true },
  _sum: { stock: true },
  _min: { price: true },
  _max: { price: true }
})

// Grouper par
const postsByAuthor = await prisma.post.groupBy({
  by: ['authorId'],
  _count: {
    id: true
  },
  _avg: {
    viewCount: true
  }
})
```

---

## ⚡ Optimisation des Performances

### 1. N+1 Query Problem

**❌ MAUVAIS (N+1 queries) :**
```typescript
const users = await prisma.user.findMany()

for (const user of users) {
  // ⚠️ 1 query par utilisateur !
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
}
// Total: 1 + N queries
```

**✅ BON (1 seule query avec include) :**
```typescript
const users = await prisma.user.findMany({
  include: {
    posts: true  // JOIN automatique
  }
})
// Total: 1 query
```

### 2. Index pour Performance

```prisma
model Post {
  id       String @id
  authorId String
  
  // ✅ Index sur colonne fréquemment filtrée
  @@index([authorId])
  
  // ✅ Index composite pour requêtes complexes
  @@index([authorId, published])
}
```

### 3. Select vs Include

```typescript
// ❌ LOURD : Récupère TOUT
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  include: { posts: true }
})

// ✅ LÉGER : Uniquement ce qui est nécessaire
const user = await prisma.user.findUnique({
  where: { id: 'user123' },
  select: {
    id: true,
    name: true,
    posts: {
      select: {
        id: true,
        title: true
      }
    }
  }
})
```

---

## 🔧 Le Client Prisma

### Initialisation

```typescript
// src/lib/db.ts

import { PrismaClient } from '@prisma/client'

// 🔑 Pattern Singleton (évite multiples connexions)
const globalForPrisma = global as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],  // Logger les queries (dev)
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

**Pourquoi ce pattern ?**
- En **développement** : Next.js recharge le code → sans singleton, crée 10+ connexions
- En **production** : 1 seule instance du serveur → pas de problème

---

## 🧪 Exercices Pratiques

### Exercice 1 : Modéliser un Blog

```prisma
// Créer un schéma avec :
// - User (id, email, name, password)
// - Post (id, title, content, published, authorId)
// - Comment (id, content, postId, authorId)
// - Category (id, name, slug)
// Relations :
// - 1 User → N Posts
// - 1 Post → N Comments
// - 1 User → N Comments
// - M Posts ↔ N Categories (many-to-many)
```

### Exercice 2 : Requêtes Complexes

```typescript
// 1. Trouver tous les posts publiés de la catégorie "Tech" avec >100 vues
// 2. Compter le nombre de posts par utilisateur
// 3. Trouver les 5 utilisateurs les plus actifs (le plus de posts)
// 4. Implémenter une pagination sur les posts (10 par page)
```

### Exercice 3 : Transactions

```typescript
// Créer une transaction :
// - Créer un utilisateur
// - Créer son profil
// - Créer 3 posts pour cet utilisateur
// Le tout doit réussir ou échouer ensemble (atomicité)

const result = await prisma.$transaction([
  // Vos requêtes ici
])
```

---

## 🎯 Points Clés à Retenir

1. **schema.prisma** = source de vérité unique
2. **Migrations** = versioning de la BDD
3. **Type-safety** = détection d'erreurs à la compilation
4. **Relations** = 1-N, 1-1, N-N avec syntaxe déclarative
5. **Include vs Select** = compromis entre facilité et performance
6. **Index** = accélérer les requêtes sur colonnes fréquentes

---

## 📚 Prochains Cours

- **Cours 4** : Gestion d'État et Formulaires React
- **Cours 5** : Authentification JWT et Sessions
- **Cours 6** : Intégration IA Locale (z-ai-web-dev-sdk)
- **Cours 7** : API MCP et Communication Inter-IA

---

**🎓 Fin du Cours 3**

Vous maîtrisez maintenant Prisma ! Prêt pour la gestion d'état React ?
