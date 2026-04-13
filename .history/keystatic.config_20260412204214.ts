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
      schema: {
        ...commonSchema,
        editorial_vibe: fields.conditional(
          fields.select({
            label: 'Editorial Vibe Category',
            options: [
              { label: 'Standard TGP', value: 'standard' },
              { label: 'Vogue Luxury', value: 'vogue-luxury' },
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
      },
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
