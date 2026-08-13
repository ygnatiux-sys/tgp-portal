import { defineConfig } from 'astro/config';
import nodeAdapter from '@astrojs/node';
import cloudflareAdapter from '@astrojs/cloudflare';
import keystatic from '@keystatic/astro';
import { tgpIntegrations } from './tgp.integrations.mjs';
import { tgpViteConfig } from './tgp.vite.mjs';
import { exec } from 'child_process';

const isBuild = process.argv.includes('build');

export default defineConfig({
  output: 'static',
  
  // Adaptador dinámico: Cloudflare para producción (build), Node para desarrollo local (dev)
  adapter: isBuild 
    ? cloudflareAdapter({ 
        compatibilityDate: '2026-04-28',
        compatibilityFlags: ['nodejs_compat']
      }) 
    : nodeAdapter({ mode: 'standalone' }),
  
  server: {
    open: true, // Abre el sitio principal en el navegador automáticamente
  },
  
  integrations: [
    keystatic(), 
    ...tgpIntegrations.filter(i => i.name !== 'keystatic'), // Evitamos duplicar Keystatic
    {
      name: 'open-keystatic-admin',
      hooks: {
        'astro:server:start': ({ address }) => {
          const host = address.address === '::' || address.address === '0.0.0.0' || address.address === 'localhost' ? '127.0.0.1' : address.address;
          const port = address.port;
          const adminUrl = `http://${host}:${port}/keystatic`;
          
          // Imprime el link de Keystatic en la terminal con formato de Astro
          setTimeout(() => {
            console.log(`\x1b[36m  ┃ \x1b[1mKeystatic Admin\x1b[22m  ${adminUrl}\x1b[0m\n`);
          }, 100);
          
          // Abre Keystatic automáticamente en el navegador
          exec(`start ${adminUrl}`, (err) => {
            if (err) {
              // Silencioso o loguear error si falla exec
            }
          });
        }
      }
    }
  ],
  
  vite: tgpViteConfig,
});