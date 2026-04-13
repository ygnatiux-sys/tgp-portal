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
  adapter: cloudflare(),
  trailingSlash: 'never',
  build: {
    format: 'directory'
  },
  integrations: [react(), markdoc(), keystatic()],
  vite: {
    plugins: [tailwindcss()],
    optimizeDeps: {
      noDiscovery: true,
      include: [],
      esbuildOptions: {
        plugins: [
          {
            name: 'shim-astro',
            setup(build) {
              // Interceptamos .astro para que el scanner de esbuild no falle
              // devolviendo un modulo JS vacio con export default
              build.onLoad({ filter: /\.astro$/ }, () => ({
                contents: 'export default function() {}',
                loader: 'js',
              }));
            },
          },
        ],
      },
    },
    ssr: {
      noExternal: ['@keystatic/astro', 'gsap', 'markdoc']
    },
    build: {
      commonjsOptions: {
        transformMixedEsModules: true
      }
    }
  }
});