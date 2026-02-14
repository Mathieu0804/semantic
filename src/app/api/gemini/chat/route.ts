// src/app/api/gemini/chat/route.ts - Endpoint chat avec Gemini
import { NextRequest, NextResponse } from 'next/server'
import { gemini, SYSTEM_PROMPTS } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const { messages, context } = await request.json()

    // Vérifier que Gemini est configuré
    if (!gemini.isAvailable()) {
      return NextResponse.json(
        {
          success: false,
          error: 'Gemini API non configurée. Vérifiez GEMINI_API_KEY dans les variables d\'environnement.'
        },
        { status: 500 }
      )
    }

    // Sélectionner le prompt système selon le contexte
    const systemPrompt = SYSTEM_PROMPTS[context as keyof typeof SYSTEM_PROMPTS] || SYSTEM_PROMPTS.generationSite

    // Préparer les messages avec le contexte système
    const fullMessages = [
      { 
        role: 'user' as const, 
        content: `${systemPrompt}\n\n---\n\n${messages[0]?.content || 'Bonjour'}` 
      },
      ...messages.slice(1)
    ]

    // Appeler Gemini
    const response = await gemini.chat({
      messages: fullMessages,
      temperature: 0.7
    })

    return NextResponse.json({
      success: true,
      response
    })
  } catch (error: any) {
    console.error('Erreur Gemini:', error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// Support pour GET (vérification status)
export async function GET() {
  const isAvailable = gemini.isAvailable()
  
  return NextResponse.json({
    service: 'Gemini API',
    available: isAvailable,
    model: process.env.GEMINI_MODEL || 'gemini-pro',
    message: isAvailable 
      ? 'Gemini API est configurée et prête' 
      : 'GEMINI_API_KEY manquante'
  })
}
