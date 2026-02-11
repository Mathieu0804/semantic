import winston from 'winston';
import dotenv from 'dotenv';
import { promises as fs } from 'fs';

dotenv.config();

// Créer le dossier logs s'il n'existe pas
await fs.mkdir('logs', { recursive: true });

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Format personnalisé des logs
const customFormat = printf(({ level, message, timestamp, stack, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message}`;
  
  // Ajouter les métadonnées si présentes
  if (Object.keys(metadata).length > 0) {
    msg += ` ${JSON.stringify(metadata)}`;
  }
  
  // Ajouter la stack trace si erreur
  if (stack) {
    msg += `\n${stack}`;
  }
  
  return msg;
});

// Niveaux de log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Couleurs pour la console
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

// Créer le logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    customFormat
  ),
  transports: [
    // Console
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat
      )
    }),
    
    // Fichier pour toutes les erreurs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    
    // Fichier pour tous les logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
    }),
  ],
  
  // Ne pas quitter sur erreur
  exitOnError: false,
});

// En développement, logs plus verbeux
if (process.env.NODE_ENV === 'development') {
  logger.level = 'debug';
  logger.info('Mode développement - logs debug activés');
}

// En production, logs plus restrictifs
if (process.env.NODE_ENV === 'production') {
  logger.level = 'warn';
  logger.info('Mode production - logs warn et error uniquement');
}

// Stream pour Morgan (HTTP logging)
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;
