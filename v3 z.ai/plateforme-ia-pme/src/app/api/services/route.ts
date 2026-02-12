import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Récupérer les services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Prisma.ServiceWhereInput = {};
    if (siteId) where.siteId = siteId;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des services' }, { status: 500 });
  }
}

// POST - Créer un service
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      siteId,
      name,
      description,
      shortDescription,
      reference,
      basePrice,
      currency,
      pricingType,
      duration,
      images,
      mainImage,
      category,
      tags,
      metaTitle,
      metaDescription,
      featured,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du service est requis' }, { status: 400 });
    }

    const service = await prisma.service.create({
      data: {
        siteId: siteId || 'default',
        name,
        description,
        shortDescription,
        reference,
        basePrice: basePrice ? parseFloat(basePrice) : null,
        currency: currency || 'EUR',
        pricingType: pricingType || 'fixed',
        duration,
        images: images ? JSON.stringify(images) : null,
        mainImage,
        category,
        tags: tags ? JSON.stringify(tags) : null,
        metaTitle,
        metaDescription,
        featured: featured || false,
      },
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error creating service:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du service' }, { status: 500 });
  }
}

// PUT - Modifier un service
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du service requis' }, { status: 400 });
    }

    const updateData: Prisma.ServiceUpdateInput = { ...data };
    if (data.basePrice !== undefined) updateData.basePrice = data.basePrice ? parseFloat(data.basePrice) : null;
    if (data.images) updateData.images = JSON.stringify(data.images);
    if (data.tags) updateData.tags = JSON.stringify(data.tags);

    const service = await prisma.service.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ service });
  } catch (error) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification du service' }, { status: 500 });
  }
}

// DELETE - Supprimer un service
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du service requis' }, { status: 400 });
    }

    await prisma.service.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du service' }, { status: 500 });
  }
}
