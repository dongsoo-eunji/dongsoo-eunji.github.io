import { base } from '$app/paths';
import { imageSize } from 'image-size';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { GalleryImage } from '$lib/gallery/gallery-data';
import type { PageServerLoad } from './$types';

const largeDir = path.resolve('static/wedding/images/gallery/large');
const thumbDir = path.resolve('static/wedding/images/gallery/thumb');
const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const imageExtensions = new Set(['.avif', '.bmp', '.gif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']);

export const load: PageServerLoad = async () => {
  const [largeEntries, thumbnailEntries] = await Promise.all([
    readdir(largeDir, { withFileTypes: true }),
    readdir(thumbDir, { withFileTypes: true })
  ]);
  const largeNames = largeEntries
    .filter((entry) => entry.isFile() && imageExtensions.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => entry.name)
    .sort(naturalOrder.compare);
  const thumbnailNames = new Set(
    thumbnailEntries.filter((entry) => entry.isFile()).map((entry) => entry.name)
  );

  if (!largeNames.includes('r01.webp')) {
    throw new Error('The representative gallery image large/r01.webp is required.');
  }

  const galleryImages: GalleryImage[] = await Promise.all(largeNames.map(async (fileName, index) => {
    const thumbnailName = `${path.parse(fileName).name}.webp`;
    if (!thumbnailNames.has(thumbnailName)) {
      throw new Error(`Missing gallery thumbnail: thumb/${thumbnailName}`);
    }

    const dimensions = imageSize(await readFile(path.join(largeDir, fileName)));
    if (!dimensions.width || !dimensions.height) {
      throw new Error(`Could not read gallery image dimensions: large/${fileName}`);
    }

    return {
      id: `wedding-${path.parse(fileName).name}`,
      src: `${base}/wedding/images/gallery/large/${fileName}`,
      thumbnailSrc: `${base}/wedding/images/gallery/thumb/${thumbnailName}`,
      width: dimensions.width,
      height: dimensions.height,
      alt: `이동수와 조은지의 웨딩 사진 ${index + 1}`
    };
  }));

  return { galleryImages };
};
