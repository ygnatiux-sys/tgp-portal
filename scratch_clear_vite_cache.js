import fs from 'fs';
import path from 'path';

const viteCache = path.join(process.cwd(), 'node_modules', '.vite');

if (fs.existsSync(viteCache)) {
  fs.rmSync(viteCache, { recursive: true, force: true });
  console.log('Vite cache cleared successfully.');
} else {
  console.log('Vite cache does not exist.');
}
