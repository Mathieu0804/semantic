// src/app/api/services/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ============================================
// GET : Liste des services
// ============================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: any = {}
    if (siteId) where.siteId = siteId
    if (status) where.status = status

    const services = await prisma.service.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      services,
      count: services.length
    })
  } catch (error) {
    console.error('[Services] GET error:', error)
    return NextResponse.json({
      success: true,
      services: [],
      warning: 'Database table not initialized'
    })
  }
}

// ============================================
// POST : Créer un service
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('[Services] Création:', body.name)

    const service = await prisma.service.create({
      data: {
        name: body.name || 'Nouveau service',
        description: body.description || '',
        shortDescription: body.shortDescription || '',
        basePrice: body.basePrice ? parseFloat(body.basePrice) : null,
        duration: body.duration || '',
        status: body.status || 'active',
        category: body.category || '',
        siteId: body.siteId || null
      }
    })

    console.log('[Services] Créé avec ID:', service.id)

    return NextResponse.json({
      success: true,
      service,
      message: 'Service créé avec succès'
    })
  } catch (error) {
    console.error('[Services] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création du service' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT : Modifier un service
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    console.log('[Services] Modification ID:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du service requis' },
        { status: 400 }
      )
    }

    const service = await prisma.service.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        shortDescription: data.shortDescription,
        basePrice: data.basePrice ? parseFloat(data.basePrice) : null,
        duration: data.duration,
        status: data.status,
        category: data.category
      }
    })

    console.log('[Services] Modifié:', service.id)

    return NextResponse.json({
      success: true,
      service,
      message: 'Service modifié avec succès'
    })
  } catch (error) {
    console.error('[Services] PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification du service' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE : Supprimer un service
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    console.log('[Services] Suppression ID:', id)

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID du service requis' },
        { status: 400 }
      )
    }

    await prisma.service.delete({
      where: { id }
    })

    console.log('[Services] Supprimé:', id)

    return NextResponse.json({
      success: true,
      message: 'Service supprimé avec succès'
    })
  } catch (error) {
    console.error('[Services] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression du service' },
      { status: 500 }
    )
  }
}