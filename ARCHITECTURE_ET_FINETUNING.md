# 📘 GUIDE COMPLET : ARCHITECTURE & AUTO-APPRENTISSAGE

## Tout sur une seule machine + Fine-tuning automatique

---

## 🏗️ PARTIE 1 : ARCHITECTURE (Tout sur la même machine)

### **OUI, tout fonctionne sur UN SEUL PC dans vos locaux**

```
┌──────────────────────────────────────────────────────────┐
│                  VOTRE PC (Dans votre bureau)            │
│                                                          │
│  ╔══════════════════════════════════════════════════╗  │
│  ║  COUCHE 1 : SITE WEB & API                       ║  │
│  ╠══════════════════════════════════════════════════╣  │
│  ║  • Node.js + Express (port 3000)                 ║  │
│  ║  • Dashboard marketeur                           ║  │
│  ║  • API REST pour visiteurs                       ║  │
│  ╚═══════════════════╦══════════════════════════════╝  │
│                      ↕                                   │
│  ╔═══════════════════╩══════════════════════════════╗  │
│  ║  COUCHE 2 : BASE DE DONNÉES                      ║  │
│  ╠══════════════════════════════════════════════════╣  │
│  ║  PostgreSQL (port 5432)                          ║  │
│  ║  • Produits (nom, prix, stock...)                ║  │
│  ║  • ADN de marque (ton, valeurs...)               ║  │
│  ║  • Logs visiteurs                                ║  │
│  ║  • Données d'apprentissage ⭐                    ║  │
│  ╚═══════════════════╦══════════════════════════════╝  │
│                      ↕                                   │
│  ╔═══════════════════╩══════════════════════════════╗  │
│  ║  COUCHE 3 : INTELLIGENCE ARTIFICIELLE            ║  │
│  ╠══════════════════════════════════════════════════╣  │
│  ║  Ollama + Llama 3.1 8B (port 11434)              ║  │
│  ║  • Utilise votre GPU RTX 3060                    ║  │
│  ║  • Génère du contenu personnalisé                ║  │
│  ║  • S'améliore avec vos données ⭐               ║  │
│  ╚══════════════════════════════════════════════════╝  │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ Internet via Box/Fibre
                        │
               ┌────────▼─────────┐
               │   🌍 INTERNET    │
               │                  │
               │  👤 Visiteurs    │
               │  🤖 Chatbots     │
               └──────────────────┘
```

---

## 💻 **CONFIGURATION MATÉRIELLE UNIQUE**

### **Un seul PC qui fait tout :**

```
┌─────────────────────────────────────────┐
│  COMPOSANT         │  SPÉCIFICATION     │
├─────────────────────────────────────────┤
│  Processeur        │  Ryzen 5 5600X     │
│                    │  (6 cores)         │
├─────────────────────────────────────────┤
│  RAM               │  32GB DDR4         │
├─────────────────────────────────────────┤
│  Carte Graphique   │  RTX 3060 12GB     │ ⭐ ESSENTIEL
│                    │  (pour l'IA)       │
├─────────────────────────────────────────┤
│  Disque Système    │  SSD 1TB NVMe      │
│                    │  (rapide)          │
├─────────────────────────────────────────┤
│  Disque Données    │  HDD 2TB           │
│                    │  (stockage)        │
├─────────────────────────────────────────┤
│  Alimentation      │  750W 80+ Gold     │
├─────────────────────────────────────────┤
│  Onduleur (UPS)    │  APC 700VA         │
│                    │  (protection)      │
└─────────────────────────────────────────┘

💰 TOTAL : ~1,500€
```

### **Connexion réseau :**

```
Internet Box (Fibre 300 Mbps)
        │
        ├─ Routeur WiFi 6
        │
        └─ Câble Ethernet → Votre PC
                            (connexion stable)
```

---

## 🔄 PARTIE 2 : AUTO-APPRENTISSAGE (Comment l'IA s'améliore)

### **PRINCIPE : L'IA apprend de VOS clients réels**

