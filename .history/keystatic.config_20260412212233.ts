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
          { label: 'Museum Luxury (Prata + Jakarta)', value: 'museum-luxury' },
          { label: 'Kinfolk High Design (Cormorant + Raleway)', value: 'kinfolk-high-design' },
          { label: 'Victorian Archeo (Gloock + IBM Mono)', value: 'victorian-archeo' },
          { label: 'Travel & Senses (Bodoni Italic + Montserrat)', value: 'travel-senses' },
          { label: '80\'s Italian Interiors (Fraunces + Jost)', value: '80s-italian' },
          { label: 'Ethnics & Arts (DM Serif + Epilogue)', value: 'ethnics-arts' },
          { label: 'Mid-90\'s Artsy (Syne + Space Grotesk)', value: 'mid-90s-artsy' },
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
  editorial_spreads: fields.blocks({
    label: 'Galería Editorial (Spreads)',
    blocks: {
      image_spread: {
        label: 'Bloque de Imagen',
        schema: fields.object({
          spread_type: fields.select({
            label: 'Tipo de Disposición',
            options: [
              { label: 'Full-Bleed (A sangre)', value: 'full-bleed' },
              { label: 'Díptico (Dos fotos)', value: 'diptych' },
              { label: 'Retrato Asimétrico', value: 'portrait-float' },
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
  }),

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
  },
});