import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { buildSystemPrompt, COLLECTION_CONFIGS, type TGPCollection } from '../config/geminiPrompts';
import { MUBI_METADATA_SYSTEM_PROMPT } from '../utils/mubiMetadataPrompt';

// ============================================================================
// 1. TIPOS & CONTRATOS DE DATOS (PAYLOAD & RESULT)
// ============================================================================

export interface PremiumReportPayload {
  title?: string;
  titulo?: string;
  slug?: string;
  collection?: TGPCollection | 'scriptorium_lab' | string;
  coleccion?: string;
  tags?: string[] | string;
  visualSource?: 'wikimedia' | 'veo3' | 'imagen3' | 'direct_url' | 'local' | string;
  fuenteVisual?: string;
  visualQuery?: string;
  author?: string;
  region?: string;
  year?: string;
  template?: string;
  promptHint?: string;
  customImageUrl?: string;
}

export interface PremiumReportResult {
  success: boolean;
  filePath: string;
  publicPostUrl: string;
  r2ImageUrl?: string;
  wordCount: number;
  excerpt: string;
  cardTags: string;
  error?: string;
}

const R2_BUCKET = process.env.R2_BUCKET || 'tgp-storage';
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || 'https://storage.thegreatpuzzleproject.com';

function sanitizeSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ============================================================================
// 2. FASE: MOTOR COGNITIVO (DELEGADO A MICROSERVICIO TGP MIND EN CLOUD RUN)
// ============================================================================

interface GeneratedContent {
  bodyMarkdown: string;
  excerpt: string;
  cardTags: string;
  suggestedBibliography?: string;
  wordCount: number;
}

async function runCognitiveEngine(
  title: string,
  collection: string,
  tags: string[],
  promptHint?: string
): Promise<GeneratedContent> {
  
  // En Vite/Astro, import.meta.env.VARIABLE debe escribirse de forma estática 
  // para que el bundler haga el reemplazo.
  let mindUrl = '';
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    mindUrl = import.meta.env.PUBLIC_TGP_MIND_URL || import.meta.env.PUBLIC_TGP_PROXY_URL;
  }
  if (!mindUrl && process.env) {
    mindUrl = process.env.PUBLIC_TGP_MIND_URL || process.env.PUBLIC_TGP_PROXY_URL || '';
  }

  if (!mindUrl) {
    throw new Error('[Seguridad] Falta la URL del microservicio cognitivo (PUBLIC_TGP_MIND_URL) en las variables de entorno del servidor.');
  }

  const validCol: TGPCollection = (collection in COLLECTION_CONFIGS) 
    ? (collection as TGPCollection) 
    : 'essays';
  const systemPrompt = buildSystemPrompt(validCol);
  const cfg = COLLECTION_CONFIGS[validCol];

  const userPrompt = `
Escribe un Informe / Ensayo Maestro de investigación densa titulado: "${title}".
Tags Temáticos: ${tags.join(', ')}
${promptHint ? `Directrices Específicas: ${promptHint}` : ''}

Requisitos de Arquitectura Textual:
1. Apertura Cinemática (Gancho): Comienza con una paradoja histórica o imagen visual potente.
2. Desarrollo Estratificado: Desarrolla el conflicto arqueosemiótico, dialéctico o filosófico con rigor erudito.
3. Inserta marcadores sutiles para imágenes: <!-- IMAGE_HERO --> y <!-- IMAGE_SPREAD -->.
4. Cierre Cósmico Universal: Eleva la perspectiva sobre la condición humana y la memoria.
5. Al final, incluye una sección de Bibliografía Académica con referencias clave.
`.trim();

  // Definición del path interno del microservicio (configurable)
  const MIND_API_PATH = '/generate'; 
  const endpoint = `${mindUrl.replace(/\/$/, '')}${MIND_API_PATH}`;

  const tgpToken = (typeof process !== 'undefined' && process.env.TGP_MIND_TOKEN) 
    || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.TGP_MIND_TOKEN) 
    || '';

  let bodyMarkdown = '';
  let excerpt = `Un recorrido analítico por "${title}", explorando la arquitectura del mito y la condición humana.`;
  let cardTags = '4K | ENSAYO VISUAL | DOC | ESPAÑOL';

  try {
    console.log(`🧠 [TGP Mind] Enviando prompt estructurado a Cloud Run: ${endpoint}`);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tgpToken || ''}`
      },
      body: JSON.stringify({
        prompt: `${systemPrompt}\n\n${userPrompt}`
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => '');
      throw new Error(`Microservicio TGP Mind retornó HTTP ${response.status}: ${errBody}`);
    }

    const data = await response.json();

    // Soporte para respuestas estructuradas del microservicio TGP Mind
    bodyMarkdown = 
      data.markdown || 
      data.body || 
      data.text || 
      data.content || 
      data.candidates?.[0]?.content?.parts?.[0]?.text || 
      '';

    if (!bodyMarkdown) {
      throw new Error('El microservicio TGP Mind respondió exitosamente pero no entregó texto generado.');
    }

    if (data.excerpt) excerpt = data.excerpt;
    if (data.cardTags || data.tags) cardTags = data.cardTags || data.tags;

  } catch (error: any) {
    throw new Error(`[Motor Cognitivo TGP Mind] ${error.message}`);
  }

  // Generación de metadatos MUBI si el microservicio principal no los proveyó directamente
  if (excerpt.includes('Un recorrido analítico')) {
    try {
      const mubiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tgpToken || ''}`
        },
        body: JSON.stringify({
          prompt: `${MUBI_METADATA_SYSTEM_PROMPT}\n\nTema: "${title}". Tags: ${tags.join(', ')}. Genera el JSON estructurado según las instrucciones.`
        }),
      });

      if (mubiResponse.ok) {
        const mubiData = await mubiResponse.json();
        const rawJson = mubiData.text || mubiData.content || mubiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          try {
            const parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
            if (parsed.excerpt) excerpt = parsed.excerpt;
            if (parsed.tags) cardTags = parsed.tags;
          } catch (e) {
            // Manejo silencioso de JSON fallback
          }
        }
      }
    } catch (mubiErr: any) {
      console.warn(`[Motor Cognitivo - Metadatos] Advertencia al generar metadatos secundarios: ${mubiErr.message}`);
    }
  }

  return {
    bodyMarkdown,
    excerpt,
    cardTags,
    wordCount: bodyMarkdown.split(/\s+/).filter(Boolean).length,
  };
}

