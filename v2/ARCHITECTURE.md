# 🏗️ PME AI Platform - Architecture Détaillée

## Vue d'ensemble du système agentique

Cette plateforme repose sur une architecture multi-agents où chaque composant travaille de manière autonome et collaborative pour offrir une solution complète aux PME/PMI.

## 🤖 Architecture Agentique

### Agent 1 : Site Creator (Créateur de Site)
**Rôle** : Interface conversationnelle pour créer des sites web
**Technologies** : React, WebSocket, TailwindCSS
**Fonctionnalités** :
- Chat IA en temps réel
- Sélection de templates responsive
- Personnalisation visuelle (couleurs, polices)
- Génération automatique de code HTML/CSS/JS
- Prévisualisation en temps réel

**Communication avec autres agents** :
- → Backend API : Sauvegarde des configurations
- → IA Locale : Génération de contenu et suggestions
- → Base de données : Stockage des conversations

### Agent 2 : Catalog Manager (Gestionnaire de Catalogue)
**Rôle** : CRUD complet pour produits et services
**Technologies** : React, Axios, CSV Parser
**Fonctionnalités** :
- Import/Export CSV, Excel, JSON
- Gestion en masse (ajout, modification, suppression)
- Recherche et filtres avancés
- Upload d'images optimisées
- Catégorisation automatique

**Communication avec autres agents** :
- → Backend API : CRUD produits
- → Base de données : Stockage catalogue
- → IA Locale : Génération descriptions SEO

### Agent 3 : Identity Manager (Gestionnaire d'Identité)
**Rôle** : Définition de l'identité de marque et SEO
**Technologies** : React, JSON-LD Generator
**Fonctionnalités** :
- Configuration identité entreprise
- Génération mots-clés SEO automatique
- Création LD-JSON (Schema.org)
- Configuration IA locale (tone, personnalité)
- Analyse concurrentielle

**Communication avec autres agents** :
- → Backend API : Sauvegarde identité
- → IA Locale : Analyse et suggestions
- → MCP Server : Configuration représentant virtuel
- → Base de données : Stockage configuration

### Agent 4 : MCP Server (Serveur IA-to-IA)
**Rôle** : Point d'entrée pour dialogues IA externes
**Technologies** : Node.js, Express, Redis (cache)
**Fonctionnalités** :
- API publique standardisée MCP
- Commercial virtuel 24/7
- Représentant entreprise personnalisé
- Logs de toutes interactions
- Analytics conversations IA

**Communication avec autres agents** :
- → IA Locale : Traitement requêtes
- → Base de données : Logs conversations
- → Analytics : Envoi métriques
- → Backend API : Récupération infos produits

### Agent 5 : Analytics Engine (Moteur d'Analyse)
**Rôle** : Analyse comportements et patterns
**Technologies** : Node.js, Python (ML), PostgreSQL
**Fonctionnalités** :
- Tracking visiteurs (RGPD compliant)
- Analyse parcours utilisateur
- Détection patterns comportementaux
- Génération suggestions amélioration
- Dashboards visualisation

**Communication avec autres agents** :
- → Base de données : Lecture/écriture analytics
- → IA Locale : Analyse patterns
- → Backend API : Suggestions amélioration
- → Frontend : Affichage dashboards

### Agent 6 : Backend API (Orchestrateur Central)
**Rôle** : API REST centrale, orchestration services
**Technologies** : Node.js, Express, JWT, Prisma ORM
**Fonctionnalités** :
- Authentification/autorisation
- Routage requêtes
- Gestion fichiers/uploads
- Orchestration agents
- Rate limiting

**Communication avec autres agents** :
- ↔ Tous les agents frontend
- → IA Locale : Délégation requêtes
- → Base de données : Opérations CRUD
- → MCP Server : Synchronisation config
- → Analytics : Événements tracking

### Agent 7 : IA Locale (Ollama/LLaMA)
**Rôle** : Cerveau IA de la plateforme
**Technologies** : Ollama, LLaMA 3 8B, LangChain
**Fonctionnalités** :
- Génération de contenu
- Analyse sémantique
- Suggestions personnalisées
- Dialogue conversationnel
- Extraction d'insights

**Communication avec autres agents** :
- ← Backend API : Requêtes chat
- ← MCP Server : Dialogues IA-to-IA
- ← Analytics : Analyse patterns
- → Base de données : Cache prompts (Redis)

## 📊 Flux de Données

### 1. Création de Site
```
User → Site Creator (Frontend)
     → Backend API
     → IA Locale (génération suggestions)
     → Base de données (sauvegarde)
     → Site Creator (affichage résultat)
```

