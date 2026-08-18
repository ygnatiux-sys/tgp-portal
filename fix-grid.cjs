const fs = require('fs');

const indexFilePath = 'c:/Users/ygnat/tgp-hemeroteca/src/pages/index.astro';
let content = fs.readFileSync(indexFilePath, 'utf8');

// 1. SecondaryA (con bandera /g por si hay múltiples)
content = content.replace(
  /<article class="md:col-span-12 card-hover-cinematic group w-full h-full relative overflow-hidden rounded-2xl border border-white\/8 bg-white\/3 transition-all duration-500">/g,
  '<article class="col-span-1 md:col-span-12 card-hover-cinematic group w-full h-full relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-500">'
);

// 2. Fila Duo - Article (con bandera /g para afectar a todas las tarjetas de esta fila)
content = content.replace(
  /<article class="md:col-span-6 h-full card-hover-cinematic group relative overflow-hidden rounded-xl border border-white\/8 bg-white\/3 transition-all duration-500 flex flex-col">/g,
  '<article class="col-span-1 md:col-span-6 w-full h-full card-hover-cinematic group relative overflow-hidden rounded-xl border border-white/8 bg-white/3 transition-all duration-500 flex flex-col">'
);

// 3. Fila Duo - Link Archivo
content = content.replace(
  /<a\s+href="\/archivo"\s+class="md:col-span-6 h-full group relative overflow-hidden rounded-xl border border-white\/6 border-dashed bg-white\/1 hover:border-rust-orange\/40 hover:bg-rust-orange\/3 transition-all duration-500 flex flex-col items-center justify-center min-h-50 p-6 text-center gap-3">/g,
  '<a\n                  href="/archivo"\n                  class="col-span-1 md:col-span-6 w-full h-full group relative overflow-hidden rounded-xl border border-white/6 border-dashed bg-white/1 hover:border-rust-orange/40 hover:bg-rust-orange/3 transition-all duration-500 flex flex-col items-center justify-center min-h-50 p-6 text-center gap-3"\n                >'
);

// 4. GRID FATHER class (Captura segura)
// Usamos $1 para mantener la primera parte, agregamos w-full, y $2 mantiene cualquier clase o atributo restante
content = content.replace(
  /(<div class="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6 md:gap-8)([^>]*">)/g,
  '$1 w-full$2'
);

fs.writeFileSync(indexFilePath, content, 'utf8');
console.log('Fixed mobile grid bugs in index.astro successfully.');
