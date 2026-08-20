import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentDir = path.join(__dirname, 'src', 'content');

function findContentFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findContentFiles(fullPath, fileList);
    } else if (
      entry.name.endsWith('.md') ||
      entry.name.endsWith('.mdx') ||
      entry.name.endsWith('.mdoc')
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

function resolveLocalImage(imagePath) {
  if (!imagePath) return null;
  const clean = imagePath.trim().replace(/^['"]|['"]$/g, '');
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('//')) {
    return 'REMOTE';
  }

  // Candidatos a verificar en disco
  const candidates = [];

  // 1. /src/assets/... o @/assets/...
  if (clean.startsWith('/src/assets/')) {
    candidates.push(path.join(__dirname, clean.replace(/^\//, '')));
  }
  if (clean.startsWith('@/assets/')) {
    candidates.push(path.join(__dirname, 'src', clean.replace('@/', '')));
  }
  if (clean.startsWith('src/assets/')) {
    candidates.push(path.join(__dirname, clean));
  }

  // 2. /images/...
  if (clean.startsWith('/images/')) {
    candidates.push(path.join(__dirname, 'src', 'assets', clean.replace(/^\//, '')));
    candidates.push(path.join(__dirname, 'public', clean.replace(/^\//, '')));
  }
  if (clean.startsWith('images/')) {
    candidates.push(path.join(__dirname, 'src', 'assets', clean));
    candidates.push(path.join(__dirname, 'public', clean));
  }

  // 3. Fallback genérico a src/assets/images/
  candidates.push(path.join(__dirname, 'src', 'assets', 'images', clean.replace(/^\/+/, '')));
  candidates.push(path.join(__dirname, 'public', clean.replace(/^\/+/, '')));

  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }

  return null;
}

const posts = findContentFiles(contentDir);
let deletedCount = 0;
const deletedFiles = [];

console.log('🔍 Escaneando colecciones de contenido en src/content/ en busca de imágenes fantasma...\n');

posts.forEach((postPath) => {
  if (!fs.existsSync(postPath)) return;
  const content = fs.readFileSync(postPath, 'utf8');

  // Buscar coverImage o hero_image
  const coverMatch = content.match(/(?:coverImage|hero_image):\s*['"]?([^'"\n\r]+)['"]?/i);

  if (coverMatch) {
    const declaredImg = coverMatch[1].trim();
    const resolved = resolveLocalImage(declaredImg);

    if (resolved === null) {
      const relPath = path.relative(__dirname, postPath);
      console.log(`❌ Post roto detectado: ${relPath}`);
      console.log(`   Imagen no encontrada en disco: "${declaredImg}"`);

      try {
        fs.unlinkSync(postPath);
        deletedCount++;
        deletedFiles.push(relPath);
        console.log(`   🗑️ Archivo eliminado: ${relPath}\n`);

        // Si el directorio padre queda vacío o era un post tipo carpeta (ej. post/index.mdoc)
        const parentDir = path.dirname(postPath);
        const remaining = fs.readdirSync(parentDir);
        if (remaining.length === 0) {
          fs.rmdirSync(parentDir);
          console.log(`   📁 Directorio vacío eliminado: ${path.relative(__dirname, parentDir)}\n`);
        }
      } catch (err) {
        console.error(`   ⚠️ Error eliminando ${relPath}:`, err.message);
      }
    }
  }
});

console.log('====================================================');
if (deletedCount === 0) {
  console.log('✅ ¡Todo perfecto! No se encontraron imágenes fantasma.');
  console.log(`Total de archivos analizados: ${posts.length}`);
} else {
  console.log(`⚠️ Proceso completado. Se eliminaron ${deletedCount} posts rotos:`);
  deletedFiles.forEach((file, index) => {
    console.log(`  ${index + 1}. ${file}`);
  });
  console.log(`\nColecciones limpias. Ya puedes compilar con 'npm run build'.`);
}
console.log('====================================================\n');
