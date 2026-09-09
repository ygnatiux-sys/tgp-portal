#!/usr/bin/env node
/**
 * scripts/upload-r2.mjs
 * 
 * Pipeline de optimización y subida a Cloudflare R2 para The Great Puzzle.
 * Convierte imágenes (JPG, PNG, TIFF, etc.) a WebP de alta fidelidad con Sharp
 * y las sube al bucket 'tgp-storage' mediante Wrangler.
 * 
 * Uso:
 *   node scripts/upload-r2.mjs <archivo-o-carpeta> [--update-posts]
 *   node scripts/upload-r2.mjs src/assets/images/posts/el-oraculo-de-delfos.jpg
 *   node scripts/upload-r2.mjs --scan-posts (busca y migra imágenes locales en src/content)
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

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Optimiza una imagen local a formato WebP
 */
async function processToWebp(inputPath, outputPath) {
  const image = sharp(inputPath);
  const metadata = await image.metadata();

  // Limitar ancho máximo a 2400px (4K retina) si es mayor
  let pipeline = image;
  if (metadata.width && metadata.width > 2400) {
    pipeline = pipeline.resize({ width: 2400, withoutEnlargement: true });
  }

  await pipeline
    .webp({ quality: 85, effort: 5 })
    .toFile(outputPath);

  const initialSize = fs.statSync(inputPath).size;
  const finalSize = fs.statSync(outputPath).size;
  const savings = (((initialSize - finalSize) / initialSize) * 100).toFixed(1);

  return { initialSize, finalSize, savings };
}

/**
 * Sube un archivo a Cloudflare R2 vía Wrangler CLI
 */
function uploadToR2(localFilePath, r2Key) {
  console.log(`☁️  Subiendo a R2 [${R2_BUCKET}/${r2Key}]...`);
  const cmd = `npx wrangler r2 object put "${R2_BUCKET}/${r2Key}" --file="${localFilePath}" --remote --content-type="image/webp"`;
  try {
    execSync(cmd, { cwd: projectRoot, stdio: 'pipe' });
    const publicUrl = `${PUBLIC_DOMAIN}/${r2Key}`;
    return publicUrl;
  } catch (err) {
    console.error(`❌ Error en wrangler r2: ${err.message}`);
    throw err;
  }
}

/**
 * Procesa y sube una sola imagen
 */
export async function uploadImage(inputPath, customName = null) {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`El archivo no existe: ${inputPath}`);
  }

  const baseName = customName || path.parse(inputPath).name;
  const sanitizedKey = `${sanitizeFilename(baseName)}.webp`;
  const tempWebp = path.join(projectRoot, `.temp-${sanitizedKey}`);

  try {
    console.log(`\n⚙️  Convirtiendo a WebP: ${path.basename(inputPath)}...`);
    const { initialSize, finalSize, savings } = await processToWebp(inputPath, tempWebp);
    console.log(`   Tamaño: ${(initialSize / 1024).toFixed(1)} KB ➔ ${(finalSize / 1024).toFixed(1)} KB (Ahorro: ${savings}%)`);

    const publicUrl = uploadToR2(tempWebp, sanitizedKey);
    console.log(`✅ ¡Éxito! URL pública generada:`);
    console.log(`   🔗 ${publicUrl}\n`);

    return { publicUrl, r2Key: sanitizedKey };
  } finally {
    if (fs.existsSync(tempWebp)) {
      fs.unlinkSync(tempWebp);
    }
  }
}

// ── MODO CLI ────────────────────────────────────────────────────────
async function runCLI() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
Uso del optimizador TGP Cloudflare R2:
  node scripts/upload-r2.mjs <archivo-o-carpeta>
  
Ejemplo:
  node scripts/upload-r2.mjs "src/assets/images/posts/el-oraculo-de-delfos.jpg"
    `);
    process.exit(0);
  }

  const targetPath = path.resolve(projectRoot, args[0]);

  if (fs.statSync(targetPath).isDirectory()) {
    const files = fs.readdirSync(targetPath);
    for (const file of files) {
      if (/\.(jpe?g|png|webp|avif|tiff)$/i.test(file)) {
        await uploadImage(path.join(targetPath, file));
      }
    }
  } else {
    await uploadImage(targetPath);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runCLI().catch((err) => {
    console.error('Error fatal:', err);
    process.exit(1);
  });
}
