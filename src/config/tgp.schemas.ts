import { fields } from '@keystatic/core';

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
  template: fields.relationship({
    label: 'Plantilla Editorial (TGP)',
    collection: 'editorialTemplates',
    // Validación estricta eliminada para permitir ensayos de prueba
  }),
  hero_image: fields.image({
    label: 'Imagen Principal (Hero)',
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

export const spreadsEngine = {
  editorial_spreads: fields.blocks(
    {
      image_spread: {
        label: 'Bloque de Imagen',
        schema: fields.object({
          spread_type: fields.select({
            label: 'Tipo de Disposición',
            options: [
              { label: 'Full-Bleed (A sangre)', value: 'full-bleed' },
              { label: 'Díptico (Dos fotos)', value: 'diptych' },
              { label: 'Retrato Asimétrico', value: 'portrait-float' },
              { label: 'Díptico Asimétrico (Luxury Offset)', value: 'asymmetric-diptych' },
              { label: 'Superposición Táctil (Overlap)', value: 'tactile-overlap' },
              { label: 'Grilla Kinfolk (Clean Rhythm)', value: 'kinfolk-grid' },
            ],
            defaultValue: 'full-bleed',
          }),
          images: fields.array(
            fields.image({
              label: 'Imagen',
              directory: 'public/images/spreads',
              publicPath: '/images/spreads',
            }),
            { label: 'Imágenes del Spread', itemLabel: () => 'Archivo de imagen' }
          ),
          caption: fields.text({ label: 'Pie de foto (Opcional)' }),
        }),
      },
    },
    {
      label: 'Galería Editorial (Spreads)',
      description: 'Añade bloques de imágenes para intercalar en el ensayo.',
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
      validation: { isRequired: true } // Único campo obligatorio
    }
  }),
  subtitle: fields.text({ label: 'Subtítulo' }),
  template: fields.relationship({
    label: 'Plantilla Editorial (TGP)',
    collection: 'editorialTemplates',
    // Validación estricta eliminada
  }),
  coverImage: fields.image({
    label: 'Imagen de Portada',
    directory: 'public/images/ensayos',
    publicPath: '/images/ensayos',
    // Validación estricta eliminada
  }),
  author: fields.text({ label: 'Autor', defaultValue: 'Xavier Benítez' }),
  accentColor: fields.text({ label: 'Color de Acento', defaultValue: '#1a1a1a' }),
  date: fields.date({ label: 'Fecha' }),
  content: fields.document({ label: 'Contenido principal', formatting: true, dividers: true, links: true }),
};