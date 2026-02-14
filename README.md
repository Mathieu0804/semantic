# Plateforme IA PME - Création de Sites Web par IA

Solution complète pour PME/PMI permettant de créer, gérer et analyser des sites web avec automatisation IA locale.

## Fonctionnalités

- **Créateur de Site IA** - Chatbot pour créer des sites web par conversation
- **Gestion Catalogue** - CRUD produits/services avec import CSV/JSON
- **Identité & SEO** - Configuration entreprise et génération automatique LD-JSON
- **Serveur MCP** - Interconnexion IA-to-IA pour assistants externes
- **Analytics** - Dashboard avec détection de patterns

## Stack Technique

- Next.js 15 + React 19
- Tailwind CSS + Shadcn/ui
- Prisma ORM + SQLite
- z-ai-web-dev-sdk (IA locale)

## Installation Rapide

```bash
# Cloner le repo
git clone https://github.com/VOTRE-USER/plateforme-ia-pme.git
cd plateforme-ia-pme

# Installer les dépendances
bun install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos valeurs

# Initialiser la base de données
bun run db:push

# Lancer en développement
bun run dev
```

## Déploiement

Voir le guide complet: [GUIDE-DEPLOIEMENT.md](./download/GUIDE-DEPLOIEMENT.md)

### VPS (Recommandé)

```bash
# Installer les dépendances
bun install

# Configurer
cp .env.example .env
bun run db:push

# Démarrer avec PM2
pm2 start ecosystem.config.js
```

### Tests MCP

```bash
# Tester le serveur MCP
bun scripts/test-mcp.js
```

## Structure du Projet

```
├── prisma/
│   └── schema.prisma      # Schéma BDD (15 tables)
├── src/
│   ├── app/
│   │   ├── page.tsx       # Page principale
│   │   └── api/           # Routes API
│   ├── components/        # Composants UI
│   └── lib/
│       ├── ai.ts          # Helper IA
│       └── db.ts          # Prisma client
├── scripts/
│   └── test-mcp.js        # Tests MCP
├── .env.example           # Variables d'environnement
└── ecosystem.config.js    # Config PM2
```

## Configuration MCP

Le serveur MCP permet aux IA externes de dialoguer avec votre IA locale:

1. Activer le MCP dans l'interface (Onglet "Serveur MCP")
2. Configurer l'URL: `https://votre-domaine.com/api/mcp`
3. Configurer la personnalité de l'IA (Onglet "Identité & SEO" > "IA")

### Endpoints MCP

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/mcp` | GET | Statut du serveur |
| `/api/mcp?action=connect` | POST | Créer une connexion |
| `/api/mcp?action=request` | POST | Envoyer une requête |

### Exemple d'utilisation

```javascript
// Se connecter
const response = await fetch('https://votre-domaine.com/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'connect',
    clientName: 'MonApp',
    clientType: 'assistant'
  })
});
const { token, sessionId } = await response.json();

// Envoyer un message
await fetch('https://votre-domaine.com/api/mcp', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'request',
    token,
    endpoint: 'chat',
    payload: { message: 'Bonjour!' }
  })
});
```

## Sécurité

- Tokens MCP hashés avec SHA256
- Requêtes SQL paramétrées
- Validation stricte des entrées
- HTTPS recommandé en production

## License

MIT

## Support

Pour toute question, consultez le [GUIDE-DEPLOIEMENT.md](./download/GUIDE-DEPLOIEMENT.md)
