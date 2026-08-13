import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';

/**
 * Array de integraciones TGP para Astro
 * Incluye React y Markdoc.
 * Keystatic se registra por separado en astro.config.mjs para evitar duplicados.
 */
export const tgpIntegrations = [
  react(),
  markdoc(),
];
