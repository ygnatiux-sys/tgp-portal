// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 1. ADAPTADOR CON PROXY ACTIVO (Para evitar el Error 500 en los ensayos)
  output: 'server',
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  
  // 2. TU ENRUTAMIENTO LÓGICO ORIGINAL
  trailingSlash: 'ignore', 
  build: {
    format: 'file' 
  },

  // 3. TUS INTEGRACIONES INTACTAS
  integrations: [react(), markdoc(), keystatic()],
  
  // 4. TU CONFIGURACIÓN DE VITE COMPLETA (GSAP, Módulos y Warnings)
  vite: {
    optimizeDeps: {
      exclude: ['@keystatic/astro', 'virtual:keystatic-config']
    },
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