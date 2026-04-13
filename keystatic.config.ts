import { config, fields, collection } from '@keystatic/core';

// Esquema Maestro con toda la artillería editorial refinada
const commonSchema = {
  title: fields.slug({ name: { label: 'Título del Ensayo' } }),
  hero_image: fields.image({
    label: 'Imagen Principal (Hero)',
    directory: 'public/images/posts',
    publicPath: '/images/posts',
  }),
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

  // Control de escala y grilla (A5, A4, A3)
  format_scale: fields.select({
    label: 'Escala Editorial (Ancho de Página)',
    options: [
      { label: 'A5 Intimate (Estrecho - Foco en Texto)', value: 'max-w-2xl' },
      { label: 'A4 Document (Estándar Editorial)', value: 'max-w-4xl' },
      { label: 'A3 Panoramic (Inmersión Total)', value: 'w-full' },
    ],
    defaultValue: 'max-w-4xl',
  }),

  // El Corazón del Sistema: Motor Editorial Vogue Luxury
  editorial_vibe: fields.conditional(
    fields.select({
      label: 'Estilo de Diseño Editorial',
      options: [
        { label: 'TGP Estándar', value: 'standard' },
        { label: 'Vogue Luxury Collection', value: 'vogue-luxury' },
      ],
      defaultValue: 'standard',
    }),
    {
      standard: fields.empty(),
      'vogue-luxury': fields.select({
        label: 'Variante de Revista',
        options: [
          { label: 'Museum Luxury', value: 'museum-luxury' },
          { label: 'Kinfolk High Design', value: 'kinfolk-high-design' },
          { label: 'Victorian Archeo', value: 'victorian-archeo' },
          { label: 'Travel & Senses', value: 'travel-senses' },
          { label: '80\'s Italian Interiors', value: '80s-italian' },
          { label: 'Ethnics & Arts', value: 'ethnics-arts' },
          { label: 'Mid-90\'s Artsy', value: 'mid-90s-artsy' },
        ],
        defaultValue: 'museum-luxury',
      }),
    }
  ),

  // Laboratorio Tipográfico (Stress Test)
  enable_stress_test: fields.checkbox({
    label: 'Activar Modo Laboratorio (Stress Test)',
    defaultValue: false,
    description: 'Reemplaza el contenido con un manifiesto para auditar las fuentes y pesos.',
  }),

  // Spreads Fotográficos (Dípticos y Panorámicas)
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

  content: fields.document({
    label: 'Contenido del Ensayo',
    formatting: true,
    dividers: true,
    links: true,
    images: {
      directory: 'public/images/posts',
      publicPath: '/images/posts',
    },
  }),
};

// Nuevo Esquema de Arquetipos (Pilar Paralelo)
const archetypeSchema = {
  title: fields.slug({ name: { label: 'Título del Arquetipo' } }),
  hero_image: commonSchema.hero_image,
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
  editorial_spreads: commonSchema.editorial_spreads,
  content: commonSchema.content,
};

export default config({
  storage: { kind: 'local' },
  collections: {
    essays: collection({
      label: 'Essays & Vignettes',
      slugField: 'title',
      path: 'src/content/essays/*',
      format: { contentField: 'content' },
      schema: commonSchema,
    }),
    architectures: collection({
      label: 'Architectures',
      slugField: 'title',
      path: 'src/content/architectures/*',
      format: { contentField: 'content' },
      schema: commonSchema,
    }),
    visual_signals: collection({
      label: 'Visual Signals',
      slugField: 'title',
      path: 'src/content/visual_signals/*',
      format: { contentField: 'content' },
      schema: commonSchema,
    }),
    master_archetypes: collection({
      label: 'Master Archetypes',
      slugField: 'title',
      path: 'src/content/master_archetypes/*',
      format: { contentField: 'content' },
      schema: archetypeSchema,
    }),
  },
});