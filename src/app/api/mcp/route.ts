// src/app/api/mcp/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chatWithAI } from '@/lib/ai'
import crypto from 'crypto'

// ============================================
// GET : Statut du serveur MCP
// ============================================

export async function GET(request: NextRequest) {
  try {
    let activeConnections = 0
    let totalRequests = 0

    try {
      activeConnections = await prisma.mCPConnection.count({
        where: { status: 'active' }
      })
    } catch (e) {
      // Table n'existe pas encore
      console.warn('[MCP] Table mcp_connections non disponible')
    }

    try {
      totalRequests = await prisma.mCPRequest.count()
    } catch (e) {
      console.warn('[MCP] Table mcp_requests non disponible')
    }

    return NextResponse.json({
      status: 'active',
      activeConnections,
      totalRequests,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('[MCP] GET error:', error)
    return NextResponse.json({
      status: 'active',
      activeConnections: 0,
      totalRequests: 0,
      warning: 'Database tables not fully initialized'
    })
  }
}

// ============================================
// POST : Actions MCP (connect, request)
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, clientName, clientType, token, endpoint, payload } = body

    // ===== ACTION : Connexion =====
    if (action === 'connect') {
      const rawToken = crypto.randomUUID()
      const hashedToken = crypto
        .createHash('sha256')
        .update(rawToken)
        .digest('hex')

      try {
        const connection = await prisma.mCPConnection.create({
          data: {
            clientName: clientName || 'Unknown',
            clientType: clientType || 'assistant',
            sessionId: `session-${Date.now()}`,
            token: hashedToken,
            status: 'active'
          }
        })

        return NextResponse.json({
          success: true,
          token: rawToken,
          sessionId: connection.sessionId
        })
      } catch (dbError) {
        // Fallback si table n'existe pas
        return NextResponse.json({
          success: true,
          token: rawToken,
          sessionId: `session-${Date.now()}`,
          warning: 'Connection not persisted (table missing)'
        })
      }
    }

    // ===== ACTION : Requête =====
    if (action === 'request') {
      if (!token) {
        return NextResponse.json(
          { error: 'Token requis' },
          { status: 401 }
        )
      }

      let response: any = {}

      if (endpoint === 'chat') {
        const messages = [
          { role: 'system', content: 'Tu es un assistant MCP pour PME.' },
          { role: 'user', content: payload?.message || 'Bonjour' }
        ]
        const aiResponse = await chatWithAI(messages)
        response = { message: aiResponse }
      } 
      else if (endpoint === 'products') {
        try {
          const products = await prisma.product.findMany({ take: 20 })
          response = { products }
        } catch {
          response = { products: [] }
        }
      }
      else if (endpoint === 'services') {
        try {
          const services = await prisma.service.findMany({ take: 20 })
          response = { services }
        } catch {
          response = { services: [] }
        }
      }
      else {
        response = { error: 'Endpoint inconnu', available: ['chat', 'products', 'services'] }
      }

      return NextResponse.json(response)
    }

    return NextResponse.json(
      { error: 'Action inconnue. Utilisez: connect, request' },
      { status: 400 }
    )

  } catch (error) {
    console.error('[MCP] POST error:', error)
    return NextResponse.json(
      { error: 'Erreur serveur MCP' },
      { status: 500 }
    )
  }
}