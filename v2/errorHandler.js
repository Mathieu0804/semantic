import logger from '../utils/logger.js';

/**
 * Middleware global de gestion des erreurs
 * À placer en dernier dans la chaîne de middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Log l'erreur
  logger.error('Erreur serveur:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    user: req.user?.id
  });

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Erreur de validation',
      details: err.message
    });
  }

  // Erreurs PostgreSQL
  if (err.code) {
    switch (err.code) {
      case '23505': // Violation contrainte unicité
        return res.status(409).json({
          error: 'Conflit',
          message: 'Cette valeur existe déjà'
        });
      
      case '23503': // Violation contrainte clé étrangère
        return res.status(400).json({
          error: 'Erreur de référence',
          message: 'Référence invalide'
        });
      
      case '23502': // Violation NOT NULL
        return res.status(400).json({
          error: 'Champ requis manquant',
          message: err.message
        });
      
      case '22P02': // Format invalide
        return res.status(400).json({
          error: 'Format de données invalide',
          message: err.message
        });
    }
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: 'Authentification requise',
      message: 'Token invalide ou expiré'
    });
  }

  // Erreurs Multer (upload fichiers)
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        error: 'Fichier trop volumineux',
        message: 'La taille maximale est de 10MB'
      });
    }
    return res.status(400).json({
      error: 'Erreur upload',
      message: err.message
    });
  }

  // Erreur par défaut (500)
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Une erreur est survenue'
    : err.message;

  res.status(statusCode).json({
    error: 'Erreur serveur',
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Middleware pour gérer les routes non trouvées (404)
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Route non trouvée',
    path: req.path,
    method: req.method
  });
};

/**
 * Wrapper async pour les routes
 * Permet de catch automatiquement les erreurs async
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default errorHandler;
