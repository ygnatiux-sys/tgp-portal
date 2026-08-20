import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import tailwindcss from '@tailwindcss/vite';
import { tgpIntegrations } from './tgp.integrations.mjs';

// Creamos un logger personalizado de Vite para silenciar los warnings obsoletos
// generados internamente por el plugin de React/Babel en las nuevas versiones de Vite.
import { createLogger } from 'vite';
const logger = createLogger();
const originalWarn = logger.warn;
logger.warn = (msg, options) => {
  if (msg.includes('esbuild') && msg.includes('deprecated')) return;
  if (msg.includes('rolldownOptions') || msg.includes('oxc')) return;
  originalWarn(msg, options);
};

// Variable crítica para aislar Keystatic del despliegue en Cloudflare
const isBuild = process.argv.includes('build');

export default defineConfig({
  output: 'static',
  
  image: {
    domains: [
      'images.unsplash.com',
      'upload.wikimedia.org',
      'commons.wikimedia.org',
      'lh3.googleusercontent.com',
      'lh4.googleusercontent.com',
      'lh5.googleusercontent.com',
      'lh6.googleusercontent.com',
    ],
  },
  
  server: {
    open: true,
  },
  
  integrations: [
    // Escudo de compilación: Keystatic y su admin solo se inyectan en desarrollo local
    ...(isBuild ? [] : [
      keystatic(), 
      {
        name: 'open-keystatic-admin',
        hooks: {
          'astro:server:start': async ({ address }) => {
            const host = address.address === '::' || address.address === '0.0.0.0' || address.address === 'localhost' ? '127.0.0.1' : address.address;
            const port = address.port;
            const adminUrl = `http://${host}:${port}/keystatic`;
            
            setTimeout(() => {
              console.log(`\x1b[36m  ┃ \x1b[1mKeystatic Admin\x1b[22m  ${adminUrl}\x1b[0m\n`);
            }, 100);
            
            try {
              const { exec } = await import('child_process');
              exec(`start ${adminUrl}`, (err) => {
                if (err) {} 
              });
            } catch {}
          }
        }
      }
    ]),
    
    // Filtramos para evitar que se cargue una instancia duplicada desde tgp.integrations
    ...tgpIntegrations.filter(i => i.name !== 'keystatic')
  ],
  
  vite: {
    customLogger: logger,
    plugins: [tailwindcss()],
  }
});