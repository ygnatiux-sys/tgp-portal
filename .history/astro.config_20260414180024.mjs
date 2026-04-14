// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  output: 'static',
  // 1. ADAPTADOR CORREGIDO: 
  // Cloudflare Pages aloja sitios estáticos de forma nativa. El adaptador de Astro para Cloudflare 
  // SOLO debe usarse si tienes 'output: "server"' o 'output: "hybrid"'. 
  // Forzar su uso en modo 'static' interfiere con el enrutador generando workers innecesarios que rompen el deploy.
  
  // 2. ENRUTAMIENTO LÓGICO CORREGIDO:
  trailingSlash: 'ignore', 
  build: {
    format: 'file' 
  },
  // Al usar trailingSlash 'never' junto con format 'directory', Astro generaba rutas que confundían 
  // a Cloudflare y rompían las rutas relativas de las imágenes (por eso te daban error 404 los jpg en la terminal).
  // Cambiarlo a 'file' e 'ignore' asegura que /ensayos resuelva directamente el archivo sin bucles de redirección.

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