# 📘 GUIDE D'IMPLÉMENTATION COMPLET
## Application Auto-Modifiable via IA

---

## 🎯 Vue d'Ensemble

Ce guide explique comment intégrer le système **AI Builder** dans votre application PME IA Assistant existante.

**Résultat :** Une application capable de se modifier elle-même via dialogue avec un chatbot IA.

---

## 📦 Fichiers Fournis

### Architecture (1 fichier)
- `architecture/ARCHITECTURE.md` - Documentation conceptuelle complète

### Librairies (2 fichiers)
- `src/lib/ai/codeGenerator.ts` - Générateur de code IA
- `src/lib/builder/fileManager.ts` - Gestionnaire de fichiers avec versioning

### API Routes (1 fichier)
- `src/app/api/ai/generate/route.ts` - Endpoint de génération

### Pages (1 fichier)
- `src/app/builder/page.tsx` - Interface AI Builder

### Schéma BDD (1 fichier)
- `prisma/schema-builder.prisma` - Nouvelles tables

### Documentation (3 fichiers)
- `docs/IMPLEMENTATION.md` - Ce guide
- `docs/USER_GUIDE.md` - Guide utilisateur
- `docs/EXAMPLES.md` - Exemples d'utilisation

---

## ⚡ Installation Rapide (30 minutes)

### Étape 1 : Copier les Fichiers

```bash
# Extraire l'archive
tar -xzf pme-ia-self-modifying.tar.gz

# Aller dans votre projet existant
cd votre-projet-pme-ia

# Copier TOUS les fichiers
cp -r ../pme-ia-self-modifying/src/* ./src/
cp -r ../pme-ia-self-modifying/prisma/schema-builder.prisma ./prisma/
```

---

### Étape 2 : Mettre à Jour le Schéma Prisma

```bash
# Ouvrir prisma/schema.prisma
# Ajouter à la fin les 3 nouveaux modèles:

# ComponentVersion (versions fichiers)
# BuilderAction (historique actions)
# Preview (prévisualisations temporaires)

# Copier-coller depuis prisma/schema-builder.prisma
```

**Puis :**

```bash
# Générer le client Prisma
npx prisma generate

# Pusher vers la BDD
npx prisma db push
```

---

### Étape 3 : Vérifier les Imports

**Fichiers à vérifier :**

```typescript
// src/lib/ai/codeGenerator.ts
import { gemini } from '../gemini' // ✅ Doit exister

// src/lib/builder/fileManager.ts  
import { prisma } from '../db' // ✅ Doit exister

// src/app/api/ai/generate/route.ts
import { codeGenerator } from '@/lib/ai/codeGenerator'
import { fileManager } from '@/lib/builder/fileManager'

// src/app/builder/page.tsx
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
```

**Si un import est cassé :** Ajustez le chemin relatif.

---

### Étape 4 : Ajouter le Lien dans la Navigation

```typescript
// src/app/page.tsx
// Ajouter cette carte:

<Link 
  href="/builder" 
  className="block p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg shadow hover:shadow-lg transition"
>
  <div className="text-4xl mb-3">🤖</div>
  <h3 className="text-xl font-semibold mb-2">AI Builder</h3>
  <p>Modifiez l'application par dialogue IA</p>
  <p className="mt-2 font-medium">→ Créez des pages, boutons, formulaires...</p>
</Link>
```

---

### Étape 5 : Tester Localement

```bash
npm run dev
```

**Ouvrir :** http://localhost:3000/builder

**Tester avec :**
```
"Ajoute un bouton rouge sur la page d'accueil"
```

**Vérifier :**
1. Le code est généré
2. La prévisualisation s'affiche
3. Cliquer "Appliquer"
4. Vérifier que la version est sauvegardée en BDD

---

### Étape 6 : Déployer sur Render

```bash
git add .
git commit -m "feat: AI Builder - Application auto-modifiable"
git push origin main
```

**Render va automatiquement rebuilder.**

**⚠️ Important :** Sur Render, les modifications ne persisteront pas après un redéploiement (système de fichiers éphémère). Solutions :
1. Utiliser un volume persistant (plan payant)
2. Sauvegarder dans la BDD et régénérer à chaque boot
3. Auto-commit vers Git après chaque modification (avancé)

