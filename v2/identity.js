import express from 'express';
import { body, validationResult } from 'express-validator';
import { queryDatabase } from '../database/client.js';
import { chatWithAI, generateSEOContent } from '../services/aiConnector.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * GET /api/identity
 * Récupérer l'identité de l'entreprise
 */
router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT ci.*, c.name as company_name, c.industry
       FROM company_identity ci
       JOIN companies c ON ci.company_id = c.id
       WHERE ci.company_id = $1`,
      [companyId]
    );

    if (result.rows.length === 0) {
      // Retourner une identité vide si pas encore configurée
      return res.json({ identity: null });
    }

    res.json({ identity: result.rows[0] });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/identity
 * Créer ou mettre à jour l'identité de l'entreprise
 */
router.post('/',
  [
    body('mission').optional().trim(),
    body('vision').optional().trim(),
    body('values').optional().isArray(),
    body('target_audience').optional().trim(),
    body('unique_selling_points').optional().isArray(),
    body('brand_voice').optional().isIn(['professional', 'friendly', 'technical', 'casual', 'enthusiastic']),
    body('brand_tone').optional().isIn(['formal', 'casual', 'humorous', 'serious', 'inspiring']),
    body('primary_color').optional().matches(/^#[0-9A-F]{6}$/i),
    body('secondary_color').optional().matches(/^#[0-9A-F]{6}$/i)
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.user.companyId;
      const {
        mission, vision, values, target_audience, unique_selling_points,
        brand_voice, brand_tone, primary_color, secondary_color, logo_url
      } = req.body;

      // Vérifier si l'identité existe déjà
      const existing = await queryDatabase(
        'SELECT id FROM company_identity WHERE company_id = $1',
        [companyId]
      );

      if (existing.rows.length > 0) {
        // Update
        const updates = req.body;
        const fields = Object.keys(updates).filter(f => updates[f] !== undefined);
        
        if (fields.length === 0) {
          return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
        }

        const setClause = fields.map((field, index) => {
          // Gérer les arrays
          if (Array.isArray(updates[field])) {
            return `${field} = $${index + 2}`;
          }
          return `${field} = $${index + 2}`;
        }).join(', ');

        const values = [
          companyId,
          ...fields.map(f => Array.isArray(updates[f]) ? updates[f] : updates[f])
        ];

        await queryDatabase(
          `UPDATE company_identity SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
           WHERE company_id = $1`,
          values
        );

        logger.info(`Identité mise à jour pour company ${companyId}`);

      } else {
        // Insert
        await queryDatabase(
          `INSERT INTO company_identity (
            company_id, mission, vision, values, target_audience, unique_selling_points,
            brand_voice, brand_tone, primary_color, secondary_color, logo_url
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [
            companyId, mission, vision, values, target_audience, unique_selling_points,
            brand_voice, brand_tone, primary_color, secondary_color, logo_url
          ]
        );

        logger.info(`Identité créée pour company ${companyId}`);
      }

      // Mettre à jour la configuration IA avec la nouvelle identité
      await updateAIConfiguration(companyId, {
        mission, vision, brand_voice, brand_tone
      });

      res.json({ message: 'Identité enregistrée avec succès' });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/identity/generate-keywords
 * Générer des mots-clés SEO automatiquement
 */
router.post('/generate-keywords', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // Récupérer l'identité
    const identityResult = await queryDatabase(
      `SELECT ci.*, c.name, c.industry
       FROM company_identity ci
       JOIN companies c ON ci.company_id = c.id
       WHERE ci.company_id = $1`,
      [companyId]
    );

    if (identityResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Veuillez d\'abord configurer votre identité d\'entreprise' 
      });
    }

    const identity = identityResult.rows[0];

    // Générer les mots-clés avec l'IA
    const prompt = `Génère une liste de 20 mots-clés SEO pertinents pour cette entreprise:

Nom: ${identity.name}
Secteur: ${identity.industry || 'Non spécifié'}
Mission: ${identity.mission || 'Non définie'}
Public cible: ${identity.target_audience || 'Non défini'}
Points forts: ${identity.unique_selling_points?.join(', ') || 'Non défini'}

Retourne uniquement une liste de mots-clés séparés par des virgules, du plus important au moins important.`;

    const aiResponse = await chatWithAI(prompt, [], 'general', {});
    const keywords = aiResponse.content
      .split(',')
      .map(k => k.trim())
      .filter(k => k.length > 0);

    logger.info(`Mots-clés SEO générés pour company ${companyId}`);

    res.json({ keywords });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/identity/generate-ldjson
 * Générer le LD-JSON Schema.org
 */
router.post('/generate-ldjson', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const identityResult = await queryDatabase(
      `SELECT ci.*, c.name, c.industry, c.domain
       FROM company_identity ci
       JOIN companies c ON ci.company_id = c.id
       WHERE ci.company_id = $1`,
      [companyId]
    );

    if (identityResult.rows.length === 0) {
      return res.status(400).json({ 
        error: 'Veuillez d\'abord configurer votre identité d\'entreprise' 
      });
    }

    const identity = identityResult.rows[0];

    // Générer LD-JSON basique
    const ldJson = {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": identity.name,
      "description": identity.mission || "",
      "url": identity.domain || "",
      "logo": identity.logo_url || "",
      "sameAs": [],
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service"
      }
    };

    // Enrichir avec IA si nécessaire
    try {
      const prompt = `Améliore ce LD-JSON Schema.org pour l'entreprise:

${JSON.stringify(ldJson, null, 2)}

Mission: ${identity.mission}
Vision: ${identity.vision}
Secteur: ${identity.industry}

Retourne uniquement le JSON complet et valide, sans commentaires.`;

      const aiResponse = await chatWithAI(prompt, [], 'general', {});
      
      // Essayer de parser la réponse comme JSON
      try {
        const enhancedJson = JSON.parse(aiResponse.content);
        res.json({ ldJson: enhancedJson });
      } catch {
        // Si parsing échoue, retourner le JSON basique
        res.json({ ldJson });
      }

    } catch (error) {
      logger.warn('Erreur enrichissement LD-JSON, utilisation version basique');
      res.json({ ldJson });
    }

  } catch (error) {
    next(error);
  }
});

/**
 * Mettre à jour la configuration IA avec l'identité
 */
async function updateAIConfiguration(companyId, identity) {
  try {
    const systemPrompt = `Tu es le représentant virtuel de l'entreprise.

Mission: ${identity.mission || 'Non définie'}
Vision: ${identity.vision || 'Non définie'}
Ton de communication: ${identity.brand_voice || 'Professionnel'}
Style: ${identity.brand_tone || 'Amical'}

Tu dois toujours refléter ces valeurs dans tes réponses.`;

    await queryDatabase(
      `INSERT INTO ai_configurations (company_id, system_prompt)
       VALUES ($1, $2)
       ON CONFLICT (company_id) 
       DO UPDATE SET system_prompt = $2, updated_at = CURRENT_TIMESTAMP`,
      [companyId, systemPrompt]
    );

  } catch (error) {
    logger.error('Erreur mise à jour config IA:', error);
  }
}

export default router;
