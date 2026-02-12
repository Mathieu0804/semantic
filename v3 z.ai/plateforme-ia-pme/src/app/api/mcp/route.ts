import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { chat } from '@/lib/ai';
import crypto from 'crypto';
import { Prisma } from '@prisma/client';

// Fonction pour hasher un token
function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// GET - Récupérer les connexions MCP
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    if (action === 'connections') {
      const connections = await prisma.mCPConnection.findMany({
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          clientName: true,
          clientType: true,
          sessionId: true,
          status: true,
          totalRequests: true,
          lastActivity: true,
          createdAt: true,
          // Ne pas exposer le token
        },
      });
      return NextResponse.json({ connections });
    }

    if (action === 'requests') {
      const connectionId = searchParams.get('connectionId');
      const where: Prisma.MCPRequestWhereInput = connectionId ? { connectionId } : {};
      const requests = await prisma.mCPRequest.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 100,
      });
      return NextResponse.json({ requests });
    }

    if (action === 'stats') {
      const totalConnections = await prisma.mCPConnection.count();
      const activeConnections = await prisma.mCPConnection.count({
        where: { status: 'active' },
      });
      const totalRequests = await prisma.mCPRequest.count();

      const requestsToday = await prisma.mCPRequest.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });

      return NextResponse.json({
        totalConnections,
        activeConnections,
        totalRequests,
        requestsToday,
      });
    }

    // Retourner le statut par défaut
    const company = await prisma.companyIdentity.findFirst();
    
    return NextResponse.json({
      status: company?.mcpEnabled ? 'running' : 'stopped',
      url: company?.mcpServerUrl || null,
      enabled: company?.mcpEnabled || false,
    });
  } catch (error) {
    console.error('MCP GET error:', error);
    return NextResponse.json({ error: 'Erreur MCP' }, { status: 500 });
  }
}

// POST - Créer une connexion MCP ou traiter une requête
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, clientName, clientType, token, endpoint, payload } = body;

    // Créer une nouvelle connexion
    if (action === 'connect') {
      const company = await prisma.companyIdentity.findFirst();

      if (!company?.mcpEnabled) {
        return NextResponse.json({ error: 'Serveur MCP non activé' }, { status: 403 });
      }

      const sessionId = crypto.randomUUID();
      const rawToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = hashToken(rawToken);

      const connection = await prisma.mCPConnection.create({
        data: {
          clientName: clientName || 'Anonyme',
          clientType: clientType || 'unknown',
          sessionId,
          token: hashedToken, // Stocker le hash
          status: 'active',
          permissions: JSON.stringify(['chat', 'products', 'services']),
        },
      });

      // Retourner le token brut (seule fois)
      return NextResponse.json({
        sessionId: connection.sessionId,
        token: rawToken, // Token brut à utiliser par le client
        serverUrl: company.mcpServerUrl,
      });
    }

    // Traiter une requête MCP
    if (action === 'request') {
      if (!token) {
        return NextResponse.json({ error: 'Token requis' }, { status: 401 });
      }

      const startTime = Date.now();

      // Vérifier le token (hashé)
      const hashedToken = hashToken(token);
      const connection = await prisma.mCPConnection.findFirst({
        where: { token: hashedToken, status: 'active' },
      });

      if (!connection) {
        return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
      }

      // Récupérer l'identité de l'entreprise
      const company = await prisma.companyIdentity.findFirst();

      const systemPrompt = company
        ? `Tu es ${company.name}, représentant de cette entreprise.
${company.aiPersonality || ''}
Tu réponds aux questions des clients et prospects via leur IA personnelle.
Ton ton est ${company.aiTone || 'professionnel'}.
Tu dois représenter l'entreprise de manière professionnelle et vendeuse.`
        : 'Tu es un assistant commercial représentant une entreprise.';

      // Traiter la requête selon l'endpoint
      let response: string;
      const message = typeof payload === 'object' && payload !== null && 'message' in payload 
        ? payload.message 
        : JSON.stringify(payload);

      if (endpoint === 'chat') {
        response = await chat(
          [{ role: 'user', content: message }],
          systemPrompt
        );
      } else if (endpoint === 'products') {
        const products = await prisma.product.findMany({
          where: { status: 'active' },
          take: 10,
        });
        response = JSON.stringify(products);
      } else if (endpoint === 'services') {
        const services = await prisma.service.findMany({
          where: { status: 'active' },
          take: 10,
        });
        response = JSON.stringify(services);
      } else {
        response = await chat(
          [{ role: 'user', content: message }],
          systemPrompt
        );
      }

      const responseTime = Date.now() - startTime;

      // Enregistrer la requête
      await prisma.mCPRequest.create({
        data: {
          connectionId: connection.id,
          endpoint: endpoint || 'unknown',
          method: 'POST',
          payload: typeof payload === 'string' ? payload : JSON.stringify(payload),
          response,
          statusCode: 200,
          responseTime,
        },
      });

      // Mettre à jour les stats de connexion
      await prisma.mCPConnection.update({
        where: { id: connection.id },
        data: {
          lastActivity: new Date(),
          totalRequests: { increment: 1 },
        },
      });

      // Sauvegarder le dialogue
      await prisma.dialogue.create({
        data: {
          sessionId: connection.sessionId,
          type: 'mcp',
          source: 'mcp_server',
          userMessage: message,
          aiResponse: response,
          responseTime,
        },
      });

      return NextResponse.json({ response, responseTime });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('MCP POST error:', error);
    return NextResponse.json({ error: 'Erreur MCP' }, { status: 500 });
  }
}

// PUT - Mettre à jour la configuration MCP
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { mcpServerUrl, mcpEnabled } = body;

    const company = await prisma.companyIdentity.findFirst();

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    const updated = await prisma.companyIdentity.update({
      where: { id: company.id },
      data: {
        mcpServerUrl,
        mcpEnabled,
      },
    });

    return NextResponse.json({ company: updated });
  } catch (error) {
    console.error('MCP PUT error:', error);
    return NextResponse.json({ error: 'Erreur mise à jour MCP' }, { status: 500 });
  }
}

// DELETE - Révoquer une connexion
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID requis' }, { status: 400 });
    }

    await prisma.mCPConnection.update({
      where: { sessionId },
      data: { status: 'revoked' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('MCP DELETE error:', error);
    return NextResponse.json({ error: 'Erreur révocation' }, { status: 500 });
  }
}