### 2. Gestion Catalogue
```
User → Catalog Manager (Frontend)
     → Backend API
     → IA Locale (descriptions SEO)
     → Base de données (stockage produits)
     → Analytics (tracking actions)
```

### 3. Dialogue IA-to-IA (MCP)
```
IA Externe → MCP Server
          → Redis (vérif cache)
          → Base de données (récup config)
          → IA Locale (traitement)
          → Base de données (log conversation)
          → Analytics (métriques)
          → MCP Server → IA Externe
```

### 4. Analytics & Amélioration Continue
```
Visiteur site → Analytics Engine (tracking)
              → Base de données (stockage événements)
              → Cron Job (analyse périodique)
              → IA Locale (détection patterns)
              → Base de données (suggestions)
              → Backend API (notification)
              → Frontend (affichage suggestions)
```

## 🗄️ Architecture Base de Données

### Tables Principales

**companies** - Entreprises clientes
**users** - Utilisateurs de la plateforme
**company_identity** - Identité de marque
**websites** - Sites web créés
**products** - Catalogue produits/services
**seo_configurations** - Configurations SEO/LD-JSON

**ai_conversations** - Historique dialogues IA-Utilisateur
**ai_messages** - Messages conversations
**mcp_conversations** - Historique dialogues IA-to-IA
**mcp_messages** - Messages MCP

**visitor_sessions** - Sessions visiteurs
**page_views** - Pages vues
**visitor_events** - Événements tracking
**behavior_patterns** - Patterns détectés
**improvement_suggestions** - Suggestions IA

### Relations Clés
- Une entreprise → N utilisateurs, N produits, N sites
- Une conversation → N messages
- Une session → N pages vues, N événements
- Un pattern → N suggestions

## 🔄 Communication Inter-Agents

### Protocoles de Communication

**REST API** : Backend ↔ Frontends
**WebSocket** : Chat temps réel (optionnel)
**Message Queue** : Jobs asynchrones (Redis)
**Database Events** : Triggers PostgreSQL
**MCP Protocol** : IA externes ↔ MCP Server

### Synchronisation

**Redis** utilisé pour :
- Cache configurations IA
- Sessions utilisateurs
- File d'attente jobs
- Pub/Sub événements

**PostgreSQL Triggers** pour :
- updated_at automatique
- Cascade deletes
- Validation données

## 🔐 Sécurité & Isolation

### Isolation des Agents

- Chaque agent frontend = conteneur Docker séparé
- Backend API = reverse proxy Nginx
- IA Locale = conteneur GPU isolé
- Base de données = réseau interne Docker

### Authentification

- JWT tokens (access + refresh)
- Validation requêtes (Joi)
- Rate limiting par IP
- CORS strict

### Données

- Chiffrement en transit (SSL/TLS)
- Chiffrement au repos (PostgreSQL)
- Backups automatiques quotidiens
- RGPD compliant (consentement tracking)

## 📈 Scalabilité

### Horizontale

- Frontends : N instances derrière load balancer
- Backend API : PM2 cluster mode
- MCP Server : Multiple instances
- Analytics : Workers séparés

### Verticale

- IA Locale : GPU scaling (multi-GPU)
- Base de données : Read replicas
- Redis : Cluster mode
- Cache : CDN pour assets statiques

## 🧪 Tests & Monitoring

### Tests
- Unit tests : Jest
- Integration tests : Supertest
- E2E tests : Cypress
- Load tests : k6

### Monitoring
- Logs : Winston → ELK Stack
- Metrics : Prometheus + Grafana
- APM : OpenTelemetry
- Alertes : PagerDuty/Slack

## 🚀 Déploiement

### Environnements

**Development** : Docker Compose local
**Staging** : Kubernetes cluster
**Production** : Kubernetes multi-région

### CI/CD

```
Git Push → GitHub Actions
        → Tests automatiques
        → Build Docker images
        → Push registry
        → Deploy Kubernetes
        → Smoke tests
        → Rollback si échec
```

## 📊 Métriques Clés

### Performance
- Temps réponse API < 100ms
- Temps génération IA < 3s
- Uptime > 99.9%

### Business
- Nombre sites créés
- Produits catalogués
- Dialogues IA-to-IA
- Suggestions appliquées

### Technique
- CPU/RAM utilisation
- Requêtes/seconde
- Erreurs/minute
- Latence base de données

## 🔮 Évolutions Futures

- Multi-tenancy (SaaS)
- Marketplace templates
- IA fine-tuning personnalisée
- Mobile apps (React Native)
- Intégrations tierces (Shopify, WooCommerce)
- A/B testing automatique
- Génération vidéos IA
- Assistant vocal

---

**Version** : 1.0.0  
**Dernière mise à jour** : Février 2025  
**Maintenance** : PME AI Platform Team
