import { config, fields, collection } from '@keystatic/core';
import {
  templateSchema,
  fullEditorialSchema,
  capsulaSchema,
} from './src/config/tgp.schemas';

// ============================================================
// EXPORT DEFAULT — CONFIG MAESTRO TGP
// ============================================================

const isDev = import.meta.env.DEV;

export default config({
  storage: isDev ? { kind: 'local' } : { kind: 'github', repo: { owner: 'ygnatiux-sys', name: 'tgp-portal' } },
  collections: {

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

  },
});
