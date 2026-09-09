import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

function getFiles(dir, exts) {
  let r = [];
  if (!fs.existsSync(dir)) return r;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) r = r.concat(getFiles(p, exts));
    else if (exts.some(e => f.name.endsWith(e))) r.push(p);
  }
  return r;
}

const contentFiles = getFiles(path.join(root, 'src/content'), ['.md', '.mdoc', '.mdx']);
console.log(`Total content files in src/content: ${contentFiles.length}`);

const items = [];

for (const cf of contentFiles) {
  const txt = fs.readFileSync(cf, 'utf8');
  const slug = path.parse(cf).name;
  const relPath = path.relative(root, cf).split(path.sep).join('/');
  
  const heroMatch = txt.match(/(?:hero_image|coverImage):\s*['"]?([^'"\r\n]+)['"]?/i);
  const hero = heroMatch ? heroMatch[1].trim() : null;
  
  // Also check local_image in hero_source_picker or cover_source_picker
  const localMatch = txt.match(/local_image:\s*['"]?([^'"\r\n]+)['"]?/i);
  const localImage = localMatch ? localMatch[1].trim() : null;
  
  const spreadsMatches = [...txt.matchAll(/-\s*['"]?(\/images\/spreads\/[^'"\r\n]+)['"]?/g)].map(m => m[1]);
  
  items.push({ relPath, slug, hero, localImage, spreadsMatches });
}

let withRemote = 0;
let withLocalHero = 0;
let withDefault = 0;
let withoutHero = 0;

for (const item of items) {
  const current = item.hero || item.localImage;
  if (!current) {
    withoutHero++;
  } else if (current.includes('storage.thegreatpuzzleproject.com')) {
    withRemote++;
  } else if (current.includes('default-hero')) {
    withDefault++;
  } else {
    withLocalHero++;
  }
}

console.log(`\nFrontmatter Hero image statistics:`);
console.log(`- Already in R2 CDN: ${withRemote}`);
console.log(`- With local specific image: ${withLocalHero}`);
console.log(`- With default-hero: ${withDefault}`);
console.log(`- No hero declared: ${withoutHero}`);

console.log(`\nItems with local hero images:`);
items.filter(i => {
  const c = i.hero || i.localImage;
  return c && !c.includes('storage.thegreatpuzzleproject.com') && !c.includes('default-hero');
}).forEach(i => {
  console.log(`  ${i.relPath} -> ${i.hero || i.localImage}`);
});

console.log(`\nItems with Spreads:`);
items.filter(i => i.spreadsMatches.length > 0).forEach(i => {
  console.log(`  ${i.relPath}: ${i.spreadsMatches.join(', ')}`);
});
