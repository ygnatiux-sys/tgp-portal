const fs = require('fs');
const path = require('path');

const cardPath = 'c:\\Users\\ygnat\\tgp-hemeroteca\\src\\components\\CinematicArchiveCard.astro';
let cardContent = fs.readFileSync(cardPath, 'utf8');

// 1. article border
cardContent = cardContent.replace(
  'border border-white/8',
  'border border-white/5'
);

// 2. background gradient
cardContent = cardContent.replace(
  'bg-linear-to-t from-theme-dark/95 via-theme-dark/50 via-45% to-transparent',
  'bg-linear-to-t from-black/90 via-black/50 via-45% to-transparent'
);

// 3. CTA button
cardContent = cardContent.replace(
  'bg-[#151718]/90 backdrop-blur-sm border border-white/10 text-[#E0E0E0]/75 font-mono font-bold text-[9px] sm:text-[10px] tracking-[0.25em]',
  'bg-[#151718]/90 md:backdrop-blur-sm border border-white/10 text-[#E0E0E0]/75 font-mono font-medium text-xs tracking-widest'
);

// 4. Tags
cardContent = cardContent.replace(
  'gap-2 mt-3 font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.4em] text-[#EFEBE3]/70',
  'gap-6 mt-3 font-mono text-xs uppercase tracking-[0.4em] text-white/70'
);

fs.writeFileSync(cardPath, cardContent, 'utf8');
console.log('Updated CinematicArchiveCard.astro');

const layoutPath = 'c:\\Users\\ygnat\\tgp-hemeroteca\\src\\layouts\\Layout.astro';
let layoutContent = fs.readFileSync(layoutPath, 'utf8');
layoutContent = layoutContent.replace(
  '<main class="grow relative">\n      <slot />\n    </main>',
  '<main class="grow relative">\n      <h1 class="sr-only">{title}</h1>\n      <slot />\n    </main>'
);
fs.writeFileSync(layoutPath, layoutContent, 'utf8');
console.log('Updated Layout.astro');
