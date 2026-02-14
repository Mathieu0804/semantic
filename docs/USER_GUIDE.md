# 📖 GUIDE UTILISATEUR - AI Builder

## Comment Modifier Votre Application par Dialogue

---

## 🎯 Qu'est-ce que l'AI Builder ?

Une fonctionnalité révolutionnaire qui vous permet de **modifier votre application en parlant naturellement** à une IA.

**Plus besoin de coder !** Décrivez ce que vous voulez, l'IA génère le code, vous validez.

---

## ⚡ Démarrage Rapide (2 minutes)

### 1. Accéder au Builder

Sur votre application, cliquer sur la carte **"🤖 AI Builder"**

OU aller directement sur : `/builder`

---

### 2. Décrire Votre Demande

**Dans la zone de texte**, tapez ce que vous voulez modifier.

**Exemples simples :**
```
"Ajoute un bouton rouge sur la page d'accueil"
"Change la couleur du header en vert"
"Crée une nouvelle page contact"
```

---

### 3. Cliquer sur "Générer le Code"

L'IA analyse votre demande et génère le code correspondant.

**⏱️ Patience :** Cela prend 5-10 secondes.

---

### 4. Prévisualiser

Le code généré s'affiche à droite avec :
- ✅ Explication de ce qui sera fait
- 📁 Fichier concerné
- 💻 Code complet

**Vérifiez** que c'est bien ce que vous vouliez.

---

### 5. Appliquer ou Annuler

**Deux choix :**

**✅ Appliquer** → La modification est sauvegardée et appliquée

**❌ Annuler** → Rien n'est modifié, vous pouvez recommencer

---

## 💡 Ce Que Vous Pouvez Faire

### 🎨 Interface

| Demande | Ce que ça fait |
|---------|----------------|
| "Ajoute un bouton bleu" | Crée un bouton avec le style demandé |
| "Change la couleur du header en vert" | Modifie les styles CSS |
| "Rends le footer sticky" | Ajoute les classes CSS appropriées |
| "Ajoute un logo en haut à gauche" | Insère une image |

---

### 📄 Pages

| Demande | Ce que ça fait |
|---------|----------------|
| "Crée une page contact" | Génère `/contact` avec un formulaire |
| "Ajoute une page FAQ" | Crée `/faq` avec structure Q&R |
| "Crée une page témoignages" | Génère `/temoignages` avec cards |

---

### 📝 Formulaires

| Demande | Ce que ça fait |
|---------|----------------|
| "Ajoute un champ email" | Insère un input email dans le formulaire |
| "Rends le téléphone obligatoire" | Ajoute la validation `required` |
| "Ajoute une case à cocher CGV" | Crée une checkbox |

---

### 🔧 Fonctionnalités

| Demande | Ce que ça fait |
|---------|----------------|
| "Ajoute un compteur de visiteurs" | Crée un composant compteur |
| "Ajoute un système de notation 5 étoiles" | Génère composant rating |
| "Crée un carrousel d'images" | Composant slider |

---

## 📋 Bonnes Pratiques

### ✅ Demandes Claires

**BON :** "Ajoute un bouton rouge 'Contactez-nous' en haut de la page d'accueil"

**MAUVAIS :** "Fais un truc rouge"

---

### ✅ Une Modification à la Fois

**BON :** 
1. "Ajoute un bouton"
2. Attendre le résultat
3. "Change la couleur en bleu"

**MAUVAIS :** "Ajoute un bouton, change le header, crée une page, modifie le footer"

---

### ✅ Vérifier Avant d'Appliquer

**Toujours** lire le code généré et vérifier que :
- ✅ C'est bien ce que vous vouliez
- ✅ Le fichier modifié est le bon
- ✅ Le code semble correct

---

### ✅ Tester Après Application

Après avoir cliqué "Appliquer" :
1. Rafraîchir la page concernée
2. Vérifier que ça fonctionne
3. Si problème : utilisez l'historique pour rollback

---

## 🎓 Exemples Concrets

### Exemple 1 : Ajouter un Bouton

**Vous tapez :**
```
Ajoute un bouton rouge "Nos Services" sur la page d'accueil
```

**L'IA génère :**
```typescript
<Button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3">
  Nos Services
</Button>
```

**Fichier :** `src/app/page.tsx`

**Vous cliquez :** ✅ Appliquer

