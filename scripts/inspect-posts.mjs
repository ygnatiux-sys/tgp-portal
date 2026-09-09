import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

function findFiles(dir, exts) {
  let list = [];
  if (!fs.existsSync(dir)) return list;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) list = list.concat(findFiles(full, exts));
    else if (exts.some(ext => entry.name.endsWith(ext))) list.push(full);
  }
  return list;
}

const posts = findFiles(path.join(projectRoot, 'src', 'content'), ['.md', '.mdoc', '.mdx']);

const breakdown = {
  hasCoverImage: 0,
  hasHeroImage: 0,
  hasLocalImage: 0,
  hasOtherImage: 0,
  noImage: 0,
  examplesWithoutImage: []
};

for (const p of posts) {
  const c = fs.readFileSync(p, 'utf8');
  const rel = path.relative(projectRoot, p);
  const coverMatch = c.match(/^coverImage:\s*(.+)$/m);
  const heroMatch = c.match(/^hero_image:\s*(.+)$/m);
  const localMatch = c.match(/local_image:\s*(.+)$/m);
  const anyImageMatch = c.match(/^image:\s*(.+)$/m);

  if (coverMatch) breakdown.hasCoverImage++;
  else if (heroMatch) breakdown.hasHeroImage++;
  else if (localMatch) breakdown.hasLocalImage++;
  else if (anyImageMatch) breakdown.hasOtherImage++;
  else {
    breakdown.noImage++;
    breakdown.examplesWithoutImage.push(rel);
  }
}

console.log(JSON.stringify(breakdown, null, 2));
