import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import { buildSystemPrompt, COLLECTION_CONFIGS, type TGPCollection } from '../../../config/geminiPrompts';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { collection = 'essays', slug, title } = data;

    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: 'Falta el slug del documento.' }), { status: 400 });
    }

    const apiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.includes('tu_gemini_api_key')) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Falta GEMINI_API_KEY en .env o tiene un valor de placeholder.' 
      }), { status: 500 });
    }

    // Ruta al archivo .mdoc o .md
    const contentDir = path.resolve(process.cwd(), 'src/content', collection);
    const mdocPath = path.join(contentDir, `${slug}.mdoc`);
    const mdPath = path.join(contentDir, `${slug}.md`);
    const targetPath = fs.existsSync(mdocPath) ? mdocPath : (fs.existsSync(mdPath) ? mdPath : mdocPath);

    const postTitle = title || slug.replace(/-/g, ' ');

    // 1. Obtener el systemInstruction adecuado para la colección
    const validCollection: TGPCollection = (collection in COLLECTION_CONFIGS) 
      ? (collection as TGPCollection) 
      : 'essays';
    
    const systemPrompt = buildSystemPrompt(validCollection);
    const cfg = COLLECTION_CONFIGS[validCollection];

    // 2. Llamada directa a Gemini REST API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const payload = {
      systemInstruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [
        {
          role: "user",
          parts: [{ 
            text: `Escribe el ensayo maestro titulado "${postTitle}" para la colección ${cfg.label}. Desarrolla el tema con máxima profundidad filosófica, rigor erudito y narrativa cinemática según las instrucciones del sistema.` 
          }]
        }
      ],
      generationConfig: {
        temperature: cfg.temperature || 0.65,
        maxOutputTokens: Math.round(cfg.targetWords * 2) || 2500
      }
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const responseBody = await response.json();

    if (!response.ok) {
      let errorMsg = `Error Gemini API (HTTP ${response.status})`;
      if (responseBody.error?.message) {
        errorMsg += `: ${responseBody.error.message}`;
      }
      return new Response(JSON.stringify({ success: false, error: errorMsg }), { status: response.status });
    }

    const generatedMarkdown = responseBody.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!generatedMarkdown) {
      return new Response(JSON.stringify({ success: false, error: 'Gemini no devolvió texto en los candidatos.' }), { status: 500 });
    }

    // 3. Inyectar en el archivo .mdoc
    let existingContent = '';
    if (fs.existsSync(targetPath)) {
      existingContent = fs.readFileSync(targetPath, 'utf-8');
    }

    let frontmatter = `---
title: ${postTitle}
draft: false
date: ${new Date().toISOString().split('T')[0]}
---
`;

    if (existingContent.startsWith('---')) {
      const parts = existingContent.split('---');
      if (parts.length >= 3) {
        let fmMatter = parts[1];
        // Desactivar triggers para que no quede pendiente
        fmMatter = fmMatter.replace(/trigger_both:\s*true/g, 'trigger_both: false');
        fmMatter = fmMatter.replace(/trigger_text_only:\s*true/g, 'trigger_text_only: false');
        fmMatter = fmMatter.replace(/trigger_image_only:\s*true/g, 'trigger_image_only: false');
        frontmatter = `---${fmMatter}---`;
      }
    }

    const finalMdoc = `${frontmatter.trim()}\n\n${generatedMarkdown.trim()}\n`;
    fs.writeFileSync(targetPath, finalMdoc, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      message: `Ensayo "${postTitle}" generado e inyectado con éxito en ${targetPath}`,
      wordCount: generatedMarkdown.split(/\s+/).length
    }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: 'Excepción en generador: ' + e.message }), { status: 500 });
  }
};
