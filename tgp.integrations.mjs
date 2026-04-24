import react from '@astrojs/react';
import markdoc from '@astrojs/markdoc';
import keystatic from '@keystatic/astro';

/**
 * Array de integraciones TGP para Astro
 * Incluye React, Markdoc y Keystatic
 */
export const tgpIntegrations = [
  react(),
  markdoc(),
  keystatic(),
];
