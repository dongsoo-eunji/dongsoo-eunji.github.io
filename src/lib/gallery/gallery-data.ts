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
 * Replace the placeholder SVG paths with the matching numbered WebP paths before publishing.
 * Dimensions should be updated to match the final photographs when they are exported.
 */
export const galleryImages: GalleryImage[] = Array.from({ length: 20 }, (_, index) => {
  const number = String(index + 1).padStart(2, '0');

  return {
    id: `wedding-${number}`,
    src: galleryPath('wedding/images/gallery/large/placeholder.svg'),
    thumbnailSrc: galleryPath('wedding/images/gallery/thumb/placeholder.svg'),
    width: 1600,
    height: 2000,
    alt: `이동수와 조은지의 웨딩 사진 ${index + 1}`
  };
});
