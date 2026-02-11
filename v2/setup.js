#!/usr/bin/env node

/**
 * Script de setup - Crée tous les dossiers nécessaires
 * Exécuter avec: node setup.js
 */

import { promises as fs } from 'fs';
import path from 'path';

const directories = [
  // Logs
  'logs',
  
  // Uploads
  'uploads',
  'uploads/original',
  'uploads/optimized',
  'uploads/resized',
  'uploads/temp',
  
  // Frontend builds
  'frontend/site-creator/dist',
  'frontend/catalog-manager/dist',
  'frontend/identity-manager/dist'
];

async function setupDirectories() {
  console.log('🔧 Configuration des répertoires...\n');

  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`✅ Créé: ${dir}`);
    } catch (error) {
      console.error(`❌ Erreur création ${dir}:`, error.message);
    }
  }

  console.log('\n✅ Setup terminé !');
  console.log('\nProchaines étapes:');
  console.log('  1. Copier .env.example vers .env');
  console.log('  2. Configurer les variables d\'environnement');
  console.log('  3. Démarrer PostgreSQL et Redis');
  console.log('  4. Exécuter les migrations: npm run migrate');
  console.log('  5. Démarrer les services: npm run dev\n');
}

setupDirectories().catch(console.error);
