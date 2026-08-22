import { config, fields, collection } from '@keystatic/core';
import {
  templateSchema,
  baseSchema,
  cinematicEngine,
  vogueEngine,
  spreadsEngine,
  fullEditorialSchema,
  capsulaSchema,
  ensayosSchema,
} from './src/config/tgp.schemas';

// ============================================================
// CAMPOS GLOBALES REUTILIZABLES — DRY CORE
// Extraídos de esquemas repetidos en múltiples colecciones.
// REGLA: NO modificar path, directory ni publicPath.
// ============================================================

const draftField = fields.checkbox({
  label: 'Borrador',
  description: 'Si está marcado, no se publicará en producción.',
  defaultValue: false,
});

const publicarConImagenField = fields.checkbox({
  label: 'Publicar con Imagen de Portada (Toggle)',
  description: 'Marca para publicar con imagen. Desmarca para modo puramente textual.',
  defaultValue: true,
});

const dateField = fields.date({ label: 'Fecha' });

const notasInvestigadorField = fields.text({
  label: 'Notas del Investigador',
  description: 'Espacio privado para ideas y borradores antes de la publicación final.',
  multiline: true,
});

const generadorMotorField = fields.text({
  label: 'Motor de Generación',
  description: 'Identificador del motor de IA utilizado para este post.',
});

// themeColor: NO extraído como constante — defaultValue varía por colección.
// Ver uso inline dentro de cada colección.

// ============================================================
// EXPORT DEFAULT — CONFIG MAESTRO TGP
// ============================================================

