// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // 1. EL ADAPTADOR PARA CLOUDFLARE (Lo que soluciona el error)
  output: 'server',
  adapter: cloudflare(),
  
  // 2. TU ENRUTAMIENTO LÓGICO ORIGINAL (Recuperado: vital para tus URLs)
  trailingSlash: 'ignore', 
  build: {
    format: 'file' 
  },

  // 3. TUS INTEGRACIONES INTACTAS
  integrations: [react(), markdoc(), keystatic()],
  
  // 4. TU CONFIGURACIÓN DE VITE COMPLETA (Con los warnings muteados, GSAP y módulos)
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