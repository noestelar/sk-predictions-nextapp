import { getWishlistContext } from "@/lib/santa-context";

const SYSTEM_MESSAGE = {
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

const TOOLS = [
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
];

// Helper to execute tool calls
async function executeToolCall(toolCall: { function: { name: string; arguments: string }; id: string }) {
  let toolResultContent = "";

  if (toolCall.function.name === 'search_wishlist') {
    const { personName } = JSON.parse(toolCall.function.arguments);
    console.log(`[SantaChat] Tool called: search_wishlist for "${personName}"`);

    const { searchParticipantWishlist, getParticipantProfile } = await import('@/lib/santa-context');

    const [wishlistResult, profileResult] = await Promise.all([
      searchParticipantWishlist(personName),
      getParticipantProfile(personName)
    ]);

    toolResultContent = `${profileResult}\n\n${wishlistResult}`;
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

  return toolResultContent;
}

// Parse SSE stream and extract content/tool calls
async function* parseSSEStream(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const decoder = new TextDecoder();
  let buffer = '';
  const toolCalls: Array<{ id: string; function: { name: string; arguments: string } }> = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') continue;

        try {
          const parsed = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;

          if (delta?.content) {
            yield { type: 'content', content: delta.content };
          }

          // Handle tool calls in streaming
          if (delta?.tool_calls) {
            for (const tc of delta.tool_calls) {
              const index = tc.index ?? 0;
              if (!toolCalls[index]) {
                toolCalls[index] = { id: tc.id || '', function: { name: '', arguments: '' } };
              }
              if (tc.id) toolCalls[index].id = tc.id;
              if (tc.function?.name) toolCalls[index].function.name = tc.function.name;
              if (tc.function?.arguments) toolCalls[index].function.arguments += tc.function.arguments;
            }
          }
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }

  // Yield tool calls at the end if any
  if (toolCalls.length > 0) {
    yield { type: 'tool_calls', toolCalls };
  }
}

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const fullMessages = [SYSTEM_MESSAGE, ...messages];
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          role: "assistant",
          content: "¡No mames! Mis elfos pendejos olvidaron conectar la API Key (DEEPSEEK_API_KEY). Avísale al admin que no sea codo. Mientras tanto... ¿te portaste chido este año o puro desmadre? 🎅🍺",
        }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Initial request with streaming
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        tools: TOOLS,
        messages: fullMessages,
        temperature: 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Deepseek API Error:", error);
      throw new Error(`Error de Deepseek API: ${response.statusText}`);
    }

    // Create a TransformStream to process the response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Process the stream in the background
    (async () => {
      try {
        const reader = response.body!.getReader();
        let collectedContent = '';
        let toolCallsToExecute: Array<{ id: string; function: { name: string; arguments: string } }> | null = null;

        for await (const chunk of parseSSEStream(reader)) {
          if (chunk.type === 'content') {
            // Clean up any artifacts in the content
            const cleanContent = chunk.content.replace(/<｜DSML｜function_calls>[\s\S]*?<\/｜DSML｜function_calls>/g, '');
            if (cleanContent) {
              collectedContent += cleanContent;
              await writer.write(encoder.encode(`data: ${JSON.stringify({ content: cleanContent })}\n\n`));
            }
          } else if (chunk.type === 'tool_calls') {
            toolCallsToExecute = chunk.toolCalls;
          }
        }

        // If there were tool calls, execute them and stream the follow-up response
        if (toolCallsToExecute && toolCallsToExecute.length > 0) {
          const toolCall = toolCallsToExecute[0];
          const toolResultContent = await executeToolCall(toolCall);

          if (toolResultContent) {
            // Build the assistant message with tool calls
            const assistantMessage = {
              role: 'assistant',
              content: collectedContent || null,
              tool_calls: [{
                id: toolCall.id,
                type: 'function',
                function: {
                  name: toolCall.function.name,
                  arguments: toolCall.function.arguments
                }
              }]
            };

            const toolMessage = {
              role: 'tool',
              tool_call_id: toolCall.id,
              content: toolResultContent
            };

            // Make follow-up request with streaming
            const followUpResponse = await fetch("https://api.deepseek.com/chat/completions", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${apiKey}`,
              },
              body: JSON.stringify({
                model: "deepseek-chat",
                messages: [...fullMessages, assistantMessage, toolMessage],
                temperature: 0.7,
                stream: true,
              }),
            });

            if (followUpResponse.ok) {
              const followUpReader = followUpResponse.body!.getReader();
              for await (const chunk of parseSSEStream(followUpReader)) {
                if (chunk.type === 'content') {
                  const cleanContent = chunk.content.replace(/<｜DSML｜function_calls>[\s\S]*?<\/｜DSML｜function_calls>/g, '');
                  if (cleanContent) {
                    await writer.write(encoder.encode(`data: ${JSON.stringify({ content: cleanContent })}\n\n`));
                  }
                }
              }
            }
          }
        }

        await writer.write(encoder.encode('data: [DONE]\n\n'));
        await writer.close();
      } catch (error) {
        console.error("Stream processing error:", error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`));
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error("Error in Santa Chat:", error);
    return new Response(
      JSON.stringify({
        error: "Chale, hubo un pedo al hablar con Santa. Los renos andan crudos.",
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
