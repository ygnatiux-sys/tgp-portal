import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const query = url.searchParams.get('q');

  if (!query || query.trim() === '') {
    return new Response(JSON.stringify({ success: false, images: [], error: 'El casillero de búsqueda está vacío.' }), { status: 400 });
  }

  try {
    // FASE 1: AGENTE DOCUMENTALISTA (GEMINI)
    let optimizedQuery = query;
    const apiKey = import.meta.env.GEMINI_API_KEY;

    if (apiKey) {
      const systemPrompt = "Eres un bibliotecario experto de Wikimedia Commons. Tu único trabajo es tomar la idea de búsqueda del usuario (generalmente en español) y devolver el TÉRMINO DE BÚSQUEDA EXACTO, preferentemente en inglés, que dará los mejores resultados visuales en Commons. \nEjemplo 1: 'piramide sarcofago en roma' -> 'Pyramid of Cestius'. \nEjemplo 2: 'piramides de china' -> 'Chinese pyramids'. \nDEVUELVE ÚNICAMENTE EL TÉRMINO, sin explicaciones ni comillas.";
      
      const payload = {
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: "user", parts: [{ text: query }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 50 }
      };

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (geminiResponse.ok) {
        const jsonGemini = await geminiResponse.json();
        if (jsonGemini.candidates && jsonGemini.candidates.length > 0) {
          optimizedQuery = jsonGemini.candidates[0].content.parts[0].text.trim();
        }
      }
    }

    // FASE 2: EXTRACCIÓN DE WIKIMEDIA COMMONS (NATIVA)
    const safeQuery = encodeURIComponent(optimizedQuery);
    const wikiUrl = `https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch=${safeQuery}&gsrnamespace=6&gsrlimit=15&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1280&format=json`;

    const wikiResponse = await fetch(wikiUrl);
    
    if (!wikiResponse.ok) {
      return new Response(JSON.stringify({ success: false, images: [], error: 'El servidor de Wikimedia rechazó la conexión.' }), { status: 502 });
    }

    const wikiJson = await wikiResponse.json();
    const fetchedImages = [];

    if (wikiJson && wikiJson.query && wikiJson.query.pages) {
      const pages = wikiJson.query.pages;
      for (const key in pages) {
        const page = pages[key];
        if (page.imageinfo && page.imageinfo.length > 0) {
          const info = page.imageinfo[0];
          
          const author = info.extmetadata?.Artist ? info.extmetadata.Artist.value.replace(/<[^>]*>?/gm, '') : 'Desconocido';
          const license = info.extmetadata?.LicenseShortName ? info.extmetadata.LicenseShortName.value : 'Dominio Público/CC';

          if (info.width > 400) {
            fetchedImages.push({
              title: page.title.replace('File:', '').replace(/\.[^/.]+$/, ""),
              url: info.thumburl,
              originalUrl: info.url,
              width: info.width,
              height: info.height,
              sizeLabel: `${info.width}x${info.height}`,
              author: author.substring(0, 40),
              license: license,
              megapixels: (info.width * info.height)
            });
          }
        }
      }
    }

    // FASE 3: ALGORITMO DE RANKING DE CALIDAD
    fetchedImages.sort((a, b) => b.megapixels - a.megapixels);

    return new Response(JSON.stringify({
      success: true,
      images: fetchedImages,
      optimizedTerm: optimizedQuery,
      error: null
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error: any) {
    return new Response(JSON.stringify({ success: false, images: [], error: `Fallo estructural: ${error.message}` }), { status: 500 });
  }
};
