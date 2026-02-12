import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { analyzePatterns } from '@/lib/ai';
import { Prisma } from '@prisma/client';

// GET - Récupérer les analytics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Dashboard overview
    if (!action || action === 'overview') {
      const totalProducts = await prisma.product.count();
      const totalServices = await prisma.service.count();
      const totalDialogues = await prisma.dialogue.count({
        where: { createdAt: { gte: startDate } },
      });
      const totalVisitors = await prisma.visitorAnalytics.count({
        where: { createdAt: { gte: startDate } },
      });
      const totalPatterns = await prisma.pattern.count();

      // Dialogues par jour - Utiliser une requête paramétrée
      const dialoguesByDay = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
        SELECT date(createdAt) as date, COUNT(*) as count
        FROM dialogues
        WHERE createdAt >= ${startDate.toISOString()}
        GROUP BY date(createdAt)
        ORDER BY date DESC
      `;

      // Répartition par type de device
      const deviceStats = await prisma.$queryRaw<{ deviceType: string; count: bigint }[]>`
        SELECT deviceType, COUNT(*) as count
        FROM visitor_analytics
        WHERE createdAt >= ${startDate.toISOString()}
        GROUP BY deviceType
      `;

      // Top pages visitées
      const topPages = await prisma.$queryRaw<{ entryPage: string; count: bigint }[]>`
        SELECT entryPage, COUNT(*) as count
        FROM visitor_analytics
        WHERE createdAt >= ${startDate.toISOString()}
        GROUP BY entryPage
        ORDER BY count DESC
        LIMIT 10
      `;

      // Produits les plus vus
      const topProducts = await prisma.product.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, name: true, viewCount: true },
      });

      // Services les plus vus
      const topServices = await prisma.service.findMany({
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: { id: true, name: true, viewCount: true },
      });

      return NextResponse.json({
        overview: {
          totalProducts,
          totalServices,
          totalDialogues,
          totalVisitors,
          totalPatterns,
        },
        chartData: {
          dialoguesByDay: dialoguesByDay.map(d => ({ date: d.date, count: Number(d.count) })),
          deviceStats: deviceStats.map(d => ({ deviceType: d.deviceType, count: Number(d.count) })),
          topPages: topPages.map(d => ({ entryPage: d.entryPage, count: Number(d.count) })),
        },
        topItems: {
          products: topProducts,
          services: topServices,
        },
      });
    }

    // Détails des dialogues
    if (action === 'dialogues') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      const dialogues = await prisma.dialogue.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.dialogue.count({
        where: { createdAt: { gte: startDate } },
      });

      return NextResponse.json({
        dialogues,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // Patterns détectés
    if (action === 'patterns') {
      const patterns = await prisma.pattern.findMany({
        where: { status: 'active' },
        orderBy: { frequency: 'desc' },
        take: 50,
      });

      return NextResponse.json({ patterns });
    }

    // Visiteurs
    if (action === 'visitors') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '50');

      const visitors = await prisma.visitorAnalytics.findMany({
        where: { createdAt: { gte: startDate } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      });

      const total = await prisma.visitorAnalytics.count({
        where: { createdAt: { gte: startDate } },
      });

      return NextResponse.json({
        visitors,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json({ error: 'Erreur analytics' }, { status: 500 });
  }
}

// POST - Analyser les patterns
export async function POST(request: NextRequest) {
  try {
    // Récupérer les dialogues récents
    const dialogues = await prisma.dialogue.findMany({
      where: { type: 'user' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        userMessage: true,
        aiResponse: true,
        intent: true,
      },
    });

    if (dialogues.length === 0) {
      return NextResponse.json({ message: 'Pas assez de données pour analyser' });
    }

    // Analyser avec l'IA
    const analysis = await analyzePatterns(dialogues);

    // Sauvegarder les patterns
    if (analysis.patterns && Array.isArray(analysis.patterns)) {
      for (const p of analysis.patterns) {
        await prisma.pattern.create({
          data: {
            type: p.type || 'general',
            description: p.description,
            pattern: JSON.stringify(p),
            insights: JSON.stringify(analysis.insights),
            suggestions: JSON.stringify(analysis.recommendations),
            confidence: p.confidence || 0.5,
            frequency: p.frequency || 1,
          },
        });
      }
    }

    return NextResponse.json({
      analysis,
      patternsCreated: analysis.patterns?.length || 0,
    });
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return NextResponse.json({ error: 'Erreur analyse patterns' }, { status: 500 });
  }
}
