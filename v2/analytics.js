import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { queryDatabase } from '../database/client.js';
import { analyzeAndSuggest } from '../services/aiConnector.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/analytics/track
 * Enregistrer un événement de tracking (public, pas d'auth)
 */
router.post('/track',
  [
    body('event_type').isIn(['page_view', 'click', 'form_submit', 'download', 'scroll', 'custom']),
    body('session_id').notEmpty(),
    body('website_id').isUUID(),
    body('page_url').notEmpty(),
    body('visitor_id').optional()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        event_type, session_id, website_id, page_url, page_title,
        visitor_id, event_category, event_value, scroll_depth, time_on_page
      } = req.body;

      // Vérifier que le website existe
      const websiteResult = await queryDatabase(
        'SELECT company_id FROM websites WHERE id = $1',
        [website_id]
      );

      if (websiteResult.rows.length === 0) {
        return res.status(404).json({ error: 'Site non trouvé' });
      }

      const companyId = websiteResult.rows[0].company_id;

      // Créer ou récupérer la session
      let sessionResult = await queryDatabase(
        'SELECT id FROM visitor_sessions WHERE session_id = $1',
        [session_id]
      );

      let sessionDbId;

      if (sessionResult.rows.length === 0) {
        // Créer nouvelle session
        sessionDbId = uuidv4();
        const userAgent = req.headers['user-agent'];
        const ipAddress = req.ip || req.connection.remoteAddress;
        const referrer = req.headers.referer;

        await queryDatabase(
          `INSERT INTO visitor_sessions (
            id, company_id, website_id, session_id, visitor_id, ip_address,
            user_agent, referrer, landing_page
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            sessionDbId, companyId, website_id, session_id, visitor_id,
            ipAddress, userAgent, referrer, page_url
          ]
        );
      } else {
        sessionDbId = sessionResult.rows[0].id;

        // Mettre à jour la session
        await queryDatabase(
          `UPDATE visitor_sessions 
           SET page_views = page_views + 1, 
               exit_page = $1,
               ended_at = CURRENT_TIMESTAMP
           WHERE id = $2`,
          [page_url, sessionDbId]
        );
      }

      // Enregistrer l'événement selon le type
      if (event_type === 'page_view') {
        await queryDatabase(
          `INSERT INTO page_views (
            id, session_id, page_url, page_title, scroll_depth, time_on_page
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [uuidv4(), sessionDbId, page_url, page_title, scroll_depth, time_on_page]
        );
      } else {
        await queryDatabase(
          `INSERT INTO visitor_events (
            id, session_id, event_type, event_category, event_value
          ) VALUES ($1, $2, $3, $4, $5)`,
          [uuidv4(), sessionDbId, event_type, event_category, event_value]
        );
      }

      res.json({ message: 'Événement enregistré' });

    } catch (error) {
      logger.error('Erreur tracking:', error);
      // Ne pas faire échouer le tracking côté client
      res.status(200).json({ message: 'ok' });
    }
  }
);

/**
 * GET /api/analytics/dashboard
 * Récupérer les statistiques du dashboard
 */
