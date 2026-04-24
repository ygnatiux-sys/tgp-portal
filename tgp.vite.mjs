import tailwindcss from '@tailwindcss/vite';

/**
 * Configuración Vite para TGP
 * Incluye el plugin de Tailwind y configuración SSR optimizada
 */
export const tgpViteConfig = {
  plugins: [tailwindcss()],
  ssr: {
    external: ['virtual:keystatic-config'],
    noExternal: [
      'gsap',
      'markdoc',
      '@keystatic/core',
      '@keystatic/astro',
      'react-dom',
    ],
  },
};
