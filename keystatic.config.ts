import { config, fields, collection } from '@keystatic/core';

// Definimos un esquema común ya que las 3 colecciones comparten la misma estructura base solicitada
const commonSchema = {
  title: fields.slug({ name: { label: 'Title' } }),
  hero_image: fields.image({
    label: 'Hero Image',
    directory: 'public/images/posts',
    publicPath: '/images/posts',
  }),
  layout_style: fields.select({
    label: 'Layout Style',
    options: [
      { label: 'Cinematic Dark', value: 'cinematic-dark' },
      { label: 'Cinematic Vintage', value: 'cinematic-vintage' },
      { label: 'Apple OS Theme', value: 'apple-os' },
      { label: 'Magazine / Luxury', value: 'magazine-luxury' },
    ],
    defaultValue: 'cinematic-dark',
  }),
  content: fields.document({
    label: 'Content',
    formatting: true,
    dividers: true,
    links: true,
    images: {
      directory: 'public/images/posts',
      publicPath: '/images/posts'
    }
  }),
};

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
