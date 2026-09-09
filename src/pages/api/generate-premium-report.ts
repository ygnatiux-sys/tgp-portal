import type { APIRoute } from 'astro';
import { generatePremiumReport, type PremiumReportPayload } from '../../services/generatePremiumReport';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload: PremiumReportPayload = await request.json();

    // 1. Extracción y Normalización de Payload
    const title = (payload.titulo || payload.title || '').trim();
    const collection = (payload.coleccion || payload.collection || '').trim();
    const visualSource = (payload.fuenteVisual || payload.visualSource || '').trim();

    // 2. Validación de Payload (400 Bad Request si faltan campos obligatorios)
    if (!title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El campo "titulo" (o "title") es obligatorio.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!collection) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El campo "coleccion" (o "collection") es obligatorio.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!visualSource) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El campo "fuenteVisual" (o "visualSource") es obligatorio.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. Ejecutar el orquestador principal
    const result = await generatePremiumReport({
      ...payload,
      title,
      collection,
      visualSource,
    });

    // 4. Evaluar respuesta del orquestador
    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        error: result.error || 'Fallo interno en el pipeline del orquestador.'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 5. Respuesta exitosa (200 OK con ruta del archivo generado)
    return new Response(JSON.stringify({
      success: true,
      filePath: result.filePath,
      publicPostUrl: result.publicPostUrl,
      r2ImageUrl: result.r2ImageUrl,
      wordCount: result.wordCount,
      excerpt: result.excerpt,
      cardTags: result.cardTags
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('❌ [ENDPOINT: GENERATE PREMIUM REPORT ERROR]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error grave y desconocido en el endpoint.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