router.get('/dashboard',
  [
    query('website_id').optional().isUUID(),
    query('period').optional().isIn(['today', 'week', 'month', 'year'])
  ],
  async (req, res, next) => {
    try {
      const companyId = req.user.companyId;
      const { website_id, period = 'month' } = req.query;

      // Calculer la date de début selon la période
      let startDate;
      switch (period) {
        case 'today':
          startDate = 'CURRENT_DATE';
          break;
        case 'week':
          startDate = 'CURRENT_DATE - INTERVAL \'7 days\'';
          break;
        case 'year':
          startDate = 'CURRENT_DATE - INTERVAL \'1 year\'';
          break;
        default: // month
          startDate = 'CURRENT_DATE - INTERVAL \'30 days\'';
      }

      let whereClause = `WHERE vs.company_id = $1 AND vs.started_at >= ${startDate}`;
      const params = [companyId];

      if (website_id) {
        whereClause += ' AND vs.website_id = $2';
        params.push(website_id);
      }

      // Visiteurs uniques
      const visitorsResult = await queryDatabase(
        `SELECT COUNT(DISTINCT visitor_id) as unique_visitors,
                COUNT(*) as total_sessions,
                AVG(page_views) as avg_page_views,
                AVG(EXTRACT(EPOCH FROM (ended_at - started_at))) as avg_session_duration
         FROM visitor_sessions vs
         ${whereClause}`,
        params
      );

      // Pages vues
      const pageViewsResult = await queryDatabase(
        `SELECT COUNT(*) as total_page_views
         FROM page_views pv
         JOIN visitor_sessions vs ON pv.session_id = vs.id
         ${whereClause}`,
        params
      );

      // Pages les plus visitées
      const topPagesResult = await queryDatabase(
        `SELECT pv.page_url, COUNT(*) as views
         FROM page_views pv
         JOIN visitor_sessions vs ON pv.session_id = vs.id
         ${whereClause}
         GROUP BY pv.page_url
         ORDER BY views DESC
         LIMIT 10`,
        params
      );

      // Événements récents
      const eventsResult = await queryDatabase(
        `SELECT ve.event_type, ve.event_category, COUNT(*) as count
         FROM visitor_events ve
         JOIN visitor_sessions vs ON ve.session_id = vs.id
         ${whereClause}
         GROUP BY ve.event_type, ve.event_category
         ORDER BY count DESC
         LIMIT 10`,
        params
      );

      // Tendances (par jour)
      const trendsResult = await queryDatabase(
        `SELECT DATE(vs.started_at) as date,
                COUNT(DISTINCT vs.visitor_id) as visitors,
                COUNT(*) as sessions
         FROM visitor_sessions vs
         ${whereClause}
         GROUP BY DATE(vs.started_at)
         ORDER BY date DESC
         LIMIT 30`,
        params
      );

      res.json({
        summary: visitorsResult.rows[0],
        pageViews: pageViewsResult.rows[0],
        topPages: topPagesResult.rows,
        events: eventsResult.rows,
        trends: trendsResult.rows
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/analytics/patterns
 * Récupérer les patterns comportementaux détectés
 */
router.get('/patterns', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT * FROM behavior_patterns
       WHERE company_id = $1
       ORDER BY confidence_score DESC, frequency DESC
       LIMIT 20`,
      [companyId]
    );

    res.json({ patterns: result.rows });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/analyze
 * Lancer une analyse IA des comportements
 */
router.post('/analyze', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // Récupérer les données récentes
    const analyticsData = await queryDatabase(
      `SELECT 
        COUNT(DISTINCT vs.visitor_id) as unique_visitors,
        AVG(vs.page_views) as avg_page_views,
        AVG(EXTRACT(EPOCH FROM (vs.ended_at - vs.started_at))) as avg_duration,
        COUNT(CASE WHEN vs.page_views = 1 THEN 1 END)::float / COUNT(*) as bounce_rate
       FROM visitor_sessions vs
       WHERE vs.company_id = $1 
       AND vs.started_at >= CURRENT_DATE - INTERVAL '7 days'`,
      [companyId]
    );

    const topPages = await queryDatabase(
      `SELECT pv.page_url, COUNT(*) as views
       FROM page_views pv
       JOIN visitor_sessions vs ON pv.session_id = vs.id
       WHERE vs.company_id = $1
       AND pv.created_at >= CURRENT_DATE - INTERVAL '7 days'
       GROUP BY pv.page_url
       ORDER BY views DESC
       LIMIT 5`,
      [companyId]
    );

    // Analyser avec l'IA
    const analysis = await analyzeAndSuggest({
      period: 'derniers 7 jours',
      ...analyticsData.rows[0],
      topPages: topPages.rows
    }, 'website_performance');

    logger.info(`Analyse IA lancée pour company ${companyId}`);

    res.json({
      message: 'Analyse terminée',
      analysis
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/analytics/suggestions
 * Récupérer les suggestions d'amélioration
 */
router.get('/suggestions', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT * FROM improvement_suggestions
       WHERE company_id = $1 AND status = 'pending'
       ORDER BY 
         CASE priority
           WHEN 'critical' THEN 1
           WHEN 'high' THEN 2
           WHEN 'medium' THEN 3
           WHEN 'low' THEN 4
         END,
         impact_score DESC,
         created_at DESC
       LIMIT 20`,
      [companyId]
    );

    res.json({ suggestions: result.rows });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/analytics/suggestions/:id/apply
 * Marquer une suggestion comme appliquée
 */
router.post('/suggestions/:id/apply', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    await queryDatabase(
      `UPDATE improvement_suggestions
       SET status = 'applied', applied_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    res.json({ message: 'Suggestion marquée comme appliquée' });

  } catch (error) {
    next(error);
  }
});

export default router;