```
╔════════════════════════════════════════════════════════╗
║              CYCLE D'APPRENTISSAGE CONTINU             ║
╚════════════════════════════════════════════════════════╝

📅 JOUR 1-14 : COLLECTE DE DONNÉES
─────────────────────────────────────────────────────────

Visiteur 1 arrive
   ↓
IA détecte : "Persona = scientifique"
   ↓
IA génère : Page avec études cliniques + chiffres
   ↓
Visiteur clique sur "Voir preuves" → CLICK ✅
   ↓
Visiteur ajoute au panier → ADD_TO_CART ✅✅
   ↓
Visiteur achète 68€ → PURCHASE ✅✅✅
   ↓
[INTERACTION ENREGISTRÉE DANS LA BASE]

{
  profile: "scientific",
  query: "crème anti-rides efficace",
  aiResponse: "Notre Sérum Lumière a démontré dans une
               étude clinique sur 120 participants...",
  clicked: true,
  purchased: true,
  revenue: 68
}

Répéter ce processus pendant 2 semaines...

─────────────────────────────────────────────────────────
📊 JOUR 15 : ANALYSE AUTOMATIQUE
─────────────────────────────────────────────────────────

Le système analyse les logs :

Total visiteurs : 450
Conversions : 89 (19.8%)

Interactions réussies collectées : 89

Par persona :
• Scientific : 34 conversions (meilleur taux : 24%)
• Emotional : 28 conversions (taux : 18%)
• Practical : 27 conversions (taux : 16%)

Patterns découverts :
• Mot "étude clinique" → +15% conversion (scientific)
• Mot "naturel" → +12% conversion (emotional)
• Mot "livraison rapide" → +8% conversion (practical)

─────────────────────────────────────────────────────────
🧠 JOUR 16 : GÉNÉRATION DATASET
─────────────────────────────────────────────────────────

Création d'un fichier d'entraînement (dataset.jsonl) :

Ligne 1:
{"instruction":"Tu es ambassadeur LuxeÉthique","input":"crème anti-rides","output":"Notre Sérum Lumière a démontré..."}

Ligne 2:
{"instruction":"Tu es ambassadeur LuxeÉthique","input":"produit naturel visage","output":"Découvrez notre gamme certifiée bio..."}

... 89 lignes au total (89 exemples qui ont VRAIMENT converti)

─────────────────────────────────────────────────────────
🔥 JOUR 17-18 : FINE-TUNING (Pendant la nuit)
─────────────────────────────────────────────────────────

3h du matin : Le système lance automatiquement :

ollama create llama-luxeethique-v1 -f Modelfile

Le GPU travaille pendant 2-4 heures
• Charge le modèle Llama 3.1 de base
• Lit les 89 exemples
• Ajuste les "poids" du réseau de neurones
• Apprend VOS patterns spécifiques

Résultat : Un nouveau modèle "llama-luxeethique-v1"
           Personnalisé pour VOTRE marque

─────────────────────────────────────────────────────────
✅ JOUR 19 : DÉPLOIEMENT AUTOMATIQUE
─────────────────────────────────────────────────────────

Le système :
1. Teste le nouveau modèle sur 20 exemples
2. Compare avec l'ancien modèle
3. Calcule le taux d'amélioration

Ancien modèle : 19.8% conversion
Nouveau modèle : 22.4% conversion
Amélioration : +13% ✅

→ Déploiement automatique du nouveau modèle
→ Tous les visiteurs bénéficient maintenant du modèle amélioré

─────────────────────────────────────────────────────────
🔄 JOUR 20-34 : CYCLE CONTINUE
─────────────────────────────────────────────────────────

Le système continue de collecter...
Prochain fine-tuning : Jour 30 (si 100+ nouvelles conversions)

Modèle version 2 attendu dans 2 semaines
Amélioration cumulée projetée : +20-25%
```

---

## 📂 **OÙ SONT STOCKÉES VOS DONNÉES ?**

