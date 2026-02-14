// src/app/api/ai/generate/route.ts
// API endpoint pour générer du code via IA

import { NextRequest, NextResponse } from 'next/server'
import { codeGenerator } from '@/lib/ai/codeGenerator'
import { fileManager } from '@/lib/builder/fileManager'

export async function POST(request: NextRequest) {
  try {
    const { prompt, applyImmediately } = await request.json()
    
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Prompt requis' },
        { status: 400 }
      )
    }
    
    // 1. Générer le code
    const result = await codeGenerator.generate({
      prompt,
      context: {
        // En production, passer la vraie structure du projet
        projectStructure: {}
      }
    })
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: result.error
      }, { status: 400 })
    }
    
    // 2. Si demandé, appliquer immédiatement
    let versionId: string | undefined
    
    if (applyImmediately && result.code && result.filePath && result.action) {
      const applyResult = await fileManager.applyOperation({
        action: result.action,
        filePath: result.filePath,
        code: result.code,
        description: result.explanation || prompt
      })
      
      if (!applyResult.success) {
        return NextResponse.json({
          success: false,
          error: `Code généré mais échec application: ${applyResult.error}`
        }, { status: 500 })
      }
      
      versionId = applyResult.versionId
    }
    
    return NextResponse.json({
      success: true,
      data: {
        code: result.code,
        filePath: result.filePath,
        action: result.action,
        explanation: result.explanation,
        versionId,
        applied: !!versionId
      }
    })
    
  } catch (error: any) {
    console.error('Erreur génération:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
