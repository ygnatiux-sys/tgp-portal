import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import { tgpIntegrations } from './tgp.integrations.mjs';
import { tgpViteConfig } from './tgp.vite.mjs';

export default defineConfig({
  // Astro 5.0+ : 'static' permite SSR por página por defecto.
  output: 'static',
  adapter: cloudflare({
    compatibilityDate: '2026-04-16',
  }),

  integrations: tgpIntegrations,
  vite: {
    ...tgpViteConfig,
    optimizeDeps: {
      exclude: ['virtual:keystatic-config'],
    },
  },
});