// src/app/api/produits/route.ts - CRUD Produits
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Liste tous les produits
export async function GET() {
  try {
    const produits = await prisma.produit.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    return NextResponse.json({
      success: true,
      data: produits
    })
  } catch (error: any) {
    console.error('Erreur GET produits:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

// POST - Créer un produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Vérifier qu'une entreprise existe
    const entreprise = await prisma.entreprise.findFirst()
    if (!entreprise) {
      return NextResponse.json(
        { success: false, error: 'Veuillez d\'abord configurer votre entreprise' },
        { status: 400 }
      )
    }
    
    // Générer un slug unique
    const slug = body.nom.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
    
    const produit = await prisma.produit.create({
      data: {
        entrepriseId: entreprise.id,
        nom: body.nom,
        description: body.description,
        prix: parseFloat(body.prix),
        prixPromo: body.prixPromo ? parseFloat(body.prixPromo) : null,
        devise: body.devise || 'EUR',
        categorie: body.categorie,
        tags: JSON.stringify(body.tags || []),
        stock: parseInt(body.stock) || 0,
        stockMin: parseInt(body.stockMin) || 5,
        enVente: body.enVente !== false,
        images: JSON.stringify(body.images || []),
        slug,
        metaDescription: body.metaDescription,
      }
    })
    
    return NextResponse.json({
      success: true,
      data: produit
    })
  } catch (error: any) {
    console.error('Erreur POST produit:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
