import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { promises as fs } from 'fs';
import path from 'path';
import { queryDatabase } from '../database/client.js';
import logger from '../utils/logger.js';

const router = express.Router();

// Configuration Multer
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = 'uploads/original';
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Types de fichiers autorisés
  const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|svg/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

/**
 * POST /api/media/upload
 * Upload d'un ou plusieurs fichiers
 */
router.post('/upload', upload.array('files', 10), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    const companyId = req.user.companyId;
    const uploadedFiles = [];

    for (const file of req.files) {
      const isImage = file.mimetype.startsWith('image/');
      let width = null;
      let height = null;
      let optimizedPath = file.path;

      // Optimiser les images
      if (isImage && file.mimetype !== 'image/svg+xml') {
        try {
          const optimizedDir = 'uploads/optimized';
          await fs.mkdir(optimizedDir, { recursive: true });
          
          const optimizedFilename = `opt_${file.filename}`;
          optimizedPath = path.join(optimizedDir, optimizedFilename);

          // Optimiser avec sharp
          const metadata = await sharp(file.path).metadata();
          width = metadata.width;
          height = metadata.height;

          await sharp(file.path)
            .resize(2000, 2000, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 85 })
            .toFile(optimizedPath);

          logger.info(`Image optimisée: ${file.originalname}`);

        } catch (error) {
          logger.warn(`Erreur optimisation image: ${error.message}`);
          // Utiliser le fichier original si optimisation échoue
        }
      }

      // Enregistrer en BDD
      const mediaId = uuidv4();
      await queryDatabase(
        `INSERT INTO media_files (
          id, company_id, filename, original_filename, file_path, file_type,
          file_size, mime_type, width, height
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          mediaId,
          companyId,
          file.filename,
          file.originalname,
          optimizedPath,
          path.extname(file.originalname).substring(1),
          file.size,
          file.mimetype,
          width,
          height
        ]
      );

      uploadedFiles.push({
        id: mediaId,
        filename: file.originalname,
        url: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        size: file.size,
        ...(width && height && { width, height })
      });
    }

    logger.info(`${uploadedFiles.length} fichier(s) uploadé(s) pour company ${companyId}`);

    res.json({
      message: 'Upload réussi',
      files: uploadedFiles
    });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/media
 * Récupérer tous les médias de l'entreprise
 */
router.get('/', async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { type, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT id, filename, original_filename, file_type, file_size, mime_type,
             width, height, alt_text, created_at
      FROM media_files
      WHERE company_id = $1
    `;
    const params = [companyId];

    if (type) {
      query += ` AND file_type = $${params.length + 1}`;
      params.push(type);
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await queryDatabase(query, params);

    // Ajouter les URLs
    const files = result.rows.map(file => ({
      ...file,
      url: `/uploads/${file.filename}`
    }));

    res.json({ files });

  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/media/:id
 * Récupérer un média spécifique
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const result = await queryDatabase(
      `SELECT * FROM media_files WHERE id = $1 AND company_id = $2`,
      [id, companyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    const file = result.rows[0];
    res.json({
      ...file,
      url: `/uploads/${file.filename}`
    });

  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/media/:id
 * Mettre à jour les métadonnées d'un média
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { alt_text } = req.body;

    const result = await queryDatabase(
      `UPDATE media_files 
       SET alt_text = $1
       WHERE id = $2 AND company_id = $3`,
      [alt_text, id, companyId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    res.json({ message: 'Métadonnées mises à jour' });

  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/media/:id
 * Supprimer un média
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Récupérer le fichier
    const fileResult = await queryDatabase(
      'SELECT file_path FROM media_files WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    const filePath = fileResult.rows[0].file_path;

    // Supprimer de la BDD
    await queryDatabase(
      'DELETE FROM media_files WHERE id = $1',
      [id]
    );

    // Supprimer le fichier physique
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn(`Impossible de supprimer le fichier: ${filePath}`);
    }

    logger.info(`Média supprimé: ${id}`);

    res.json({ message: 'Fichier supprimé' });

  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/media/:id/resize
 * Redimensionner une image
 */
router.post('/:id/resize', async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { width, height } = req.body;

    if (!width && !height) {
      return res.status(400).json({ error: 'Width ou height requis' });
    }

    // Récupérer le fichier
    const fileResult = await queryDatabase(
      'SELECT file_path, filename FROM media_files WHERE id = $1 AND company_id = $2',
      [id, companyId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Fichier non trouvé' });
    }

    const { file_path, filename } = fileResult.rows[0];

    // Créer version redimensionnée
    const resizedDir = 'uploads/resized';
    await fs.mkdir(resizedDir, { recursive: true });

    const resizedFilename = `${width}x${height}_${filename}`;
    const resizedPath = path.join(resizedDir, resizedFilename);

    await sharp(file_path)
      .resize(width, height, {
        fit: 'cover'
      })
      .toFile(resizedPath);

    logger.info(`Image redimensionnée: ${resizedFilename}`);

    res.json({
      message: 'Image redimensionnée',
      url: `/uploads/resized/${resizedFilename}`,
      width,
      height
    });

  } catch (error) {
    next(error);
  }
});

export default router;
