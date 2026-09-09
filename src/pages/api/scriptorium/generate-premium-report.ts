import type { APIRoute } from 'astro';
import { generatePremiumReport, type PremiumReportPayload } from '../../../services/generatePremiumReport';

export const POST: APIRoute = async ({ request }) => {
  try {
    const payload: PremiumReportPayload = await request.json();

    if (!payload.title) {
      return new Response(JSON.stringify({
        success: false,
        error: 'El campo "title" es obligatorio para generar el Informe Premium.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const result = await generatePremiumReport(payload);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[GENERATE PREMIUM REPORT ERROR]', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Error desconocido al ejecutar el pipeline del Informe Premium.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