// ============================================================================
// 3. FASE: ADQUISICIÓN VISUAL (WIKIMEDIA COMMONS O VEO / IMAGEN 3)
// ============================================================================

async function acquireVisualBuffer(
  title: string,
  source: 'wikimedia' | 'veo3' | 'imagen3' | 'direct_url' | 'local',
  query?: string,
  customUrl?: string
): Promise<{ buffer: Buffer; attribution?: string }> {
  try {
    // Caso 1: URL directa
    if (source === 'direct_url' && customUrl) {
      console.log(`🌐 Descargando imagen desde URL directa: ${customUrl}`);
      const res = await fetch(customUrl);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      return { buffer: Buffer.from(arrayBuffer), attribution: 'Fuente Externa Directa' };
    }

    // FASE 3 ÚNICA: Adquisición Visual vía VEO3 / Imagen 3
    const veoApiUrl = (typeof process !== 'undefined' && process.env.PUBLIC_TGP_VEO_API_URL) 
      || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.PUBLIC_TGP_VEO_API_URL);

    console.log(`🎨 Adquiriendo asset representativo vía VEO3 para "${title}"...`);
    
    // Construimos el prompt canónico hiperrealista
    const imagePrompt = `Fotografía histórica hiperrealista, estilo documental arqueológico de National Geographic, cámara Leica 35mm. Tema: ${title}. ${query ? `Contexto visual: ${query}.` : ''} Estética: realista, dramática, iluminación cinematográfica natural, alta fidelidad material, textura hiperdetallada, sin elementos fantasiosos ni anacrónicos, 8k, obra maestra visual.`;

    if (veoApiUrl) {
      try {
        const veoRes = await fetch(veoApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: imagePrompt, aspect_ratio: '16:9' })
        });
        
        if (veoRes.ok) {
          const arrBuf = await veoRes.arrayBuffer();
          return {
            buffer: Buffer.from(arrBuf),
            attribution: 'Generado por TGP VEO3 (IA Sintética Hiperrealista)'
          };
        } else {
          console.warn(`⚠️ Fallo en API VEO3 (HTTP ${veoRes.status}). Cayendo a fallback...`);
        }
      } catch (e: any) {
        console.warn(`⚠️ Error de red contactando a VEO3: ${e.message}. Cayendo a fallback...`);
      }
    } else {
      console.warn(`⚠️ PUBLIC_TGP_VEO_API_URL no está configurada. Cayendo a fallback...`);
    }

    // Fallback Curado
    console.log(`⚠️ Usando asset fallback curado...`);
    const fallbackUrl = 'https://storage.thegreatpuzzleproject.com/Lascaux_001.jpg';
    const fbRes = await fetch(fallbackUrl);
    if (!fbRes.ok) throw new Error(`Fallo descargando fallback HTTP ${fbRes.status}`);
    const fbArr = await fbRes.arrayBuffer();
    return {
      buffer: Buffer.from(fbArr),
      attribution: 'The Great Puzzle Project · Visual Studio'
    };
  } catch (error: any) {
    throw new Error(`[Adquisición Visual] Error al obtener el recurso: ${error.message}`);
  }
}

