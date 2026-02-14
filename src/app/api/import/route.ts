import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// POST - Importer des données depuis CSV ou JSON
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'products' ou 'services'
    const siteId = formData.get('siteId') as string || 'default';

    if (!file || !type) {
      return NextResponse.json({ error: 'Fichier et type requis' }, { status: 400 });
    }

    const content = await file.text();
    let data: any[] = [];

    // Parser le fichier
    if (file.name.endsWith('.json')) {
      const parsed = JSON.parse(content);
      data = Array.isArray(parsed) ? parsed : [parsed];
    } else if (file.name.endsWith('.csv')) {
      data = parseCSV(content);
    } else {
      return NextResponse.json({ error: 'Format non supporté. Utilisez CSV ou JSON.' }, { status: 400 });
    }

    // Insérer les données
    let imported = 0;
    let errors = 0;

    if (type === 'products') {
      for (const item of data) {
        try {
          await prisma.product.create({
            data: {
              siteId,
              name: item.name || item.nom || item.Name || 'Sans nom',
              description: item.description || item.description || item.Description,
              shortDescription: item.shortDescription || item.resume,
              reference: item.reference || item.ref || item.Reference,
              sku: item.sku || item.SKU,
              price: parseFloat(item.price || item.prix || item.Price) || null,
              currency: item.currency || 'EUR',
              category: item.category || item.categorie || item.Category,
              subcategory: item.subcategory || item.sous_categorie,
              stock: parseInt(item.stock || item.quantite) || null,
              stockStatus: item.stockStatus || item.statut_stock || 'in_stock',
              mainImage: item.image || item.mainImage || item.Image,
              status: item.status || 'active',
            },
          });
          imported++;
        } catch (e) {
          errors++;
          console.error('Import error:', e);
        }
      }
    } else if (type === 'services') {
      for (const item of data) {
        try {
          await prisma.service.create({
            data: {
              siteId,
              name: item.name || item.nom || item.Name || 'Sans nom',
              description: item.description || item.Description,
              shortDescription: item.shortDescription || item.resume,
              reference: item.reference || item.ref,
              basePrice: parseFloat(item.price || item.prix || item.basePrice) || null,
              currency: item.currency || 'EUR',
              pricingType: item.pricingType || 'fixed',
              duration: item.duration || item.duree,
              category: item.category || item.categorie,
              mainImage: item.image || item.mainImage,
              status: item.status || 'active',
            },
          });
          imported++;
        } catch (e) {
          errors++;
          console.error('Import error:', e);
        }
      }
    } else {
      return NextResponse.json({ error: 'Type non reconnu. Utilisez "products" ou "services".' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      imported,
      errors,
      total: data.length,
    });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'Erreur lors de l\'import' }, { status: 500 });
  }
}

// Fonction pour parser CSV
function parseCSV(content: string): any[] {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
    const obj: any = {};
    
    headers.forEach((header, index) => {
      obj[header] = values[index] || '';
    });
    
    data.push(obj);
  }

  return data;
}
