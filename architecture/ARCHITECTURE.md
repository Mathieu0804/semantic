# 🏗️ ARCHITECTURE - APPLICATION AUTO-MODIFIABLE

## 🎯 Concept : "L'Outil qui Crée l'Outil"

Application qui génère et modifie son propre code via dialogue avec un chatbot IA.

---

## 📊 Vue d'Ensemble Architecturale

```
┌─────────────────────────────────────────────────────────────┐
│                    UTILISATEUR                              │
│  "Ajoute un bouton rouge sur la page d'accueil"            │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│              CHATBOT IA BUILDER                             │
│  - Comprend l'intention                                     │
│  - Décompose en actions techniques                          │
│  - Génère le code React/Next.js                             │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         │               │               │
┌────────▼────────┐ ┌───▼────────┐ ┌───▼────────────┐
│   GÉNÉRATEUR    │ │ MODIFICATEUR│ │  VALIDATEUR    │
│   DE CODE       │ │ DE CODE     │ │  SÉCURITÉ      │
│                 │ │             │ │                │
│ - Crée pages    │ │ - Modifie   │ │ - Pas de code  │
│ - Crée composants│ │   existants │ │   malicieux    │
│ - Crée routes   │ │ - Ajoute    │ │ - Validation   │
│                 │ │   features  │ │   syntaxe      │
└────────┬────────┘ └───┬────────┘ └───┬────────────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              SYSTÈME DE VERSIONING                          │
│  - Sauvegarde chaque version                                │
│  - Rollback possible                                        │
│  - Historique des modifications                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
         ┌──────────────┼──────────────┐
         │              │              │
┌────────▼────────┐ ┌───▼────────┐ ┌──▼────────────┐
│  PRÉVISUALISATION│ │  BASE DE   │ │  DÉPLOIEMENT  │
│  TEMPS RÉEL     │ │  DONNÉES   │ │  AUTOMATIQUE  │
│                 │ │            │ │               │
│ - Sandbox       │ │ - Versions │ │ - Git commit  │
│ - Iframe isolé  │ │ - Composants│ │ - Rebuild     │
│                 │ │ - Historique│ │               │
└─────────────────┘ └────────────┘ └───────────────┘
```

---

## 🔧 Composants Clés

### 1. AI Code Generator

**Fichier :** `src/lib/ai/codeGenerator.ts`

**Responsabilité :**
- Analyser les demandes utilisateur
- Générer du code React/Next.js valide
- Respecter les conventions du projet
- Créer des composants réutilisables

**Exemple :**
```
Input : "Ajoute un bouton rouge sur la page d'accueil"
Output : 
  - Analyse : Modifier src/app/page.tsx
  - Code : <Button className="bg-red-600">Mon Bouton</Button>
  - Position : Après le header
```

---

### 2. Component Modifier

**Fichier :** `src/lib/builder/componentModifier.ts`

**Responsabilité :**
- Lire les fichiers existants
- Parser le code React
- Insérer/Modifier/Supprimer des éléments
- Maintenir la validité du code

**Capacités :**
- Ajouter des composants
- Modifier des props
- Changer des styles
- Réorganiser la structure

---

### 3. Preview System

**Fichier :** `src/components/builder/PreviewFrame.tsx`

**Responsabilité :**
- Afficher le code généré en temps réel
- Sandbox sécurisé (iframe)
- Hot reload automatique
- Comparaison avant/après

---

### 4. Version Manager

**Fichier :** `src/lib/builder/versionManager.ts`

**Responsabilité :**
- Sauvegarder chaque modification
- Permettre rollback
- Historique complet
- Diff entre versions

**Structure BDD :**
```prisma
model ComponentVersion {
  id          String   @id
  filePath    String
  code        String
  description String
  version     Int
  createdAt   DateTime
}
```

---

## 🎨 Interface Utilisateur

### Page Builder (`/builder`)

```
┌─────────────────────────────────────────────────────────┐
│  🤖 AI Builder - Construisez votre application          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────┐  ┌─────────────────────────┐ │
│  │  💬 CHATBOT         │  │  👁️ PRÉVISUALISATION   │ │
│  │                     │  │                         │ │
│  │  User: Ajoute un    │  │  ┌──────────────────┐  │ │
│  │  bouton rouge       │  │  │ [Button Rouge]   │  │ │
│  │                     │  │  │                  │  │ │
│  │  AI: D'accord ! Je  │  │  │ Voici le résultat│  │ │
│  │  vais ajouter un    │  │  └──────────────────┘  │ │
│  │  bouton rouge sur   │  │                         │ │
│  │  la page d'accueil. │  │  [Appliquer] [Annuler]│ │
│  │  [Code généré ✓]    │  │                         │ │
│  │                     │  │                         │ │
│  │  [Appliquer ✓]      │  │                         │ │
│  └─────────────────────┘  └─────────────────────────┘ │
│                                                         │
│  ┌─────────────────────────────────────────────────┐  │
│  │  📜 HISTORIQUE DES MODIFICATIONS                │  │
│  │  - v5: Ajout bouton rouge (il y a 2 min)       │  │
│  │  - v4: Modification header (il y a 10 min)     │  │
│  │  - v3: Création page témoignages (hier)        │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Modification

### Cas d'Usage 1 : Ajouter un Bouton

```
1. USER dit au chatbot :
   "Ajoute un bouton rouge 'Contactez-nous' sur la page d'accueil"

