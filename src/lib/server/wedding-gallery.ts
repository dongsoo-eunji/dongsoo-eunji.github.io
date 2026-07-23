import { imageSize } from 'image-size';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import type { GalleryImage } from '../gallery/gallery-data';

const defaultLargeDir = path.resolve('static/wedding/images/gallery/large');
const defaultThumbDir = path.resolve('static/wedding/images/gallery/thumb');
const naturalOrder = new Intl.Collator('en', { numeric: true, sensitivity: 'base' });
const imageExtensions = new Set(['.avif', '.bmp', '.gif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']);

export type GalleryVariant = 'standard' | 'extended';

type GalleryOptions = {
  largeDir?: string;
  thumbDir?: string;
  assetBase?: string;
};

export function selectGalleryFileNames(
  fileNames: string[],
  variant: GalleryVariant
): string[] {
  const images = fileNames.filter((fileName) =>
    imageExtensions.has(path.extname(fileName).toLowerCase())
  );
  const withPrefix = (prefix: 'r' | 'm') =>
    images
      .filter((fileName) => new RegExp(`^${prefix}\\d+$`).test(path.parse(fileName).name))
      .sort(naturalOrder.compare);

  const regularImages = withPrefix('r');
  return variant === 'extended'
    ? [...regularImages, ...withPrefix('m')]
    : regularImages;
}

export async function loadWeddingGallery(
  variant: GalleryVariant,
  {
    largeDir = defaultLargeDir,
    thumbDir = defaultThumbDir,
    assetBase = ''
  }: GalleryOptions = {}
): Promise<{ galleryImages: GalleryImage[] }> {
  const [largeEntries, thumbnailEntries] = await Promise.all([
    readdir(largeDir, { withFileTypes: true }),
    readdir(thumbDir, { withFileTypes: true })
  ]);
  const largeNames = selectGalleryFileNames(
    largeEntries.filter((entry) => entry.isFile()).map((entry) => entry.name),
    variant
  );
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
      src: `${assetBase}/wedding/images/gallery/large/${fileName}`,
      thumbnailSrc: `${assetBase}/wedding/images/gallery/thumb/${thumbnailName}`,
      width: dimensions.width,
      height: dimensions.height,
      alt: `이동수와 조은지의 웨딩 사진 ${index + 1}`
    };
  }));

  return { galleryImages };
}
