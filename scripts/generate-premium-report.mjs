#!/usr/bin/env node
/**
 * scripts/generate-premium-report.mjs
 * 
 * CLI Runner para ejecutar el orquestador de Informes Premium desde la terminal.
 * Uso:
 *   node scripts/generate-premium-report.mjs "El Misterio de las Placas Tartésicas" --tags="Arqueosemiótica,Tartessos" --source=wikimedia
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  const args = process.argv.slice(2);
  const title = args[0];

  if (!title) {
    console.log(`
Uso del Generador de Informes Premium TGP:
  node scripts/generate-premium-report.mjs "Título del Ensayo" [--tags="Tag1,Tag2"] [--source=wikimedia|veo3]

Ejemplo:
  node scripts/generate-premium-report.mjs "La Geometría Oculta de Stonehenge" --tags="Arqueoastronomía,Megalitismo" --source=wikimedia
    `);
    process.exit(0);
  }

  let tags = ['Liminal', 'Heterodoxia'];
  let visualSource = 'wikimedia';
  let collection = 'essays';

  for (const arg of args.slice(1)) {
    if (arg.startsWith('--tags=')) {
      tags = arg.replace('--tags=', '').split(',');
    } else if (arg.startsWith('--source=')) {
      visualSource = arg.replace('--source=', '');
    } else if (arg.startsWith('--collection=')) {
      collection = arg.replace('--collection=', '');
    }
  }

  console.log(`📡 Invocando servicio TS / API para: "${title}"`);
  
  // Dynamic import of the compiled/TS service
  const { generatePremiumReport } = await import('../src/services/generatePremiumReport.ts');
  const result = await generatePremiumReport({
    title,
    tags,
    visualSource,
    collection,
  });

  console.log('\n🎉 ¡RESULTADO DEL PIPELINE!');
  console.log(JSON.stringify(result, null, 2));
}

run().catch((err) => {
  console.error('❌ Error en ejecución:', err);
  process.exit(1);
});