2. AI ANALYSE :
   {
     action: "add_component",
     target: "src/app/page.tsx",
     component: "Button",
     props: {
       text: "Contactez-nous",
       className: "bg-red-600 hover:bg-red-700"
     },
     position: "before_footer"
   }

3. CODE GENERATOR génère :
   <Button 
     className="bg-red-600 hover:bg-red-700 text-white px-6 py-3"
     onClick={() => window.location.href='/contact'}
   >
     Contactez-nous
   </Button>

4. PRÉVISUALISATION affiche le résultat

5. USER valide → Modification sauvegardée

6. SYSTÈME crée une version :
   - Version 6
   - Description: "Ajout bouton contact rouge"
   - Fichier: src/app/page.tsx
   - Timestamp: 2026-02-14 18:30:00
```

---

### Cas d'Usage 2 : Créer une Nouvelle Page

```
1. USER :
   "Crée une nouvelle page /temoignages avec 3 témoignages clients"

2. AI GÉNÈRE :
   - Fichier: src/app/temoignages/page.tsx
   - Contenu: Structure complète avec layout
   - Composants: Card pour chaque témoignage
   - Données: 3 exemples de témoignages

3. PRÉVISUALISATION montre la page

4. USER valide → Page créée

5. SYSTÈME ajoute automatiquement :
   - Lien dans la navigation
   - Route dans l'API
   - Référence dans le menu
```

---

### Cas d'Usage 3 : Modifier un Formulaire

```
1. USER :
   "Ajoute un champ 'Site web' au formulaire entreprise"

2. AI ANALYSE le fichier existant :
   - Lit src/app/entreprise/page.tsx
   - Identifie le formulaire
   - Trouve l'emplacement optimal

3. CODE MODIFIER :
   - Ajoute le champ dans formData
   - Ajoute l'input dans le JSX
   - Modifie l'API pour sauvegarder
   - Met à jour le schéma Prisma si nécessaire

4. PRÉVISUALISATION montre le nouveau champ

5. USER valide → Tous les fichiers modifiés
```

---

## 🔐 Sécurité

### Validations Implémentées

1. **Code Injection Prevention**
   - Pas d'eval() ou Function()
   - Pas d'accès système (fs, exec)
   - Sandbox pour prévisualisation

2. **Validation Syntaxe**
   - Parser AST (Abstract Syntax Tree)
   - Vérifier JSX valide
   - Vérifier imports corrects

3. **Limites**
   - Max 100 modifications/jour
   - Max 10 fichiers par modification
   - Rollback automatique si erreur

4. **Audit Trail**
   - Chaque modification loguée
   - IP et timestamp enregistrés
   - Possibilité de désactiver l'auto-modification

---

## 📁 Structure des Fichiers Générés

```
src/
├── app/
│   ├── builder/
│   │   └── page.tsx              # Interface builder principale
│   │
│   ├── preview/
│   │   └── [id]/
│   │       └── page.tsx          # Prévisualisation isolée
│   │
│   └── api/
│       └── ai/
│           ├── generate/
│           │   └── route.ts      # Générer nouveau code
│           │
│           ├── modify/
│           │   └── route.ts      # Modifier code existant
│           │
│           ├── preview/
│           │   └── route.ts      # Obtenir preview
│           │
│           └── apply/
│               └── route.ts      # Appliquer modifications
│
├── components/
│   └── builder/
│       ├── ChatInterface.tsx     # Interface chat builder
│       ├── PreviewFrame.tsx      # Prévisualisation
│       ├── CodeDiff.tsx          # Comparaison code
│       └── VersionHistory.tsx    # Historique versions
│
└── lib/
    ├── ai/
    │   ├── codeGenerator.ts      # Génération code
    │   ├── codeAnalyzer.ts       # Analyse code existant
    │   └── promptTemplates.ts    # Prompts spécialisés
    │
    └── builder/
        ├── componentModifier.ts  # Modification composants
        ├── fileManager.ts        # Gestion fichiers
        ├── versionManager.ts     # Gestion versions
        └── validator.ts          # Validation sécurité
