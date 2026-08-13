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
      '@keystatic/core',
      '@keystatic/astro',
    ],
    exclude: [
      'virtual:keystatic-config',
    ],
  },
  ssr: {
    noExternal: [
      'gsap',
      'markdoc',
    ],
  },
};
