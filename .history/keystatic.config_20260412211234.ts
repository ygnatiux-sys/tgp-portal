import { config, fields, collection } from '@keystatic/core';

// Definimos el ESQUEMA MAESTRO. Todo lo que esté aquí se aplicará a todas las colecciones.
const commonSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  hero_image: fields.image({
    label: 'Hero Image',
    directory: 'public/images/posts',
    publicPath: '/images/posts',
  }),
  layout_style: fields.select({
    label: 'Hero Component Style',
    options: [
      { label: 'Cinematic Dark (Marquee)', value: 'cinematic-dark' },
      { label: 'Cinematic Vintage (Ken Burns)', value: 'cinematic-vintage' },
      { label: 'Apple OS Theme (Parallax)', value: 'apple-os' },
      { label: 'Magazine / Luxury (Fade to Black)', value: 'magazine-luxury' },
    ],
    defaultValue: 'cinematic-dark',
  }),
  
  // --- AQUI ESTA EL GRID A4/A5/A3 QUE EL AGENTE OLVIDÓ ---
  format_scale: fields.select({
    label: 'Grid & Format Scale (Page Width)',
    options: [
      { label: 'A5 Intimate (Narrow - max-w-2xl)', value: 'max-w-2xl' },
      { label: 'A4 Document (Standard - max-w-4xl)', value: 'max-w-4xl' },
      { label: 'A3 Panoramic (Wide - w-full)', value: 'w-full' },
    ],
    defaultValue: 'max-w-4xl',
  }),

  // --- EL MOTOR EDITORIAL VOGUE AHORA ESTÁ EN TODAS LAS COLECCIONES ---
  editorial_vibe: fields.conditional(
    fields.select({
      label: 'Editorial Vibe Category',
      options: [
        { label: 'Standard TGP', value: 'standard' },
        { label: 'Vogue Luxury Styles', value: 'vogue-luxury' },
      ],
      defaultValue: 'standard',
    }),
    {
      standard: fields.empty(),
      'vogue-luxury': fields.select({
        label: 'Vogue Luxury Variant',
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

  // --- LOS SPREADS FOTOGRÁFICOS QUE EL AGENTE IGNORÓ ---
  editorial_spreads: fields.blocks({
    label: 'Editorial Image Spreads (Gallery)',
    description: 'Añade bloques de imágenes para intercalar en el ensayo.',
    blocks: {
      image_spread: {
        label: 'Image Spread',
        schema: {
          spread_type: fields.select({
            label: 'Spread Layout',
            options: [
              { label: 'Full-Bleed Panorámico', value: 'full-bleed' },
              { label: 'Díptico Simétrico', value: 'diptych' },
              { label: 'Retrato Flotante Asimétrico', value: 'portrait-float' },
            ],
            defaultValue: 'full-bleed',
          }),
          images: fields.array(
            fields.image({
              label: 'Image',
              directory: 'public/images/spreads',
              publicPath: '/images/spreads',
            }),
            { 
              label: 'Spread Images',
              itemLabel: props => props.value ? 'Imagen cargada' : 'Espacio vacío'
            }
          ),
          caption: fields.text({ label: 'Caption / Pie de foto (Opcional)' }),
        }
      }
    }
  }),

  // El contenido de texto Markdoc
  content: fields.document({
    label: 'Main Content',
    formatting: true,
    dividers: true,
    links: true,
    images: {
      directory: 'public/images/posts',
      publicPath: '/images/posts'
    }
  }),
};

// Generación final de las colecciones de TGP
export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    essays: collection({
      label: 'Essays & Vignettes',
      slugField: 'title',
      path: 'src/content/essays/*',
      format: { contentField: 'content' },
      schema: commonSchema, // Ahora hereda todo el poder
    }),
    architectures: collection({
      label: 'Architectures',
      slugField: 'title',
      path: 'src/content/architectures/*',
      format: { contentField: 'content' },
      schema: commonSchema, // Ahora hereda todo el poder
    }),
    visual_signals: collection({
      label: 'Visual Signals',
      slugField: 'title',
      path: 'src/content/visual_signals/*',
      format: { contentField: 'content' },
      schema: commonSchema, // Ahora hereda todo el poder
    }),
  },
});