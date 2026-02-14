// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { chatWithAI } from '@/lib/ai'
import { prisma } from '@/lib/db'

// ============================================
// POST : Envoyer un message au chatbot
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, sessionId, history = [] } = body

    console.log('[Chat] Message reçu:', message?.substring(0, 50))

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message requis' },
        { status: 400 }
      )
    }

    // Construire les messages pour l'IA
    const messages = [
      {
        role: 'system',
        content: `Tu es un assistant IA professionnel pour une PME française. 
Tu aides les visiteurs à créer des sites web, comprendre les produits et services, 
et répondre à leurs questions. Sois amical, professionnel et concis.
Réponds toujours en français.`
      },
      ...history.map((h: any) => ({
        role: h.role || 'user',
        content: h.content
      })),
      {
        role: 'user',
        content: message
      }
    ]

    // Appeler l'IA (Gemini ou démo)
    const response = await chatWithAI(messages)

    // Sauvegarder le dialogue (optionnel, avec gestion d'erreur)
    try {
      await prisma.dialogue.create({
        data: {
          sessionId: sessionId || `session-${Date.now()}`,
          userMessage: message,
          aiResponse: response,
          source: 'chat',
          type: 'user'
        }
      })
      console.log('[Chat] Dialogue sauvegardé')
    } catch (dbError: any) {
      // Si la table n'existe pas, on continue
      console.warn('[Chat] Impossible de sauvegarder:', dbError?.message || dbError)
    }

    return NextResponse.json({
      success: true,
      response,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[Chat] API error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors du traitement du message',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    )
  }
}

// ============================================
// GET : Statut de l'API
// ============================================

export async function GET() {
  return NextResponse.json({
    status: 'Chat API running',
    timestamp: new Date().toISOString()
  })
}