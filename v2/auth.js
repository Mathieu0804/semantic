import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import { queryDatabase } from '../database/client.js';
import logger from '../utils/logger.js';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

/**
 * POST /api/auth/register
 * Inscription d'un nouvel utilisateur et création d'entreprise
 */
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('firstName').notEmpty().trim(),
    body('lastName').notEmpty().trim(),
    body('companyName').notEmpty().trim(),
    body('industry').optional().trim()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, companyName, industry } = req.body;

      // Vérifier si l'email existe déjà
      const existingUser = await queryDatabase(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }

      // Hasher le mot de passe (12 rounds pour sécurité renforcée)
      const passwordHash = await bcrypt.hash(password, 12);

      // Créer l'entreprise
      const companyId = uuidv4();
      await queryDatabase(
        `INSERT INTO companies (id, name, industry) VALUES ($1, $2, $3)`,
        [companyId, companyName, industry || null]
      );

      // Créer l'utilisateur admin
      const userId = uuidv4();
      await queryDatabase(
        `INSERT INTO users (id, company_id, email, password_hash, first_name, last_name, role)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [userId, companyId, email, passwordHash, firstName, lastName, 'admin']
      );

      // Créer la configuration IA par défaut
      await queryDatabase(
        `INSERT INTO ai_configurations (company_id, model_name, temperature)
         VALUES ($1, $2, $3)`,
        [companyId, 'llama3:8b', 0.7]
      );

      logger.info(`Nouvel utilisateur créé: ${email} pour entreprise ${companyName}`);

      // Générer les tokens
      const accessToken = jwt.sign(
        { userId, companyId, email, role: 'admin' },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      res.status(201).json({
        message: 'Inscription réussie',
        user: {
          id: userId,
          email,
          firstName,
          lastName,
          companyId,
          companyName,
          role: 'admin'
        },
        accessToken,
        refreshToken
      });

    } catch (error) {
      logger.error('Erreur inscription:', error);
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Connexion utilisateur
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password } = req.body;

      // Récupérer l'utilisateur
      const result = await queryDatabase(
        `SELECT u.id, u.company_id, u.email, u.password_hash, u.first_name, u.last_name, 
                u.role, u.is_active, c.name as company_name
         FROM users u
         JOIN companies c ON u.company_id = c.id
         WHERE u.email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      const user = result.rows[0];

      if (!user.is_active) {
        return res.status(403).json({ error: 'Compte désactivé' });
      }

      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }

      // Mettre à jour last_login
      await queryDatabase(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );

      // Générer les tokens
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          companyId: user.company_id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        REFRESH_TOKEN_SECRET,
        { expiresIn: '30d' }
      );

      logger.info(`Connexion réussie: ${email}`);

      res.json({
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          companyId: user.company_id,
          companyName: user.company_name,
          role: user.role
        },
        accessToken,
        refreshToken
      });

    } catch (error) {
      logger.error('Erreur connexion:', error);
      next(error);
    }
  }
);

/**
 * POST /api/auth/refresh
 * Rafraîchir le token d'accès
 */
router.post('/refresh',
  [body('refreshToken').notEmpty()],
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;

      // Vérifier le refresh token
      const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      // Récupérer l'utilisateur
      const result = await queryDatabase(
        `SELECT u.id, u.company_id, u.email, u.role, u.is_active
         FROM users u
         WHERE u.id = $1`,
        [decoded.userId]
      );

      if (result.rows.length === 0 || !result.rows[0].is_active) {
        return res.status(401).json({ error: 'Token invalide' });
      }

      const user = result.rows[0];

      // Générer un nouveau access token
      const accessToken = jwt.sign(
        { 
          userId: user.id, 
          companyId: user.company_id, 
          email: user.email, 
          role: user.role 
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({ accessToken });

    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token invalide ou expiré' });
      }
      next(error);
    }
  }
);

/**
 * POST /api/auth/logout
 * Déconnexion (côté client principalement)
 */
router.post('/logout', (req, res) => {
  // Avec JWT, la déconnexion est gérée côté client en supprimant le token
  // Optionnel: implémenter une blacklist de tokens
  res.json({ message: 'Déconnexion réussie' });
});

/**
 * GET /api/auth/me
 * Récupérer les informations de l'utilisateur connecté
 */
router.get('/me', async (req, res, next) => {
  try {
    // Extraire le token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token manquant' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    // Récupérer les infos utilisateur
    const result = await queryDatabase(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.company_id,
              c.name as company_name, c.industry
       FROM users u
       JOIN companies c ON u.company_id = c.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token invalide ou expiré' });
    }
    next(error);
  }
});

export default router;
