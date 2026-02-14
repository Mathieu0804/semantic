# 🎓 Programme de Formation v3zai
## Formation Complète pour Maîtriser la Stack Next.js + IA Locale

---

## 📖 Vue d'Ensemble

Ce programme de formation vous guide pas à pas dans la compréhension approfondie du projet **v3zai**, une plateforme IA pour PME permettant la création de sites web automatisés.

**Niveau :** Intermédiaire à Avancé  
**Durée estimée :** 40-60 heures  
**Prérequis :** JavaScript/TypeScript de base, React fondamental

---

## 🗺️ Plan de Formation

### 📚 Module 1 : Fondations
**Durée : 8-10 heures**

#### Cours 1 : Architecture Globale du Projet
- Comprendre la structure d'une application Next.js 15
- Le rôle de chaque dossier et fichier
- Le flux de données dans l'application
- Les choix technologiques (Next.js, Prisma, Tailwind)
- **Exercices :** Explorer la structure, tracer des flux de données

📄 [**Ouvrir le Cours 1**](./cours_01_architecture_globale.md)

---

#### Cours 2 : Next.js App Router en Profondeur
- Routing basé sur les fichiers
- Server Components vs Client Components
- Layouts, loading et error states
- API Routes et data fetching
- Routes dynamiques
- **Exercices :** Créer des pages, API routes, gérer le loading

📄 [**Ouvrir le Cours 2**](./cours_02_nextjs_app_router.md)

---

### 🗄️ Module 2 : Base de Données et Backend
**Durée : 10-12 heures**

#### Cours 3 : Prisma ORM - Modélisation et Requêtes
- Le schéma Prisma (types, relations)
- Migrations de base de données
- Requêtes CRUD avec type-safety
- Requêtes avancées (filtres, agrégations)
- Optimisation des performances
- **Exercices :** Modéliser un blog, requêtes complexes, transactions

📄 [**Ouvrir le Cours 3**](./cours_03_prisma_orm.md)

---

### 🤖 Module 3 : Intelligence Artificielle
**Durée : 12-15 heures**

#### Cours 4 : Serveur MCP - Communication Inter-IA
- Model Context Protocol (MCP)
- Architecture du serveur MCP
- Authentification et sessions
- Gestion des requêtes IA-to-IA
- Cas d'usage pratiques
- **Exercices :** Créer un client MCP, tester les endpoints

📄 [**Ouvrir le Cours 4**](./cours_04_serveur_mcp.md)

---

#### Cours 5 : Intégration de l'IA Locale
- L'IA locale vs Cloud AI
- SDK z-ai-web-dev-sdk
- Prompts engineering
- Génération de code intelligente
- Gestion du contexte conversationnel
- Optimisation (cache, queue)
- **Exercices :** Générer des composants, créer un chatbot

📄 [**Ouvrir le Cours 5**](./cours_05_ia_locale.md)

---

### 🛠️ Module 4 : Référence et Pratique
**Durée : 10-15 heures**

#### Guide de Référence Rapide
- Commandes essentielles
- Antisèches Prisma, Next.js, Tailwind
- Debugging et troubleshooting
- Déploiement (VPS, Docker)
- Sécurité et performance

📄 [**Ouvrir le Guide de Référence**](./guide_reference_rapide.md)

---

## 🎯 Objectifs d'Apprentissage

À la fin de cette formation, vous serez capable de :

### Niveau Technique
✅ Construire une application Next.js 15 complète (frontend + backend)  
✅ Modéliser une base de données relationnelle avec Prisma  
✅ Créer des API REST type-safe et sécurisées  
✅ Intégrer une IA locale pour génération de contenu  
✅ Implémenter un serveur MCP pour communication inter-IA  
✅ Déployer sur VPS avec PM2 ou Docker  

### Niveau Conceptuel
✅ Comprendre l'architecture d'une application moderne full-stack  
✅ Maîtriser le pattern Server Components / Client Components  
✅ Appliquer les best practices de sécurité et performance  
✅ Orchestrer plusieurs services (BDD, IA, API)  

---

## 📊 Progression Suggérée

