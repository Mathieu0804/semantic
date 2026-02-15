'use server'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ========================================================
// GET - Récupérer l'entreprise (singleton id: 1)
// ========================================================
export async function GET() {
  try {
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: 1 }
    })

    return NextResponse.json({
      success: true,
      data: entreprise
    })
  } catch (error: any) {
    console.error('Erreur GET entreprise:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// ========================================================
// POST - Créer ou mettre à jour l'entreprise (singleton)
// ========================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const entreprise = await prisma.entreprise.upsert({
      where: { id: 1 },
      update: {
        nom: body.nom,
        slogan: body.slogan,
        email: body.email,
        telephone: body.telephone,
        adresse: body.adresse,
        descriptionBreve: body.descriptionBreve,
        descriptionLongue: body.descriptionLongue,
        logo: body.logo,
        couleurPrimaire: body.couleurPrimaire || '#3B82F6',
        couleurSecondaire: body.couleurSecondaire || '#10B981',
        reseauxSociaux: JSON.stringify(body.reseauxSociaux || {}),
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        keywords: JSON.stringify(body.keywords || []),
      },
      create: {
        id: 1, // 👈 Id unique obligatoire
        nom: body.nom,
        slogan: body.slogan,
        email: body.email,
        telephone: body.telephone,
        adresse: body.adresse,
        descriptionBreve: body.descriptionBreve,
        descriptionLongue: body.descriptionLongue,
        logo: body.logo,
        couleurPrimaire: body.couleurPrimaire || '#3B82F6',
        couleurSecondaire: body.couleurSecondaire || '#10B981',
        reseauxSociaux: JSON.stringify(body.reseauxSociaux || {}),
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        keywords: JSON.stringify(body.keywords || []),
      }
    })

    return NextResponse.json({
      success: true,
      data: entreprise
    })
  } catch (error: any) {
    console.error('Erreur POST entreprise:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
