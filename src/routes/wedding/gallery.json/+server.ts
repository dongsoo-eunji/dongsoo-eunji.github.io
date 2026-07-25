import { base } from '$app/paths';
import { loadWeddingGallery } from '$lib/server/wedding-gallery';
import { json } from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
  return json(await loadWeddingGallery('standard', { assetBase: base }));
}