```
/home/semantic-platform/
│
├── data/
│   │
│   ├── logs/                      ← Logs des visiteurs
│   │   ├── 2025-02-01.log        (chaque jour = 1 fichier)
│   │   ├── 2025-02-02.log
│   │   └── 2025-02-03.log
│   │
│   ├── learning/                  ← Données d'apprentissage
│   │   ├── interactions.jsonl    (toutes les interactions)
│   │   ├── feedback.jsonl        (clics, achats, temps)
│   │   └── dataset.jsonl         (prêt pour fine-tuning)
│   │
│   └── models/                    ← Vos modèles IA
│       ├── llama-luxeethique-v1  (après 1er fine-tuning)
│       ├── llama-luxeethique-v2  (après 2ème fine-tuning)
│       └── llama-luxeethique-v3  (après 3ème fine-tuning)
│
└── backups/                       ← Sauvegardes automatiques
    └── backup-2025-02-03.tar.gz  (tous les soirs)
```

**IMPORTANT :**
- ✅ Tout reste SUR VOTRE PC
- ✅ Aucune donnée envoyée à l'extérieur
- ✅ 100% privé et confidentiel
- ✅ Conforme RGPD (données anonymisées)

---

## ⚙️ **PARAMÈTRES DE FINE-TUNING**

### **Fichier de configuration :**

```javascript
// backend/config/fine-tuning.json

{
  "enabled": true,                    // Activer/désactiver
  
  "schedule": {
    "interval": "weekly",             // weekly, biweekly, monthly
    "preferredTime": "03:00",         // 3h du matin (pc inactif)
    "preferredDay": "Sunday"          // Dimanche nuit
  },
  
  "triggers": {
    "minConversions": 100,            // Min 100 conversions
    "minImprovement": 5               // Déployer si +5% minimum
  },
  
  "quality": {
    "onlySuccessful": true,           // Garder seulement conversions
    "minConfidenceScore": 0.8,        // Score de confiance IA
    "excludeLowEngagement": true      // Exclure <10s temps page
  }
}
```

### **Modifier les paramètres :**

Via le dashboard web :

```
┌──────────────────────────────────────────────┐
│  ⚙️  CONFIGURATION FINE-TUNING              │
├──────────────────────────────────────────────┤
│  Auto-apprentissage : [✓] Activé            │
│                                              │
│  Fréquence :                                 │
│  ○ Hebdomadaire (dimanche 3h) ← sélectionné │
│  ○ Tous les 14 jours                         │
│  ○ Mensuel                                   │
│                                              │
│  Seuil de déclenchement :                    │
│  [100] conversions minimum                   │
│                                              │
│  Amélioration requise :                      │
│  [5]% minimum pour déployer                  │
│                                              │
│  [💾 Sauvegarder]  [🔄 Lancer maintenant]   │
└──────────────────────────────────────────────┘
```

---

## 📊 **SUIVI DE L'AMÉLIORATION**

### **Dashboard d'analytics :**

```
┌──────────────────────────────────────────────────────────┐
│  📈 ÉVOLUTION DE PERFORMANCE                             │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Modèle de base (Semaine 1)                             │
│  Taux de conversion : 12.3%                              │
│  ▓▓▓▓▓▓░░░░░░░░░░░░░░                                   │
│                                                          │
│  Modèle v1 (Semaine 3)                                  │
│  Taux de conversion : 15.8%  (+28% 🚀)                   │
│  ▓▓▓▓▓▓▓▓░░░░░░░░░░░░                                   │
│                                                          │
│  Modèle v2 (Semaine 6)                                  │
│  Taux de conversion : 19.2%  (+56% 🚀🚀)                 │
│  ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░                                   │
│                                                          │
│  Modèle v3 (Semaine 9)                                  │
│  Taux de conversion : 22.7%  (+85% 🚀🚀🚀)               │
│  ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░                                   │
│                                                          │
│  Prochain fine-tuning prévu : Dans 4 jours              │
│  Nouvelles conversions collectées : 87 / 100            │
└──────────────────────────────────────────────────────────┘
```

---

## 🔐 **SÉCURITÉ & RGPD**

### **Données collectées :**