### Semaine 1-2 : Fondations
```
Jour 1-2 : Cours 1 (Architecture globale)
Jour 3-5 : Cours 2 (Next.js App Router)
Jour 6-7 : Exercices pratiques + mini-projet
```

### Semaine 3-4 : Backend et BDD
```
Jour 8-10 : Cours 3 (Prisma ORM)
Jour 11-14 : Projet pratique (CRUD complet)
```

### Semaine 5-6 : Intelligence Artificielle
```
Jour 15-17 : Cours 4 (Serveur MCP)
Jour 18-21 : Cours 5 (IA locale)
Jour 22-24 : Projet final (chatbot + génération)
```

### Semaine 7-8 : Consolidation
```
Jour 25-28 : Guide de référence + approfondissements
Jour 29-30 : Déploiement et optimisation
```

---

## 🛠️ Configuration de l'Environnement

### Prérequis Logiciels

```bash
# Node.js 20+ et Bun
node --version  # v20.x ou supérieur
bun --version   # 1.0.x ou supérieur

# Git
git --version

# Éditeur recommandé : VS Code
# Extensions utiles :
# - Prisma
# - Tailwind CSS IntelliSense
# - ESLint
# - TypeScript
```

### Installation du Projet

```bash
# 1. Cloner le repository
git clone https://github.com/Mathieu0804/v3zai.git
cd v3zai

# 2. Installer les dépendances
bun install

# 3. Configurer l'environnement
cp .env.example .env
# Éditer .env selon vos besoins

# 4. Initialiser la base de données
bun prisma db push

# 5. Lancer le serveur de développement
bun run dev

# 6. Ouvrir dans le navigateur
# http://localhost:3000
```

---

## 📚 Ressources Complémentaires

