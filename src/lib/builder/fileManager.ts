// src/lib/builder/fileManager.ts
// Gestion sécurisée des fichiers de l'application

import { prisma } from '../db'

export interface FileOperation {
  action: 'create' | 'modify' | 'delete'
  filePath: string
  code: string
  description: string
}

export interface FileOperationResult {
  success: boolean
  versionId?: string
  error?: string
}

/**
 * Gestionnaire de fichiers avec versioning
 * ATTENTION: En production, utiliser un système de fichiers réel
 * Cette version utilise la BDD pour la démo
 */
export class FileManager {
  
  /**
   * Applique une opération sur un fichier
   */
  async applyOperation(operation: FileOperation): Promise<FileOperationResult> {
    try {
      // 1. Valider l'opération
      const validation = this.validateOperation(operation)
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error
        }
      }
      
      // 2. Obtenir la version actuelle si modification
      let currentVersion = 0
      if (operation.action === 'modify') {
        const latest = await this.getLatestVersion(operation.filePath)
        currentVersion = latest?.version || 0
      }
      
      // 3. Créer une nouvelle version
      const version = await prisma.componentVersion.create({
        data: {
          filePath: operation.filePath,
          fileName: this.extractFileName(operation.filePath),
          code: operation.code,
          description: operation.description,
          version: currentVersion + 1,
          metadata: JSON.stringify({
            action: operation.action,
            timestamp: new Date().toISOString()
          })
        }
      })
      
      // 4. Logger l'action
      await prisma.builderAction.create({
        data: {
          action: operation.action,
          target: operation.filePath,
          prompt: operation.description,
          code: operation.code,
          applied: true,
          success: true,
          versionId: version.id
        }
      })
      
      // 5. En production: écrire le fichier réellement
      // await fs.writeFile(operation.filePath, operation.code)
      
      return {
        success: true,
        versionId: version.id
      }
      
    } catch (error: any) {
      // Logger l'échec
      await prisma.builderAction.create({
        data: {
          action: operation.action,
          target: operation.filePath,
          prompt: operation.description,
          code: operation.code,
          applied: false,
          success: false,
          error: error.message
        }
      })
      
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  /**
   * Valide une opération de fichier
   */
  private validateOperation(operation: FileOperation): { valid: boolean; error?: string } {
    // Chemins autorisés uniquement
    const allowedPaths = [
      'src/app/',
      'src/components/',
      'src/lib/'
    ]
    
    const isAllowed = allowedPaths.some(path => operation.filePath.startsWith(path))
    if (!isAllowed) {
      return {
        valid: false,
        error: `Chemin non autorisé: ${operation.filePath}`
      }
    }
    
    // Interdire certains fichiers critiques
    const forbiddenFiles = [
      'layout.tsx', // Layout racine
      'gemini.ts', // Client IA
      'db.ts', // Client BDD
      'schema.prisma' // Schéma BDD
    ]
    
    const fileName = this.extractFileName(operation.filePath)
    if (forbiddenFiles.includes(fileName)) {
      return {
        valid: false,
        error: `Fichier protégé: ${fileName}`
      }
    }
    
    // Vérifier que le code ne contient pas de contenu dangereux
    const dangerousPatterns = [
      'eval(',
      'Function(',
      'require(',
      'process.env',
      '__dirname',
      'fs.readFile',
      'fs.writeFile',
      'child_process'
    ]
    
    for (const pattern of dangerousPatterns) {
      if (operation.code.includes(pattern)) {
        return {
          valid: false,
          error: `Pattern dangereux détecté: ${pattern}`
        }
      }
    }
    
    return { valid: true }
  }
  
  /**
   * Récupère la dernière version d'un fichier
   */
  async getLatestVersion(filePath: string) {
    return await prisma.componentVersion.findFirst({
      where: { filePath },
      orderBy: { version: 'desc' }
    })
  }
  
  /**
   * Récupère l'historique d'un fichier
   */
  async getHistory(filePath: string) {
    return await prisma.componentVersion.findMany({
      where: { filePath },
      orderBy: { createdAt: 'desc' }
    })
  }
  
  /**
   * Rollback vers une version précédente
   */
  async rollback(versionId: string): Promise<FileOperationResult> {
    try {
      const version = await prisma.componentVersion.findUnique({
        where: { id: versionId }
      })
      
      if (!version) {
        return {
          success: false,
          error: 'Version introuvable'
        }
      }
      
      // Créer une nouvelle version avec le code de l'ancienne
      return await this.applyOperation({
        action: 'modify',
        filePath: version.filePath,
        code: version.code,
        description: `Rollback vers version ${version.version}`
      })
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  /**
   * Liste tous les fichiers modifiés
   */
  async listModifiedFiles() {
    const files = await prisma.componentVersion.groupBy({
      by: ['filePath', 'fileName'],
      _max: {
        version: true,
        createdAt: true
      }
    })
    
    return files.map(f => ({
      filePath: f.filePath,
      fileName: f.fileName,
      latestVersion: f._max.version,
      lastModified: f._max.createdAt
    }))
  }
  
  /**
   * Obtient les statistiques du builder
   */
  async getStats() {
    const [totalActions, totalVersions, successRate] = await Promise.all([
      prisma.builderAction.count(),
      prisma.componentVersion.count(),
      prisma.builderAction.aggregate({
        where: { success: true },
        _count: true
      })
    ])
    
    return {
      totalActions,
      totalVersions,
      successRate: totalActions > 0 ? (successRate._count / totalActions) * 100 : 0
    }
  }
  
  /**
   * Extrait le nom du fichier depuis le chemin
   */
  private extractFileName(filePath: string): string {
    return filePath.split('/').pop() || filePath
  }
}

// Export singleton
export const fileManager = new FileManager()
