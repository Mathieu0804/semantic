import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSEOKeywords, generateLDJson } from '@/lib/ai';

// GET - Récupérer l'identité entreprise
export async function GET(request: NextRequest) {
  try {
    const company = await prisma.companyIdentity.findFirst();
    
    if (!company) {
      // Créer une entreprise par défaut
      const defaultCompany = await prisma.companyIdentity.create({
        data: {
          name: 'Mon Entreprise',
          description: 'Description de mon entreprise',
          primaryColor: '#3B82F6',
          secondaryColor: '#1E40AF',
          accentColor: '#10B981',
          businessType: 'LocalBusiness',
          aiTone: 'professionnel',
        },
      });
      return NextResponse.json({ company: defaultCompany });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération de l\'entreprise' }, { status: 500 });
  }
}

// POST - Créer ou mettre à jour l'identité entreprise
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      slogan,
      logo,
      primaryColor,
      secondaryColor,
      accentColor,
      email,
      phone,
      address,
      city,
      postalCode,
      country,
      website,
      facebook,
      twitter,
      linkedin,
      instagram,
      metaTitle,
      metaDescription,
      keywords,
      businessType,
      aiPersonality,
      aiTone,
      aiExpertise,
      mcpServerUrl,
      mcpEnabled,
    } = body;

    // Vérifier si une entreprise existe déjà
    const existing = await prisma.companyIdentity.findFirst();

    let company;
    if (existing) {
      company = await prisma.companyIdentity.update({
        where: { id: existing.id },
        data: {
          name,
          description,
          slogan,
          logo,
          primaryColor,
          secondaryColor,
          accentColor,
          email,
          phone,
          address,
          city,
          postalCode,
          country,
          website,
          facebook,
          twitter,
          linkedin,
          instagram,
          metaTitle,
          metaDescription,
          keywords,
          businessType,
          aiPersonality,
          aiTone,
          aiExpertise,
          mcpServerUrl,
          mcpEnabled,
        },
      });
    } else {
      company = await prisma.companyIdentity.create({
        data: {
          name: name || 'Mon Entreprise',
          description,
          slogan,
          logo,
          primaryColor: primaryColor || '#3B82F6',
          secondaryColor: secondaryColor || '#1E40AF',
          accentColor: accentColor || '#10B981',
          email,
          phone,
          address,
          city,
          postalCode,
          country,
          website,
          facebook,
          twitter,
          linkedin,
          instagram,
          metaTitle,
          metaDescription,
          keywords,
          businessType: businessType || 'LocalBusiness',
          aiPersonality,
          aiTone: aiTone || 'professionnel',
          aiExpertise,
          mcpServerUrl,
          mcpEnabled: mcpEnabled || false,
        },
      });
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('Error saving company:', error);
    return NextResponse.json({ error: 'Erreur lors de la sauvegarde de l\'entreprise' }, { status: 500 });
  }
}

// PUT - Générer SEO et LD-JSON
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    const company = await prisma.companyIdentity.findFirst();

    if (!company) {
      return NextResponse.json({ error: 'Entreprise non trouvée' }, { status: 404 });
    }

    if (action === 'generate-seo') {
      // Générer les mots-clés SEO
      const keywords = await generateSEOKeywords(
        company.description || company.name,
        company.businessType || undefined
      );

      // Mettre à jour l'entreprise
      const updated = await prisma.companyIdentity.update({
        where: { id: company.id },
        data: {
          keywords: keywords.join(', '),
        },
      });

      return NextResponse.json({ keywords, company: updated });
    }

    if (action === 'generate-ldjson') {
      // Générer le LD-JSON
      const ldJson = await generateLDJson({
        name: company.name,
        description: company.description || undefined,
        email: company.email || undefined,
        phone: company.phone || undefined,
        address: company.address || undefined,
        city: company.city || undefined,
        website: company.website || undefined,
        businessType: company.businessType || undefined,
      });

      if (ldJson) {
        const updated = await prisma.companyIdentity.update({
          where: { id: company.id },
          data: {
            ldJson: JSON.stringify(ldJson),
          },
        });

        return NextResponse.json({ ldJson, company: updated });
      }

      return NextResponse.json({ error: 'Impossible de générer le LD-JSON' }, { status: 500 });
    }

    return NextResponse.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Error generating SEO/LD-JSON:', error);
    return NextResponse.json({ error: 'Erreur lors de la génération' }, { status: 500 });
  }
}