export default config({
  storage: { kind: 'local' },
  collections: {

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ENSAYOS
    // path: src/content/ensayos/*/  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    ensayos: collection({
      label: 'Ensayos',
      slugField: 'title',
      path: 'src/content/ensayos/*/',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        volanta: fields.text({
          label: 'Volanta (Subtítulo o contexto de lectura)',
          description: 'Aparecerá en tipografía Mono por encima del título principal.',
        }),
        generador: generadorMotorField,
        notasInvestigador: notasInvestigadorField,
        date: dateField,
        themeColor: fields.select({
          label: 'Theme Color',
          options: [
            { label: 'British Green', value: 'british-green' },
            { label: 'Bordeaux', value: 'bordeaux' },
            { label: 'Old Navy', value: 'old-navy' },
            { label: 'Bus Red', value: 'bus-red' },
            { label: 'Vintage Yellow', value: 'vintage-yellow' },
            { label: 'Rust Orange', value: 'rust-orange' },
          ],
          defaultValue: 'british-green',
        }),
        sitioGeohistorico: fields.text({
          label: 'Lugar Geohistórico / Sitio Arqueohistórico',
          description: 'Ej: Aramu Muru (Perú), Tikal (Guatemala), Bonampak (México), Cartago (Túnez)',
        }),
        publicarConImagen: publicarConImagenField,
        draft: draftField,
        coverImage: fields.image({
          label: 'Imagen de Portada (Opcional)',
          directory: 'src/assets/ensayos',
          publicPath: '/src/assets/ensayos/',
        }),
        isCinematic: fields.checkbox({
          label: 'Renderizar como Dossier Cinemático',
          description: 'Transforma el texto y la galería en una experiencia inmersiva GSAP.',
          defaultValue: false,
        }),
        gallery: fields.array(
          fields.image({
            label: 'Imagen de Galería',
            directory: 'src/assets/ensayos',
            publicPath: '/src/assets/ensayos/',
          }),
          { label: 'Galería de Imágenes Cinemáticas (Opcional)', itemLabel: () => 'Imagen' }
        ),
        videoBg: fields.text({ label: 'URL del Video Cinemagraph' }),
        spotifyLink: fields.url({ label: 'Link de Spotify Podcast (Opcional)' }),
        youtubeLink: fields.url({ label: 'Link de YouTube Podcast (Opcional)' }),
        excerpt: fields.text({ label: 'Excerpt (Sinopsis / Cita Filosófica 2-4 Renglones)', multiline: true }),
        content: fields.document({
          label: 'Contenido',
          formatting: true,
          dividers: true,
          links: true,
          images: { directory: 'src/assets/ensayos', publicPath: '/src/assets/ensayos/' },
          tables: true,
        }),
      },
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ARQUETIPOS GLOBALES
    // path: src/content/arquetipos-globales/*/  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    arquetiposGlobales: collection({
      label: 'Arquetipos Globales',
      slugField: 'title',
      path: 'src/content/arquetipos-globales/*/',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Título del Arquetipo' } }),
        volanta: fields.text({
          label: 'Volanta (Subtítulo o contexto de lectura)',
          description: 'Aparecerá en tipografía Mono por encima del título principal.',
        }),
        generador: generadorMotorField,
        notasInvestigador: notasInvestigadorField,
        date: dateField,
        themeColor: fields.select({
          label: 'Theme Color',
          options: [
            { label: 'British Green', value: 'british-green' },
            { label: 'Bordeaux', value: 'bordeaux' },
            { label: 'Old Navy', value: 'old-navy' },
            { label: 'Bus Red', value: 'bus-red' },
            { label: 'Vintage Yellow', value: 'vintage-yellow' },
            { label: 'Rust Orange', value: 'rust-orange' },
          ],
          defaultValue: 'rust-orange',
        }),
        sitioGeohistorico: fields.text({
          label: 'Lugar Geohistórico / Origen Mitológico',
          description: 'Ej: Eleusis (Grecia), Alejandría (Egipto), Babilonia (Mesopotamia)',
        }),
        publicarConImagen: publicarConImagenField,
        draft: draftField,
        coverImage: fields.image({
          label: 'Imagen de Portada (Opcional)',
          directory: 'src/assets/arquetipos-globales',
          publicPath: '/src/assets/arquetipos-globales/',
        }),
        isCinematic: fields.checkbox({
          label: 'Renderizar como Dossier Cinemático',
          description: 'Transforma el texto y la galería en una experiencia inmersiva GSAP.',
          defaultValue: false,
        }),
        gallery: fields.array(
          fields.image({
            label: 'Imagen de Galería',
            directory: 'src/assets/arquetipos-globales',
            publicPath: '/src/assets/arquetipos-globales/',
          }),
          { label: 'Galería de Imágenes Cinemáticas (Opcional)', itemLabel: () => 'Imagen' }
        ),
        videoBg: fields.text({ label: 'URL del Video Cinemagraph' }),
        spotifyLink: fields.url({ label: 'Link de Spotify Podcast (Opcional)' }),
        youtubeLink: fields.url({ label: 'Link de YouTube Podcast (Opcional)' }),
        excerpt: fields.text({ label: 'Excerpt (Sinopsis / Cita Filosófica 2-4 Renglones)', multiline: true }),
        content: fields.document({
          label: 'Contenido',
          formatting: true,
          dividers: true,
          links: true,
          images: { directory: 'src/assets/arquetipos-globales', publicPath: '/src/assets/arquetipos-globales/' },
          tables: true,
        }),
      },
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: GEORREFERENCIAS ARQUEOSEMIÓTICAS
    // path: src/content/georreferencias/*/  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    georreferencias: collection({
      label: 'Georreferencias Arqueosemióticas',
      slugField: 'title',
      path: 'src/content/georreferencias/*/',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Nombre del Sitio / Lugar' } }),
        sitioGeohistorico: fields.text({
          label: 'Ubicación Geohistórica (País / Región / Coordenadas)',
          description: 'Ej: Aramu Muru (Puno, Perú), Tikal (Guatemala), Bonampak (México)',
        }),
        volantaHook: fields.text({
          label: 'Volanta / H2 Hook (2 Renglones)',
          description: 'Copete conceptual que sirve como gancho para el informe geohistórico.',
          multiline: true,
        }),
        saberMasDato: fields.text({
          label: 'Saber Más (Dato Local No Divulgado)',
          description: 'Dato o micro-narrativa etnográfica no divulgada masivamente.',
          multiline: true,
        }),
        date: dateField,
        category: fields.text({
          label: 'Categoría Disciplinar',
          defaultValue: 'Arqueosemiótica',
        }),
        publicarConImagen: publicarConImagenField,
        draft: draftField,
        coverImage: fields.image({
          label: 'Imagen del Sitio (Opcional)',
          directory: 'src/assets/georreferencias',
          publicPath: '/src/assets/georreferencias/',
        }),
        excerpt: fields.text({ label: 'Sinopsis / Excerpt', multiline: true }),
        content: fields.document({
          label: 'Informe Geohistórico Multidimensional',
          formatting: true,
          dividers: true,
          links: true,
          tables: true,
        }),
      },
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ENSAYOS CINEMÁTICOS (GSAP)
    // path: src/content/ensayos-cinematicos/*/  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    ensayosCinematicos: collection({
      label: 'Ensayos Cinemáticos (GSAP)',
      slugField: 'title',
      path: 'src/content/ensayos-cinematicos/*/',
      format: { data: 'json' },
      schema: {
        title: fields.slug({ name: { label: 'Título' } }),
        atmosfera: fields.conditional(
          fields.select({
            label: 'Atmósfera',
            options: [
              { label: 'Canon Default', value: 'obsidiana' },
              { label: 'Documental', value: 'deriva' },
              { label: 'Cognitivo', value: 'umbral' },
              { label: 'Personalizado', value: 'custom' },
            ],
            defaultValue: 'obsidiana',
          }),
          {
            obsidiana: fields.empty(),
            deriva: fields.empty(),
            umbral: fields.empty(),
            custom: fields.object({
              header: fields.select({
                label: 'Header',
                options: [
                  { label: 'Minimalista', value: 'minimalista' },
                  { label: 'Cinemático Clásico', value: 'clasico' },
                  { label: 'Editorial Flotante', value: 'flotante' },
                ],
                defaultValue: 'clasico',
              }),
              body: fields.select({
                label: 'Body',
                options: [
                  { label: 'Lectura Profunda (Serif)', value: 'serif' },
                  { label: 'Manifiesto (Sans)', value: 'sans' },
                  { label: 'Técnico (Mono)', value: 'mono' },
                ],
                defaultValue: 'serif',
              }),
              imagen: fields.select({
                label: 'Imagen',
                options: [
                  { label: 'Vertical Fade (Eje Y)', value: 'fade-y' },
                  { label: 'Paralaje Lateral (Eje X)', value: 'paralaje-x' },
                  { label: 'Zoom Profundo (Eje Z)', value: 'zoom-z' },
                ],
                defaultValue: 'fade-y',
              }),
              footer: fields.select({
                label: 'Footer',
                options: [
                  { label: 'Completo con Metadatos', value: 'completo' },
                  { label: 'Minimalista Sutil', value: 'minimal' },
                  { label: 'Retorno Rápido', value: 'retorno' },
                ],
                defaultValue: 'completo',
              }),
            }),
          }
        ),
        coverImage: fields.image({
          label: 'Imagen de Portada (Opcional)',
          directory: 'src/assets/ensayos-cinematicos',
          publicPath: '/src/assets/ensayos-cinematicos/',
        }),
        gallery: fields.array(
          fields.image({
            label: 'Imagen de Galería',
            directory: 'src/assets/ensayos-cinematicos',
            publicPath: '/src/assets/ensayos-cinematicos/',
          }),
          { label: 'Galería de Imágenes Cinemáticas (GSAP)', itemLabel: () => 'Imagen' }
        ),
        content: fields.document({
          label: 'Contenido',
          formatting: true,
          links: true,
          images: true,
        }),
      },
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: PLANTILLAS EDITORIALES TGP  [PORTAL]
    // path: src/content/editorial_templates/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    editorialTemplates: collection({
      label: 'Plantillas Editoriales TGP',
      slugField: 'title',
      path: 'src/content/editorial_templates/*',
      schema: templateSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ESSAYS & VIGNETTES  [PORTAL]
    // path: src/content/essays/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    essays: collection({
      label: 'Essays & Vignettes',
      slugField: 'title',
      path: 'src/content/essays/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ARCHITECTURES  [PORTAL]
    // path: src/content/architectures/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    architectures: collection({
      label: 'Architectures',
      slugField: 'title',
      path: 'src/content/architectures/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: VISUAL SIGNALS  [PORTAL]
    // path: src/content/visual_signals/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    visual_signals: collection({
      label: 'Visual Signals',
      slugField: 'title',
      path: 'src/content/visual_signals/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: CÁPSULAS  [PORTAL]
    // path: src/content/capsulas/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    capsulas: collection({
      label: 'Cápsulas',
      slugField: 'title',
      path: 'src/content/capsulas/*',
      format: { contentField: 'content' },
      schema: capsulaSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: ENSAYOS SUBSTACK FEED  [PORTAL]
    // path: src/content/ensayos/*  — ATENCIÓN: ruta compartida con
    // hemeroteca solo si es un monorepo; si son proyectos separados
    // esta ruta es la del portal y es INTOCABLE.
    // ──────────────────────────────────────────────────────────
    ensayosSubstack: collection({
      label: 'Ensayos (Substack Feed)',
      slugField: 'title',
      path: 'src/content/ensayos-substack/*',
      format: { contentField: 'content' },
      schema: ensayosSchema,
    }),

    // ──────────────────────────────────────────────────────────
    // COLECCIÓN: TEST / BORRADORES  [PORTAL]
    // path: src/content/test/*  [INTOCABLE]
    // ──────────────────────────────────────────────────────────
    test: collection({
      label: '🧪 Test / Borradores (Papelera)',
      slugField: 'title',
      path: 'src/content/test/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),

  },
});