```json
{
  "visitor": {
    "persona": "scientific",     // Déduit automatiquement
    "language": "fr",             // Langue navigateur
    "country": "FR",              // Pays (IP anonymisée)
    "device": "desktop"           // Type appareil
  },
  "interaction": {
    "query": "crème anti-rides",  // Requête
    "aiResponse": "...",          // Réponse IA
    "clicked": true,              // Action
    "purchased": false,           // Conversion
    "timeSpent": 45               // Secondes
  }
}
```

### **Données NON collectées :**

❌ Nom, prénom, email  
❌ Adresse IP complète (anonymisée)  
❌ Historique de navigation  
❌ Données bancaires  
❌ Informations personnelles identifiantes  

### **Conformité :**

✅ Article 6 RGPD : Intérêt légitime  
✅ Anonymisation automatique  
✅ Droit à l'oubli (script fourni)  
✅ Transparence (mentionné dans politique de confidentialité)  

---

## ❓ **QUESTIONS FRÉQUENTES**

### **Q : L'IA va-t-elle "oublier" ce qu'elle savait avant ?**

**R :** NON. Le fine-tuning **ajoute** des connaissances. L'IA garde tout ce qu'elle sait de base (langue française, culture générale, etc.) et ajoute une expertise spécifique à VOTRE marque.

---

### **Q : Combien de temps prend le fine-tuning ?**

**R :** Avec votre RTX 3060 12GB :
- 100 exemples : ~2-4 heures
- 500 exemples : ~4-6 heures
- 1,000 exemples : ~6-8 heures

C'est pour ça qu'on lance la nuit (3h du matin).

---

### **Q : Le site reste accessible pendant le fine-tuning ?**

**R :** OUI ! L'IA continue de fonctionner avec l'ancien modèle pendant qu'on entraîne le nouveau. Aucune interruption de service.

---

### **Q : Que se passe-t-il si le fine-tuning échoue ?**

**R :** Le système garde l'ancien modèle. Aucun risque. Le log indique l'erreur et réessaiera la prochaine fois.

---

### **Q : Puis-je annuler un fine-tuning ?**

**R :** OUI, deux façons :
1. Via le dashboard : Bouton "Revenir au modèle précédent"
2. Via terminal : `ollama cp llama-luxeethique-v1 llama-luxeethique-active`

---

### **Q : Combien ça coûte en électricité ?**

**R :** Fine-tuning pendant 4h avec RTX 3060 :
- Consommation : ~200W
- Coût : ~0.12€ (tarif EDF 0.15€/kWh)
- Par mois : ~0.50€ (fine-tuning hebdomadaire)

Négligeable !

---

### **Q : L'IA peut-elle apprendre de mauvaises choses ?**

**R :** NON, car on ne collecte QUE les interactions qui ont converti (achats réussis). L'IA apprend uniquement ce qui fonctionne bien.

---

## 🎯 **RÉSUMÉ EN 3 POINTS**

### **1️⃣ TOUT SUR UNE MACHINE**
- Un PC avec GPU dans vos locaux
- Site web + Base de données + IA locale
- Coût : ~1,500€ + 45€/mois

### **2️⃣ AUTO-APPRENTISSAGE AUTOMATIQUE**
- Collecte automatique des conversions
- Fine-tuning tous les 7 jours (ou 100 conversions)
- Amélioration continue +5% à +30% par itération

### **3️⃣ 100% PRIVÉ & GRATUIT**
- Vos données restent chez vous
- Pas d'abonnement IA (OpenAI, etc.)
- Conforme RGPD

---

## 🚀 **PROCHAINES ÉTAPES**

1. ✅ Acheter le matériel (1,500€)
2. ✅ Installer Ubuntu + Ollama (2h)
3. ✅ Déployer Semantic Platform (1h)
4. ✅ Importer vos produits (30 min)
5. ✅ Laisser tourner 2 semaines
6. ✅ Premier fine-tuning automatique
7. ✅ Profiter de l'amélioration ! 🎉

---

**Besoin d'aide ? support@semanticplatform.com** 📧
