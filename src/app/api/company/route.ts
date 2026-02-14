// src/app/api/company/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ============================================
// GET : Récupérer l'identité entreprise
// ============================================

export async function GET() {
  try {
    const company = await prisma.companyIdentity.findFirst()
    
    return NextResponse.json({
      success: true,
      company: company || null
    })
  } catch (error) {
    console.error('[Company] GET error:', error)
    
    // Retourner une réponse par défaut si la table n'existe pas
    return NextResponse.json({
      success: true,
      company: null,
      warning: 'Database table not initialized'
    })
  }
}

// ============================================
// POST : Créer l'identité entreprise
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const company = await prisma.companyIdentity.create({
      data: {
        name: body.name || 'Mon Entreprise',
        description: body.description || '',
        slogan: body.slogan || '',
        email: body.email || '',
        phone: body.phone || '',
        address: body.address || '',
        city: body.city || '',
        postalCode: body.postalCode || '',
        country: body.country || 'France',
        primaryColor: body.primaryColor || '#3B82F6',
        secondaryColor: body.secondaryColor || '#1E40AF',
        metaTitle: body.metaTitle || '',
        metaDescription: body.metaDescription || ''
      }
    })
    
    return NextResponse.json({
      success: true,
      company
    })
  } catch (error) {
    console.error('[Company] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT : Mettre à jour l'identité entreprise
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Chercher l'entreprise existante
    let company = await prisma.companyIdentity.findFirst()
    
    if (company) {
      // Mettre à jour
      company = await prisma.companyIdentity.update({
        where: { id: company.id },
        data: body
      })
    } else {
      // Créer si n'existe pas
      company = await prisma.companyIdentity.create({
        data: {
          name: body.name || 'Mon Entreprise',
          description: body.description || '',
          ...body
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      company
    })
  } catch (error) {
    console.error('[Company] PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la mise à jour' },
      { status: 500 }
    )
  }
}