// src/app/api/products/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// ============================================
// GET : Liste des produits
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

    const products = await prisma.product.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      products,
      count: products.length
    })
  } catch (error) {
    console.error('[Products] GET error:', error)
    return NextResponse.json({
      success: true,
      products: [],
      warning: 'Database table not initialized'
    })
  }
}

// ============================================
// POST : Créer un produit
// ============================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || '',
        price: body.price ? parseFloat(body.price) : null,
        sku: body.sku || '',
        stock: body.stock ? parseInt(body.stock) : 0,
        status: body.status || 'active',
        siteId: body.siteId
      }
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('[Products] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la création' },
      { status: 500 }
    )
  }
}

// ============================================
// PUT : Modifier un produit
// ============================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    const product = await prisma.product.update({
      where: { id },
      data
    })

    return NextResponse.json({
      success: true,
      product
    })
  } catch (error) {
    console.error('[Products] PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la modification' },
      { status: 500 }
    )
  }
}

// ============================================
// DELETE : Supprimer un produit
// ============================================

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID requis' },
        { status: 400 }
      )
    }

    await prisma.product.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé'
    })
  } catch (error) {
    console.error('[Products] DELETE error:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors de la suppression' },
      { status: 500 }
    )
  }
}