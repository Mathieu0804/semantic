import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Récupérer les produits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Prisma.ProductWhereInput = {};
    if (siteId) where.siteId = siteId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des produits' }, { status: 500 });
  }
}

// POST - Créer un produit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      siteId,
      name,
      description,
      shortDescription,
      reference,
      sku,
      price,
      currency,
      discountPrice,
      taxRate,
      images,
      mainImage,
      category,
      subcategory,
      tags,
      stock,
      stockStatus,
      minOrder,
      metaTitle,
      metaDescription,
      featured,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du produit est requis' }, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        siteId: siteId || 'default',
        name,
        description,
        shortDescription,
        reference,
        sku,
        price: price ? parseFloat(price) : null,
        currency: currency || 'EUR',
        discountPrice: discountPrice ? parseFloat(discountPrice) : null,
        taxRate: taxRate ? parseFloat(taxRate) : 20.0,
        images: images ? JSON.stringify(images) : null,
        mainImage,
        category,
        subcategory,
        tags: tags ? JSON.stringify(tags) : null,
        stock: stock ? parseInt(stock) : null,
        stockStatus: stockStatus || 'in_stock',
        minOrder: minOrder ? parseInt(minOrder) : 1,
        metaTitle,
        metaDescription,
        featured: featured || false,
      },
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du produit' }, { status: 500 });
  }
}

// PUT - Modifier un produit
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 });
    }

    const updateData: Prisma.ProductUpdateInput = { ...data };
    if (data.price !== undefined) updateData.price = data.price ? parseFloat(data.price) : null;
    if (data.discountPrice !== undefined) updateData.discountPrice = data.discountPrice ? parseFloat(data.discountPrice) : null;
    if (data.taxRate !== undefined) updateData.taxRate = data.taxRate ? parseFloat(data.taxRate) : null;
    if (data.stock !== undefined) updateData.stock = data.stock ? parseInt(data.stock) : null;
    if (data.images) updateData.images = JSON.stringify(data.images);
    if (data.tags) updateData.tags = JSON.stringify(data.tags);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification du produit' }, { status: 500 });
  }
}

// DELETE - Supprimer un produit
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du produit requis' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du produit' }, { status: 500 });
  }
}
