import { fields } from '@keystatic/core';

// --- SELECTOR UNIVERSAL FANCYBOX DE IMÁGENES ---
/**
 * Crea un selector condicional multi-fuente (Mi PC, Wikimedia Commons HD, Google Photos, URL directa)
 * con controles de lote (hasta 20 selecciones, seleccionar todo / deseleccionar, limpiar).
 */
export const createFancyboxImagePicker = (options: {
  label?: string;
  directory?: string;
  publicPath?: string;
} = {}) => {
  const {
    label = 'Imagen Principal / Portada (Fancybox Selector)',
    directory = 'public/images/posts',
    publicPath = '/images/posts',
  } = options;

  return fields.object({
    source: fields.select({
      label: 'Fuente de Imagen (Pestaña / Origen)',
      description: 'Elige la fuente de la imagen. El formulario y controles del Fancybox se adaptan automáticamente.',
      options: [
        { label: '📁 Mi PC (Archivos Locales)', value: 'local' },
        { label: '🌐 Wikimedia Commons (Búsqueda Semántica HD · CC0 / Atribución)', value: 'wikimedia' },
        { label: '📸 Google Photos (Biblioteca / Álbum Dedicado)', value: 'google_photos' },
        { label: '🔗 URL Directa / CDN Externa', value: 'direct_url' },
      ],
      defaultValue: 'local',
    }),
    local_image: fields.image({
      label: 'Subir desde Mi PC',
      description: 'Selecciona o arrastra una imagen desde tu equipo.',
      directory,
      publicPath,
    }),
    wikimedia_query: fields.text({
      label: 'Búsqueda Semántica Wikimedia (HD)',
      description: 'Término de búsqueda semántica cercana (Ej: "Victorians marble sculpture high resolution").',
    }),
    wikimedia_url: fields.text({
      label: 'URL de Imagen Wikimedia (Hero HD · CC0 o Licencia Abierta)',
      description: 'Pega el enlace directo a la imagen en resolución completa.',
    }),
    wikimedia_author: fields.text({
      label: 'Atribución de Autor / Licencia CC (Requerido para CC-BY)',
      description: 'Ej: Dominio Público / CC BY-SA 4.0 — Nombre del Autor / Institución.',
    }),
    google_photos_url: fields.text({
      label: 'Enlace / Recurso de Google Photos',
      description: 'Pega el enlace directo o enlace de álbum compartido de Google Photos.',
    }),
    direct_url: fields.text({
      label: 'URL Externa Directa',
      description: 'Enlace web directo (HTTPS).',
    }),
    caption: fields.text({
      label: 'Pie de foto / Epígrafe (Opcional)',
    }),
  }, {
    label,
    description: 'Gestor unificado de selección de imágenes con soporte multi-origen.',
  });
};

// --- PLANTILLAS (Templates) ---
export const templateSchema = {
  title: fields.slug({ 
    name: { 
      label: 'Nombre de la Plantilla',
      validation: { isRequired: true }
    }
  }),
  themeKey: fields.select({
    label: 'Identidad Visual (themeKey)',
    options: [
      { label: 'Victorian Archeo', value: 'vibe-victorian-archeo' },
      { label: 'Travel & Senses', value: 'vibe-travel-senses' },
      { label: "80's Italian Interiors", value: "vibe-80s-italian" },
      { label: "Mid-90's Artsy", value: "vibe-mid-90s-artsy" },
      { label: 'Ethnics & Arts', value: 'vibe-ethnics-arts' },
      { label: 'Museum Luxury', value: 'vibe-museum-luxury' },
      { label: 'Kinfolk High Design', value: 'vibe-kinfolk-high-design' },
    ],
    defaultValue: 'vibe-victorian-archeo',
  }),
  description: fields.text({ 
    label: 'Descripción / Materialidad',
    multiline: true 
  }),
};

