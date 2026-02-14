# Guide Ultra-Simple pour Débutants
# Déploiement de la Plateforme IA PME

## Vous avez déjà mis les fichiers sur GitHub ? Parfait !
## Passons à la suite étape par étape.

---

# PARTIE 1 : METTRE VOTRE SITE EN LIGNE

## Option la PLUS SIMPLE : Utiliser Render.com (GRATUIT pour commencer)

Render est comme un hébergeur qui va récupérer vos fichiers sur GitHub et les mettre en ligne automatiquement.

### Étape 1 : Créer un compte sur Render

1. Ouvrez votre navigateur (Chrome, Firefox, etc.)
2. Allez sur : **https://render.com**
3. Cliquez sur le bouton **"Get Started"** (en haut à droite)
4. Cliquez sur **"Sign up with GitHub"** (pour utiliser votre compte GitHub)
5. Autorisez Render à accéder à votre compte GitHub

### Étape 2 : Créer votre site

1. Une fois connecté, vous verrez un tableau de bord
2. Cliquez sur le bouton **"New +"** (en haut à droite)
3. Sélectionnez **"Web Service"** dans le menu

### Étape 3 : Connecter votre projet GitHub

1. Vous verrez une liste de vos projets GitHub
2. Cliquez sur **"Connect"** à côté de votre projet "plateforme-ia-pme"

### Étape 4 : Configurer (quelques cases à remplir)

```
┌─────────────────────────────────────────────────────────────┐
│  Name: plateforme-ia-pme                                    │
│  (c'est le nom de votre site, vous pouvez changer)          │
├─────────────────────────────────────────────────────────────┤
│  Region: Oregon (US West) ou Frankfurt (EU Central)         │
│  (choisissez le plus proche de vous)                        │
├─────────────────────────────────────────────────────────────┤
│  Branch: main                                               │
│  (laissez comme c'est)                                      │
├─────────────────────────────────────────────────────────────┤
│  Runtime: Node                                              │
│  (normalement détecté automatiquement)                      │
├─────────────────────────────────────────────────────────────┤
│  Build Command: bun install && bun run db:push              │
│  (copiez-collez exactement ceci)                            │
├─────────────────────────────────────────────────────────────┤
│  Start Command: bun run start                               │
│  (copiez-collez exactement ceci)                            │
├─────────────────────────────────────────────────────────────┤
│  Instance Type: Free                                        │
│  (c'est gratuit !)                                          │
└─────────────────────────────────────────────────────────────┘
```

### Étape 5 : Ajouter les variables d'environnement

Juste en bas de la page, vous verrez une section **"Environment Variables"**.
Cliquez sur **"Add Environment Variable"** et ajoutez ces 3 lignes :

```
Variable 1:
  Key: DATABASE_URL
  Value: file:./db/production.db

Variable 2:
  Key: NODE_ENV
  Value: production

Variable 3:
  Key: NEXTAUTH_SECRET
  Value: (cliquez sur "Generate" pour créer une clé automatiquement)
```

### Étape 6 : Lancer le déploiement

1. Cliquez sur le bouton **"Deploy Web Service"** (en bas de page)
2. Patientez... (cela prend 3-5 minutes la première fois)
3. Vous verrez des lignes défiler, c'est normal !

### Étape 7 : Votre site est en ligne !

1. Quand vous voyez **"Deploy successful"** en vert, c'est gagné !
2. En haut de la page, vous verrez une URL comme :
   **https://plateforme-ia-pme-xxxx.onrender.com**
3. Cliquez dessus : votre site s'ouvre !

---

# PARTIE 2 : CONFIGURER LE SERVEUR MCP

## C'est quoi le MCP ? (Explication simple)

Le MCP permet à d'autres IA (comme Siri, Alexa, ou l'IA de vos clients) de parler automatiquement avec l'IA de votre entreprise.

## Étape 1 : Ouvrir votre site

1. Allez sur l'URL de votre site (trouvée à l'étape précédente)
2. Vous voyez une interface avec un menu à gauche

## Étape 2 : Configurer votre entreprise

1. Dans le menu à gauche, cliquez sur **"Identité & SEO"**
2. Remplissez les informations de votre entreprise :
   - **Nom de l'entreprise** : Votre nom
   - **Description** : Ce que vous faites
   - **Email, téléphone, adresse** : Vos coordonnées
3. Cliquez sur **"Enregistrer"** (en haut à droite)

## Étape 3 : Configurer l'IA

Toujours dans "Identité & SEO" :

