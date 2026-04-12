import { getCollection } from 'astro:content';

export async function GET() {
  const essays = await getCollection('essays');
  const architectures = await getCollection('architectures');
  const visualSignals = await getCollection('visual_signals');
  return new Response(JSON.stringify({ essays, architectures, visualSignals }, null, 2), {
    headers: {
      'Content-Type': 'application/json'
    }
  });
}