// --- ESQUEMAS BASE ---
export const baseSchema = {
  title: fields.slug({ 
    name: { 
      label: 'Título',
      validation: { isRequired: true } // Único campo obligatorio
    }
  }),
  date: fields.date({ 
    label: 'Fecha',
    defaultValue: { kind: 'today' },
    description: 'Importante para el orden de los posts en la página de inicio.',
  }),
  template: fields.relationship({
    label: 'Plantilla Editorial (TGP)',
    collection: 'editorialTemplates',
  }),
  hero_image: fields.image({
    label: 'Imagen Principal (Hero - Archivo Directo)',
    description: 'Ruta principal de imagen Hero en el sistema de archivos.',
    directory: 'public/images/posts',
    publicPath: '/images/posts',
  }),
  hero_source_picker: createFancyboxImagePicker({
    label: 'Selector Fancybox Avanzado (Wikimedia HD / Google Photos / Mi PC)',
    directory: 'public/images/posts',
    publicPath: '/images/posts',
  }),
  content: fields.document({
    label: 'Contenido',
    formatting: true,
    dividers: true,
    links: true,
    images: {
      directory: 'public/images/posts',
      publicPath: '/images/posts',
    },
  }),
};

// --- MOTORES DE MAQUETACIÓN (Layout Engines) ---
export const cinematicEngine = {
  layout_style: fields.select({
    label: 'Arquitectura del Hero (Comportamiento)',
    options: [
      { label: 'Cinematic Dark (Marquee Infinito)', value: 'cinematic-dark' },
      { label: 'Cinematic Vintage (Efecto Ken Burns)', value: 'cinematic-vintage' },
      { label: 'Apple OS Theme (Parallax Técnico)', value: 'apple-os' },
      { label: 'Magazine Luxury (Pinned + Fade to Black)', value: 'magazine-luxury' },
    ],
    defaultValue: 'cinematic-dark',
  }),
};

export const vogueEngine = {
  format_scale: fields.select({
    label: 'Escala Editorial (Ancho de Página)',
    options: [
      { label: 'A5 Intimate (Estrecho - Foco en Texto)', value: 'max-w-2xl' },
      { label: 'A4 Document (Estándar Editorial)', value: 'max-w-4xl' },
      { label: 'A3 Panoramic (Inmersión Total)', value: 'w-full' },
    ],
    defaultValue: 'max-w-4xl',
  }),
  enable_stress_test: fields.checkbox({
    label: 'Activar Modo Laboratorio (Stress Test)',
    defaultValue: false,
    description: 'Reemplaza el contenido con un manifiesto para auditar las fuentes y pesos.',
  }),
};

// Helper to generate 20 placeholder fields
const generate20Fields = (fieldSchemaGenerator: (index: number) => any) => {
  const fieldsObj: Record<string, any> = {};
  for (let i = 1; i <= 20; i++) {
    const key = `placa_${String(i).padStart(2, '0')}`;
    fieldsObj[key] = fieldSchemaGenerator(i);
  }
  return fieldsObj;
};

