# Wedding gallery images

The included SVG files keep the prerendered fallback usable until photos are ready. Before publishing, add 20 WebP image pairs and update each data item in `src/lib/gallery/gallery-data.ts` to its matching numbered paths:

- `large/01.webp` through `large/20.webp` — the full-size images.
- `thumb/01.webp` through `thumb/20.webp` — smaller cropped thumbnails.

Update the matching `width` and `height` values in `src/lib/gallery/gallery-data.ts` if the final image dimensions differ from 1600×2000.
