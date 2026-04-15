import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

export default defineConfig({
  // CAMBIO CLAVE: Modo estático para desarrollo local sin errores de Cloudflare
  output: 'static', 
  
  integrations: [react(), markdoc(), keystatic()],
  
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      noExternal: ['gsap', 'markdoc'],
    },
  },
});