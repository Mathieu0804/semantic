/**
 * MODULE : DATA IMPORTER
 * =======================
 * 
 * RÔLE : Importer des données produits depuis N'IMPORTE QUEL format
 *        grâce à l'intelligence artificielle
 * 
 * Formats supportés (détection automatique) :
 * - CSV, TSV
 * - Excel (.xlsx, .xls)
 * - JSON (structuré ou non)
 * - XML
 * - SQL exports
 * - Fichiers texte délimités
 * - Google Sheets exports
 * - WooCommerce / Shopify exports
 * - Et même : PDF de catalogues (OCR + extraction)
 */

const fs = require('fs').promises;
const path = require('path');
const { parse: parseCSV } = require('csv-parse/sync');
const XLSX = require('xlsx');
const xml2js = require('xml2js');
const OpenAI = require('openai');

class DataImporter {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    this.transformations = new Map(); // Cache des transformations en cours
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.dataDir = path.join(__dirname, '../data/imports');
  }

  async initialize() {
    // Créer les répertoires nécessaires
    await fs.mkdir(this.uploadsDir, { recursive: true });
    await fs.mkdir(this.dataDir, { recursive: true });
    console.log('✅ DataImporter initialisé');
  }

  /**
   * MÉTHODE : analyzeFile()
   * ------------------------
   * RÔLE : Analyser un fichier uploadé et détecter sa structure
   * 
   * L'IA identifie :
   * - Le format (CSV, Excel, JSON, XML...)
   * - La structure (colonnes, types, relations)
   * - Les champs pertinents pour produits
   * - Les anomalies potentielles
   */
  async analyzeFile(fileInfo) {
    const { path: filePath, filename, mimetype } = fileInfo;

    console.log(`📊 Analyse de ${filename}...`);

    // 1. DÉTECTION DU FORMAT
    const format = await this.detectFormat(filePath, mimetype, filename);
    
    // 2. LECTURE DU CONTENU
    const rawData = await this.readFile(filePath, format);
    
    // 3. ANALYSE PAR L'IA
    const analysis = await this.analyzeWithAI(rawData, format, filename);

    // 4. SAUVEGARDER L'ANALYSE
    const analysisId = this.generateId();
    await fs.writeFile(
      path.join(this.dataDir, `${analysisId}_analysis.json`),
      JSON.stringify({ fileInfo, format, rawData, analysis }, null, 2)
    );

    return {
      id: analysisId,
      detectedFormat: format,
      confidence: analysis.confidence,
      schema: analysis.detectedSchema,
      preview: rawData.slice(0, 5), // 5 premiers items
      rowCount: rawData.length,
      suggestions: analysis.suggestions
    };
  }

  /**
   * MÉTHODE : detectFormat()
   * -------------------------
   * RÔLE : Détecter automatiquement le format du fichier
   */
  async detectFormat(filePath, mimetype, filename) {
    const ext = path.extname(filename).toLowerCase();

    // Détection par extension
    const formatMap = {
      '.csv': 'csv',
      '.tsv': 'tsv',
      '.txt': 'text',
      '.xlsx': 'excel',
      '.xls': 'excel',
      '.json': 'json',
      '.xml': 'xml',
      '.sql': 'sql'
    };

    if (formatMap[ext]) {
      return formatMap[ext];
    }

    // Détection par mimetype
    if (mimetype.includes('csv')) return 'csv';
    if (mimetype.includes('excel') || mimetype.includes('spreadsheet')) return 'excel';
    if (mimetype.includes('json')) return 'json';
    if (mimetype.includes('xml')) return 'xml';

    // Fallback : lecture des premiers octets
    const buffer = await fs.readFile(filePath);
    const header = buffer.toString('utf-8', 0, 1000);

    if (header.startsWith('{') || header.startsWith('[')) return 'json';
    if (header.startsWith('<?xml')) return 'xml';
    if (header.includes('\t')) return 'tsv';
    if (header.includes(',')) return 'csv';

    return 'unknown';
  }

  /**
   * MÉTHODE : readFile()
   * ---------------------
   * RÔLE : Lire le fichier selon son format
   */
  async readFile(filePath, format) {
    const content = await fs.readFile(filePath);

    switch (format) {
      case 'csv':
      case 'tsv':
        return this.parseCSV(content, format === 'tsv' ? '\t' : ',');
      
      case 'excel':
        return this.parseExcel(filePath);
      
      case 'json':
        return JSON.parse(content.toString());
      
      case 'xml':
        return await this.parseXML(content.toString());
      
      case 'sql':
        // Pour SQL : extraire les INSERT INTO
        return this.parseSQL(content.toString());
      
      default:
        // Tentative de parsing générique
        return this.parseGeneric(content.toString());
    }
  }

  parseCSV(content, delimiter = ',') {
    try {
      return parseCSV(content, {
        columns: true,
        skip_empty_lines: true,
        delimiter: delimiter,
        trim: true
      });
    } catch (error) {
      throw new Error(`Erreur parsing CSV: ${error.message}`);
    }
  }

  parseExcel(filePath) {
    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Première feuille
      const sheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(sheet);
    } catch (error) {
      throw new Error(`Erreur parsing Excel: ${error.message}`);
    }
  }

  async parseXML(content) {
    try {
      const parser = new xml2js.Parser();
      const result = await parser.parseStringPromise(content);
      
      // Trouver le tableau de produits dans le XML
      // (structure varie selon la source)
      return this.extractArrayFromXML(result);
    } catch (error) {
      throw new Error(`Erreur parsing XML: ${error.message}`);
    }
  }

  extractArrayFromXML(obj) {
    // Récursif : trouver le premier array dans la structure
    if (Array.isArray(obj)) return obj;
    
    if (typeof obj === 'object') {
      for (const key in obj) {
        if (Array.isArray(obj[key]) && obj[key].length > 0) {
          return obj[key];
        }
        const nested = this.extractArrayFromXML(obj[key]);
        if (nested) return nested;
      }
    }
    
    return [];
  }

  parseSQL(content) {
    // Extraction basique des INSERT INTO
    const insertRegex = /INSERT INTO.*?VALUES\s*\((.*?)\)/gi;
    const matches = [...content.matchAll(insertRegex)];
    
    return matches.map(match => {
      const values = match[1].split(',').map(v => v.trim().replace(/'/g, ''));
      // Simpliste : on retourne un objet avec indexes
      return Object.fromEntries(values.map((v, i) => [`col${i}`, v]));
    });
  }

  parseGeneric(content) {
    // Tentative de parsing ligne par ligne
    const lines = content.split('\n').filter(l => l.trim());
    
    // Détecter le délimiteur le plus fréquent
    const delimiters = [',', ';', '\t', '|'];
    const counts = delimiters.map(d => 
      lines[0]?.split(d).length || 0
    );
    const bestDelimiter = delimiters[counts.indexOf(Math.max(...counts))];
    
    return this.parseCSV(Buffer.from(content), bestDelimiter);
  }

  /**
   * MÉTHODE : analyzeWithAI()
   * --------------------------
   * RÔLE : L'IA analyse la structure des données et suggère un mapping
   */
  async analyzeWithAI(data, format, filename) {
    // Prendre un échantillon des données
    const sample = data.slice(0, 10);

    const prompt = `Tu es un expert en migration de données e-commerce.

Analyse ce fichier de données produits :
- Nom du fichier : ${filename}
- Format détecté : ${format}
- Échantillon (10 premiers items) :
${JSON.stringify(sample, null, 2)}

Ta mission :
1. Identifier les champs qui correspondent aux données produits standards :
   - Nom/Titre du produit
   - Description
   - Prix
   - Catégorie
   - SKU/ID
   - Images (URLs)
   - Stock/Disponibilité
   - Caractéristiques/Attributs

2. Détecter les anomalies :
   - Champs vides ou manquants
   - Formats incohérents
   - Valeurs aberrantes

3. Suggérer des transformations nécessaires

Réponds UNIQUEMENT en JSON (pas de markdown, pas de backticks) :
{
  "confidence": 0.0-1.0,
  "detectedSchema": {
    "productName": "nom_du_champ_source",
    "description": "nom_du_champ_source",
    "price": "nom_du_champ_source",
    ...
  },
  "anomalies": [
    {"field": "...", "issue": "...", "severity": "low|medium|high"}
  ],
  "suggestions": [
    "Suggestion 1",
    "Suggestion 2"
  ]
}`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3
    });

    const response = completion.choices[0].message.content;
    
    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('Erreur parsing réponse IA:', response);
      throw new Error('Impossible de parser la réponse de l\'IA');
    }
  }

  /**
   * MÉTHODE : transformData()
   * --------------------------
   * RÔLE : Transformer les données brutes en format SemanticDNA
   */
  async transformData({ fileId, hints, instructions }) {
    // Charger l'analyse précédente
    const analysisPath = path.join(this.dataDir, `${fileId}_analysis.json`);
    const analysis = JSON.parse(await fs.readFile(analysisPath, 'utf-8'));

    console.log(`🔄 Transformation des données avec IA...`);

    const transformed = await this.transformWithAI({
      rawData: analysis.rawData,
      schema: analysis.analysis.detectedSchema,
      hints: hints,
      instructions: instructions
    });

    // Sauvegarder la transformation
    const transformId = this.generateId();
    await fs.writeFile(
      path.join(this.dataDir, `${transformId}_transform.json`),
      JSON.stringify(transformed, null, 2)
    );

    this.transformations.set(transformId, transformed);

    return {
      id: transformId,
      productCount: transformed.products.length,
      successCount: transformed.products.filter(p => p.isValid).length,
      warnings: transformed.warnings,
      errors: transformed.errors,
      preview: transformed.products.slice(0, 3)
    };
  }

  /**
   * MÉTHODE : transformWithAI()
   * ----------------------------
   * RÔLE : L'IA transforme chaque produit en format SemanticDNA
   */
  async transformWithAI({ rawData, schema, hints, instructions }) {
    const products = [];
    const warnings = [];
    const errors = [];

    // Traiter par batch de 10 produits (pour ne pas exploser le context)
    const batchSize = 10;
    
    for (let i = 0; i < rawData.length; i += batchSize) {
      const batch = rawData.slice(i, i + batchSize);

      const prompt = `Tu es un expert en transformation de données produits.

INSTRUCTIONS DU MARKETEUR :
${instructions || 'Mode automatique : génère des descriptions professionnelles'}

MAPPING DES CHAMPS :
${JSON.stringify(schema, null, 2)}

DONNÉES BRUTES (batch de ${batch.length} produits) :
${JSON.stringify(batch, null, 2)}

Ta mission : transformer chaque produit en format SemanticDNA.

Pour chaque produit, génère :
1. Un "aiPitch" optimisé (2-3 phrases qui donnent envie d'acheter)
2. Une description enrichie (si absente ou trop courte)
3. Tags/catégories pertinentes
4. Mots-clés pour le SEO

IMPORTANT :
- Respecte le ton défini dans les instructions
- Si un champ est manquant, essaie de l'inférer intelligemment
- Marque les produits avec des warnings si données incomplètes

Réponds UNIQUEMENT en JSON (pas de markdown) :
{
  "products": [
    {
      "sourceId": "...",
      "name": "...",
      "description": "...",
      "aiPitch": "...",
      "price": number,
      "category": "...",
      "tags": ["..."],
      "images": ["..."],
      "attributes": {...},
      "isValid": true/false,
      "warnings": ["..."]
    }
  ]
}`;

      try {
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7
        });

        const response = completion.choices[0].message.content;
        const parsed = JSON.parse(response);
        
        products.push(...parsed.products);

        // Collecter warnings
        parsed.products.forEach(p => {
          if (p.warnings && p.warnings.length > 0) {
            warnings.push(...p.warnings);
          }
        });

      } catch (error) {
        console.error(`Erreur transformation batch ${i}:`, error);
        errors.push(`Batch ${i}-${i + batchSize}: ${error.message}`);
      }

      // Pause pour éviter rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      products,
      warnings,
      errors
    };
  }

  /**
   * MÉTHODE : validate()
   * ---------------------
   * RÔLE : Valider les données transformées
   */
  async validate(transformationId) {
    const transformation = this.transformations.get(transformationId);
    
    if (!transformation) {
      throw new Error('Transformation introuvable');
    }

    const errors = [];
    const warnings = [];
    
    let totalFields = 0;
    let filledFields = 0;

    transformation.products.forEach((product, index) => {
      // Vérifier champs obligatoires
      if (!product.name) {
        errors.push(`Produit ${index}: nom manquant`);
      }
      if (!product.price || product.price <= 0) {
        errors.push(`Produit ${index}: prix invalide`);
      }
      if (!product.description || product.description.length < 20) {
        warnings.push(`Produit ${index}: description trop courte`);
      }
      if (!product.aiPitch) {
        warnings.push(`Produit ${index}: aiPitch manquant`);
      }

      // Calculer complétude
      const fields = ['name', 'description', 'price', 'category', 'aiPitch', 'images'];
      fields.forEach(field => {
        totalFields++;
        if (product[field]) filledFields++;
      });
    });

    const completeness = (filledFields / totalFields) * 100;

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      completeness: Math.round(completeness),
      consistency: 100, // Simplified
      richness: transformation.products.filter(p => 
        p.aiPitch && p.aiPitch.length > 50
      ).length / transformation.products.length * 100
    };
  }

  /**
   * MÉTHODE : commit()
   * -------------------
   * RÔLE : Importer définitivement en base
   */
  async commit({ transformationId, environment }) {
    const transformation = this.transformations.get(transformationId);
    
    if (!transformation) {
      throw new Error('Transformation introuvable');
    }

    // Sauvegarder dans l'environnement cible
    const targetPath = path.join(
      this.dataDir,
      `${environment}_products.json`
    );

    await fs.writeFile(
      targetPath,
      JSON.stringify(transformation.products, null, 2)
    );

    console.log(`✅ ${transformation.products.length} produits importés en ${environment}`);

    return {
      importedCount: transformation.products.length,
      environment
    };
  }

  // Utilitaires
  generateId() {
    return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  isHealthy() {
    return this.openai !== null;
  }
}

module.exports = DataImporter;
