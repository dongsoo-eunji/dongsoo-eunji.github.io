import { base } from '$app/paths';
import { loadWeddingGallery } from '$lib/server/wedding-gallery';
import { createWeddingAccessData } from '$lib/server/wedding-access';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({
  ...(await loadWeddingGallery('standard', { assetBase: base })),
  weddingAccess: createWeddingAccessData()
});
