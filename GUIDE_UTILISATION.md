# 📘 GUIDE D'UTILISATION - Pour Débutants

## Comment utiliser la Semantic Platform en 5 minutes

---

## 🎬 ÉTAPE 0 : DÉMARRER LE SERVEUR

### **Sur votre ordinateur :**

1. **Ouvrir un terminal / invite de commande**
   - Windows : Appuyez sur `Win + R`, tapez `cmd`, Entrée
   - Mac : Appuyez sur `Cmd + Espace`, tapez `Terminal`, Entrée

2. **Aller dans le dossier du projet**
   ```bash
   cd semantic-platform
   ```

3. **Installer les dépendances** (une seule fois)
   ```bash
   npm install
   ```

4. **Démarrer le serveur**
   ```bash
   npm start
   ```

   Vous verrez :
   ```
   ╔════════════════════════════════════════╗
   ║  🧬 SEMANTIC PLATFORM                  ║
   ║  Port : 3000                           ║
   ║  Status : ✅ Opérationnel             ║
   ╚════════════════════════════════════════╝
   ```

5. **Ouvrir le dashboard dans votre navigateur**
   - Allez sur : `http://localhost:3000/dashboard.html`

---

## 📋 ÉTAPE 1 : IMPORTER VOS PRODUITS

### **Ce que vous voyez :**

```
┌─────────────────────────────────────────────┐
│  1  Importez vos produits                   │
├─────────────────────────────────────────────┤
│                                             │
│     ┌─────────────────────────────────┐    │
│     │         📁                       │    │
│     │  Glissez votre fichier ici      │    │
│     │  ou cliquez pour sélectionner   │    │
│     └─────────────────────────────────┘    │
│                                             │
└─────────────────────────────────────────────┘
```

### **Ce que vous faites :**

1. **Préparez votre fichier**
   - CSV de votre boutique Shopify
   - Excel de votre inventaire
   - Export JSON de WooCommerce
   - N'importe quel format !

2. **Uploadez-le**
   - Cliquez dans la zone
   - Ou glissez-déposez votre fichier

3. **Attendez 10-30 secondes**
   - L'IA analyse automatiquement votre fichier
   - Détecte le format
   - Identifie les colonnes

4. **Résultat affiché :**
   ```
   ✅ Analyse terminée
   Format détecté : CSV
   Produits trouvés : 234
   Confiance : 95%
   
   [▶️ Transformer les données]
   ```

5. **Cliquez sur "Transformer les données"**
   - L'IA génère automatiquement :
     - Des descriptions enrichies
     - Des "pitchs IA" pour chaque produit
     - Des catégories pertinentes

---

## 🧬 ÉTAPE 2 : DÉFINIR VOTRE ADN DE MARQUE

### **Ce que vous voyez :**

```
┌─────────────────────────────────────────────┐
│  2  Définissez votre ADN de marque          │
├─────────────────────────────────────────────┤
│                                             │
│  📚 Besoin d'inspiration ?                  │
│  [🧴 Cosmétiques bio premium]              │
│  [👕 Mode streetwear]                      │
│  [💻 SaaS B2B]                             │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │ Notre marque s'appelle...            │   │
│  │                                      │   │
│  │ [Zone de texte libre]                │   │
│  │                                      │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  [🧬 Générer l'ADN automatiquement]        │
│                                             │
└─────────────────────────────────────────────┘
```

### **Ce que vous faites :**

1. **Option A : Utiliser un exemple**
   - Cliquez sur "🧴 Cosmétiques bio premium" (ou autre)
   - Le texte d'exemple se remplit automatiquement
   - Modifiez-le selon votre marque

2. **Option B : Écrire vous-même**
   - Écrivez simplement comment vous parlez de votre marque
   - Comme si vous l'expliquiez à un ami

**Exemple de ce que vous écrivez :**
```
Notre marque s'appelle BioJus.

On fait des jus de fruits frais pressés à froid.

NOTRE TON :
Simple, bon, sain. On complique pas.

NOS VALEURS :
Fraîcheur, transparence, local.

CE QU'ON ÉVITE DE DIRE :
"detox", "miracle", "superfood"

CE QU'ON PRÉFÈRE DIRE :
"frais", "naturel", "simple"

Nos fruits viennent d'un rayon de 50km.
Pressés le matin, livrés l'après-midi.
```

3. **Cliquez sur "🧬 Générer l'ADN automatiquement"**
   - L'IA lit votre texte
   - Génère un ADN structuré
   - Vous montre un aperçu

4. **Résultat affiché :**
   ```
   ✅ ADN généré avec succès
   Marque : BioJus
   Ton : Simple, Authentique, Direct
   Valeurs : Fraîcheur, Transparence, Local
   
   [💾 Sauvegarder l'ADN]
   ```

5. **Cliquez sur "💾 Sauvegarder"**

---

## 🧪 ÉTAPE 3 : TESTER AVANT DE PUBLIER

### **Ce que vous voyez :**

```
┌─────────────────────────────────────────────┐
│  3  Testez avant de publier                 │
├─────────────────────────────────────────────┤
│                                             │
│  [🔬 Simuler un visiteur "Scientifique"]   │
│  [❤️ Simuler un visiteur "Émotionnel"]    │
│  [⚡ Simuler un visiteur "Pratique"]       │
│                                             │
└─────────────────────────────────────────────┘
```