// ============================================================================
// 4. FASE: REFINAMIENTO MATERIAL (SHARP -> WEBP ALTA FIDELIDAD)
// ============================================================================

async function refineVisualWithSharp(rawBuffer: Buffer): Promise<Buffer> {
  console.log(`⚙️  Refinando y optimizando imagen con Sharp (WebP 85% Dark Academia)...`);
  try {
    const image = sharp(rawBuffer);
    const metadata = await image.metadata();

    let pipeline = image;
    if (metadata.width && metadata.width > 2400) {
      pipeline = pipeline.resize({ width: 2400, withoutEnlargement: true });
    }

    return await pipeline
      .webp({ quality: 85, effort: 5 })
      .toBuffer();
  } catch (error: any) {
    throw new Error(`[Refinamiento Visual] Error en procesamiento de Sharp: ${error.message}`);
  }
}

// ============================================================================
// 5. FASE: ALMACENAMIENTO PERIMETRAL (CLOUDFLARE R2)
// ============================================================================

async function uploadToCloudflareR2(webpBuffer: Buffer, filenameKey: string): Promise<string> {
  const r2Key = `informes/${filenameKey}`;
  console.log(`☁️  Transfiriendo a Cloudflare R2 [${R2_BUCKET}/${r2Key}]...`);

  const tempPath = path.resolve(process.cwd(), `.temp-r2-${filenameKey}`);
  try {
    fs.writeFileSync(tempPath, webpBuffer);

    const { execSync } = await import('node:child_process');
    execSync(`npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${tempPath}" --remote --content-type="image/webp"`, {
      cwd: process.cwd(),
      stdio: 'pipe',
    });
    console.log(`✅ Asset almacenado con éxito en R2: ${R2_PUBLIC_DOMAIN}/${r2Key}`);
    return `${R2_PUBLIC_DOMAIN}/${r2Key}`;
  } catch (error: any) {
    console.warn(`⚠️ Wrangler R2 CLI falló: ${error.message}.`);
    throw new Error(`[Almacenamiento R2] Fallo al subir el asset al bucket. Revise credenciales de Wrangler en el servidor.`);
  } finally {
    if (fs.existsSync(tempPath)) {
      fs.unlinkSync(tempPath);
    }
  }
}

// ============================================================================
// 6. FASE: ENSAMBLAJE Y PERSISTENCIA (MDOC / MDX)
// ============================================================================

