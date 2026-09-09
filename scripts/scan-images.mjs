import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function resolveLocalImage(imagePath) {
  if (!imagePath) return null;
  const clean = imagePath.trim().replace(/^['"]|['"]$/g, '');
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('//')) {
    return 'REMOTE';
  }

  const candidates = [
    clean.startsWith('/src/assets/') ? path.join(projectRoot, clean.replace(/^\//, '')) : null,
    clean.startsWith('@/assets/') ? path.join(projectRoot, 'src', clean.replace('@/', '')) : null,
    clean.startsWith('src/assets/') ? path.join(projectRoot, clean) : null,
    clean.startsWith('/images/') ? path.join(projectRoot, 'src', 'assets', clean.replace(/^\//, '')) : null,
    clean.startsWith('/images/') ? path.join(projectRoot, 'public', clean.replace(/^\//, '')) : null,
    clean.startsWith('images/') ? path.join(projectRoot, 'src', 'assets', clean) : null,
    clean.startsWith('images/') ? path.join(projectRoot, 'public', clean) : null,
    path.join(projectRoot, 'src', 'assets', 'images', clean.replace(/^\/+/, '')),
    path.join(projectRoot, 'public', clean.replace(/^\/+/, '')),
  ].filter(Boolean);

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return null;
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

const posts = findFiles(path.join(projectRoot, 'src', 'content'), ['.md', '.mdoc', '.mdx']);
console.log(`\n📚 Total posts en src/content: ${posts.length}`);

let remoteCount = 0;
let localResolved = [];
let localMissing = [];

for (const postPath of posts) {
  const content = fs.readFileSync(postPath, 'utf8');
  const match = content.match(/(?:coverImage|hero_image|local_image):\s*['"]?([^'"\r\n]+)['"]?/i);
  if (match) {
    const rawImg = match[1].trim();
    const resolved = resolveLocalImage(rawImg);
    if (resolved === 'REMOTE') {
      remoteCount++;
    } else if (resolved) {
      localResolved.push({ postPath, rawImg, resolved });
    } else {
      localMissing.push({ postPath, rawImg });
    }
  }
}

console.log(`🌐 Ya están en R2 / Remoto: ${remoteCount}`);
console.log(`📁 Locales listas para subir a R2: ${localResolved.length}`);
console.log(`⚠️  No encontradas en disco: ${localMissing.length}`);

// Escanear todas las imágenes en src/assets y public
const assetImages = findFiles(path.join(projectRoot, 'src', 'assets'), ['.jpg', '.jpeg', '.png', '.webp', '.avif']);
const publicImages = findFiles(path.join(projectRoot, 'public', 'images'), ['.jpg', '.jpeg', '.png', '.webp', '.avif']);

console.log(`\n🖼️  Archivos de imagen en src/assets: ${assetImages.length}`);
console.log(`🖼️  Archivos de imagen en public/images: ${publicImages.length}`);
console.log(`Total archivos de imagen en disco: ${assetImages.length + publicImages.length}\n`);
