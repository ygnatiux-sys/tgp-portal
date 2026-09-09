#!/usr/bin/env node
/**
 * scripts/full-migrate-r2.mjs
 * 
 * Pipeline Maestro de Migración a Cloudflare R2:
 * 1. Lee todas las imágenes locales (posts, ensayos, spreads, default-hero).
 * 2. Verifica con HEAD si ya existen en https://storage.thegreatpuzzleproject.com.
 * 3. Si no existen, convierte a WebP (Sharp Q85 max 2400px) y sube a R2 bucket 'tgp-storage' con Wrangler CLI.
 * 4. Actualiza todos los archivos de contenido en src/content para apuntar a las URLs de R2.
 * 5. Actualiza fallbacks en esquemas y componentes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const R2_BUCKET = 'tgp-storage';
const PUBLIC_DOMAIN = 'https://storage.thegreatpuzzleproject.com';
const isDryRun = process.argv.includes('--dry-run');

function sanitizeSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function checkRemoteExists(url) {
  try {
    const res = await fetch(url, { method: 'HEAD' });
    return res.status === 200;
  } catch {
    return false;
  }
}

async function convertToWebp(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  let pipeline = image;
  if (metadata.width && metadata.width > 2400) {
    pipeline = pipeline.resize({ width: 2400, withoutEnlargement: true });
  }

  await pipeline
    .webp({ quality: 85, effort: 5 })
    .toFile(outputPath);

  return {
    initialBytes: fs.statSync(inputPath).size,
    finalBytes: fs.statSync(outputPath).size,
  };
}

function uploadFileToR2(localPath, r2Key) {
  const cmd = `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localPath}" --remote --content-type="image/webp"`;
  execSync(cmd, { cwd: projectRoot, stdio: 'pipe' });
  return `${PUBLIC_DOMAIN}/${r2Key}`;
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`🚀 PIPELINE MAESTRO: MIGRACIÓN A CLOUDFLARE R2`);
  console.log(`   Bucket: ${R2_BUCKET}`);
  console.log(`   CDN:    ${PUBLIC_DOMAIN}`);
  if (isDryRun) console.log(`   ⚠️ MODO DRY-RUN ACTIVADO`);
  console.log(`======================================================\n`);

  const manifestPath = path.join(projectRoot, 'scripts/manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('No se encontró scripts/manifest.json. Ejecuta primero build-migration-manifest.mjs');
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`📦 Total de imágenes en catálogo: ${manifest.length}\n`);

  let alreadyCount = 0;
  let uploadedCount = 0;
  let failedCount = 0;

  // Deduplicación de uploads por r2Key
  const seenKeys = new Set();
  const uniqueItems = [];
  for (const item of manifest) {
    if (!seenKeys.has(item.r2Key)) {
      seenKeys.add(item.r2Key);
      uniqueItems.push(item);
    }
  }

  console.log(`🔍 Claves R2 únicas a procesar: ${uniqueItems.length}\n`);

  for (let i = 0; i < uniqueItems.length; i++) {
    const item = uniqueItems[i];
    const progress = `[${i + 1}/${uniqueItems.length}]`;

    // 1. Verificar si ya existe en R2
    const exists = await checkRemoteExists(item.r2Url);
    if (exists) {
      alreadyCount++;
      console.log(`${progress} ⏭️  Ya existe en R2: ${item.r2Key}`);
      continue;
    }

    console.log(`${progress} 🔄 Procesando: ${item.relPath} ➔ ${item.r2Key}`);

    if (isDryRun) {
      uploadedCount++;
      console.log(`   [DRY-RUN] Convertiría y subiría a ${item.r2Url}`);
      continue;
    }

    const tempFilename = `.temp-${sanitizeSlug(item.r2Key)}.webp`;
    const tempWebp = path.join(projectRoot, tempFilename);

    try {
      const { initialBytes, finalBytes } = await convertToWebp(item.localAbs, tempWebp);
      const savings = (((initialBytes - finalBytes) / initialBytes) * 100).toFixed(1);
      console.log(`   🎨 WebP: ${(initialBytes / 1024).toFixed(1)} KB ➔ ${(finalBytes / 1024).toFixed(1)} KB (-${savings}%)`);

      uploadFileToR2(tempWebp, item.r2Key);
      console.log(`   ☁️  Subido con éxito a: ${item.r2Url}`);
      uploadedCount++;
    } catch (err) {
      console.error(`   ❌ Error en ${item.relPath}:`, err.message);
      failedCount++;
    } finally {
      if (fs.existsSync(tempWebp)) {
        try { fs.unlinkSync(tempWebp); } catch {}
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`📊 RESULTADO DE SUBIDA A R2:`);
  console.log(`   ✅ Ya existían en CDN: ${alreadyCount}`);
  console.log(`   🚀 ${isDryRun ? 'Simulados para subir' : 'Subidos con éxito'}: ${uploadedCount}`);
  console.log(`   ❌ Errores: ${failedCount}`);
  console.log(`======================================================\n`);

  // FASE 2: ACTUALIZACIÓN DE FRONTMATTER DE CONTENIDO
  console.log(`📝 Actualizando archivos de contenido en src/content...`);

  // Construir mapa de rutas locales a URLs R2
  const pathMap = new Map();
  const slugMap = new Map();

  for (const item of manifest) {
    pathMap.set(`/images/${item.relPath}`, item.r2Url);
    pathMap.set(`@/assets/images/${item.relPath}`, item.r2Url);
    pathMap.set(`/src/assets/${item.relPath}`, item.r2Url);
    pathMap.set(`src/assets/images/${item.relPath}`, item.r2Url);
    pathMap.set(`public/images/${item.relPath}`, item.r2Url);

    const parts = item.relPath.split('/');
    if (parts.length >= 2) {
      const slug = sanitizeSlug(parts[1]);
      if (!slugMap.has(slug)) slugMap.set(slug, item.r2Url);
    }
  }

  function findFiles(dir, exts) {
    let list = [];
    if (!fs.existsSync(dir)) return list;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) list = list.concat(findFiles(full, exts));
      else if (exts.some(ext => entry.name.endsWith(ext))) list.push(full);
    }
    return list;
  }

  const contentFiles = findFiles(path.join(projectRoot, 'src/content'), ['.md', '.mdoc', '.mdx']);
  let updatedPosts = 0;

  for (const file of contentFiles) {
    const rel = path.relative(projectRoot, file).split(path.sep).join('/');
    const slug = sanitizeSlug(path.parse(file).name);
    let raw = fs.readFileSync(file, 'utf8');
    let modified = false;

    // 1. Reemplazo de spreads
    for (const [localRef, r2Url] of pathMap.entries()) {
      if (raw.includes(localRef)) {
        raw = raw.split(localRef).join(r2Url);
        modified = true;
      }
    }

    // 2. Determinar la URL R2 principal del post
    const heroMatch = raw.match(/(?:hero_image|coverImage):\s*['"]?([^'"\r\n]+)['"]?/i);
    const currentHero = heroMatch ? heroMatch[1].trim() : null;

    let targetR2Url = null;
    if (currentHero && currentHero.includes('storage.thegreatpuzzleproject.com')) {
      targetR2Url = currentHero;
    } else if (currentHero && pathMap.has(currentHero)) {
      targetR2Url = pathMap.get(currentHero);
    } else if (slugMap.has(slug)) {
      targetR2Url = slugMap.get(slug);
    } else if (slug === 'el-oraculo-de-delfos') {
      targetR2Url = `${PUBLIC_DOMAIN}/el-oraculo-de-delfos.webp`;
    } else {
      targetR2Url = `${PUBLIC_DOMAIN}/default-hero.webp`;
    }

    // 3. Actualizar o insertar hero_image / coverImage
    const isEnsayo = rel.includes('/ensayos/');
    const fieldName = isEnsayo ? 'coverImage' : 'hero_image';

    if (new RegExp(`(?:hero_image|coverImage):\\s*['"]?[^'"\\r\\n]+['"]?`, 'i').test(raw)) {
      const newRaw = raw.replace(
        new RegExp(`(?:hero_image|coverImage):\\s*['"]?[^'"\\r\\n]+['"]?`, 'i'),
        `${fieldName}: ${targetR2Url}`
      );
      if (newRaw !== raw) {
        raw = newRaw;
        modified = true;
      }
    } else {
      // No tenía declarado hero: insertarlo debajo de title:
      raw = raw.replace(/(title:\s*[^\r\n]+)/i, `$1\n${fieldName}: ${targetR2Url}`);
      modified = true;
    }

    // 4. Limpiar hero_source_picker si tenía referencia local obsoleta
    if (/source:\s*local/i.test(raw)) {
      raw = raw.replace(/source:\s*local/g, 'source: direct_url');
      modified = true;
    }

    if (modified) {
      if (!isDryRun) {
        fs.writeFileSync(file, raw, 'utf8');
      }
      updatedPosts++;
      console.log(`   ✏️ Actualizado: ${rel} ➔ ${targetR2Url}`);
    }
  }

  console.log(`\n✅ ${updatedPosts} archivos de contenido actualizados.`);
  console.log(`\n🎉 Migración y acomodación completa.`);
}

run().catch(err => {
  console.error('Fallo en la ejecución:', err);
  process.exit(1);
});