export async function generatePremiumReport(payload: PremiumReportPayload): Promise<PremiumReportResult> {
  const resolvedTitle = payload.title || payload.titulo;
  const resolvedCollection = (payload.collection || payload.coleccion || 'essays') as TGPCollection;
  const resolvedVisualSource = (payload.visualSource || payload.fuenteVisual || 'wikimedia') as 'wikimedia' | 'veo3' | 'imagen3' | 'direct_url' | 'local';

  const {
    slug: rawSlug,
    tags: rawTags = ['Liminal', 'Heterodoxia'],
    visualQuery,
    author = 'The Great Puzzle Project',
    region = 'INTERNACIONAL',
    year = new Date().getFullYear().toString(),
    template = 'victorian-archeo',
    promptHint,
    customImageUrl,
  } = payload;

  const title = resolvedTitle;
  const collection = resolvedCollection;
  const visualSource = resolvedVisualSource;

  if (!title || title.trim() === '') {
    throw new Error('El título (title/titulo) es requerido para generar el informe premium.');
  }

  const slug = rawSlug ? sanitizeSlug(rawSlug) : sanitizeSlug(title);
  const tags = Array.isArray(rawTags) ? rawTags : rawTags.split(',').map((t) => t.trim()).filter(Boolean);

  console.log(`\n======================================================`);
  console.log(`🚀 INICIANDO PIPELINE DE INFORME PREMIUM: "${title}"`);
  console.log(`📁 Colección: ${collection} | Slug: ${slug}`);
  console.log(`🏷️ Tags: ${tags.join(', ')} | Fuente Visual: ${visualSource}`);
  console.log(`======================================================\n`);

  try {
    // Paso 1: Motor Cognitivo
    console.log(`🧠 [Fase 2] Generando ensayo y metadata analítica...`);
    const cognitiveData = await runCognitiveEngine(title, collection, tags, promptHint);

    // Paso 2: Adquisición Visual
    console.log(`📸 [Fase 3] Adquiriendo recurso visual (${visualSource})...`);
    const { buffer: rawVisualBuffer } = await acquireVisualBuffer(title, visualSource, visualQuery, customImageUrl);

    // Paso 3: Refinamiento Material con Sharp
    console.log(`✨ [Fase 4] Refinando buffer visual con Sharp...`);
    const webpBuffer = await refineVisualWithSharp(rawVisualBuffer);

    // Paso 4: Almacenamiento Perimetral en Cloudflare R2
    console.log(`☁️  [Fase 5] Almacenando en Cloudflare R2...`);
    const r2ImageUrl = await uploadToCloudflareR2(webpBuffer, `${slug}.webp`);

    // Paso 5: Ensamblaje Frontmatter y Persistencia
    console.log(`📝 [Fase 6] Ensamblando frontmatter y persistiendo archivo...`);
    const targetDir = path.resolve(process.cwd(), 'src/content', collection);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, `${slug}.mdoc`);
    const today = new Date().toISOString().split('T')[0];

    const frontmatter = `---
title: "${title}"
subtitle: "${cognitiveData.excerpt.replace(/"/g, '\\"')}"
author: "${author}"
date: "${today}"
coverImage: "${r2ImageUrl}"
hero_image: "${r2ImageUrl}"
template: "${template}"
draft: false
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
card_metadata:
  card_title: "${title.toUpperCase()}"
  card_author: "${author.toUpperCase()}"
  card_region: "${region.toUpperCase()}"
  card_year: "${year}"
  card_excerpt: >-
    ${cognitiveData.excerpt}
  card_tags: "${cognitiveData.cardTags}"
  card_image: "${r2ImageUrl}"
ai_copilot:
  generation_mode: disabled
  trigger_both: false
  trigger_text_only: false
  trigger_image_only: false
origen_cognitivo: 'Orquestador Astro / TGP Mind V2'
---

${cognitiveData.bodyMarkdown.trim()}
`;

    fs.writeFileSync(filePath, frontmatter, 'utf-8');
    console.log(`✅ ¡Informe Premium ensamblado exitosamente en ${filePath}!\n`);

    return {
      success: true,
      filePath,
      publicPostUrl: `/${collection}/${slug}`,
      r2ImageUrl,
      wordCount: cognitiveData.wordCount,
      excerpt: cognitiveData.excerpt,
      cardTags: cognitiveData.cardTags,
    };
  } catch (error: any) {
    console.error(`\n❌ ERROR FATAL EN PIPELINE: ${error.message}\n`);
    return {
      success: false,
      filePath: '',
      publicPostUrl: '',
      wordCount: 0,
      excerpt: '',
      cardTags: '',
      error: error.message,
    };
  }
}
