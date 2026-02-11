import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import sharp from 'sharp';
import csv from 'csv-parser';
import XLSX from 'xlsx';
import { createReadStream } from 'fs';
import { queryDatabase } from '../database/client.js';
import { generateSEOContent } from '../services/aiConnector.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configuration Multer pour upload fichiers
const upload = multer({ 
  dest: 'uploads/temp/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

/**
 * GET /api/products
 * Récupérer tous les produits de l'entreprise
 */
router.get('/',
  [
    query('search').optional().trim(),
    query('category').optional().trim(),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.user.companyId;
      const { search, category, limit = 50, offset = 0 } = req.query;

      let query = `
        SELECT id, sku, name, description, short_description, category, 
               price, currency, stock_quantity, is_active, images, 
               seo_title, seo_description, created_at, updated_at
        FROM products
        WHERE company_id = $1
      `;
      const params = [companyId];
      let paramIndex = 2;

      if (search) {
        query += ` AND (name ILIKE $${paramIndex} OR sku ILIKE $${paramIndex})`;
        params.push(`%${search}%`);
        paramIndex++;
      }

      if (category) {
        query += ` AND category = $${paramIndex}`;
        params.push(category);
        paramIndex++;
      }

      query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, offset);

      const result = await queryDatabase(query, params);

      // Compter le total
      const countResult = await queryDatabase(
        `SELECT COUNT(*) FROM products WHERE company_id = $1`,
        [companyId]
      );

      res.json({
        products: result.rows,
        total: parseInt(countResult.rows[0].count),
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/products/:id
 * Récupérer un produit spécifique
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT * FROM products WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    res.json({ product: result.rows[0] });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products
 * Créer un nouveau produit
 */
router.post('/',
  [
    body('name').notEmpty().trim(),
    body('sku').optional().trim(),
    body('description').optional().trim(),
    body('short_description').optional().trim(),
    body('category').optional().trim(),
    body('price').isFloat({ min: 0 }),
    body('currency').optional().isIn(['EUR', 'USD', 'GBP']),
    body('stock_quantity').optional().isInt({ min: 0 }),
    body('is_active').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const companyId = req.user.companyId;
      const {
        name, sku, description, short_description, category,
        price, currency = 'EUR', stock_quantity = 0, is_active = true
      } = req.body;

      // Vérifier unicité SKU si fourni
      if (sku) {
        const existing = await queryDatabase(
          'SELECT id FROM products WHERE sku = $1 AND company_id = $2',
          [sku, companyId]
        );
        if (existing.rows.length > 0) {
          return res.status(400).json({ error: 'Ce SKU existe déjà' });
        }
      }

      const productId = uuidv4();

      // Générer SEO avec IA si description fournie
      let seoTitle = name;
      let seoDescription = short_description || '';
      let seoKeywords = [];

      if (description || short_description) {
        try {
          const seoContent = await generateSEOContent(
            { name, description, category, price },
            'meta_description'
          );
          seoDescription = seoContent.substring(0, 160);
        } catch (error) {
          logger.warn('Erreur génération SEO, utilisation valeur par défaut');
        }
      }

      await queryDatabase(
        `INSERT INTO products (
          id, company_id, sku, name, description, short_description, category,
          price, currency, stock_quantity, is_active, seo_title, seo_description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          productId, companyId, sku, name, description, short_description, category,
          price, currency, stock_quantity, is_active, seoTitle, seoDescription
        ]
      );

      logger.info(`Produit créé: ${name} (${productId})`);

      res.status(201).json({
        message: 'Produit créé avec succès',
        productId
      });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/products/:id
 * Mettre à jour un produit
 */
router.put('/:id',
  [
    body('name').optional().trim(),
    body('description').optional().trim(),
    body('short_description').optional().trim(),
    body('category').optional().trim(),
    body('price').optional().isFloat({ min: 0 }),
    body('stock_quantity').optional().isInt({ min: 0 }),
    body('is_active').optional().isBoolean()
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const companyId = req.user.companyId;

      // Vérifier que le produit existe
      const existing = await queryDatabase(
        'SELECT id FROM products WHERE id = $1 AND company_id = $2',
        [id, companyId]
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({ error: 'Produit non trouvé' });
      }

      const updates = req.body;
      const fields = Object.keys(updates);
      
      if (fields.length === 0) {
        return res.status(400).json({ error: 'Aucun champ à mettre à jour' });
      }

      const setClause = fields.map((field, index) => 
        `${field} = $${index + 2}`
      ).join(', ');

      const values = [id, ...fields.map(f => updates[f])];

      await queryDatabase(
        `UPDATE products SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
         WHERE id = $1`,
        values
      );

      logger.info(`Produit mis à jour: ${id}`);

      res.json({ message: 'Produit mis à jour avec succès' });

    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/products/:id
 * Supprimer un produit
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      'DELETE FROM products WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    logger.info(`Produit supprimé: ${id}`);

    res.json({ message: 'Produit supprimé avec succès' });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/products/import
 * Importer des produits depuis CSV/Excel
 */
router.post('/import', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Fichier manquant' });
    }

    const companyId = req.user.companyId;
    const filePath = req.file.path;
    const fileExt = req.file.originalname.split('.').pop().toLowerCase();

    let products = [];

    // Parser selon le format
    if (fileExt === 'csv') {
      products = await new Promise((resolve, reject) => {
        const results = [];
        createReadStream(filePath)
          .pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      });
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      products = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    } else {
      return res.status(400).json({ error: 'Format non supporté' });
    }

    // Insérer les produits
    let imported = 0;
    for (const prod of products) {
      try {
        const productId = uuidv4();
        await queryDatabase(
          `INSERT INTO products (
            id, company_id, name, sku, description, short_description, category,
            price, currency, stock_quantity
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            productId,
            companyId,
            prod.name || prod.Name,
            prod.sku || prod.SKU,
            prod.description || prod.Description,
            prod.short_description || prod['Short Description'],
            prod.category || prod.Category,
            parseFloat(prod.price || prod.Price || 0),
            prod.currency || prod.Currency || 'EUR',
            parseInt(prod.stock_quantity || prod.Stock || 0)
          ]
        );
        imported++;
      } catch (error) {
        logger.warn(`Erreur import produit: ${error.message}`);
      }
    }

    logger.info(`Import terminé: ${imported}/${products.length} produits`);

    res.json({
      message: 'Import terminé',
      imported,
      total: products.length
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/export
 * Exporter les produits en CSV
 */
router.get('/export', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT name, sku, description, short_description, category, price, 
              currency, stock_quantity, is_active
       FROM products WHERE company_id = $1`,
      [companyId]
    );

    // Générer CSV
    const headers = Object.keys(result.rows[0] || {});
    const csv = [
      headers.join(','),
      ...result.rows.map(row => 
        headers.map(h => `"${row[h] || ''}"`).join(',')
      )
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    res.send(csv);

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/products/categories
 * Récupérer toutes les catégories
 */
router.get('/categories', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT DISTINCT category FROM products 
       WHERE company_id = $1 AND category IS NOT NULL
       ORDER BY category`,
      [companyId]
    );

    res.json({
      categories: result.rows.map(r => ({ name: r.category }))
    });

  } catch (error) {
    next(error);
  }
});

export default router;
