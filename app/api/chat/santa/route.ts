import { NextResponse } from "next/server";
import { getWishlistContext } from "@/lib/santa-context";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    // const wishlistContext = await getWishlistContext(); // Removed to save tokens/latency

    const systemMessage = {
      role: "system",
      content: `Eres un Santa Claus 🎅 mexicano, moderno y con mucha actitud para la "Velada SKToxqui 2025" Una celebración anual entre amigos que está en su 5to año consecutivo.
      
      Tu personalidad es alegre y festiva, pero hablas con jerga mexicana (mexicanismos). Usas palabras como "wey", "no mames", "cabrón" (de cariño), "chido", y puedes soltar alguna grosería leve si la situación lo amerita, pero siempre en tono de broma, camaradería y desmadre, nunca ofensivo. Eres como ese tío borracho pero buena onda en la fiesta de Navidad.

      Estás ayudando a los changos (los participantes) a elegir el regalo perfecto o hacer predicciones para el intercambio.
      
      IMPORTANTE SOBRE EL USO DE HERRAMIENTAS:
      - NO tienes la información de la wishlist cargada por defecto.
      - Si el usuario solo saluda ("hola", "qué onda") o habla de temas generales, RESPONDE DIRECTAMENTE sin usar herramientas. ¡No gastes recursos a lo pendejo!
      - SOLO si te preguntan por los gustos, regalos o personalidad de alguien, usa la herramienta 'search_wishlist'.
      - Si te preguntan por TODOS los participantes o el contexto general del evento, usa la herramienta 'get_all_wishlists'.

      Tienes dos tareas principales cuando se te solicita:
      1. Sugerir regalos basados en la wishlist y perfil de cada participante.
      2. Hacer predicciones divertidas y ligeras sobre quién podría regalar qué a quién.
      
      Instrucciones de personalidad:
      1. Responde siempre como este Santa mexicano y desmadroso.
      2. Usa emojis festivos y mexicanos si aplica 🌮🍺🎅🎁.
      3. Sé conciso, directo y divertido. ¡A huevo!

      Reglas para sugerencias de regalos (cuando tengas la info):
      - Siempre sugiere regalos que estén en la wishlist.
      - Si un participante no tiene wishlist, sugiere algo genérico pero divertido.
      
      Ejemplo de respuesta (sin herramientas):
      Usuario: "¡Qué onda Santa!"
      Santa: "¡Qué pedo wey! ¿Ya listo pa' la peda o qué? Aquí ando al tiro por si necesitas ayuda con los regalos. 🎅🍺"

      Ejemplo de respuesta (con herramienta):
      Usuario: "¿Qué le regalo a Juan?"
      (Usa tool search_wishlist("Juan"))
      Santa: "No mames wey, Juan quiere una consola de videojuegos según su wishlist. ¡Échale ganas y cómprasela! 🎮🎅"
      `,
    };

    const fullMessages = [systemMessage, ...messages];

    // Call Deepseek API
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      // Fallback if no API key is present (for demo purposes)
      return NextResponse.json({
        role: "assistant",
        content:
          "¡No mames! Mis elfos pendejos olvidaron conectar la API Key (DEEPSEEK_API_KEY). Avísale al admin que no sea codo. Mientras tanto... ¿te portaste chido este año o puro desmadre? 🎅🍺",
      });
    }

    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        tools: [
          {
            type: 'function',
            function: {
              name: 'get_participant_profile',
              description: 'Get the profile (bio, description) of a participant from the database. Use this to get personality info or context about a person.',
              parameters: {
                type: 'object',
                properties: {
                  personName: {
                    type: 'string',
                    description: 'The name of the person to search for.'
                  }
                },
                required: ['personName']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'search_wishlist',
              description: 'Search for a specific participant\'s wishlist in the Notion database. Use this when asked about a specific person.',
              parameters: {
                type: 'object',
                properties: {
                  personName: {
                    type: 'string',
                    description: 'The name of the person to search for (e.g., "Martin", "Noe", "Esteban").'
                  }
                },
                required: ['personName']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'get_all_wishlists',
              description: 'Get the full wishlist of all participants. Use this ONLY when asked about "everyone", "all participants", or general context.',
              parameters: {
                type: 'object',
                properties: {},
              }
            }
          }
        ],
        messages: fullMessages,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Deepseek API Error:", error);
      throw new Error(`Error de Deepseek API: ${response.statusText}`);
    }

    const data = await response.json();
    const reply = data.choices[0].message;

    // Clean up Deepseek's function call artifacts if they appear in content
    if (reply.content && typeof reply.content === 'string') {
      reply.content = reply.content.replace(/<｜DSML｜function_calls>[\s\S]*?<\/｜DSML｜function_calls>/g, '').trim();
    }

    // Handle tool calls
    if (reply.tool_calls) {
      const toolCall = reply.tool_calls[0];
      let toolResultContent = "";

      if (toolCall.function.name === 'search_wishlist') {
        const { personName } = JSON.parse(toolCall.function.arguments);
        console.log(`[SantaChat] Tool called: search_wishlist for "${personName}"`);
        
        // Execute both profile search and wishlist search in parallel for better context
        const { searchParticipantWishlist, getParticipantProfile } = await import('@/lib/santa-context');
        
        const [wishlistResult, profileResult] = await Promise.all([
          searchParticipantWishlist(personName),
          getParticipantProfile(personName)
        ]);
        
        toolResultContent = `
        ${profileResult}
        
        ${wishlistResult}
        `;
      } else if (toolCall.function.name === 'get_participant_profile') {
        const { personName } = JSON.parse(toolCall.function.arguments);
        console.log(`[SantaChat] Tool called: get_participant_profile for "${personName}"`);
        const { getParticipantProfile } = await import('@/lib/santa-context');
        toolResultContent = await getParticipantProfile(personName);
      } else if (toolCall.function.name === 'get_all_wishlists') {
        console.log(`[SantaChat] Tool called: get_all_wishlists`);
        const { getWishlistContext } = await import('@/lib/santa-context');
        toolResultContent = await getWishlistContext();
      }

      if (toolResultContent) {
        // Send the tool result back to the model
        const toolMessage = {
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolResultContent
        };
        
        const followUpResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [...fullMessages, reply, toolMessage],
            temperature: 0.7,
          }),
        });
        
        if (!followUpResponse.ok) {
           throw new Error('Error in follow-up tool response');
        }
        
        const followUpData = await followUpResponse.json();
        const followUpReply = followUpData.choices[0].message;
        
        // Clean up artifacts in follow-up response too
        if (followUpReply.content && typeof followUpReply.content === 'string') {
          followUpReply.content = followUpReply.content.replace(/<｜DSML｜function_calls>[\s\S]*?<\/｜DSML｜function_calls>/g, '').trim();
        }
        
        return NextResponse.json(followUpReply);
      }
    }

    return NextResponse.json(reply);
  } catch (error) {
    console.error("Error in Santa Chat:", error);
    return NextResponse.json(
      {
        error:
          "Chale, hubo un pedo al hablar con Santa. Los renos andan crudos.",
      },
      { status: 500 }
    );
  }
}
