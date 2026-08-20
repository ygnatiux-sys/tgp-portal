import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, content, redes, youtube, images, gemaId } = data;

    if (!title || !content) {
      return new Response(JSON.stringify({ success: false, error: 'Faltan campos obligatorios (title o content).' }), { status: 400 });
    }

    // Determinar la colección y rutas según la Gema
    let collectionDir = 'essays';
    let imgDir = 'posts';
    
    if (gemaId === 'ensayo_html') {
      collectionDir = 'ensayos';
      imgDir = 'ensayos';
    } else if (gemaId === 'resena_historica') {
      collectionDir = 'visual_signals';
      imgDir = 'posts';
    } else if (gemaId === 'gbp_post') {
      collectionDir = 'capsulas';
      imgDir = 'spreads';
    }

    // Slugificar el título
    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    // Crear rutas de sistema (src/assets/images y src/content)
    const projectRoot = process.cwd();
    const assetsImgPath = path.join(projectRoot, 'src', 'assets', 'images', imgDir);
    const publicImgPath = path.join(projectRoot, 'public', 'images', imgDir);
    const contentDir = path.join(projectRoot, 'src', 'content', collectionDir);

    await fs.mkdir(assetsImgPath, { recursive: true });
    await fs.mkdir(publicImgPath, { recursive: true });
    await fs.mkdir(contentDir, { recursive: true });

    let coverImagePath = '';
    const downloadedImages = [];

    // Descargar imágenes de Wikimedia al repositorio local
    if (images && Array.isArray(images) && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const imgUrl = img.originalUrl || img.url;
        if (!imgUrl) continue;

        try {
          const imgResponse = await fetch(imgUrl);
          if (!imgResponse.ok) throw new Error(`Falló la descarga HTTP ${imgResponse.status}`);
          
          // Extraer extensión de la URL o asumir jpg
          const urlObj = new URL(imgUrl);
          const extMatch = urlObj.pathname.match(/\.(jpg|jpeg|png|webp|gif)$/i);
          const ext = extMatch ? extMatch[1] : 'jpg';
          
          const fileName = `${slug}-${i + 1}.${ext}`;
          const assetsFilePath = path.join(assetsImgPath, fileName);
          const publicFilePath = path.join(publicImgPath, fileName);
          
          // Escribir el buffer al disco (en src/assets/images y en public/images)
          const arrayBuffer = await imgResponse.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          await fs.writeFile(assetsFilePath, buffer);
          await fs.writeFile(publicFilePath, buffer);

          const relativeWebPath = `@/assets/images/${imgDir}/${fileName}`;
          downloadedImages.push({
            url: relativeWebPath,
            title: img.title,
            author: img.author,
            license: img.license
          });

          if (i === 0) {
            coverImagePath = relativeWebPath; // La primera es la portada
          }
        } catch (imgError) {
          console.error(`Error descargando imagen ${imgUrl}:`, imgError);
        }
      }
    }

    // Armar el Frontmatter (Markdoc / Keystatic standard)
    const today = new Date().toISOString().split('T')[0];
    
    // Si es un Ensayo (ensayosSchema), usamos coverImage. Si es otro, hero_image.
    const imageField = (collectionDir === 'ensayos') ? 'coverImage' : 'hero_image';
    
    let frontmatter = `---
title: "${title.replace(/"/g, '\\"')}"
date: "${today}"
`;

    if (coverImagePath) {
      frontmatter += `${imageField}: "${coverImagePath}"\n`;
    }
    frontmatter += `---\n\n`;

    // Añadir pie de fotos si hay más imágenes
    let pieDeFotos = '';
    if (downloadedImages.length > 0) {
      pieDeFotos += `\n\n---\n\n### Documentación Visual\n`;
      downloadedImages.forEach(img => {
        pieDeFotos += `\n![${img.title}](${img.url})\n*${img.title}*. Créditos: ${img.author} (${img.license}).\n`;
      });
    }

    let extraData = '';
    if (redes && redes !== '') {
      extraData += `\n\n---\n\n### Snippet Redes Sociales\n\n${redes}`;
    }
    if (youtube && youtube !== '') {
      extraData += `\n\n---\n\n### Descripción YouTube\n\n${youtube}`;
    }

    const finalMdoc = frontmatter + content + pieDeFotos + extraData;
    const mdocPath = path.join(contentDir, `${slug}.mdoc`);

    await fs.writeFile(mdocPath, finalMdoc, 'utf-8');

    return new Response(JSON.stringify({ 
      success: true, 
      slug: slug, 
      mdocPath: `/src/content/${collectionDir}/${slug}.mdoc`,
      imagesSaved: downloadedImages.length
    }), { status: 200 });

  } catch (e: any) {
    return new Response(JSON.stringify({ success: false, error: 'Excepción al guardar post: ' + e.message }), { status: 500 });
  }
};
