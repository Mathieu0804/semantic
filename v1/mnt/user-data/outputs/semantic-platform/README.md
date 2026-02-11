# 🧬 SEMANTIC PLATFORM

## Plateforme de Marketing Sémantique Intelligente

**Version 2.0** - Approche bi-phasée : Personnalisation IA → Commerce M2M

---

## 🎯 VISION

Transformer votre site web en interface intelligente qui s'adapte à chaque visiteur, puis permettre aux agents IA (ChatGPT, Claude, Gemini) de recommander vos produits avec VOTRE voix.

### **Phase 1 : Personnalisation IA Embarquée** (Maintenant)
Votre site s'adapte automatiquement à chaque visiteur selon son profil, sa culture, son comportement - tout en respectant votre ADN de marque.

### **Phase 2 : Commerce Machine-to-Machine** (2027+)
Les agents IA accèdent directement à votre catalogue certifié et recommandent vos produits avec votre ton, vos valeurs, vos arguments.

---

## ✨ FONCTIONNALITÉS

### **1. Import de Données Ultra-Flexible**
```
✅ CSV, Excel, JSON, XML, SQL...
✅ N'importe quel format
✅ IA détecte automatiquement la structure
✅ Transformation intelligente vers format SemanticDNA
✅ Génération automatique de "pitchs IA" pour chaque produit
```

### **2. Gestion ADN de Marque (Prompt Libre)**
```
✅ Le marketeur écrit en texte libre
✅ L'IA génère l'ADN structuré
✅ Validation automatique de cohérence
✅ Garde-fous (cadre semi-rigide)
✅ Versioning & rollback
```

### **3. Environnement de Test Complet**
```
✅ Sessions de test isolées
✅ Simulation de visiteurs (personas)
✅ Simulation de chatbots (Phase 2)
✅ Métriques en temps réel
✅ Comparaison A/B
```

### **4. Déploiement Sécurisé**
```
✅ Vérifications pre-flight
✅ Déploiement zero-downtime
✅ Rollback instantané
✅ Backup automatique
✅ Historique des déploiements
```

---

## 🚀 INSTALLATION

### **Prérequis**
- Node.js 16+
- PostgreSQL 14+ (optionnel, peut utiliser JSON files)
- Compte OpenAI (clé API)

### **Installation rapide**
```bash
# Cloner le repo
git clone https://github.com/votre-org/semantic-platform
cd semantic-platform

# Installer les dépendances
npm install

# Configuration
cp .env.example .env
# Éditer .env avec votre clé OpenAI

# Démarrer
npm start
```

Le serveur démarre sur `http://localhost:3000`

---

## 📖 UTILISATION

### **1. Importer vos produits**

```bash
# Via API
curl -X POST http://localhost:3000/api/import/analyze \
  -F "file=@mon_catalogue.csv"

# Réponse :
{
  "success": true,
  "analysis": {
    "format": "csv",
    "estimatedProducts": 1234,
    "preview": [...]
  }
}
```

### **2. Définir votre ADN de marque**

```bash
# Via API avec prompt libre
curl -X POST http://localhost:3000/api/brand-dna/update \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Notre marque s'appelle LuxeÉthique. Nous vendons des cosmétiques bio premium. Notre ton est élégant mais accessible..."
  }'

# L'IA génère automatiquement l'ADN structuré
```

### **3. Tester avant déploiement**

```bash
# Créer une session de test
curl -X POST http://localhost:3000/api/test/create-session \
  -H "Content-Type: application/json" \
  -d '{"description": "Test nouveau ADN"}'

# Simuler un visiteur
curl -X POST http://localhost:3000/api/test/simulate-visitor \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "xxx",
    "visitorProfile": {
      "persona": "scientific",
      "language": "fr",
      "device": "mobile"
    }
  }'
```

### **4. Déployer en production**

```bash
curl -X POST http://localhost:3000/api/deploy/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sourceSessionId": "xxx",
    "rollbackOnError": true
  }'
```

