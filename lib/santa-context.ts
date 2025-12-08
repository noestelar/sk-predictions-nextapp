import { Client } from '@notionhq/client';
import prisma from '@/lib/prisma';
import { redis } from '@/lib/redis';

// Helper to normalize strings for accent-insensitive comparison
const normalizeString = (str: string) => {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

// Helper to clean and format Notion text content
const extractTextFromBlock = (block: any): string => {
  if (block.type === 'paragraph' && block.paragraph.rich_text.length > 0) {
    return block.paragraph.rich_text.map((t: any) => t.plain_text).join('') + '\n';
  }
  if (block.type === 'heading_1' || block.type === 'heading_2' || block.type === 'heading_3') {
    const type = block.type;
    return `\n[${type.toUpperCase()}] ` + block[type].rich_text.map((t: any) => t.plain_text).join('') + '\n';
  }
  if (block.type === 'bulleted_list_item' || block.type === 'numbered_list_item') {
    const type = block.type;
    return '- ' + block[type].rich_text.map((t: any) => t.plain_text).join('') + '\n';
  }
  return '';
};

export const getWishlistContext = async () => {
  const CACHE_KEY = 'notion:wishlist_context';
  
  // Try cache first
  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log('[Redis] Returning cached wishlist context');
        return cached;
      }
    } catch (e) {
      console.warn('[Redis] Error reading cache:', e);
    }
  }

  const apiKey = process.env.NOTION_API_KEY;
  const rawPageId = process.env.NOTION_PAGE_ID || '28276c7ee2d9808fa902f6b3a6e5f398';
  // Extract the 32-char UUID if it's part of a longer string (like a URL slug)
  const pageIdMatch = rawPageId.replace(/-/g, '').match(/[a-f0-9]{32}$/);
  const pageId = pageIdMatch ? pageIdMatch[0] : rawPageId;

  if (!apiKey) {
    console.warn('NOTION_API_KEY is missing. Using mock data.');
    return `
      [MOCK DATA - FALTA NOTION_API_KEY]
      Aquí está la lista de deseos (Wishlist) de los participantes del evento "Velada SKToxqui 2025":
      1. Martín: Le gusta la tecnología, los gadgets, y la comida picante.
      2. Noé: Fanático de la programación, teclados mecánicos y café de especialidad.
      3. Esteban: Le gustan los videojuegos, figuras de colección y snacks japoneses.
    `;
  }

  // Create a new client for each request to ensure fresh state
  const notion = new Client({ auth: apiKey });
  
  let contextContent = `Información extraída de Notion para la "Velada SKToxqui 2025":\n\n`;

  try {
    // 1. Try to fetch as a Database (if the ID points to a database)
    try {
      console.log(`[Notion] Attempting to query ID ${pageId} as a database...`);
      
      // Manual fetch because SDK seems to be missing query method in this version
      const response = await fetch(`https://api.notion.com/v1/databases/${pageId}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        // If it's not a database, this might fail with 400 or 404, which is handled by the catch block
        throw new Error(`Notion API error: ${response.status} ${response.statusText}`);
      }
      
      const dbResponse = await response.json();
      console.log(`[Notion] Direct database query found ${dbResponse.results.length} items.`);
      
      if (dbResponse.results.length > 0) {
        contextContent += "LISTA DE DESEOS (Base de Datos):\n";
        dbResponse.results.forEach((page: any) => {
          const props = page.properties;
          // Generic extraction of properties
          const name = props.Name?.title?.[0]?.plain_text || props.Nombre?.title?.[0]?.plain_text || 'Persona';
          
          // Try to find other text fields
          const details = Object.keys(props)
            .filter(key => key !== 'Name' && key !== 'Nombre')
            .map(key => {
              const prop = props[key];
              if (prop.type === 'rich_text') {
                return `${key}: ${prop.rich_text.map((t: any) => t.plain_text).join('')}`;
              }
              if (prop.type === 'select') {
                return `${key}: ${prop.select?.name}`;
              }
              if (prop.type === 'multi_select') {
                return `${key}: ${prop.multi_select.map((s: any) => s.name).join(', ')}`;
              }
              return '';
            })
            .filter(Boolean)
            .join(' | ');

          contextContent += `- ${name}: ${details}\n`;
        });
        return contextContent;
      }
    } catch (dbError) {
      console.log('[Notion] ID is not a direct database or query failed, trying as page blocks...');
      // Not a database or permission error, continue to try as page blocks
      // console.log('Not a database, trying as page blocks...');
    }

    // 2. Fetch as Page Blocks (if it's a page containing text or inline databases)
    console.log(`[Notion] Fetching blocks for page ID ${pageId}...`);
    const blocksResponse = await notion.blocks.children.list({
      block_id: pageId,
    });
    console.log(`[Notion] Found ${blocksResponse.results.length} blocks on the page.`);

    for (const block of blocksResponse.results as any[]) {
      // console.log(`[Notion] Processing block type: ${block.type}`);
      contextContent += extractTextFromBlock(block);

      // If we find a child database, we should query it
      if (block.type === 'child_database') {
        const dbTitle = block.child_database.title;
        console.log(`[Notion] Found child database: "${dbTitle}" (${block.id})`);
        contextContent += `\n[TABLA: ${dbTitle}]\n`;
        try {
          // Re-initialize client inside the loop to avoid any scope/closure weirdness
          const childNotion = new Client({ auth: apiKey });
          
          // Debugging: Check if databases.query exists on the new instance
          // It seems 'query' is missing from the prototype or instance in this environment.
          // Let's try to force access or check if it's under a different name (unlikely)
          // OR, manually construct the request if the SDK is broken.
          
          let childDb;
          if (childNotion.databases && typeof (childNotion.databases as any).query === 'function') {
             childDb = await (childNotion.databases as any).query({ database_id: block.id });
          } else {
             console.warn('[Notion] SDK broken, falling back to manual fetch for child DB');
             // Manual fetch fallback
             const response = await fetch(`https://api.notion.com/v1/databases/${block.id}/query`, {
                method: 'POST',
                headers: {
                   'Authorization': `Bearer ${apiKey}`,
                   'Notion-Version': '2022-06-28',
                   'Content-Type': 'application/json'
                }
             });
             if (!response.ok) {
                throw new Error(`Manual fetch failed: ${response.statusText}`);
             }
             childDb = await response.json();
          }
          console.log(`[Notion] Child database query returned ${childDb.results.length} rows.`);
          
          // Log a sample of the data found
          if (childDb.results.length > 0) {
             // Debug: Log the structure of the first item to see property names
             // console.log('[Notion] First item structure:', JSON.stringify(childDb.results[0].properties, null, 2));
             
             const sampleNames = childDb.results.slice(0, 3).map((r: any) => {
                const p = r.properties;
                // Try to find the title property dynamically
                const titlePropKey = Object.keys(p).find(key => p[key].type === 'title');
                return titlePropKey ? p[titlePropKey].title?.[0]?.plain_text : 'Item (No Title)';
             });
             console.log(`[Notion] Sample items from DB: ${sampleNames.join(', ')}...`);
          }

          childDb.results.forEach((row: any) => {
            const props = row.properties;
            // Find the title property dynamically
            const titlePropKey = Object.keys(props).find(key => props[key].type === 'title');
            const name = titlePropKey ? (props[titlePropKey].title?.[0]?.plain_text || 'Persona') : 'Persona';
            
            const details = Object.keys(props)
            .filter(key => key !== titlePropKey)
            .map(key => {
              const prop = props[key];
              if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('');
              if (prop.type === 'select') return prop.select?.name;
              if (prop.type === 'multi_select') return prop.multi_select.map((s: any) => s.name).join(', ');
              return '';
            })
            .filter(Boolean)
            .join(', ');

            contextContent += `- ${name}: ${details}\n`;
          });
        } catch (e) {
          console.error(`[Notion] Error querying child database ${block.id}:`, e);
          contextContent += "(No se pudo leer el contenido de la tabla)\n";
        }
      }
    }

    console.log('✅ Notion data retrieved successfully. Length:', contextContent.length);
    
    // Cache the result
    if (redis) {
      try {
        await redis.set(CACHE_KEY, contextContent, 'EX', 60 * 60); // 1 hour cache
        console.log('[Redis] Cached wishlist context');
      } catch (e) {
        console.warn('[Redis] Error setting cache:', e);
      }
    }

    return contextContent;

  } catch (error) {
    console.error('Error fetching Notion data:', error);
    return `Error al obtener datos de Notion. Usa tu imaginación de Santa.`;
  }
};

