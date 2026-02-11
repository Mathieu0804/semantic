# 🚀 PME AI Platform - Plateforme Web Intelligente pour PME/PMI

## Vue d'ensemble

Plateforme complète auto-hébergée permettant aux PME/PMI de créer, gérer et optimiser leur présence en ligne avec l'IA, tout en conservant la souveraineté de leurs données.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    INTERFACES WEB (React)                    │
├─────────────────────────────────────────────────────────────┤
│  1. Créateur de Site (Chat IA)                              │
│  2. Gestion Catalogue Produits/Services                      │
│  3. Identité Entreprise & SEO Manager                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│              BACKEND API (Node.js + Express)                │
├─────────────────────────────────────────────────────────────┤
│  • API REST complète                                         │
│  • Authentification JWT                                      │
│  • Upload fichiers & Images                                  │
│  • Générateur SEO/LD-JSON automatique                        │
└──────────┬────────────────────┬─────────────────────────────┘
           │                    │
┌──────────▼─────────┐   ┌─────▼──────────────────────────────┐
│   SERVEUR MCP      │   │     IA LOCALE (Ollama/LM Studio)   │
│ (IA-to-IA API)     │◄──┤  • Commercial virtuel               │
│  • Endpoints publics│   │  • Conseiller personnalisé         │
│  • Logs dialogues  │   │  • Générateur de contenu            │
└────────┬───────────┘   └─────┬──────────────────────────────┘
         │                     │
┌────────▼─────────────────────▼──────────────────────────────┐
│         BASE DE DONNÉES (PostgreSQL + Redis)                │
├─────────────────────────────────────────────────────────────┤
│  • Produits/Services  • Dialogues IA  • Analytics            │
│  • Identité entreprise  • Patterns  • SEO/LD-JSON           │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Composants du Système

### Frontend (React + Vite)
- **site-creator**: Interface de création de site avec chat IA
- **catalog-manager**: Gestion CRUD du catalogue
- **identity-manager**: Configuration identité & SEO
- **shared**: Composants réutilisables (ChatBot, etc.)

### Backend (Node.js)
- **api**: API REST principale
- **mcp-server**: Serveur MCP pour dialogues IA-to-IA
- **ai-connector**: Connexion à l'IA locale
- **analytics**: Analyse comportements & patterns

### Database
- **PostgreSQL**: Stockage relationnel
- **Redis**: Cache & sessions
- **Migrations**: Gestion versions schéma

## 🚀 Installation Rapide

### Prérequis
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Ollama ou LM Studio (IA locale)
- Docker & Docker Compose (optionnel)

### Installation avec Docker (Recommandé)

```bash
# Cloner et démarrer
git clone <repo>
cd pme-ai-platform
cp .env.example .env
# Éditer .env avec vos configurations
docker-compose up -d

# Le système sera accessible sur :
# - Frontend: http://localhost:3000
# - API Backend: http://localhost:5000
# - MCP Server: http://localhost:5001
```

### Installation Manuelle

```bash
# 1. Base de données
createdb pme_ai_platform
psql pme_ai_platform < database/schemas/init.sql

# 2. Backend
cd backend/api
npm install
npm run migrate
npm run dev

# 3. MCP Server
cd ../mcp-server
npm install
npm run dev

# 4. Frontend
cd ../../frontend/site-creator
npm install
npm run dev

# Répéter pour catalog-manager et identity-manager
```

## 📚 Documentation des Agents

### Agent 1 - Créateur de Site Web
Interface conversationnelle permettant de créer un site complet :
- Chat avec IA locale pour définir besoins
- Sélection templates responsive
- Personnalisation couleurs, polices, contenus
- Upload images optimisées automatiquement
- Génération code HTML/CSS/JS
- Déploiement en un clic

### Agent 2 - Gestionnaire de Catalogue
CRUD complet pour produits/services :
- Import CSV, Excel, JSON
- Ajout/Modification/Suppression en masse
- Gestion images produits
- Catégorisation automatique par IA
- Export multi-formats
- Synchronisation BDD locale

### Agent 3 - Manager Identité & SEO
Configuration identité entreprise et référencement :
- Chat IA pour définir identité de marque
- Génération mots-clés SEO automatique
- Création LD-JSON (Schema.org)
- Configuration IA locale (tone, style)
- Meta descriptions optimisées
- Suggestions amélioration continue

### Agent 4 - Serveur MCP (IA-to-IA)
API publique pour dialogues IA externes :
- Endpoints standardisés MCP
- Commercial virtuel 24/7
- Représentant entreprise personnalisé
- Logs de toutes conversations
- Analytics interactions IA

### Agent 5 - Analytics & Patterns
Analyse comportements et optimisation :
- Tracking visiteurs (RGPD compliant)
- Analyse parcours utilisateur
- Détection patterns comportementaux
- Suggestions amélioration produits
- Optimisation SEO basée sur data
- Amélioration continue IA

## 🔧 Technologies Utilisées

**Frontend**
- React 18 + Vite
- TailwindCSS
- React Router
- Axios
- Chart.js (analytics)

**Backend**
- Node.js 20 + Express
- TypeScript
- Prisma ORM
- JWT Authentication
- Multer (upload fichiers)

**IA & MCP**
- Ollama (LLaMA 3, Mistral)
- LangChain
- MCP Protocol
- Redis (cache prompts)

**Base de Données**
- PostgreSQL 16
- Redis 7
- Prisma Migrations

**Infrastructure**
- Docker & Docker Compose
- Nginx (reverse proxy)
- PM2 (process manager)
- Matomo (analytics auto-hébergé)

## 🔐 Sécurité & Souveraineté

✅ **Données 100% locales** - Aucune donnée envoyée à des tiers  
✅ **IA auto-hébergée** - Modèles tournant sur vos serveurs  
✅ **RGPD compliant** - Contrôle total des données utilisateurs  
✅ **Chiffrement** - Communications SSL/TLS  
✅ **Backups automatiques** - Sauvegardes journalières  
✅ **Authentification sécurisée** - JWT + refresh tokens  

## 📈 Roadmap

- [x] Phase 1: Architecture & Infrastructure
- [x] Phase 2: Interfaces Frontend
- [x] Phase 3: Backend API
- [x] Phase 4: Serveur MCP
- [ ] Phase 5: Analytics & Patterns (en cours)
- [ ] Phase 6: Tests utilisateurs PME
- [ ] Phase 7: Documentation complète
- [ ] Phase 8: Marketplace templates

## 🤝 Support

Pour toute question ou assistance :
- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@pme-ai-platform.local

## 📄 Licence

Propriétaire - Usage commercial réservé aux PME/PMI clientes

---

**Développé avec ❤️ pour les PME/PMI françaises souhaitant leur souveraineté numérique**
