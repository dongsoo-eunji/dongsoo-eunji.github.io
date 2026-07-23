import { base } from '$app/paths';
import { loadWeddingGallery } from '$lib/server/wedding-gallery';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () =>
  loadWeddingGallery('extended', { assetBase: base });
