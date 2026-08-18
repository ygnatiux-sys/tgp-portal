const fs = require('fs');
const path = require('path');

const filePath = 'c:/Users/ygnat/tgp-hemeroteca/src/pages/colecciones/index.astro';
let content = fs.readFileSync(filePath, 'utf8');

const startMarker = '<section class="flex flex-col gap-16 md:gap-24">';
const startIndex = content.indexOf(startMarker);

let remaining = content.substring(startIndex);
let count = 0;
let endIndex = -1;
let i = 0;
while (i < remaining.length) {
    if (remaining.substring(i).startsWith('<section')) {
        count++;
    } else if (remaining.substring(i).startsWith('</section>')) {
        count--;
        if (count === 0) {
            endIndex = startIndex + i + '</section>'.length;
            break;
        }
    }
    i++;
}

const replacement = `<section class="flex flex-col gap-6 md:gap-8 w-full">
        <div class="grid grid-cols-1 lg:grid-cols-12 auto-rows-[minmax(280px,auto)] gap-6 lg:gap-8 w-full">
          {collections.map((col, index) => {
            let spanClass = "lg:col-span-4 lg:row-span-1";
            if (index === 0) spanClass = "lg:col-span-12 lg:row-span-2";
            else if (index === 1) spanClass = "lg:col-span-7 lg:row-span-1";
            else if (index === 2) spanClass = "lg:col-span-5 lg:row-span-1";
            
            return (
              <a 
                href={\`/colecciones/\${col.key}\`} 
                class={\`group relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/5 bg-theme-dark/80 shadow-2xl flex flex-col justify-end w-full isolate \${spanClass} min-h-[300px]\`}
              >
                {col.img ? (
                  <Image
                    src={col.img}
                    alt={col.label}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    quality={80}
                    class="absolute inset-0 w-full h-full object-cover object-center brightness-90 contrast-[1.03] pointer-events-none -z-10 group-hover:scale-[1.018] group-hover:brightness-95 transition-transform duration-700 delay-75 ease-out"
                  />
                ) : (
                  <div class="absolute inset-0 w-full h-full bg-linear-to-br from-[#1c242b] via-theme-dark to-[#0a0b0b] -z-10" />
                )}
                
                {/* Touch-First Mobile Gradient & Desktop Blur */}
                <div class="absolute inset-0 bg-linear-to-t from-black/90 via-black/50 via-45% to-transparent pointer-events-none z-10 md:bg-linear-to-t md:from-theme-dark/95 md:via-theme-dark/50 md:via-45% md:to-transparent md:backdrop-blur-sm"></div>

                <div class="relative z-20 p-6 md:p-8 flex flex-col justify-end h-full">
                   <span class="font-mono text-xs uppercase tracking-widest text-rust-orange font-bold mb-2">Colección TGP</span>
                   <h2 class="font-cinzel font-extrabold text-3xl md:text-4xl text-white mb-2 leading-tight drop-shadow-lg">{col.label}</h2>
                   <p class="font-sans text-sm text-white/80">{col.count} {col.count === 1 ? 'Documento' : 'Documentos'}</p>
                </div>
              </a>
            );
          })}
        </div>
      </section>`;

if (startIndex !== -1 && endIndex !== -1) {
    const newContent = content.substring(0, startIndex) + replacement + content.substring(endIndex);
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('colecciones/index.astro updated.');
} else {
    console.log('Could not find section to replace in colecciones/index.astro');
}

// Update index.astro
const indexFilePath = 'c:/Users/ygnat/tgp-hemeroteca/src/pages/index.astro';
let indexContent = fs.readFileSync(indexFilePath, 'utf8');
if (indexContent.includes('secondaryB && (')) {
  indexContent = indexContent.replace(
    /{secondaryB && \(\s*<div class="md:col-span-6(.*?)"/,
    '{secondaryB && (\n              <div class="md:col-span-6 h-full"'
  );
  indexContent = indexContent.replace(
    /{secondaryA && \(\s*<article class="md:col-span-12(.*?)"/,
    '{secondaryA && (\n              <article class="md:col-span-12 card-hover-cinematic group w-full h-full relative overflow-hidden rounded-2xl border border-white/8 bg-white/3 transition-all duration-500"'
  );
  fs.writeFileSync(indexFilePath, indexContent, 'utf8');
  console.log('index.astro updated.');
} else {
  console.log('Could not update index.astro');
}
