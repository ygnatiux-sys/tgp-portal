import tailwindcss from '@tailwindcss/vite';

/**
 * Configuración Vite para TGP
 * Incluye el plugin de Tailwind y configuración SSR optimizada
 */
export const tgpViteConfig = {
  plugins: [tailwindcss()],
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
    ],
    exclude: [
      'virtual:keystatic-config',
      '@keystatic/core',
      '@keystatic/astro',
    ],
  },
  ssr: {
    noExternal: [
      'gsap',
      'markdoc',
    ],
  },
};