---

## 📊 ARCHITECTURE

```
┌────────────────────────────────────────────┐
│           CLIENT (Navigateur)              │
│  ou Agent IA (ChatGPT, Claude...)         │
└────────────────┬───────────────────────────┘
                 │
                 ▼
┌────────────────────────────────────────────┐
│        API GATEWAY (Express)               │
│  • Authentication                          │
│  • Rate Limiting                           │
│  • CORS                                    │
└────────────────┬───────────────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌─────────┐ ┌─────────┐ ┌─────────┐
│ Data    │ │ Brand   │ │ Test    │
│ Importer│ │ DNA     │ │ Env     │
└─────────┘ └─────────┘ └─────────┘
    │            │            │
    └────────────┼────────────┘
                 ▼
┌────────────────────────────────────────────┐
│         OpenAI GPT-4 (IA)                  │
│  • Analyse données                         │
│  • Génère ADN structuré                    │
│  • Adapte contenu                          │
└────────────────────────────────────────────┘
```

---

## 📁 STRUCTURE DU PROJET

```
semantic-platform/
├── backend/
│   ├── server.js                 # Serveur principal
│   ├── modules/
│   │   ├── data-importer.js      # Import IA multi-format
│   │   ├── brand-dna-manager.js  # Gestion ADN
│   │   ├── test-environment.js   # Environnement de test
│   │   └── deployment-manager.js # Déploiements
│   └── data/                     # Données persistées
│       ├── imports/
│       ├── brand-dna/
│       └── deployments/
├── frontend/                     # Dashboard web (TODO)
├── docs/
│   ├── GUIDE_INTEGRATION.md      # Matériel & coûts
│   └── EXEMPLES_PROMPTS.md       # Exemples pour marketeurs
├── package.json
└── README.md
```

---

## 🔑 VARIABLES D'ENVIRONNEMENT

```env
# Serveur
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-xxx

# Base de données (optionnel)
DATABASE_URL=postgresql://user:pass@localhost:5432/semantic

# URLs
BASE_URL=http://localhost:3000
```

---

## 🧪 TESTS

```bash
# Tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Coverage
npm run test:coverage
```

---

## 📈 ROADMAP

### **Q1 2025 : MVP Phase 1** ✅ (Actuel)
- ✅ Import IA multi-format
- ✅ Génération ADN depuis prompt
- ✅ Environnement de test
- ✅ Déploiement sécurisé

### **Q2 2025 : Dashboard Web**
- [ ] Interface web pour marketeurs
- [ ] Upload drag & drop
- [ ] Éditeur ADN visuel
- [ ] Analytics dashboard

### **Q3 2025 : Personnalisation Avancée**
- [ ] ML : détection automatique personas
- [ ] A/B testing multi-variantes
- [ ] Optimisation continue
- [ ] Widget JavaScript léger

### **Q4 2025 : Phase 2 Préparation**
- [ ] API publique M2M
- [ ] Certification cryptographique
- [ ] SDKs pour agents IA
- [ ] Documentation API

### **2026 : Commerce M2M**
- [ ] Intégration ChatGPT, Claude, Gemini
- [ ] Payment rails
- [ ] Marketplace d'agents
- [ ] Standard industriel

---

## 🤝 CONTRIBUTION

Les contributions sont bienvenues ! Voir [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📄 LICENCE

Propriétaire - Tous droits réservés

Contact : contact@semanticplatform.com

---

## 📞 SUPPORT

- 📧 Email : support@semanticplatform.com
- 💬 Discord : https://discord.gg/semanticplatform
- 📚 Docs : https://docs.semanticplatform.com
- 🐛 Issues : https://github.com/votre-org/semantic-platform/issues

---

## 🙏 REMERCIEMENTS

- OpenAI pour l'API GPT-4
- Anthropic pour Claude (utilisé dans les tests)
- La communauté open-source

---

**Made with ❤️ for marketers who want to control their brand in the AI era**
