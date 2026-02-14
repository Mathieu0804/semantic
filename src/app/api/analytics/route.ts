// src/app/api/analytics/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET : Statistiques
export async function GET() {
  try {
    let productsCount = 0
    let servicesCount = 0
    let dialoguesCount = 0
    let visitorsCount = 0

    try { productsCount = await prisma.product.count() } catch {}
    try { servicesCount = await prisma.service.count() } catch {}
    try { dialoguesCount = await prisma.dialogue.count() } catch {}
    try { visitorsCount = await prisma.visitorAnalytics.count() } catch {}

    let recentDialogues: any[] = []
    try {
      recentDialogues = await prisma.dialogue.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    } catch {}

    return NextResponse.json({
      success: true,
      stats: { products: productsCount, services: servicesCount, dialogues: dialoguesCount, visitors: visitorsCount },
      recentDialogues
    })
  } catch (error) {
    return NextResponse.json({
      success: true,
      stats: { products: 0, services: 0, dialogues: 0, visitors: 0 },
      recentDialogues: []
    })
  }
}

// POST : Enregistrer une visite
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const analytics = await prisma.visitorAnalytics.create({
      data: {
        visitorId: body.visitorId || `visitor-${Date.now()}`,
        sessionId: body.sessionId || `session-${Date.now()}`,
        deviceType: body.deviceType || 'unknown',
        entryPage: body.page || '/',  // ← CORRECTION
        referrer: body.referrer || ''
      }
    })

    return NextResponse.json({ success: true, analytics })
  } catch (error) {
    return NextResponse.json({ success: true, warning: 'Analytics not recorded' })
  }
}