**Résultat :** Le bouton apparaît sur votre page d'accueil !

---

### Exemple 2 : Créer une Page

**Vous tapez :**
```
Crée une page "À Propos" avec notre histoire
```

**L'IA génère :**
- Fichier : `src/app/a-propos/page.tsx`
- Contenu : Structure complète avec header, contenu, footer
- Navigation : Lien ajouté automatiquement

**Vous cliquez :** ✅ Appliquer

**Résultat :** Nouvelle page accessible sur `/a-propos` !

---

### Exemple 3 : Modifier un Formulaire

**Vous tapez :**
```
Ajoute un champ "Site web" au formulaire entreprise
```

**L'IA génère :**
- Ajout dans `formData`
- Nouvel input avec validation URL
- Mise à jour de la sauvegarde

**Vous cliquez :** ✅ Appliquer

**Résultat :** Champ "Site web" dans le formulaire !

---

## 📜 Historique

**En bas à gauche**, vous voyez l'historique de vos modifications.

**Utilité :**
- Voir ce qui a été fait
- Se rappeler des modifications précédentes
- Déboguer si problème

---

## ⚠️ Limitations

### Ce que l'IA PEUT faire :

✅ Ajouter des éléments UI (boutons, inputs, cards)  
✅ Modifier des styles (couleurs, tailles, positions)  
✅ Créer des pages simples  
✅ Modifier des formulaires  
✅ Ajouter des composants basiques  

### Ce que l'IA NE PEUT PAS (encore) faire :

❌ Logique métier complexe  
❌ Intégrations tierces compliquées  
❌ Refactoring massif  
❌ Optimisations performance  
❌ Sécurité avancée  

---

## 🐛 Que Faire Si...

### Le code ne génère pas ?

**Solutions :**
1. Vérifier votre connexion Internet
2. Reformuler plus clairement
3. Simplifier la demande
4. Vérifier que Gemini API est configurée

---

### Le code généré est incorrect ?

**Solutions :**
1. Cliquer "Annuler"
2. Reformuler différemment
3. Être plus précis dans la demande
4. Vérifier l'historique pour des exemples qui ont marché

---

### La modification ne s'applique pas ?

**Causes possibles :**
- Erreur de syntaxe dans le code généré
- Fichier protégé
- Conflit avec code existant

**Solutions :**
1. Regarder les logs (Console navigateur)
2. Vérifier l'historique des actions en BDD
3. Annuler et recommencer

---

### Je veux annuler une modification ?

**Malheureusement, pas de rollback UI pour l'instant.**

**Workaround :**
- Demander à l'IA de "remettre comme avant"
- Ou demander l'inverse de ce qui a été fait

**Exemple :**
- Avant : "Ajoute un bouton rouge"
- Rollback : "Supprime le bouton rouge"

---

## 🎯 Conseils Pro

### 1. Commencez Simple

Testez d'abord avec des demandes basiques :
- Ajouter un bouton
- Changer une couleur
- Modifier un texte

**Une fois à l'aise**, essayez des trucs plus complexes.

---

### 2. Soyez Précis

Au lieu de :
> "Modifie la page"

Dites :
> "Ajoute un titre h2 'Bienvenue' en haut de la page d'accueil"

---

### 3. Découpez les Tâches

Au lieu de :
> "Crée une page contact avec formulaire, carte Google Maps et horaires d'ouverture"

Faites en 3 étapes :
1. "Crée une page contact"
2. "Ajoute un formulaire de contact"
3. "Ajoute une section horaires"

---

### 4. Vérifiez Toujours

**Avant de cliquer "Appliquer" :**
- Lisez le code (même rapidement)
- Vérifiez le nom du fichier
- Assurez-vous que c'est cohérent

---

## 🎉 Amusez-vous !

L'AI Builder est un **outil puissant** qui vous donne un **super-pouvoir** : modifier votre application sans coder.

**Expérimentez, testez, créez !**

---

## 📞 Besoin d'Aide ?

**Questions fréquentes :**
- Consultez `IMPLEMENTATION.md` (technique)
- Consultez `EXAMPLES.md` (exemples détaillés)

**Support :**
- Vérifier les logs d'erreur
- Tester avec des demandes simples d'abord
- Reformuler si ça ne marche pas

---

**Bon build ! 🚀**
