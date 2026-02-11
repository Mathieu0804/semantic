import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { queryDatabase } from '../database/client.js';
import { chatWithAI } from '../services/aiConnector.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/websites
 * Récupérer tous les sites de l'entreprise
 */
router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT id, name, template, domain, is_published, created_at, updated_at, published_at
       FROM websites
       WHERE company_id = $1
       ORDER BY created_at DESC`,
      [companyId]
    );

    res.json({ websites: result.rows });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/websites/:id
 * Récupérer un site spécifique avec son contenu
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT * FROM websites WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    res.json({ website: result.rows[0] });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/websites
 * Créer un nouveau site web
 */
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('template').notEmpty().isIn(['modern', 'ecommerce', 'restaurant', 'portfolio', 'blog']),
    body('colors').optional().isObject(),
    body('fonts').optional().isObject(),
    body('conversationId').optional().isUUID()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.user.companyId;
      const { name, template, colors, fonts, conversationId } = req.body;

      const websiteId = uuidv4();

      // Récupérer l'identité de l'entreprise pour personnalisation
      const identityResult = await queryDatabase(
        `SELECT mission, vision, brand_voice, primary_color, secondary_color
         FROM company_identity WHERE company_id = $1`,
        [companyId]
      );

      const identity = identityResult.rows[0] || {};

      // Générer le contenu HTML/CSS avec l'IA
      let htmlContent = '';
      let cssContent = '';

      try {
        const prompt = `Génère un site web ${template} complet en HTML et CSS inline.
        
Informations entreprise:
- Nom: ${name}
- Mission: ${identity.mission || 'Non définie'}
- Vision: ${identity.vision || 'Non définie'}
- Couleur primaire: ${colors?.primary || identity.primary_color || '#3B82F6'}
- Couleur secondaire: ${colors?.secondary || identity.secondary_color || '#10B981'}

Le code doit être:
- Responsive (mobile-first)
- Moderne et professionnel
- Optimisé SEO
- Accessible

Retourne uniquement le HTML complet avec CSS inline.`;

        const aiResponse = await chatWithAI(prompt, [], 'site_creation', identity);
        htmlContent = aiResponse.content;

        // Extraire le CSS si présent
        const cssMatch = htmlContent.match(/<style>([\s\S]*?)<\/style>/);
        if (cssMatch) {
          cssContent = cssMatch[1];
        }

      } catch (error) {
        logger.warn('Erreur génération IA, utilisation template par défaut');
        htmlContent = getDefaultTemplate(template, name, colors);
      }

      // Créer le site
      await queryDatabase(
        `INSERT INTO websites (
          id, company_id, name, template, html_content, css_content, metadata
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          websiteId,
          companyId,
          name,
          template,
          htmlContent,
          cssContent,
          JSON.stringify({ colors, fonts, conversationId })
        ]
      );

      logger.info(`Site web créé: ${name} (${websiteId})`);

      res.status(201).json({
        message: 'Site créé avec succès',
        websiteId,
        previewUrl: `/preview/${websiteId}`
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/websites/:id
 * Mettre à jour un site
 */
router.put('/:id',
  [
    body('name').optional().trim(),
    body('html_content').optional().trim(),
    body('css_content').optional().trim(),
    body('domain').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;
      const updates = req.body;

      const existing = await queryDatabase(
        'SELECT id FROM websites WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Site non trouvé' });
      }

      const fields = Object.keys(updates);
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
      }

      const setClause = fields.map((field, index) => 
        `${field} = $${index + 2}`
      ).join(', ');

      const values = [id, ...fields.map(f => updates[f])];

      await queryDatabase(
        `UPDATE websites SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        values
      );

      logger.info(`Site mis à jour: ${id}`);

      res.json({ message: 'Site mis à jour avec succès' });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/websites/:id/publish
 * Publier un site
 */
router.post('/:id/publish', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { domain } = req.body;

    const result = await queryDatabase(
      `UPDATE websites 
       SET is_published = true, 
           domain = $1,
           published_at = CURRENT_TIMESTAMP,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 AND company_id = $3
       RETURNING id, domain`,
      [domain, id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    logger.info(`Site publié: ${id} sur ${domain}`);

    res.json({
      message: 'Site publié avec succès',
      domain: result.rows[0].domain
    });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/websites/:id
 * Supprimer un site
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      'DELETE FROM websites WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Site non trouvé' });
    }

    logger.info(`Site supprimé: ${id}`);

    res.json({ message: 'Site supprimé avec succès' });

  } catch (error) {
    next(error);
  }
});

/**
 * Template HTML par défaut
 */
function getDefaultTemplate(template, name, colors = {}) {
  const primaryColor = colors.primary || '#3B82F6';
  const secondaryColor = colors.secondary || '#10B981';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    header { background: ${primaryColor}; color: white; padding: 2rem; text-align: center; }
    main { max-width: 1200px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 1rem; }
    .section { margin: 2rem 0; padding: 2rem; background: #f8f9fa; border-radius: 8px; }
    .cta { background: ${secondaryColor}; color: white; padding: 1rem 2rem; border: none; 
            border-radius: 4px; font-size: 1.1rem; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <h1>${name}</h1>
    <p>Bienvenue sur notre site</p>
  </header>
  <main>
    <div class="section">
      <h2>À propos</h2>
      <p>Votre contenu ici...</p>
    </div>
    <div class="section">
      <h2>Nos services</h2>
      <p>Découvrez ce que nous offrons...</p>
    </div>
    <button class="cta">Contactez-nous</button>
  </main>
</body>
</html>`;
}

export default router;
