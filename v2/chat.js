import express from 'express';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { queryDatabase } from '../database/client.js';
import { chatWithAI } from '../services/aiConnector.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * POST /api/chat/conversations
 * Créer une nouvelle conversation avec l'IA
 */
router.post('/conversations',
  [
    body('title').optional().isString(),
    body('type').isIn(['site_creation', 'identity', 'product', 'support', 'general'])
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, type } = req.body;
      const companyId = req.user.companyId;
      const userId = req.user.id;

      const conversationId = uuidv4();
      
      await queryDatabase(
        `INSERT INTO ai_conversations (id, company_id, user_id, conversation_type, title)
         VALUES ($1, $2, $3, $4, $5)`,
        [conversationId, companyId, userId, type, title || `Conversation ${type}`]
      );

      logger.info(`Nouvelle conversation créée: ${conversationId} pour user ${userId}`);

      res.status(201).json({
        id: conversationId,
        title: title || `Conversation ${type}`,
        type,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/chat/conversations
 * Récupérer toutes les conversations de l'utilisateur
 */
router.get('/conversations', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;

    const result = await queryDatabase(
      `SELECT id, conversation_type, title, created_at, updated_at
       FROM ai_conversations
       WHERE company_id = $1 AND user_id = $2
       ORDER BY updated_at DESC
       LIMIT 50`,
      [companyId, userId]
    );

    res.json({
      conversations: result.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/chat/conversations/:id/messages
 * Récupérer tous les messages d'une conversation
 */
router.get('/conversations/:id/messages', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Vérifier que la conversation appartient à l'entreprise
    const convResult = await queryDatabase(
      `SELECT id FROM ai_conversations WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (convResult.rows.length === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    const messagesResult = await queryDatabase(
      `SELECT id, role, content, metadata, created_at
       FROM ai_messages
       WHERE conversation_id = $1
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      messages: messagesResult.rows
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/chat/conversations/:id/messages
 * Envoyer un message à l'IA et recevoir une réponse
 */
router.post('/conversations/:id/messages',
  [
    body('message').isString().notEmpty().isLength({ max: 5000 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { message } = req.body;
      const companyId = req.user.companyId;

      // Vérifier que la conversation existe
      const convResult = await queryDatabase(
        `SELECT id, conversation_type FROM ai_conversations 
         WHERE id = $1 AND company_id = $2`,
        [id, companyId]
      );

      if (convResult.rows.length === 0) {
        return res.status(404).json({ error: 'Conversation non trouvée' });
      }

      const conversationType = convResult.rows[0].conversation_type;

      // Récupérer l'historique de la conversation
      const historyResult = await queryDatabase(
        `SELECT role, content FROM ai_messages
         WHERE conversation_id = $1
         ORDER BY created_at ASC
         LIMIT 20`,
        [id]
      );

      const conversationHistory = historyResult.rows;

      // Sauvegarder le message utilisateur
      const userMessageId = uuidv4();
      await queryDatabase(
        `INSERT INTO ai_messages (id, conversation_id, role, content)
         VALUES ($1, $2, $3, $4)`,
        [userMessageId, id, 'user', message]
      );

      // Récupérer le contexte entreprise si nécessaire
      let companyContext = {};
      if (['site_creation', 'identity'].includes(conversationType)) {
        const contextResult = await queryDatabase(
          `SELECT c.name, c.industry, ci.mission, ci.vision, ci.brand_voice
           FROM companies c
           LEFT JOIN company_identity ci ON c.id = ci.company_id
           WHERE c.id = $1`,
          [companyId]
        );
        if (contextResult.rows.length > 0) {
          companyContext = contextResult.rows[0];
        }
      }

      // Appeler l'IA locale
      const aiResponse = await chatWithAI(
        message,
        conversationHistory,
        conversationType,
        companyContext
      );

      // Sauvegarder la réponse de l'IA
      const aiMessageId = uuidv4();
      await queryDatabase(
        `INSERT INTO ai_messages (id, conversation_id, role, content, metadata)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          aiMessageId,
          id,
          'assistant',
          aiResponse.content,
          JSON.stringify({
            model: aiResponse.model,
            tokens: aiResponse.tokens,
            responseTime: aiResponse.responseTime
          })
        ]
      );

      // Mettre à jour la conversation
      await queryDatabase(
        `UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [id]
      );

      logger.info(`Message AI envoyé dans conversation ${id}`);

      res.json({
        userMessage: {
          id: userMessageId,
          role: 'user',
          content: message,
          created_at: new Date().toISOString()
        },
        aiMessage: {
          id: aiMessageId,
          role: 'assistant',
          content: aiResponse.content,
          created_at: new Date().toISOString()
        }
      });
    } catch (error) {
      logger.error('Erreur lors de l\'envoi du message à l\'IA:', error);
      next(error);
    }
  }
);

/**
 * DELETE /api/chat/conversations/:id
 * Supprimer une conversation
 */
router.delete('/conversations/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `DELETE FROM ai_conversations WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Conversation non trouvée' });
    }

    logger.info(`Conversation supprimée: ${id}`);
    res.json({ message: 'Conversation supprimée avec succès' });
  } catch (error) {
    next(error);
  }
});

export default router;
