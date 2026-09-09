#!/usr/bin/env node
/**
 * scripts/migrate-all-to-r2.mjs
 * 
 * Pipeline masivo de migración a Cloudflare R2:
 * 1. Mapea cada post en src/content a su imagen real en disco (src/assets o public/).
 * 2. Convierte cada imagen a WebP de alta definición con Sharp.
 * 3. Sube a Cloudflare R2 (bucket 'tgp-storage') vía Wrangler CLI.
 * 4. Actualiza los .mdoc / .md para que apunten a https://storage.thegreatpuzzleproject.com/<slug>.webp.
 * 
 * Uso:
 *   node scripts/migrate-all-to-r2.mjs --dry-run   (solo simula y muestra qué haría)
 *   node scripts/migrate-all-to-r2.mjs             (ejecuta la migración real)
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

/**
 * Encuentra la imagen en disco para un post
 */
function findImageForPost(postPath, content) {
  const postSlug = path.parse(postPath).name;

  // 1. Verificar si ya tiene una URL remota
  const remoteMatch = content.match(/(?:coverImage|hero_image):\s*['"]?(https?:\/\/[^'"\r\n]+)['"]?/i);
  if (remoteMatch && remoteMatch[1].includes('storage.thegreatpuzzleproject.com')) {
    return { type: 'ALREADY_R2', url: remoteMatch[1] };
  }

  // 2. Extraer ruta declarada en frontmatter
  const match = content.match(/(?:coverImage|hero_image|local_image):\s*['"]?([^'"\r\n]+)['"]?/i);
  const declared = match ? match[1].trim() : null;

  const candidates = [];

  if (declared && !declared.startsWith('http')) {
    candidates.push(
      path.join(projectRoot, declared.replace(/^@\//, 'src/').replace(/^\//, '')),
      path.join(projectRoot, 'src', 'assets', declared.replace(/^\//, '')),
      path.join(projectRoot, 'src', 'assets', 'images', declared.replace(/^\//, '')),
      path.join(projectRoot, 'public', declared.replace(/^\//, ''))
    );
  }

  // 3. Fallbacks por nombre de carpeta o slug
  const possibleDirs = [
    path.join(projectRoot, 'src', 'assets', 'images', 'posts', postSlug),
    path.join(projectRoot, 'src', 'assets', 'images', 'ensayos', postSlug),
    path.join(projectRoot, 'src', 'assets', 'ensayos', postSlug),
    path.join(projectRoot, 'public', 'images', 'posts', postSlug),
  ];

  for (const dir of possibleDirs) {
    if (fs.existsSync(dir) && fs.statSync(dir).isDirectory()) {
      const files = fs.readdirSync(dir);
      for (const f of files) {
        if (/\.(jpe?g|png|webp|avif)$/i.test(f)) {
          candidates.push(path.join(dir, f));
        }
      }
    }
  }

  // 4. Fallback directo por archivo con el nombre del slug
  const imgExts = ['.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of imgExts) {
    candidates.push(
      path.join(projectRoot, 'src', 'assets', 'images', 'posts', `${postSlug}${ext}`),
      path.join(projectRoot, 'src', 'assets', 'images', 'ensayos', `${postSlug}${ext}`),
      path.join(projectRoot, 'public', 'images', 'posts', `${postSlug}${ext}`)
    );
  }

  for (const cand of candidates) {
    if (cand && fs.existsSync(cand) && fs.statSync(cand).isFile()) {
      return { type: 'LOCAL', localPath: cand, slug: postSlug };
    }
  }

  return { type: 'NOT_FOUND', slug: postSlug };
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

function updatePostFrontmatter(postPath, newR2Url) {
  let content = fs.readFileSync(postPath, 'utf8');

  // Si ya tiene coverImage o hero_image, reemplazarlo
  if (/coverImage:\s*['"]?[^'"\r\n]+['"]?/i.test(content)) {
    content = content.replace(/coverImage:\s*['"]?[^'"\r\n]+['"]?/i, `coverImage: "${newR2Url}"`);
  } else if (/hero_image:\s*['"]?[^'"\r\n]+['"]?/i.test(content)) {
    content = content.replace(/hero_image:\s*['"]?[^'"\r\n]+['"]?/i, `hero_image: "${newR2Url}"`);
  } else if (/local_image:\s*['"]?[^'"\r\n]+['"]?/i.test(content)) {
    content = content.replace(/local_image:\s*['"]?[^'"\r\n]+['"]?/i, `coverImage: "${newR2Url}"`);
  } else {
    // Insertar coverImage justo después del title:
    content = content.replace(/(title:\s*[^\r\n]+)/i, `$1\ncoverImage: "${newR2Url}"`);
  }

  fs.writeFileSync(postPath, content, 'utf8');
}

async function main() {
  console.log(`\n======================================================`);
  console.log(`🚀 PIPELINE DE MIGRACIÓN A CLOUDFLARE R2 (WEBP)`);
  console.log(`   Bucket destino: ${R2_BUCKET}`);
  console.log(`   Dominio público: ${PUBLIC_DOMAIN}`);
  if (isDryRun) console.log(`   ⚠️  MODO DRY-RUN (Simulación sin cambios)`);
  console.log(`======================================================\n`);

  const posts = findFiles(path.join(projectRoot, 'src', 'content'), ['.md', '.mdoc', '.mdx']);
  console.log(`📋 Posts analizados: ${posts.length}\n`);

  let alreadyR2 = 0;
  let migrated = 0;
  let skippedNoImage = 0;

  for (let i = 0; i < posts.length; i++) {
    const postPath = posts[i];
    const relPost = path.relative(projectRoot, postPath);
    const content = fs.readFileSync(postPath, 'utf8');
    const result = findImageForPost(postPath, content);

    if (result.type === 'ALREADY_R2') {
      alreadyR2++;
      console.log(`[${i + 1}/${posts.length}] ⏭️  Ya en R2: ${relPost} ➔ ${result.url}`);
      continue;
    }

    if (result.type === 'NOT_FOUND') {
      skippedNoImage++;
      console.log(`[${i + 1}/${posts.length}] ⚪ Sin imagen local específica: ${relPost}`);
      continue;
    }

    const r2Key = `${sanitizeSlug(result.slug)}.webp`;
    const r2Url = `${PUBLIC_DOMAIN}/${r2Key}`;
    console.log(`[${i + 1}/${posts.length}] 📦 Migrando: ${relPost}`);
    console.log(`   Local: ${path.relative(projectRoot, result.localPath)}`);
    console.log(`   R2 Key: ${r2Key}`);

    if (!isDryRun) {
      const tempWebp = path.join(projectRoot, `.temp-batch-${r2Key}`);
      try {
        const { initialBytes, finalBytes } = await convertToWebp(result.localPath, tempWebp);
        const savings = (((initialBytes - finalBytes) / initialBytes) * 100).toFixed(1);
        console.log(`   WebP: ${(initialBytes / 1024).toFixed(1)} KB ➔ ${(finalBytes / 1024).toFixed(1)} KB (-${savings}%)`);

        uploadFileToR2(tempWebp, r2Key);
        updatePostFrontmatter(postPath, r2Url);
        console.log(`   ✅ Subido y frontmatter actualizado a: ${r2Url}\n`);
        migrated++;
      } catch (err) {
        console.error(`   ❌ Error procesando ${relPost}:`, err.message);
      } finally {
        if (fs.existsSync(tempWebp)) fs.unlinkSync(tempWebp);
      }
    } else {
      console.log(`   [DRY-RUN] Convertiría a ${r2Key} y actualizaría frontmatter.\n`);
      migrated++;
    }
  }

  console.log(`======================================================`);
  console.log(`📊 RESUMEN DE MIGRACIÓN:`);
  console.log(`   ✅ Ya estaban en R2: ${alreadyR2}`);
  console.log(`   🚀 ${isDryRun ? 'Listos para migrar' : 'Migrados con éxito'}: ${migrated}`);
  console.log(`   ⚪ Sin imagen local (usan default-hero): ${skippedNoImage}`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('Fallo en la migración:', err);
  process.exit(1);
});
