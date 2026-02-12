import { NextRequest, NextResponse } from 'next/server';
import { chat, generateSiteContent } from '@/lib/ai';
import { prisma } from '@/lib/db';

// GET - Récupérer l'historique des dialogues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const limit = parseInt(searchParams.get('limit') || '50');

    const dialogues = await prisma.dialogue.findMany({
      where: sessionId ? { sessionId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({ dialogues });
  } catch (error) {
    console.error('Error fetching dialogues:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des dialogues' }, { status: 500 });
  }
}

// POST - Envoyer un message au chatbot
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { message, sessionId, context, type = 'user' } = body;

    if (!message || !sessionId) {
      return NextResponse.json({ error: 'Message et sessionId requis' }, { status: 400 });
    }

    // Récupérer l'identité de l'entreprise pour le prompt système
    const company = await prisma.companyIdentity.findFirst();
    
    const systemPrompt = company 
      ? `Tu es l'assistant IA de ${company.name}. ${company.aiPersonality || 'Tu es professionnel, serviable et expert en création de sites web pour PME.'}
      
Ton rôle:
- Aider les utilisateurs à créer leur site web
- Répondre aux questions sur les produits et services
- Conseiller sur le SEO et le référencement
- Représenter l'entreprise de manière professionnelle

Ton ton: ${company.aiTone || 'professionnel'}
${company.aiExpertise ? `Tes domaines d'expertise: ${company.aiExpertise}` : ''}

Réponds toujours en français de manière claire et concise.`
      : 'Tu es un assistant IA expert en création de sites web pour PME/PMI. Tu aides les utilisateurs à créer leur site, gérer leur catalogue et optimiser leur SEO. Réponds toujours en français.';

    // Récupérer l'historique de la session
    const history = await prisma.dialogue.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    const messages = history.map(d => [
      { role: 'user' as const, content: d.userMessage || '' },
      { role: 'assistant' as const, content: d.aiResponse || '' }
    ]).flat();

    // Ajouter le message actuel
    messages.push({ role: 'user', content: message });

    // Appeler l'IA
    const aiResponse = await chat(messages, systemPrompt);
    const responseTime = Date.now() - startTime;

    // Sauvegarder le dialogue
    const dialogue = await prisma.dialogue.create({
      data: {
        sessionId,
        type,
        source: 'web',
        userMessage: message,
        aiResponse,
        context: context ? JSON.stringify(context) : null,
        responseTime,
      },
    });

    return NextResponse.json({ 
      response: aiResponse, 
      dialogueId: dialogue.id,
      responseTime 
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: 'Erreur lors de la communication avec l\'IA' }, { status: 500 });
  }
}

// POST /generate - Générer un site complet
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, companyInfo, userId } = body;

    const siteData = await generateSiteContent(prompt, companyInfo);

    // Créer le site en base
    if (siteData.name && userId) {
      const site = await prisma.site.create({
        data: {
          userId,
          name: siteData.name,
          description: siteData.description,
          theme: siteData.theme || 'modern',
          status: 'draft',
        },
      });

      // Créer les pages
      if (siteData.pages && Array.isArray(siteData.pages)) {
        for (const page of siteData.pages) {
          await prisma.page.create({
            data: {
              siteId: site.id,
              name: page.name,
              slug: page.slug,
              content: page.content,
              metaTitle: page.metaTitle,
              metaDescription: page.metaDescription,
            },
          });
        }
      }

      return NextResponse.json({ site, pages: siteData.pages });
    }

    return NextResponse.json({ data: siteData });
  } catch (error) {
    console.error('Site generation error:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération du site' }, { status: 500 });
  }
}