---

## 🔧 Configuration Avancée

### Personnaliser les Prompts IA

```typescript
// src/lib/ai/codeGenerator.ts

// Modifier le prompt de génération
private buildGenerationPrompt(analysis: any, context: any): string {
  return `
Tu es un expert ${analysis.targetFile.includes('api') ? 'backend' : 'frontend'}.

RÈGLES PERSONNALISÉES:
- Toujours ajouter des commentaires
- Utiliser des noms de variables en français
- Ajouter des console.log pour debug

${/* Votre prompt custom */}
`
}
```

---

### Ajouter des Validations Personnalisées

```typescript
// src/lib/builder/fileManager.ts

private validateOperation(operation: FileOperation) {
  // Ajouter vos règles:
  
  // Exemple: Limiter la taille du code
  if (operation.code.length > 50000) {
    return {
      valid: false,
      error: 'Code trop long (max 50KB)'
    }
  }
  
  // Exemple: Vérifier le nom des composants
  if (operation.action === 'create' && 
      !operation.filePath.match(/[A-Z]/)) {
    return {
      valid: false,
      error: 'Nom de composant doit commencer par majuscule'
    }
  }
  
  return { valid: true }
}
```

---

### Activer le Système de Fichiers Réel

**⚠️ Production uniquement, pas en développement**

```typescript
// src/lib/builder/fileManager.ts
import { promises as fs } from 'fs'
import path from 'path'

async applyOperation(operation: FileOperation) {
  // ... code existant ...
  
  // Après sauvegarde en BDD, écrire le fichier réellement:
  if (process.env.NODE_ENV === 'production') {
    const fullPath = path.join(process.cwd(), operation.filePath)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, operation.code, 'utf-8')
  }
  
  return { success: true, versionId: version.id }
}
```

---

## 📊 Structure BDD

### ComponentVersion

| Champ | Type | Description |
|-------|------|-------------|
| id | String | ID unique |
| filePath | String | ex: "src/app/page.tsx" |
| fileName | String | ex: "page.tsx" |
| code | String | Code complet du fichier |
| description | String | Description modification |
| version | Int | Numéro version (1, 2, 3...) |
| metadata | JSON | action, timestamp, etc |
| createdBy | String | "ai" ou "user" |
| createdAt | DateTime | Date création |

**Utilité :** Historique complet de chaque fichier modifié.

---

### BuilderAction

| Champ | Type | Description |
|-------|------|-------------|
| id | String | ID unique |
| action | String | "create", "modify", "delete" |
| target | String | Fichier cible |
| prompt | String | Demande utilisateur |
| code | String | Code généré |
| applied | Boolean | Modification appliquée ? |
| success | Boolean | Succès ou échec |
| error | String | Message d'erreur si échec |
| versionId | String | Lien vers ComponentVersion |
| createdAt | DateTime | Date |

**Utilité :** Audit trail complet de toutes les actions.

---

### Preview

| Champ | Type | Description |
|-------|------|-------------|
| id | String | ID unique |
| code | String | Code à prévisualiser |
| filePath | String | Fichier concerné |
| expiresAt | DateTime | Suppression automatique |
| createdAt | DateTime | Date création |

**Utilité :** Stockage temporaire des prévisualisations.

---

## 🎨 Interface Builder

### Fonctionnalités

**1. Zone de Texte**
- Utilisateur décrit sa demande
- Exemples affichés pour guider
- Validation avant envoi

**2. Bouton Générer**
- Appelle `/api/ai/generate`
- Loading state pendant génération
- Affiche résultat ou erreur

**3. Prévisualisation**
- Affiche le code généré
- Montre fichier et action
- Coloration syntaxique

**4. Boutons Appliquer/Annuler**
- Appliquer : Sauvegarde en BDD + écrit fichier
- Annuler : Efface la prévisualisation

**5. Historique**
- Liste des modifications appliquées
- Affiche prompt et résultat
- Ordre chronologique inverse

---

## 🔐 Sécurité

