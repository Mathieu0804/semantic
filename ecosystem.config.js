/**
 * Configuration PM2 pour la Plateforme IA PME
 * 
 * Utilisation:
 *   pm2 start ecosystem.config.js
 *   pm2 restart plateforme-ia-pme
 *   pm2 logs plateforme-ia-pme
 *   pm2 stop plateforme-ia-pme
 */

module.exports = {
  apps: [
    {
      name: 'plateforme-ia-pme',
      script: 'bun',
      args: 'run start',
      cwd: process.cwd(),
      instances: 1,
      exec_mode: 'fork',
      
      // Redémarrage automatique
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      
      // Variables d'environnement
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      
      // Logs
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/error.log',
      out_file: './logs/out.log',
      merge_logs: true,
      
      // Santé
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
};