### Documentation Officielle
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React 19 Documentation](https://react.dev)

### Tutoriels et Guides
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev by Google](https://web.dev/)

### Communautés
- [Next.js Discord](https://nextjs.org/discord)
- [Prisma Discord](https://pris.ly/discord)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

---

## 🎓 Exercices et Projets

### Exercices Intégrés
Chaque cours contient des exercices pratiques à la fin. Il est **fortement recommandé** de les faire pour consolider vos connaissances.

### Projets Suggérés

#### 🌟 Projet 1 : Blog Personnel (Après Module 2)
**Objectif :** Créer un blog avec CRUD complet  
**Fonctionnalités :**
- Liste d'articles avec pagination
- Création/édition/suppression d'articles
- Système de catégories et tags
- SEO optimisé

**Durée :** 2-3 jours

---

#### 🌟 Projet 2 : Dashboard Analytics (Après Module 2)
**Objectif :** Créer un tableau de bord avec graphiques  
**Fonctionnalités :**
- Agrégation de données (comptes, moyennes)
- Graphiques interactifs
- Filtres par période
- Export CSV

**Durée :** 3-4 jours

---

#### 🌟🌟 Projet 3 : Générateur de Landing Pages (Après Module 3)
**Objectif :** Créer un outil de génération automatique de pages  
**Fonctionnalités :**
- Chatbot pour recueillir les specs
- Génération de code avec l'IA locale
- Prévisualisation en temps réel
- Export du code généré

**Durée :** 5-7 jours

---

#### 🌟🌟🌟 Projet Final : Plateforme Multi-Tenants (Après tout)
**Objectif :** Application SaaS complète  
**Fonctionnalités :**
- Authentification et autorisation
- Gestion multi-utilisateurs
- Génération de sites par IA
- Serveur MCP fonctionnel
- Analytics et monitoring

**Durée :** 10-15 jours

---

## 🔍 Évaluation des Connaissances

### Quiz de Fin de Module

À la fin de chaque module, testez-vous avec ces questions :

**Module 1 (Fondations) :**
1. Quelle est la différence entre un Server Component et un Client Component ?
2. Comment créer une API route dans Next.js 15 ?
3. À quoi sert le fichier `layout.tsx` ?

**Module 2 (Backend) :**
1. Comment définir une relation 1-N dans Prisma ?
2. Quelle est la différence entre `findUnique` et `findFirst` ?
3. Comment optimiser une requête Prisma qui cause un N+1 problem ?

**Module 3 (IA) :**
1. Quel est le rôle du serveur MCP ?
2. Comment gérer le contexte conversationnel dans un chatbot ?
3. Quels sont les avantages d'une IA locale vs Cloud AI ?

---

## 💡 Conseils pour Réussir

### 1. Pratiquer Régulièrement
```
❌ Lire tous les cours d'affilée
✅ 1 cours → exercices → pause → projet
```

### 2. Debugger Activement
```
Quand vous bloquez :
1. Lire le message d'erreur COMPLÈTEMENT
2. console.log() pour comprendre le flux
3. Utiliser Prisma Studio pour voir la BDD
4. Chercher sur Stack Overflow
5. Demander de l'aide (Discord, forums)
```

### 3. Prendre des Notes
```
Créez un fichier NOTES.md dans le projet :
- Concepts difficiles
- Astuces découvertes
- Erreurs communes à éviter
```

### 4. Construire en Public
```
Partagez vos projets :
- GitHub (portfolio)
- Twitter/X
- Dev.to
→ Feedback de la communauté = apprentissage accéléré
```

---

## 🎯 Certification (Optionnel)

### Projet de Certification

Pour valider vos compétences, créez une application qui démontre :

1. **Next.js 15** : Pages, API routes, layouts
2. **Prisma** : Modèle complexe avec relations
3. **IA** : Intégration d'au moins 2 fonctionnalités IA
4. **MCP** : Serveur fonctionnel
5. **Déploiement** : Application en ligne (VPS ou Vercel)
6. **Code Quality** : Tests, types, linting

**Critères d'évaluation :**
- Fonctionnalité (40%)
- Qualité du code (30%)
- Documentation (15%)
- Design (15%)

---

## 📞 Support et Aide

### Où Poser des Questions ?

1. **GitHub Issues** du projet v3zai (pour bugs spécifiques)
2. **Discord Next.js / Prisma** (pour questions techniques générales)
3. **Stack Overflow** (tag: next.js, prisma, etc.)

### Contribuer à la Formation

Ce programme de formation est open-source ! Vous pouvez :
- Proposer des améliorations (Pull Requests)
- Signaler des erreurs (Issues)
- Ajouter des exercices
- Traduire en d'autres langues

---

## 🗺️ Navigation Rapide

| Cours | Sujet | Durée | Difficulté |
|-------|-------|-------|------------|
| [Cours 1](./cours_01_architecture_globale.md) | Architecture Globale | 3-4h | ⭐⭐ |
| [Cours 2](./cours_02_nextjs_app_router.md) | Next.js App Router | 4-5h | ⭐⭐⭐ |
| [Cours 3](./cours_03_prisma_orm.md) | Prisma ORM | 5-6h | ⭐⭐⭐ |
| [Cours 4](./cours_04_serveur_mcp.md) | Serveur MCP | 4-5h | ⭐⭐⭐⭐ |
| [Cours 5](./cours_05_ia_locale.md) | IA Locale | 6-7h | ⭐⭐⭐⭐ |
| [Guide Référence](./guide_reference_rapide.md) | Antisèches | 1-2h | ⭐ |

**Légende difficulté :**
- ⭐ Facile (bases)
- ⭐⭐ Débutant (quelques concepts nouveaux)
- ⭐⭐⭐ Intermédiaire (requiert pratique)
- ⭐⭐⭐⭐ Avancé (concepts complexes)
- ⭐⭐⭐⭐⭐ Expert (architectures avancées)

---

## 🚀 Commencer Maintenant

Prêt à démarrer ? Voici vos prochaines étapes :

1. ✅ Installer l'environnement de développement
2. ✅ Cloner le projet v3zai
3. ✅ Lancer le serveur de développement
4. ✅ Ouvrir le [Cours 1](./cours_01_architecture_globale.md)

**Bon apprentissage ! 🎓**

---

## 📝 Changelog de la Formation

### Version 1.0 (13 février 2026)
- Création initiale du programme
- 5 cours complets
- 1 guide de référence
- Exercices pratiques intégrés

---

**Créé avec ❤️ pour la communauté des développeurs**

Si cette formation vous aide, n'hésitez pas à :
- ⭐ Star le repository
- 🐦 Partager sur les réseaux sociaux
- 💬 Donner votre feedback
