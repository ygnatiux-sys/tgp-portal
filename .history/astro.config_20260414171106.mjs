// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  adapter: process.argv.includes('build') ? cloudflare() : undefined,
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  integrations: [react(), markdoc(), keystatic()],
  vite: {
    plugins: [
      tailwindcss(),
      {
        name: 'mute-warnings',
        configResolved(config) {
          const originalLogger = config.logger.warn;
          config.logger.warn = (msg, options) => {
            if (msg.includes('points to missing source files')) return;
            originalLogger(msg, options);
          };
        }
      }
    ],
    ssr: {
      noExternal: ['gsap', 'markdoc']
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  }
});