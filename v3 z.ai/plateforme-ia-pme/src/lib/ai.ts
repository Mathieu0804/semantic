import ZAI from 'z-ai-web-dev-sdk';

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

export async function getAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function chat(messages: ChatMessage[], systemPrompt?: string) {
  const zai = await getAI();
  
  const fullMessages: ChatMessage[] = systemPrompt 
    ? [{ role: 'system', content: systemPrompt }, ...messages]
    : messages;

  const completion = await zai.chat.completions.create({
    messages: fullMessages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  return completion.choices[0]?.message?.content || '';
}

export async function generateSiteContent(prompt: string, companyInfo?: {
  name?: string;
  description?: string;
  colors?: { primary: string; secondary: string };
}) {
  const systemPrompt = `Tu es un expert en création de sites web pour PME/PMI. 
Tu génères du contenu professionnel et optimisé SEO.
Réponds toujours en français.
Structure tes réponses en JSON quand c'est demandé.`;

  const userPrompt = `Crée un site web complet pour: ${prompt}
${companyInfo ? `
Informations entreprise:
- Nom: ${companyInfo.name || 'Non spécifié'}
- Description: ${companyInfo.description || 'Non spécifié'}
- Couleurs: ${companyInfo.colors?.primary || '#3B82F6'} (primaire), ${companyInfo.colors?.secondary || '#1E40AF'} (secondaire)
` : ''}
Génère une structure JSON avec:
{
  "name": "Nom du site",
  "description": "Description du site",
  "pages": [
    {
      "name": "Accueil",
      "slug": "accueil",
      "content": "Contenu HTML de la page",
      "metaTitle": "Titre SEO",
      "metaDescription": "Description SEO"
    }
  ],
  "theme": "modern",
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#1E40AF"
  }
}`;

  const response = await chat([{ role: 'user', content: userPrompt }], systemPrompt);
  
  try {
    // Extract JSON from response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw response if not JSON
  }
  
  return { raw: response };
}

export async function generateSEOKeywords(description: string, industry?: string) {
  const systemPrompt = `Tu es un expert SEO. Génère des mots-clés pertinents pour le référencement.
Réponds uniquement avec une liste de mots-clés séparés par des virgules.`;

  const response = await chat([
    { role: 'user', content: `Génère 15 mots-clés SEO pour une entreprise: ${description}
${industry ? `Secteur: ${industry}` : ''}` }
  ], systemPrompt);

  return response.split(',').map(k => k.trim()).filter(k => k.length > 0);
}

export async function generateLDJson(companyInfo: {
  name: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  website?: string;
  businessType?: string;
}) {
  const systemPrompt = `Tu es un expert en données structurées Schema.org.
Génère un LD-JSON valide pour une entreprise.
Réponds uniquement avec le JSON, sans markdown.`;

  const response = await chat([
    { role: 'user', content: `Génère un LD-JSON Schema.org pour:
Nom: ${companyInfo.name}
Description: ${companyInfo.description || ''}
Email: ${companyInfo.email || ''}
Téléphone: ${companyInfo.phone || ''}
Adresse: ${companyInfo.address || ''}
Ville: ${companyInfo.city || ''}
Site web: ${companyInfo.website || ''}
Type: ${companyInfo.businessType || 'LocalBusiness'}` }
  ], systemPrompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw response if not valid JSON
  }
  
  return null;
}

export async function analyzePatterns(dialogues: Array<{ userMessage: string; aiResponse: string; intent?: string }>) {
  const systemPrompt = `Tu es un analyste de données expert. Analyse les dialogues et identifie des patterns.
Réponds en JSON avec:
{
  "patterns": [
    {
      "type": "product_interest",
      "description": "Description du pattern",
      "frequency": 10,
      "confidence": 0.85
    }
  ],
  "insights": ["Insight 1", "Insight 2"],
  "recommendations": ["Recommandation 1", "Recommandation 2"]
}`;

  const response = await chat([
    { role: 'user', content: `Analyse ces ${dialogues.length} dialogues et identifie des patterns:
${JSON.stringify(dialogues.slice(0, 50), null, 2)}` }
  ], systemPrompt);

  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Return raw response
  }
  
  return { raw: response };
}
