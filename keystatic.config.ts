import { config, fields, collection } from '@keystatic/core';

// --- MODULOS DE CONFIGURACIÓN (Arquitectura Refactorizada) ---

const baseSchema = {
  title: fields.text({ label: 'Título' }),
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

const cinematicEngine = {
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

const vogueEngine = {
  format_scale: fields.select({
    label: 'Escala Editorial (Ancho de Página)',
    options: [
      { label: 'A5 Intimate (Estrecho - Foco en Texto)', value: 'max-w-2xl' },
      { label: 'A4 Document (Estándar Editorial)', value: 'max-w-4xl' },
      { label: 'A3 Panoramic (Inmersión Total)', value: 'w-full' },
    ],
    defaultValue: 'max-w-4xl',
  }),
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
          { label: "80's Italian Interiors", value: "80s-italian" },
          { label: 'Ethnics & Arts', value: 'ethnics-arts' },
          { label: "Mid-90's Artsy", value: "mid-90s-artsy" },
        ],
        defaultValue: 'museum-luxury',
      }),
    }
  ),
  enable_stress_test: fields.checkbox({
    label: 'Activar Modo Laboratorio (Stress Test)',
    defaultValue: false,
    description: 'Reemplaza el contenido con un manifiesto para auditar las fuentes y pesos.',
  }),
};

const spreadsEngine = {
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

// --- ESQUEMAS FINALES (Ensamblaje) ---

const fullEditorialSchema = {
  ...baseSchema,
  ...cinematicEngine,
  ...vogueEngine,
  ...spreadsEngine,
};

const capsulaSchema = {
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

export default config({
  storage: { kind: 'local' },
  collections: {
    essays: collection({
      label: 'Essays & Vignettes',
      slugField: 'title',
      path: 'src/content/essays/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),
    architectures: collection({
      label: 'Architectures',
      slugField: 'title',
      path: 'src/content/architectures/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),
    visual_signals: collection({
      label: 'Visual Signals',
      slugField: 'title',
      path: 'src/content/visual_signals/*',
      format: { contentField: 'content' },
      schema: fullEditorialSchema,
    }),
    capsulas: collection({
      label: 'Cápsulas',
      slugField: 'title',
      path: 'src/content/capsulas/*',
      format: { contentField: 'content' },
      schema: capsulaSchema,
    }),
    ensayos: collection({
      label: 'Ensayos (Substack Feed)',
      slugField: 'title',
      path: 'src/content/ensayos/*/',
      format: { contentField: 'content' },
      schema: {
        title: fields.slug({ 
          name: { 
            label: 'Título',
            validation: { isRequired: true }
          }
        }),
        subtitle: fields.text({ label: 'Subtítulo' }),
        coverImage: fields.image({
          label: 'Imagen de Portada',
          directory: 'public/images/ensayos',
          publicPath: '/images/ensayos',
          validation: { isRequired: true }
        }),
        author: fields.text({ label: 'Autor', defaultValue: 'Xavier Benítez' }),
        accentColor: fields.text({ label: 'Color de Acento', defaultValue: '#1a1a1a' }),
        date: fields.date({ label: 'Fecha' }),
        content: fields.document({ label: 'Contenido principal', formatting: true, dividers: true, links: true }),
      },
    }),
  },
});