### **Ce que vous faites :**

1. **Choisissez un profil de visiteur**
   - **Scientifique** : Veut des données, des preuves, des chiffres
   - **Émotionnel** : Veut des valeurs, du ressenti, de l'humain
   - **Pratique** : Veut du concret, rapide, efficace

2. **Cliquez sur un bouton**
   - Exemple : "🔬 Simuler un visiteur Scientifique"

3. **Attendez 5-10 secondes**
   - L'IA génère une page adaptée

4. **Vous voyez la page générée**
   - Directement dans le dashboard
   - Adaptée au profil choisi
   - Respecte votre ADN de marque

**Exemple de différences :**

Pour un visiteur **Scientifique** :
```
┌────────────────────────────────────┐
│ BioJus - Innovation Nutritionnelle │
│                                    │
│ 95% de vitamines préservées        │
│ grâce au pressage à froid          │
│                                    │
│ [Voir les analyses nutritionnelles]│
└────────────────────────────────────┘
```

Pour un visiteur **Émotionnel** :
```
┌────────────────────────────────────┐
│ BioJus - Le goût du naturel        │
│                                    │
│ Chaque gorgée, c'est le verger     │
│ de votre enfance                   │
│                                    │
│ [Découvrir notre histoire]         │
└────────────────────────────────────┘
```

5. **Testez plusieurs profils**
   - Comparez les résultats
   - Vérifiez que ça vous plaît

---

## 🚀 ÉTAPE 4 : DÉPLOYER EN PRODUCTION

### **Ce que vous voyez :**

```
┌─────────────────────────────────────────────┐
│  4  Déployez en production                  │
├─────────────────────────────────────────────┤
│                                             │
│  ⚠️ Le déploiement est instantané          │
│     Vous pouvez revenir en arrière         │
│                                             │
│  [🚀 Déployer en production]               │
│                                             │
└─────────────────────────────────────────────┘
```

### **Ce que vous faites :**

1. **Cliquez sur "🚀 Déployer en production"**

2. **Confirmez**
   - Une fenêtre demande : "Êtes-vous sûr ?"
   - Cliquez "OK"

3. **Attendez 5 secondes**
   - Barre de progression : 0% → 100%
   
   ```
   [████████████████████] 100%
   ```

4. **C'est fait !**
   ```
   ✅ Déploiement réussi !
   ID : deploy_1738583400000
   Heure : 03/02/2025 à 15:30
   
   [⏪ Revenir en arrière]
   ```

5. **Si besoin de revenir en arrière**
   - Cliquez sur "⏪ Revenir en arrière"
   - Instantané

---

## 🎓 RÉSUMÉ : LES 4 ÉTAPES

```
1️⃣ IMPORTER
   📁 Glisser votre fichier
   ⏱️  30 secondes
   
2️⃣ ADN DE MARQUE  
   ✍️  Écrire en texte libre
   ⏱️  2-5 minutes
   
3️⃣ TESTER
   🧪 Simuler des visiteurs
   ⏱️  1 minute par test
   
4️⃣ DÉPLOYER
   🚀 Un clic
   ⏱️  5 secondes
```

**TEMPS TOTAL : 10-15 minutes** ⚡

---

## ❓ QUESTIONS FRÉQUENTES

### **Q : Le serveur doit-il toujours être allumé ?**
**R :** Oui, tant que vous voulez que votre site utilise la personnalisation IA. Mais une fois configuré, il tourne tout seul.

### **Q : Que se passe-t-il si je ferme le terminal ?**
**R :** Le serveur s'arrête. Pour le relancer : `npm start`

### **Q : Puis-je modifier l'ADN après déploiement ?**
**R :** Oui ! Refaites les étapes 2-4. L'ancien est sauvegardé automatiquement.

### **Q : Mes données sont-elles sécurisées ?**
**R :** Oui, tout est stocké sur votre serveur. Seules les requêtes à l'IA (OpenAI) sortent de votre infrastructure.

### **Q : Combien ça coûte en API OpenAI ?**
**R :** 
- Import 100 produits : ~0.50€
- Génération ADN : ~0.10€
- Test 10 simulations : ~0.20€
- **Total setup initial : ~1€**
- Ensuite : ~0.01€ par visiteur personnalisé

### **Q : Ça fonctionne avec quel type de site ?**
**R :** Tous ! WordPress, Shopify, site custom, etc. Il suffit d'intégrer le widget JavaScript (fourni).

### **Q : Je n'ai pas de compétences techniques, est-ce possible ?**
**R :** Oui ! Cette interface est conçue pour les marketeurs. Pas de code à écrire.

### **Q : Puis-je avoir de l'aide ?**
**R :** Oui !
- 📧 Email : support@semanticplatform.com
- 💬 Chat en direct dans le dashboard (bientôt)
- 📞 Tél : +33 1 XX XX XX XX

---

## 🎉 FÉLICITATIONS !

Vous savez maintenant utiliser la Semantic Platform comme un pro !

**Prochaines étapes recommandées :**
1. ✅ Testez avec vos vraies données
2. ✅ Partagez le lien de test à vos collègues
3. ✅ Analysez les résultats dans l'onglet Analytics (bientôt)
4. ✅ Déployez progressivement (A/B testing)

---

**Besoin d'aide ?** N'hésitez pas à nous contacter ! 💌

*Document mis à jour : Février 2025*