export const searchParticipantWishlist = async (personName: string) => {
  const normalizedKeyName = normalizeString(personName).replace(/\s+/g, '_');
  const CACHE_KEY = `notion:search:${normalizedKeyName}`;

  // Try cache first
  if (redis) {
    try {
      const cached = await redis.get(CACHE_KEY);
      if (cached) {
        console.log(`[Redis] Returning cached search for "${personName}"`);
        return cached;
      }
    } catch (e) {
      console.warn('[Redis] Error reading cache:', e);
    }
  }

  const apiKey = process.env.NOTION_API_KEY;
  const rawPageId = process.env.NOTION_PAGE_ID || '28276c7ee2d9808fa902f6b3a6e5f398';
  const pageIdMatch = rawPageId.replace(/-/g, '').match(/[a-f0-9]{32}$/);
  const pageId = pageIdMatch ? pageIdMatch[0] : rawPageId;

  if (!apiKey) return "No API Key configured.";

  // Resolve name using Prisma to handle accents (e.g. "Noe" -> "Noé")
  let searchName = personName;
  try {
      const allParticipants = await prisma.participant.findMany({ select: { name: true } });
      const normalizedSearch = normalizeString(personName);
      // Find best match: exact normalized match first, then partial
      const match = allParticipants.find(p => normalizeString(p.name) === normalizedSearch) || 
                    allParticipants.find(p => normalizeString(p.name).includes(normalizedSearch));
      
      if (match) {
          console.log(`[Name Resolution] Resolved "${personName}" to "${match.name}"`);
          searchName = match.name;
      }
  } catch (e) {
      console.warn('[Name Resolution] Failed to resolve name via Prisma, using original input', e);
  }

  // We need to find the database ID first. 
  // Since we know it's a child database of the page, we have to find it again.
  // This is a bit inefficient but robust.
  const notion = new Client({ auth: apiKey });
  
  try {
    // 1. Find the child database ID
    const blocksResponse = await notion.blocks.children.list({ block_id: pageId });
    const childDbBlock = blocksResponse.results.find((b: any) => b.type === 'child_database');
    
    if (!childDbBlock) {
      return "No se encontró la base de datos de Wishlist.";
    }

    const databaseId = childDbBlock.id;
    console.log(`[Notion Search] Searching for "${searchName}" (orig: "${personName}") in DB ${databaseId}`);

    // 2. Query with filter
    // We use the manual fetch fallback pattern since the SDK might be acting up
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        filter: {
          property: 'Persona', // User specified 'Persona' field
          rich_text: {
            contains: searchName
          }
        }
      })
    });

    if (!response.ok) {
       // Try with 'Name' or 'Nombre' if 'Persona' fails or doesn't exist
       console.log('[Notion Search] Filter by Persona failed or empty, trying generic search...');
       // Fallback to searching in the default title property if specific property fails
       // But for now let's return the error or empty
       return `No se encontró información para "${searchName}".`;
    }

    const data = await response.json();
    
    if (data.results.length === 0) {
      return `No se encontró a nadie llamado "${searchName}" en la Wishlist.`;
    }

    // Format the results
    let resultText = `Resultados de búsqueda para "${searchName}":\n`;
    data.results.forEach((row: any) => {
        const props = row.properties;
        // Find title
        const titlePropKey = Object.keys(props).find(key => props[key].type === 'title');
        const name = titlePropKey ? (props[titlePropKey].title?.[0]?.plain_text || 'Participante') : 'Participante';
        
        const details = Object.keys(props)
        .filter(key => key !== titlePropKey)
        .map(key => {
            const prop = props[key];
            if (prop.type === 'rich_text') return `${key}: ${prop.rich_text.map((t: any) => t.plain_text).join('')}`;
            if (prop.type === 'select') return `${key}: ${prop.select?.name}`;
            if (prop.type === 'multi_select') return `${key}: ${prop.multi_select.map((s: any) => s.name).join(', ')}`;
            return '';
        })
        .filter(Boolean)
        .join('\n');

        resultText += `\n👤 ${name}\n${details}\n`;
    });

    // Cache the result
    if (redis) {
      try {
        await redis.set(CACHE_KEY, resultText, 'EX', 60 * 60); // 1 hour cache
        console.log(`[Redis] Cached search result for "${personName}"`);
      } catch (e) {
        console.warn('[Redis] Error setting cache:', e);
      }
    }

    return resultText;

  } catch (error) {
    console.error('[Notion Search] Error:', error);
    return "Error al buscar en Notion.";
  }
};

export const getParticipantProfile = async (personName: string) => {
  try {
    // Search for participant in the database (accent-insensitive)
    const allParticipants = await prisma.participant.findMany();
    const normalizedSearch = normalizeString(personName);
    const participant = allParticipants.find(p => normalizeString(p.name) === normalizedSearch) || 
                        allParticipants.find(p => normalizeString(p.name).includes(normalizedSearch));

    if (!participant) {
      return `No se encontró el perfil de "${personName}" en la base de datos.`;
    }

    return `
      Perfil de Participante:
      Nombre: ${participant.name}
      Descripción/Bio: ${participant.description || 'Sin descripción disponible.'}
    `;
  } catch (error) {
    console.error('[Profile Search] Error:', error);
    return "Error al buscar el perfil del participante.";
  }
};
