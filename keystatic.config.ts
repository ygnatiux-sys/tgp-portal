import { config, collection } from '@keystatic/core';
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

export default config({
  storage: { kind: 'local' },
  collections: {
    editorialTemplates: collection({
      label: 'Plantillas Editoriales TGP',
      slugField: 'title',
      path: 'src/content/editorial_templates/*',
      schema: templateSchema,
    }),
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
      path: 'src/content/ensayos/*',
      format: { contentField: 'content' },
      schema: ensayosSchema,
    }),
  },
});