import fs from 'fs';
import path from 'path';

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

const all = findFiles('src/assets', ['.jpg', '.jpeg', '.png', '.webp', '.avif'])
  .concat(findFiles('public/images', ['.jpg', '.jpeg', '.png', '.webp', '.avif']));

console.log('Sample of image files on disk:');
for (const f of all.slice(0, 25)) {
  console.log('-', f);
}
