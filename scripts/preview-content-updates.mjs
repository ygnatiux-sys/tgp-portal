import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const manifestRaw = fs.readFileSync(path.join(projectRoot, 'scripts/manifest.json'), 'utf8');
const manifest = JSON.parse(manifestRaw);

// Build lookup tables:
// 1. Exact relative path: e.g. "/images/posts/arkhaim/hero_image.jpg" -> r2Url
// 2. Slug-based lookup: e.g. "arkhaim" -> r2Url
const exactLookup = new Map();
const slugLookup = new Map();

for (const item of manifest) {
  // Variations of local paths
  exactLookup.set(`/images/${item.relPath}`, item.r2Url);
  exactLookup.set(`@/assets/images/${item.relPath}`, item.r2Url);
  exactLookup.set(`/src/assets/${item.relPath}`, item.r2Url);
  exactLookup.set(`src/assets/images/${item.relPath}`, item.r2Url);
  exactLookup.set(`public/images/${item.relPath}`, item.r2Url);

  // Slug lookup for posts and ensayos
  const parts = item.relPath.split('/');
  if (parts.length >= 2) {
    const slug = parts[1].toLowerCase().trim().replace(/[^a-z0-9_-]/g, '-');
    if (!slugLookup.has(slug)) {
      slugLookup.set(slug, item.r2Url);
    }
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

const posts = findFiles(path.join(projectRoot, 'src/content'), ['.md', '.mdoc', '.mdx']);
console.log(`Analizando ${posts.length} archivos de contenido...\n`);

const summary = [];

for (const p of posts) {
  const rel = path.relative(projectRoot, p).split(path.sep).join('/');
  const slug = path.parse(p).name.toLowerCase();
  const content = fs.readFileSync(p, 'utf8');

  // Check current hero/cover
  const heroMatch = content.match(/(?:hero_image|coverImage):\s*['"]?([^'"\r\n]+)['"]?/i);
  const currentImg = heroMatch ? heroMatch[1].trim() : null;

  let resolvedR2 = null;
  let reason = '';

  if (currentImg && currentImg.includes('storage.thegreatpuzzleproject.com')) {
    resolvedR2 = currentImg;
    reason = 'Ya en R2';
  } else if (currentImg && exactLookup.has(currentImg)) {
    resolvedR2 = exactLookup.get(currentImg);
    reason = 'Mapeo exacto de ruta';
  } else if (slugLookup.has(slug)) {
    resolvedR2 = slugLookup.get(slug);
    reason = 'Mapeo por slug de post';
  } else {
    // Check if slug has partial match
    const slugClean = slug.replace(/[^a-z0-9_-]/g, '-');
    if (slugLookup.has(slugClean)) {
      resolvedR2 = slugLookup.get(slugClean);
      reason = 'Mapeo por slug limpio';
    } else {
      resolvedR2 = 'https://storage.thegreatpuzzleproject.com/default-hero.webp';
      reason = 'Fallback a default-hero';
    }
  }

  // Spreads check
  const spreads = [...content.matchAll(/-\s*['"]?(\/images\/spreads\/[^'"\r\n]+)['"]?/g)].map(m => m[1]);
  const spreadsUpdated = spreads.map(s => {
    return {
      original: s,
      r2: exactLookup.get(s) || s
    };
  });

  summary.push({
    rel,
    slug,
    currentImg,
    resolvedR2,
    reason,
    spreadsCount: spreads.length,
    spreadsUpdated
  });
}

console.log('Resultados de resolución para todos los posts:');
let direct = 0;
let bySlug = 0;
let defaultHero = 0;
let already = 0;

for (const s of summary) {
  if (s.reason === 'Ya en R2') already++;
  else if (s.reason === 'Mapeo exacto de ruta') direct++;
  else if (s.reason.startsWith('Mapeo por slug')) bySlug++;
  else defaultHero++;

  console.log(`📄 ${s.rel}`);
  console.log(`   Actual: ${s.currentImg || '(sin imagen)'}`);
  console.log(`   ➔ R2:   ${s.resolvedR2} (${s.reason})`);
  if (s.spreadsCount > 0) {
    console.log(`   ✨ Spreads (${s.spreadsCount}):`);
    s.spreadsUpdated.forEach(sp => console.log(`      ${sp.original} ➔ ${sp.r2}`));
  }
}

console.log(`\n======================================================`);
console.log(`📊 TOTALES DE RESOLUCIÓN:`);
console.log(`   - Ya en R2: ${already}`);
console.log(`   - Resueltos por ruta exacta: ${direct}`);
console.log(`   - Resueltos por carpeta/slug existente: ${bySlug}`);
console.log(`   - Asignados a default-hero: ${defaultHero}`);
console.log(`   Total posts: ${summary.length}`);
console.log(`======================================================\n`);