// --- MOTOR DE SPREADS Y GALERÍAS FANCYBOX (20 Placeholders) ---
export const spreadsEngine = {
  editorial_spreads: fields.blocks(
    {
      image_spread: {
        label: 'Bloque de Galería / Fancybox Spread (20 Placeholders)',
        schema: fields.object({
          spread_type: fields.select({
            label: 'Tipo de Disposición Visual',
            options: [
              { label: 'Full-Bleed (A sangre)', value: 'full-bleed' },
              { label: 'Díptico (Dos fotos)', value: 'diptych' },
              { label: 'Retrato Asimétrico', value: 'portrait-float' },
              { label: 'Díptico Asimétrico (Luxury Offset)', value: 'asymmetric-diptych' },
              { label: 'Superposición Táctil (Overlap)', value: 'tactile-overlap' },
              { label: 'Grilla Kinfolk (Clean Rhythm)', value: 'kinfolk-grid' },
              { label: 'Galería Fancybox Multi-Placa (Hasta 20)', value: 'fancybox-multi' },
            ],
            defaultValue: 'full-bleed',
          }),
          source_tab: fields.select({
            label: 'Pestaña de Origen Fancybox',
            description: 'Selecciona el proveedor para este bloque. El fancybox se ajusta con selector dedicado.',
            options: [
              { label: '📁 Mi PC (Archivos Locales)', value: 'local' },
              { label: '🌐 Wikimedia Commons (HD Hero / CC0 / Atribución)', value: 'wikimedia' },
              { label: '📸 Google Photos (Biblioteca / Álbum Dedicado)', value: 'google_photos' },
            ],
            defaultValue: 'local',
          }),
          batch_control: fields.select({
            label: 'Control de Lote / Selección',
            options: [
              { label: '✓ Seleccionar Todo (Activar todas las placas)', value: 'select_all' },
              { label: '○ Selección Manual Personalizada', value: 'custom_selection' },
              { label: '✕ Limpiar Selección / Deseleccionar', value: 'clear_selection' },
            ],
            defaultValue: 'select_all',
          }),
          // 20 Placeholders para carga local
          local_images: fields.object(
            generate20Fields((i) => fields.image({
              label: `Placa ${String(i).padStart(2, '0')} (Mi PC)`,
              directory: 'public/images/spreads',
              publicPath: '/images/spreads',
            }))
          ),
          // 20 Placeholders para Wikimedia Commons
          remote_wikimedia_images: fields.object(
            generate20Fields((i) => fields.object({
              url: fields.text({ label: `Placa ${String(i).padStart(2, '0')} - URL Directa HD` }),
              semantic_match: fields.text({ label: `Placa ${String(i).padStart(2, '0')} - Término / Similitud` }),
              author_citation: fields.text({ label: `Placa ${String(i).padStart(2, '0')} - Cita de Autor / Licencia` }),
              is_selected: fields.checkbox({ label: 'Seleccionar en Fancybox', defaultValue: true }),
            }))
          ),
          // 20 Placeholders para Google Photos
          google_photos_images: fields.object(
            generate20Fields((i) => fields.object({
              photo_url_or_id: fields.text({ label: `Placa ${String(i).padStart(2, '0')} - URL / ID de Foto` }),
              caption: fields.text({ label: `Placa ${String(i).padStart(2, '0')} - Título / Epígrafe` }),
              is_selected: fields.checkbox({ label: 'Seleccionar en Fancybox', defaultValue: true }),
            }))
          ),
          caption: fields.text({ label: 'Pie de foto / Epígrafe Global (Opcional)' }),
        }),
      },
    },
    {
      label: 'Galería Editorial & Fancybox Spreads',
      description: 'Añade bloques de imágenes y galerías con soporte de 20 placeholders por pestaña.',
    }
  ),
};

// --- ESQUEMAS COMPUESTOS (Assemblies) ---
export const fullEditorialSchema = {
  ...baseSchema,
  ...cinematicEngine,
  ...vogueEngine,
  ...spreadsEngine,
};

export const capsulaSchema = {
  ...baseSchema,
  master_archetype: fields.select({
    label: 'Arquetipo Maestro',
    options: [
      { label: 'El Archivo Táctil (Victorian Archeo)', value: 'tactile-archive' },
      { label: 'La Galería Expansiva (Museum Luxury)', value: 'expansive-gallery' },
      { label: 'El Manifiesto Cinético (Mid-90s Artsy)', value: 'kinetic-manifesto' },
      { label: 'El Cuaderno de Campo (Kinfolk)', value: 'field-notebook' },
    ],
    defaultValue: 'tactile-archive',
  }),
  ...spreadsEngine,
};

// --- ESQUEMA ESPECIAL: ENSAYOS (Substack Feed) ---
export const ensayosSchema = {
  title: fields.slug({ 
    name: { 
      label: 'Título',
      validation: { isRequired: true }
    }
  }),
  subtitle: fields.text({ label: 'Subtítulo' }),
  template: fields.relationship({
    label: 'Plantilla Editorial (TGP)',
    collection: 'editorialTemplates',
  }),
  coverImage: fields.image({
    label: 'Imagen de Portada (Archivo Directo)',
    directory: 'public/images/ensayos',
    publicPath: '/images/ensayos',
  }),
  cover_source_picker: createFancyboxImagePicker({
    label: 'Selector Fancybox Avanzado de Portada (Wikimedia HD / Google Photos / Mi PC)',
    directory: 'public/images/ensayos',
    publicPath: '/images/ensayos',
  }),
  author: fields.text({ label: 'Autor', defaultValue: 'Xavier Benítez' }),
  accentColor: fields.text({ label: 'Color de Acento', defaultValue: '#1a1a1a' }),
  date: fields.date({ label: 'Fecha' }),
  content: fields.document({ label: 'Contenido principal', formatting: true, dividers: true, links: true }),
};