// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

export default defineConfig({
  output: 'static',
  
  // Enrutamiento lógico corregido para que Cloudflare no se pierda
  trailingSlash: 'ignore', 
  build: {
    format: 'file' 
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