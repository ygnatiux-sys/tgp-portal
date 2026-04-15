// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  // El adaptador SSR vital para que Cloudflare Workers no colapse
  output: 'server',
  adapter: cloudflare(),
  
  // Tu enrutamiento lógico original intacto
  trailingSlash: 'ignore', 
  build: {
    format: 'file' 
  },

  // Integraciones de TGP
  integrations: [react(), markdoc(), keystatic()],
  
  // Configuración de Vite con warnings silenciados y dependencias optimizadas
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