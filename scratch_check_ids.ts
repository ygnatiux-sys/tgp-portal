
import { getCollection } from 'astro:content';

export async function check() {
  const essays = await getCollection('essays');
  console.log('ESSAYS IDs:', essays.map(e => ({ id: e.id, collection: e.collection })));
}
