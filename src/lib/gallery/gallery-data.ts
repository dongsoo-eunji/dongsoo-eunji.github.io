import { base } from '$app/paths';

export type GalleryImage = {
  id: string;
  src: string;
  thumbnailSrc: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
};

const galleryPath = (path: string): string => `${base}/${path}`;

/**
 * Replace the sample SVG paths with matching numbered WebP paths before publishing.
 * Dimensions should be updated to match the final photographs when they are exported.
 */
const samples = [
  { name: 'portrait-3x4', width: 1200, height: 1600 },
  { name: 'portrait-4x5', width: 1280, height: 1600 },
  { name: 'portrait-2x3', width: 1200, height: 1800 },
  { name: 'landscape-4x3', width: 1600, height: 1200 },
  { name: 'portrait-3x4-b', width: 1200, height: 1600 },
  { name: 'landscape-16x9', width: 1600, height: 900 }
] as const;

export const galleryImages: GalleryImage[] = Array.from({ length: 20 }, (_, index) => {
  const sample = samples[index % samples.length];

  return {
    id: `wedding-${String(index + 1).padStart(2, '0')}`,
    src: galleryPath(`wedding/images/gallery/large/${sample.name}.svg`),
    thumbnailSrc: galleryPath(`wedding/images/gallery/thumb/${sample.name}.svg`),
    width: sample.width,
    height: sample.height,
    alt: `이동수와 조은지의 웨딩 사진 ${index + 1}`
  };
});