```

---

## 🎯 Fonctionnalités Clés

### 1. Génération Intelligente

**Le chatbot peut :**
- ✅ Créer des pages complètes
- ✅ Créer des composants
- ✅ Modifier des fichiers existants
- ✅ Ajouter des fonctionnalités
- ✅ Changer les styles
- ✅ Réorganiser l'interface

### 2. Prévisualisation Temps Réel

**L'utilisateur voit :**
- ✅ Le résultat avant validation
- ✅ Comparaison avant/après
- ✅ Erreurs éventuelles
- ✅ Impact sur les autres pages

### 3. Gestion de Versions

**Système complet :**
- ✅ Chaque modification = nouvelle version
- ✅ Rollback en 1 clic
- ✅ Historique illimité
- ✅ Export/Import de versions

### 4. Intelligence Contextuelle

**L'IA comprend :**
- ✅ Le contexte du projet
- ✅ Les composants existants
- ✅ Les conventions de code
- ✅ Les dépendances entre fichiers

---

## 🚀 Exemples de Commandes Possibles

### Interface
```
"Ajoute un bouton bleu en haut à droite"
"Change la couleur du header en vert"
"Rends le footer sticky"
"Ajoute un menu hamburger sur mobile"
```

### Pages
```
"Crée une page contact avec un formulaire"
"Ajoute une page FAQ avec 5 questions"
"Crée une page de témoignages clients"
"Ajoute une page blog"
```

### Formulaires
```
"Ajoute un champ email au formulaire"
"Rends le champ téléphone obligatoire"
"Ajoute un sélecteur de date"
"Ajoute une case à cocher CGV"
```

### Fonctionnalités
```
"Ajoute un système de notation par étoiles"
"Crée un carrousel d'images"
"Ajoute un compteur de visiteurs"
"Intègre une carte Google Maps"
```

### Données
```
"Ajoute une table 'Avis' dans la base de données"
"Modifie le schéma Produit pour ajouter 'Référence'"
"Crée une API pour les commentaires"
```

---

## 📊 Schéma Base de Données

### Nouvelles Tables

```prisma
// Versions des composants
model ComponentVersion {
  id          String   @id @default(cuid())
  filePath    String
  fileName    String
  code        String   @db.Text
  description String
  version     Int
  metadata    String   @default("{}")
  
  createdBy   String   @default("ai")
  createdAt   DateTime @default(now())
  
  @@index([filePath])
  @@index([version])
  @@map("component_versions")
}

// Historique des modifications
model BuilderAction {
  id          String   @id @default(cuid())
  
  action      String   // "create", "modify", "delete"
  target      String   // Fichier cible
  prompt      String   @db.Text
  code        String?  @db.Text
  
  applied     Boolean  @default(false)
  success     Boolean?
  error       String?
  
  versionId   String?
  
  createdAt   DateTime @default(now())
  
  @@index([action])
  @@index([applied])
  @@map("builder_actions")
}

// Prévisualisations temporaires
model Preview {
  id          String   @id @default(cuid())
  code        String   @db.Text
  expiresAt   DateTime
  
  @@map("previews")
}
```

---

## 🎓 Avantages pour l'Utilisateur

### Non-Technique
✅ Pas besoin de coder  
✅ Dialogue naturel  
✅ Résultats immédiats  
✅ Pas d'erreurs de syntaxe  

### Technique
✅ Code propre et maintenable  
✅ Respect des conventions  
✅ Type-safe (TypeScript)  
✅ Versionné et traçable  

### Business
✅ Prototypage ultra-rapide  
✅ Itérations instantanées  
✅ Pas de développeur nécessaire  
✅ Coût réduit  

---

## ⚠️ Limitations et Considérations

### Limitations Techniques

1. **Complexité**
   - Modifications simples uniquement
   - Pas de logique métier complexe
   - Pas de refactoring massif

2. **Sécurité**
   - Validation stricte du code
   - Pas d'accès système
   - Sandbox obligatoire

3. **Performance**
   - Génération peut prendre 5-10s
   - Prévisualisation nécessite rebuild

### Bonnes Pratiques

1. **Commencer Simple**
   - Tester avec modifications mineures
   - Valider chaque étape
   - Rollback si nécessaire

2. **Backup Régulier**
   - Exporter versions importantes
   - Git commit fréquent
   - Tester en dev d'abord

3. **Validation Humaine**
   - Toujours prévisualiser
   - Vérifier le code généré
   - Tester fonctionnellement

---

## 🔮 Évolutions Futures

### v2.0 (Prévu)
- ✅ Génération d'API complexes
- ✅ Intégration services tiers
- ✅ Thèmes complets en 1 clic
- ✅ Templates pré-conçus

### v3.0 (Vision)
- ✅ Génération depuis maquette (image → code)
- ✅ Voice commands
- ✅ Collaboration temps réel
- ✅ AI suggestions proactives

---

**CONCLUSION :** Architecture révolutionnaire permettant à l'application de se construire elle-même via dialogue naturel avec l'IA.

**PHILOSOPHIE :** "L'outil qui crée l'outil" - Démocratisation du développement web.
