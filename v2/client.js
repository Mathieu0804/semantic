import pg from 'pg';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const { Pool } = pg;

// Configuration du pool de connexions
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20, // Nombre maximum de clients dans le pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Event handlers
pool.on('connect', () => {
  logger.debug('Nouvelle connexion PostgreSQL établie');
});

pool.on('error', (err) => {
  logger.error('Erreur PostgreSQL inattendue:', err);
  process.exit(-1);
});

/**
 * Exécuter une requête SQL
 * @param {string} text - Requête SQL
 * @param {Array} params - Paramètres de la requête
 * @returns {Promise<Object>} Résultat de la requête
 */
export const queryDatabase = async (text, params = []) => {
  const start = Date.now();
  
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    logger.debug('Requête exécutée', {
      text: text.substring(0, 100) + '...',
      duration: `${duration}ms`,
      rows: result.rowCount
    });
    
    return result;
  } catch (error) {
    logger.error('Erreur requête SQL:', {
      text: text.substring(0, 100) + '...',
      error: error.message,
      code: error.code
    });
    throw error;
  }
};

/**
 * Obtenir un client du pool pour les transactions
 * @returns {Promise<Object>} Client PostgreSQL
 */
export const getClient = async () => {
  const client = await pool.connect();
  return client;
};

/**
 * Exécuter une transaction
 * @param {Function} callback - Fonction à exécuter dans la transaction
 * @returns {Promise<any>} Résultat du callback
 */
export const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Vérifier la santé de la connexion
 * @returns {Promise<boolean>}
 */
export const healthCheck = async () => {
  try {
    const result = await queryDatabase('SELECT NOW()');
    return result.rows.length > 0;
  } catch (error) {
    logger.error('Health check échoué:', error);
    return false;
  }
};

/**
 * Fermer toutes les connexions (pour shutdown graceful)
 */
export const closePool = async () => {
  try {
    await pool.end();
    logger.info('Pool de connexions PostgreSQL fermé');
  } catch (error) {
    logger.error('Erreur fermeture pool:', error);
  }
};

// Graceful shutdown
process.on('SIGTERM', closePool);
process.on('SIGINT', closePool);

export default {
  query: queryDatabase,
  getClient,
  transaction,
  healthCheck,
  closePool,
  pool
};
