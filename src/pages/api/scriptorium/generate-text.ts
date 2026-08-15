import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { promptText, gemaId } = data;

    if (!promptText || promptText.trim() === '') {
      return new Response(JSON.stringify({ success: false, error: 'El prompt está vacío.' }), { status: 400 });
    }

    // El API key de Gemini viene del entorno (ej. en Vercel o archivo .env)
    const apiKey = import.meta.env.GEMINI_API_KEY;
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: 'Falta GEMINI_API_KEY en las variables de entorno (.env).' }), { status: 500 });
    }

    const systemPrompt = `Eres un Ecosistema de Producción de Contenido Premium. Tu objetivo es generar textos de alta retención para audiencias exigentes, orientados a la monetización mediante autoridad y calidad.

RESTRICCIONES ESTÉTICAS GLOBALES (VETO TGP):
- NUNCA uses frases mecánicas o clichés de IA (ej: "En el vertiginoso mundo de hoy", "Es crucial recordar", "En conclusión", "En resumen").
- Ve directamente al núcleo del tema. Cero introducciones redundantes.
- Tono: Sobrio, agudo, preciso, con calidez humanista. Directo al punto, pero profundo.
- Construye párrafos cortos para facilitar la lectura en móviles.

Es ESTRICTAMENTE OBLIGATORIO que envuelvas cada pieza de contenido con sus etiquetas correspondientes.

[ARTICULO]
Actúa como un Ensayista/Blogger Experto.
- Escribe el artículo estructurado en HTML directo para Blogger o Markdown (usaremos Markdown).
- No incluyas la etiqueta <h1> ni <html> o <body>.
- Empieza con un gancho (hook) narrativo o analítico contundente.
- Usa etiquetas <h2> o ## para dividir lógicamente los subtítulos.
- Usa <b> o ** para resaltar conceptos clave (facilita el escaneo visual del lector).
- Finaliza con una reflexión abierta o una pregunta que incite a comentar, no con un resumen genérico.
[/ARTICULO]

[REDES]
Actúa como un Estratega de Audiencias (Twitter/LinkedIn/Facebook).
- Crea un copete (texto para acompañar el link del artículo).
- Estructura: 1. Gancho disruptivo o pregunta contraintuitiva. 2. El núcleo del problema/idea (2 líneas). 3. Llamado a la acción (CTA) invitando a leer el artículo.
- Usa emojis con extrema moderación (máximo 2 o 3, estilizados).
[/REDES]

[YOUTUBE]
Actúa como un Productor Audiovisual SEO.
- Crea una descripción para un video basado en este tema.
- Estructura:
  1. Un título magnético (solo texto, sin poner "Título:").
  2. Dos líneas de resumen impactante.
  3. "En este video exploramos:" seguido de 3 o 4 viñetas clave.
  4. Llamado a la acción claro (suscribirse y link al blog).
[/YOUTUBE]`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: `Tema central a desarrollar (${gemaId || 'ensayo_html'}): ${promptText}` }]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 3072
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.json();

    if (response.ok) {
      if (responseBody.candidates && responseBody.candidates.length > 0) {
        const fullText = responseBody.candidates[0].content.parts[0].text;
        
        // Motor Separador de Scriptorium Bis
        const articuloMatch = fullText.match(/\[ARTICULO\]([\s\S]*?)\[\/ARTICULO\]/);
        const redesMatch = fullText.match(/\[REDES\]([\s\S]*?)\[\/REDES\]/);
        const youtubeMatch = fullText.match(/\[YOUTUBE\]([\s\S]*?)\[\/YOUTUBE\]/);

        return new Response(JSON.stringify({ 
          success: true, 
          articulo: articuloMatch ? articuloMatch[1].trim() : "<p style='color:red;'>Error de extracción: Gemini no respetó la etiqueta [ARTICULO].</p>",
          redes: redesMatch ? redesMatch[1].trim() : "Error de extracción: Gemini no respetó la etiqueta [REDES].",
          youtube: youtubeMatch ? youtubeMatch[1].trim() : "Error de extracción: Gemini no respetó la etiqueta [YOUTUBE].",
          raw: fullText
        }), { status: 200 });
      } else {
        return new Response(JSON.stringify({ success: false, error: 'Gemini no devolvió candidatos válidos.' }), { status: 500 });
      }
    } else {
      let errorMsg = `Error HTTP ${response.status}`;
      if (responseBody.error && responseBody.error.message) {
        errorMsg += ': ' + responseBody.error.message;
      }
      return new Response(JSON.stringify({ success: false, error: errorMsg }), { status: response.status });
    }

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: 'Excepción en integración Gemini: ' + e.message }), { status: 500 });
  }
};
