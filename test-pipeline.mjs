import fetch from 'node-fetch'; // No need if Node 18+, but just in case, Node 18+ has native fetch

const payload = {
  titulo: "El Umbral de los Signos: Arqueología de los Sistemas Liminales",
  coleccion: "essays",
  fuenteVisual: "wikimedia",
  tags_tematicos: "Liminal, Heterodoxia, Semiótica, Mito",
  directrices_tematicas: "Énfasis en el concepto de liminalidad de Turner y su extensión a los sistemas de escritura precolombinos.",
  autor: "The Great Puzzle Project"
};

async function testPipeline() {
  try {
    const res = await fetch('http://127.0.0.1:4321/api/generate-premium-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    console.log('STATUS:', res.status);
    console.log('RESULTADO:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('ERROR EN EL TEST:', error);
  }
}

testPipeline();
