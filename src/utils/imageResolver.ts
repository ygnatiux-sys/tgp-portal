import type { ImageMetadata } from 'astro';

// Carga perezosa (lazy) de imágenes rasterizadas en src/assets/images
const assetImages = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/**/*.{jpeg,jpg,png,webp,avif,gif,JPEG,JPG,PNG,WEBP}'
);

/**
 * Resuelve cualquier ruta de imagen (local src/assets, alias @/assets, ruta heredada /images/, o URL remota)
 * a su correspondiente ImageMetadata optimizable por Astro Assets de forma asíncrona.
 */
export async function resolveImage(src: any): Promise<ImageMetadata | string> {
  if (!src) return src;
  
  // Si ya es un objeto ImageMetadata
  if (typeof src === 'object' && src !== null && 'src' in src && 'width' in src && 'height' in src) {
    return src as ImageMetadata;
  }

  if (typeof src !== 'string') return src;

  // URLs remotas o SVGs
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//') || src.toLowerCase().endsWith('.svg')) {
    return src;
  }

  // Normalizar ruta
  let clean = src.trim();
  try {
    clean = decodeURIComponent(clean);
  } catch {}

  // Convertir alias y formatos a /src/assets/images/...
  if (clean.startsWith('@/assets/images/')) {
    clean = clean.replace('@/assets/images/', '/src/assets/images/');
  } else if (clean.startsWith('@/assets/')) {
    clean = clean.replace('@/assets/', '/src/assets/');
  } else if (clean.startsWith('@/')) {
    clean = clean.replace('@/', '/src/');
  } else if (clean.startsWith('src/assets/')) {
    clean = '/' + clean;
  } else if (clean.startsWith('/images/')) {
    clean = '/src/assets' + clean;
  } else if (clean.startsWith('images/')) {
    clean = '/src/assets/' + clean;
  }

  if (!clean.startsWith('/src/assets/')) {
    clean = '/src/assets/images/' + clean.replace(/^\/+/, '');
  }

  // 1. Búsqueda exacta
  if (assetImages[clean]) {
    try {
      const mod = await assetImages[clean]();
      return mod.default;
    } catch (err) {
      console.warn(`[TgpImage] Error resolviendo metadata para ${clean}:`, err);
      return src;
    }
  }

  // 2. Búsqueda insensible a mayúsculas
  const lowerClean = clean.toLowerCase();
  for (const [key, loader] of Object.entries(assetImages)) {
    if (key.toLowerCase() === lowerClean) {
      try {
        const mod = await loader();
        return mod.default;
      } catch (err) {
        console.warn(`[TgpImage] Error resolviendo metadata para ${key}:`, err);
        return src;
      }
    }
  }

  // 3. Búsqueda por coincidencia de nombre de archivo relativo
  const filename = clean.split('/').pop()?.toLowerCase();
  if (filename) {
    for (const [key, loader] of Object.entries(assetImages)) {
      if (key.toLowerCase().endsWith('/' + filename)) {
        try {
          const mod = await loader();
          return mod.default;
        } catch {
          return src;
        }
      }
    }
  }

  // Fallback seguro: devolver la ruta original si no está en src/assets
  return src;
}
