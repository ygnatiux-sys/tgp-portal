import { getCollection } from 'astro:content';

export const GET = async () => {
  let essaysRaw: any[] = [];
  let architecturesRaw: any[] = [];
  let visualSignalsRaw: any[] = [];
  let ensayosRaw: any[] = [];
  let capsulasRaw: any[] = [];

  try { essaysRaw = await getCollection('essays'); } catch {}
  try { architecturesRaw = await getCollection('architectures'); } catch {}
  try { visualSignalsRaw = await getCollection('visual_signals'); } catch {}
  try { ensayosRaw = await getCollection('ensayos'); } catch {}
  try { capsulasRaw = await getCollection('capsulas'); } catch {}

  const normalize = (post: any, col: string) => ({
    title: post.data.title || 'Sin título',
    subtitle: post.data.subtitle || post.data.description || '',
    link: `/${col.replace('_', '-')}/${post.id}`,
    collection: col.replace('_', ' '),
  });

  const all = [
    ...essaysRaw.map(p => normalize(p, 'essays')),
    ...architecturesRaw.map(p => normalize(p, 'architectures')),
    ...visualSignalsRaw.map(p => normalize(p, 'visual_signals')),
    ...ensayosRaw.map(p => normalize(p, 'ensayos')),
    ...capsulasRaw.map(p => normalize(p, 'capsulas')),
  ];

  return new Response(JSON.stringify(all), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
