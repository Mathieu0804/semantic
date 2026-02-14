// src/lib/ai/codeGenerator.ts
// Générateur de code intelligent pour l'auto-modification

import { gemini } from '../gemini'

export interface GenerateRequest {
  prompt: string
  context: {
    existingFiles?: string[]
    targetFile?: string
    projectStructure?: any
  }
}

export interface GenerateResult {
  success: boolean
  code?: string
  filePath?: string
  action?: 'create' | 'modify' | 'delete'
  explanation?: string
  error?: string
}

/**
 * Générateur de code IA
 * Transforme des demandes en langage naturel en code React/Next.js
 */
export class AICodeGenerator {
  
  /**
   * Génère du code basé sur une demande utilisateur
   */
  async generate(request: GenerateRequest): Promise<GenerateResult> {
    try {
      // 1. Analyser la demande
      const analysis = await this.analyzeRequest(request.prompt)
      
      // 2. Générer le code approprié
      const code = await this.generateCode(analysis, request.context)
      
      // 3. Valider le code généré
      const validation = this.validateCode(code)
      
      if (!validation.valid) {
        return {
          success: false,
          error: `Code invalide: ${validation.errors.join(', ')}`
        }
      }
      
      return {
        success: true,
        code: code,
        filePath: analysis.targetFile,
        action: analysis.action,
        explanation: analysis.explanation
      }
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      }
    }
  }
  
  /**
   * Analyse une demande utilisateur
   */
  private async analyzeRequest(prompt: string): Promise<any> {
    const analysisPrompt = `
Analyse cette demande utilisateur et extrais les informations structurées.

DEMANDE: "${prompt}"

Réponds UNIQUEMENT avec un JSON au format suivant:
{
  "action": "create" | "modify" | "delete",
  "targetFile": "chemin/du/fichier",
  "component": "nom du composant",
  "modifications": {
    "type": "add_button" | "change_style" | "create_page" | etc,
    "details": {}
  },
  "explanation": "Explication de ce qui va être fait"
}

Exemples:
- "Ajoute un bouton rouge" → action: "modify", targetFile: "src/app/page.tsx", type: "add_button"
- "Crée une page contact" → action: "create", targetFile: "src/app/contact/page.tsx", type: "create_page"
`

    const response = await gemini.chat({
      messages: [{ role: 'user', content: analysisPrompt }],
      temperature: 0.3 // Basse température pour plus de précision
    })
    
    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Impossible d\'analyser la demande')
    }
    
    return JSON.parse(jsonMatch[0])
  }
  
  /**
   * Génère le code React/Next.js
   */
  private async generateCode(analysis: any, context: any): Promise<string> {
    const generationPrompt = this.buildGenerationPrompt(analysis, context)
    
    const response = await gemini.chat({
      messages: [{ role: 'user', content: generationPrompt }],
      temperature: 0.5
    })
    
    // Extraire le code de la réponse
    return this.extractCode(response)
  }
  
  /**
   * Construit le prompt de génération
   */
  private buildGenerationPrompt(analysis: any, context: any): string {
    return `
Tu es un expert développeur Next.js 15 avec TypeScript.

TÂCHE: ${analysis.action === 'create' ? 'Créer' : 'Modifier'} ${analysis.targetFile}

DEMANDE ORIGINALE: ${analysis.explanation}

CONTEXTE DU PROJET:
- Framework: Next.js 15 avec App Router
- Langage: TypeScript
- Styling: Tailwind CSS
- Composants existants: Button, Input, ChatBot

RÈGLES STRICTES:
1. Code TypeScript valide uniquement
2. Utiliser 'use client' si nécessaire (interactivité)
3. Imports corrects depuis @/components
4. Tailwind pour tous les styles
5. Code propre et commenté
6. Pas de console.log en production
7. Gestion d'erreurs appropriée

${analysis.action === 'create' ? `
STRUCTURE ATTENDUE POUR UNE PAGE:
\`\`\`typescript
'use client' // Si interactif

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ${this.getComponentName(analysis.targetFile)}() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Link href="/" className="text-blue-600">← Retour</Link>
          <h1 className="text-2xl font-bold mt-1">Titre</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Contenu ici */}
      </main>
    </div>
  )
}
\`\`\`
` : `
MODIFICATION À EFFECTUER:
${JSON.stringify(analysis.modifications, null, 2)}

Fournis UNIQUEMENT le code modifié complet du fichier.
`}

RÉPONDS UNIQUEMENT AVEC LE CODE, pas de texte avant ou après.
Commence directement par le code TypeScript.
`
  }
  
  /**
   * Extrait le code de la réponse IA
   */
  private extractCode(response: string): string {
    // Retirer les balises markdown si présentes
    let code = response.replace(/```typescript|```tsx|```jsx|```/g, '').trim()
    
    // S'assurer que le code commence par un import ou 'use client'
    if (!code.startsWith('import') && !code.startsWith("'use client'") && !code.startsWith('"use client"')) {
      // Probablement du texte avant le code, essayer de l'extraire
      const lines = code.split('\n')
      const codeStartIndex = lines.findIndex(line => 
        line.startsWith('import') || 
        line.includes("'use client'") ||
        line.includes('"use client"')
      )
      
      if (codeStartIndex !== -1) {
        code = lines.slice(codeStartIndex).join('\n')
      }
    }
    
    return code
  }
  
  /**
   * Valide le code généré
   */
  private validateCode(code: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    
    // Vérifications basiques
    if (!code || code.trim().length === 0) {
      errors.push('Code vide')
    }
    
    // Vérifier les imports dangereux
    const dangerousImports = ['fs', 'child_process', 'eval', 'Function']
    dangerousImports.forEach(imp => {
      if (code.includes(imp)) {
        errors.push(`Import dangereux détecté: ${imp}`)
      }
    })
    
    // Vérifier la structure basique
    if (code.includes('export default') === false && 
        code.includes('export function') === false &&
        code.includes('export const') === false) {
      errors.push('Pas d\'export trouvé')
    }
    
    // Vérifier les balances de crochets/parenthèses (basique)
    const openBraces = (code.match(/\{/g) || []).length
    const closeBraces = (code.match(/\}/g) || []).length
    if (openBraces !== closeBraces) {
      errors.push(`Accolades non équilibrées: ${openBraces} ouvrantes, ${closeBraces} fermantes`)
    }
    
    return {
      valid: errors.length === 0,
      errors
    }
  }
  
  /**
   * Extrait le nom du composant depuis le chemin
   */
  private getComponentName(filePath: string): string {
    const parts = filePath.split('/')
    const fileName = parts[parts.length - 2] || parts[parts.length - 1]
    return fileName.charAt(0).toUpperCase() + fileName.slice(1) + 'Page'
  }
}

// Export singleton
export const codeGenerator = new AICodeGenerator()

/**
 * Prompts spécialisés pour différents types de génération
 */
export const CODE_GENERATION_PROMPTS = {
  
  createPage: `
Tu crées une nouvelle page Next.js.
Structure: Header avec retour, titre, main avec contenu.
Style: Tailwind, moderne, responsive.
`,
  
  addButton: `
Tu ajoutes un bouton React.
Utilise le composant Button depuis @/components/ui/button.
Props: className pour le style, onClick pour l'action.
`,
  
  modifyForm: `
Tu modifies un formulaire existant.
Ajoute le champ demandé en respectant la structure.
Utilise Input depuis @/components/ui/input.
Met à jour formData et le handleSubmit.
`,
  
  createComponent: `
Tu crées un composant React réutilisable.
Export named ou default selon le contexte.
Props typées avec TypeScript.
Documentation JSDoc si complexe.
`
}
