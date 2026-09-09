import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const R2_BUCKET = 'tgp-storage';
const PUBLIC_DOMAIN = 'https://storage.thegreatpuzzleproject.com';

function sanitizeSlug(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function findImages(dir) {
  let list = [];
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) list = list.concat(findImages(full));
    else if (/\.(jpe?g|png|webp|avif)$/i.test(entry.name)) list.push(full);
  }
  return list;
}

// Gather all images from public/images and src/assets/images
const publicImgs = findImages(path.join(projectRoot, 'public/images'));
const assetImgs = findImages(path.join(projectRoot, 'src/assets/images'));

// Deduplicate by relative path under images/
const canonicalMap = new Map();

function registerFile(absPath, baseFolder) {
  const rel = path.relative(baseFolder, absPath).split(path.sep).join('/');
  if (!canonicalMap.has(rel)) {
    canonicalMap.set(rel, absPath);
  }
}

publicImgs.forEach(f => registerFile(f, path.join(projectRoot, 'public/images')));
assetImgs.forEach(f => registerFile(f, path.join(projectRoot, 'src/assets/images')));

// Also check src/assets/ensayos (like la-torre-de-babel)
const extraEnsayos = findImages(path.join(projectRoot, 'src/assets/ensayos'));
extraEnsayos.forEach(f => {
  const rel = 'ensayos/' + path.relative(path.join(projectRoot, 'src/assets/ensayos'), f).split(path.sep).join('/');
  if (!canonicalMap.has(rel)) {
    canonicalMap.set(rel, f);
  }
});

console.log(`\n======================================================`);
console.log(`📸 MANIFEST DE IMÁGENES A MIGRAR A R2`);
console.log(`   Total únicas encontradas: ${canonicalMap.size}`);
console.log(`======================================================\n`);

const uploadManifest = [];

for (const [relPath, localAbs] of canonicalMap.entries()) {
  const parts = relPath.split('/');
  const category = parts[0]; // 'posts', 'ensayos', 'spreads', or filename
  let r2Key = '';

  if (category === 'posts') {
    // posts/<slug>/hero_image.<ext> OR posts/<slug>.<ext>
    if (parts.length >= 3) {
      const slug = sanitizeSlug(parts[1]);
      r2Key = `posts/${slug}.webp`;
    } else {
      const slug = sanitizeSlug(path.parse(parts[1]).name);
      r2Key = `posts/${slug}.webp`;
    }
  } else if (category === 'ensayos') {
    // ensayos/<slug>/coverImage.<ext> OR ensayos/<name>.<ext>
    if (parts.length >= 3) {
      const slug = sanitizeSlug(parts[1]);
      r2Key = `ensayos/${slug}.webp`;
    } else {
      const slug = sanitizeSlug(path.parse(parts[1]).name);
      r2Key = `ensayos/${slug}.webp`;
    }
  } else if (category === 'spreads') {
    // spreads/<slug>/editorial_spreads/<spreadIdx>/value/images/<imgIdx>.<ext>
    const slug = sanitizeSlug(parts[1]);
    const filename = path.parse(relPath).name; // e.g. "0" or "1"
    const spreadIdx = parts[3] || '0';
    r2Key = `spreads/${slug}/${spreadIdx}_${filename}.webp`;
  } else if (relPath.includes('default-hero')) {
    r2Key = 'default-hero.webp';
  } else {
    const slug = sanitizeSlug(path.parse(relPath).name);
    r2Key = `misc/${slug}.webp`;
  }

  const r2Url = `${PUBLIC_DOMAIN}/${r2Key}`;
  const localSizeKb = (fs.statSync(localAbs).size / 1024).toFixed(1);

  uploadManifest.push({
    relPath,
    localAbs,
    r2Key,
    r2Url,
    localSizeKb,
    category
  });
}

// Check for collisions in r2Key
const r2KeyCounts = new Map();
for (const item of uploadManifest) {
  r2KeyCounts.set(item.r2Key, (r2KeyCounts.get(item.r2Key) || 0) + 1);
}

let collisions = 0;
for (const [key, count] of r2KeyCounts.entries()) {
  if (count > 1) {
    console.error(`⚠️ Key collision detected on ${key} (${count} files):`);
    uploadManifest.filter(m => m.r2Key === key).forEach(m => console.error(`   - ${m.relPath}`));
    collisions++;
  }
}

if (collisions === 0) {
  console.log(`✅ Cero colisiones en claves R2.`);
}

console.log(`\nDesglose por categoría:`);
const cats = {};
uploadManifest.forEach(m => {
  cats[m.category] = (cats[m.category] || 0) + 1;
});
console.log(cats);

console.log(`\nEjemplos de mapeo:`);
uploadManifest.slice(0, 15).forEach(m => {
  console.log(`  [${m.localSizeKb} KB] ${m.relPath} ➔ ${m.r2Key}`);
});

fs.writeFileSync(
  path.join(projectRoot, 'scripts/manifest.json'),
  JSON.stringify(uploadManifest, null, 2),
  'utf8'
);
console.log(`\n💾 Manifest guardado en scripts/manifest.json`);
