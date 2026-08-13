import tailwindcss from '@tailwindcss/vite';

/**
 * Configuración Vite para TGP
 * Optimizada: Dejamos que Astro maneje las dependencias por defecto.
 */
export const tgpViteConfig = {
  plugins: [tailwindcss()]
};