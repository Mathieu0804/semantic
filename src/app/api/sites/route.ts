import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Récupérer les sites
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const status = searchParams.get('status');

    const where: Prisma.SiteWhereInput = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const sites = await prisma.site.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        pages: {
          orderBy: { order: 'asc' },
        },
        _count: {
          select: { products: true, services: true },
        },
      },
    });

    return NextResponse.json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des sites' }, { status: 500 });
  }
}

// POST - Créer un site
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, domain, description, theme, language, htmlContent, cssContent, jsContent } = body;

    if (!name) {
      return NextResponse.json({ error: 'Le nom du site est requis' }, { status: 400 });
    }

    const site = await prisma.site.create({
      data: {
        userId: userId || 'default',
        name,
        domain,
        description,
        theme: theme || 'modern',
        language: language || 'fr',
        htmlContent,
        cssContent,
        jsContent,
        status: 'draft',
      },
    });

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error creating site:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du site' }, { status: 500 });
  }
}

// PUT - Mettre à jour un site
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID du site requis' }, { status: 400 });
    }

    const updateData: Prisma.SiteUpdateInput = { ...data };

    // Si status est 'published', mettre à jour publishedAt
    if (data.status === 'published' && !data.publishedAt) {
      updateData.publishedAt = new Date();
    }

    const site = await prisma.site.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ site });
  } catch (error) {
    console.error('Error updating site:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour du site' }, { status: 500 });
  }
}

// DELETE - Supprimer un site
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID du site requis' }, { status: 400 });
    }

    await prisma.site.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting site:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression du site' }, { status: 500 });
  }
}