### Validations Implémentées

**1. Chemins Autorisés**
```typescript
const allowedPaths = [
  'src/app/',
  'src/components/',
  'src/lib/'
]
```

**2. Fichiers Protégés**
```typescript
const forbiddenFiles = [
  'layout.tsx',
  'gemini.ts',
  'db.ts',
  'schema.prisma'
]
```

**3. Patterns Dangereux**
```typescript
const dangerousPatterns = [
  'eval(',
  'Function(',
  'process.env',
  'fs.readFile',
  'child_process'
]
```

**4. Validation Syntaxe**
- Vérification crochets équilibrés
- Présence d'export
- Code non vide

---

### Recommandations Production

1. **Rate Limiting**
   ```typescript
   // Limiter à 10 modifications/heure/user
   // Utiliser Redis ou en mémoire
   ```

2. **Authentification**
   ```typescript
   // Vérifier que l'utilisateur est admin
   if (session.role !== 'admin') {
     return Response forbidden
   }
   ```

3. **Audit Complet**
   ```typescript
   // Logger IP, user agent, etc
   await prisma.builderAction.create({
     data: {
       // ... existant
       ip: request.headers.get('x-forwarded-for'),
       userAgent: request.headers.get('user-agent')
     }
   })
   ```

4. **Backup Automatique**
   ```typescript
   // Avant chaque modification:
   // - Export de la BDD
   // - Commit Git automatique
   // - Archive des fichiers
   ```

---

## 🐛 Troubleshooting

### Erreur "Gemini non configuré"

**Cause :** `GEMINI_API_KEY` manquante

**Solution :**
```bash
# Render Dashboard > Environment
GEMINI_API_KEY=AIzaSy...
```

---

### Erreur "Code invalide: Accolades non équilibrées"

**Cause :** IA a généré du code syntaxiquement incorrect

**Solution :**
1. Reformuler la demande plus clairement
2. Vérifier le prompt système
3. Baisser la température (0.3 au lieu de 0.5)

---

### Modifications ne persistent pas (Render)

**Cause :** Système de fichiers éphémère

**Solutions :**
1. **Court terme :** Accepter (OK pour démo)
2. **Moyen terme :** Volume persistant Render (payant)
3. **Long terme :** Auto-commit Git après chaque modification

---

### Prévisualisation ne s'affiche pas

**Cause :** Code trop long ou erreur parsing

**Solution :**
- Limiter la longueur du code généré
- Améliorer l'extraction du code depuis la réponse IA
- Vérifier les logs côté serveur

---

## 📚 Ressources Supplémentaires

### Documentation

- `ARCHITECTURE.md` - Concepts et flux
- `USER_GUIDE.md` - Guide utilisateur
- `EXAMPLES.md` - Exemples concrets
- `API.md` - Documentation API

### Code Source

- `src/lib/ai/codeGenerator.ts` - Générateur IA
- `src/lib/builder/fileManager.ts` - Gestion fichiers
- `src/app/api/ai/generate/route.ts` - API endpoint
- `src/app/builder/page.tsx` - Interface

---

## ✅ Checklist Post-Installation

- [ ] Tous les fichiers copiés
- [ ] Schéma Prisma mis à jour
- [ ] `npx prisma generate` exécuté
- [ ] `npx prisma db push` exécuté
- [ ] Imports vérifiés (pas d'erreurs)
- [ ] Lien ajouté dans navigation
- [ ] Test en local réussi
- [ ] Page `/builder` accessible
- [ ] Génération de code fonctionne
- [ ] Application fonctionne
- [ ] Historique sauvegardé en BDD
- [ ] Git commit et push
- [ ] Déployé sur Render
- [ ] Test en production

---

## 🎉 Félicitations !

Votre application peut maintenant **se modifier elle-même** via dialogue avec l'IA.

**Prochaines étapes :**
1. Tester avec différentes demandes
2. Affiner les prompts IA
3. Ajouter des fonctionnalités personnalisées
4. Partager avec des utilisateurs beta

---

**Questions ? Consultez la documentation complète ou les exemples fournis.**

**Bon développement ! 🚀**