1. Cliquez sur l'onglet **"IA"** (en haut, à côté de "Identité", "Contact", "SEO")
2. Remplissez :
   - **Ton de l'IA** : Choisissez "Professionnel" ou "Amical"
   - **Personnalité** : Écrivez comment l'IA doit se comporter
     *Exemple : "Tu es l'assistant de Ma Boutique. Tu aides les clients à trouver nos produits."*
   - **Domaines d'expertise** : Ce que vous vendez
     *Exemple : "Vente de vêtements, Conseils mode, Tailles"*
3. Cliquez sur **"Enregistrer"**

## Étape 4 : Activer le serveur MCP

1. Dans le menu à gauche, cliquez sur **"Serveur MCP"**
2. Vous voyez un toggle (interrupteur) **"Activer le serveur MCP"**
3. Cliquez dessus pour le mettre sur **ON** (position droite)
4. Dans le champ **"URL du serveur MCP"**, entrez votre URL suivie de /api/mcp
   *Exemple : https://plateforme-ia-pme-xxxx.onrender.com/api/mcp*
5. Cliquez sur **"OK"** à côté du champ
6. Le statut doit passer à **"Actif"** avec un point vert

## Étape 5 : Vérifier que ça fonctionne

Toujours dans "Serveur MCP" :

1. Regardez les statistiques :
   - **Statut** : Actif (point vert)
   - **Connexions actives** : 0 (pour l'instant)
2. Votre serveur MCP est prêt à recevoir des connexions !

---

# PARTIE 3 : AJOUTER DES PRODUITS

## Étape 1 : Aller dans le catalogue

1. Dans le menu à gauche, cliquez sur **"Catalogue"**

## Étape 2 : Ajouter un produit

1. Cliquez sur le bouton **"Ajouter"** (en haut à droite)
2. Une fenêtre s'ouvre avec un formulaire
3. Remplissez :
   - **Nom** : Nom de votre produit
   - **Description** : Décrivez-le
   - **Prix** : Le prix en euros
   - **Catégorie** : Sa catégorie
   - **Stock** : Combien vous en avez
4. Cliquez sur **"Enregistrer"**

## Étape 3 : Répéter pour tous vos produits

Ajoutez tous vos produits de la même manière.

---

# PARTIE 4 : GÉNÉRER VOTRE SITE WEB

## Étape 1 : Utiliser le chatbot

1. Dans le menu à gauche, cliquez sur **"Créateur de Site"**
2. Vous voyez une fenêtre de chat comme une messagerie
3. Tapez dans le champ en bas : *"Je veux créer un site pour ma boutique..."*
4. Appuyez sur Entrée ou cliquez sur le bouton d'envoi

## Étape 2 : Répondre aux questions

L'IA va vous poser des questions. Répondez naturellement comme si vous parliez à quelqu'un.

## Étape 3 : Générer le site

1. Cliquez sur le bouton **"Config"** en haut à droite
2. Remplissez :
   - **Nom du site** : Votre nom
   - **Thème** : Choisissez (Moderne, Classique, etc.)
   - **Couleurs** : Cliquez sur les carrés colorés pour choisir
   - **Description** : Ce que vous voulez
3. Cliquez sur **"Générer le site"**
4. Patientez... l'IA crée votre site !

---

# PARTIE 5 : VOS INFORMATIONS IMPORTANTES

## À noter quelque part :

```
Mon URL : https://plateforme-ia-pme-xxxx.onrender.com
Mon URL MCP : https://plateforme-ia-pme-xxxx.onrender.com/api/mcp

Mes identifiants Render : 
  - Email : _______________
  - Mot de passe : _______________
```

---

# PROBLÈMES COURANTS

## "Mon site ne s'affiche pas"
→ Attendez 5 minutes après le déploiement
→ Rafraîchissez la page (F5)

## "Erreur 500"
→ Vérifiez que vous avez bien ajouté les variables d'environnement
→ Dans Render, allez dans "Environment" et vérifiez les 3 variables

## "Je ne trouve pas mon URL"
→ Dans Render, votre URL est en haut de la page de votre service
→ Elle ressemble à : https://plateforme-ia-pme-xxxx.onrender.com

## "Le serveur MCP ne s'active pas"
→ Vérifiez que vous avez bien cliqué sur "OK" après avoir entré l'URL
→ L'URL doit finir par /api/mcp

---

# BESOIN D'AIDE ?

Si vous êtes bloqué :
1. Faites une capture d'écran de l'erreur
2. Notez exactement ce que vous faisiez
3. Demandez de l'aide avec ces informations

---

# RÉSUMÉ EN 5 POINTS

1. ✅ Créer un compte sur **render.com**
2. ✅ Connecter votre projet GitHub
3. ✅ Configurer et déployer
4. ✅ Configurer votre entreprise dans l'interface
5. ✅ Activer le serveur MCP

Votre site est en ligne ! 🎉
