const fs = require('fs');

const indexFilePath = 'c:/Users/ygnat/tgp-hemeroteca/src/pages/index.astro';
let content = fs.readFileSync(indexFilePath, 'utf8');

// Ensure secondaryA has col-span-1 and w-full
content = content.replace(
  /<article class="md:col-span-12 card-hover-cinematic group w-full h-full relative overflow-hidden rounded-2xl border border-white\/8 bg-white\/3 transition-all duration-500">/,
  '<article class="col-span-1 md:col-span-12 card-hover-cinematic group w-full h-full relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-500">'
);

// Ensure Fila Duo has col-span-1 and w-full
content = content.replace(
  /<article class="md:col-span-6 h-full card-hover-cinematic group relative overflow-hidden rounded-xl border border-white\/8 bg-white\/3 transition-all duration-500 flex flex-col">/,
  '<article class="col-span-1 md:col-span-6 w-full h-full card-hover-cinematic group relative overflow-hidden rounded-xl border border-white/8 bg-white/3 transition-all duration-500 flex flex-col">'
);

content = content.replace(
  /<a\s+href="\/archivo"\s+class="md:col-span-6 h-full group relative overflow-hidden rounded-xl border border-white\/6 border-dashed bg-white\/1 hover:border-rust-orange\/40 hover:bg-rust-orange\/3 transition-all duration-500 flex flex-col items-center justify-center min-h-50 p-6 text-center gap-3">/,
  '<a\n                  href="/archivo"\n                  class="col-span-1 md:col-span-6 w-full h-full group relative overflow-hidden rounded-xl border border-white/6 border-dashed bg-white/1 hover:border-rust-orange/40 hover:bg-rust-orange/3 transition-all duration-500 flex flex-col items-center justify-center min-h-50 p-6 text-center gap-3"\n                >'
);

// Also verify GRID FATHER class
content = content.replace(
  /<div class="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6 md:gap-8[^>]*">/,
  '<div class="grid grid-cols-1 md:grid-cols-12 auto-rows-min gap-6 md:gap-8 w-full">'
);

fs.writeFileSync(indexFilePath, content, 'utf8');
console.log('Fixed mobile grid bugs in index.astro');
