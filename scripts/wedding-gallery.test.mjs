import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  loadWeddingGallery,
  selectGalleryFileNames
} from '../src/lib/server/wedding-gallery.ts';

const sourceImage = path.resolve('static/wedding/images/gallery/large/r01.webp');

async function fixture(t, largeNames, thumbnailNames = largeNames) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'wedding-gallery-load-'));
  const largeDir = path.join(root, 'large');
  const thumbDir = path.join(root, 'thumb');
  await Promise.all([mkdir(largeDir), mkdir(thumbDir)]);
  await Promise.all([
    ...largeNames.map((name) => copyFile(sourceImage, path.join(largeDir, name))),
    ...thumbnailNames.map((name) =>
      writeFile(path.join(thumbDir, `${path.parse(name).name}.webp`), 'thumbnail')
    )
  ]);
  t.after(() => rm(root, { recursive: true, force: true }));
  return { largeDir, thumbDir };
}

test('selects regular images only for the standard gallery', () => {
  assert.deepEqual(
    selectGalleryFileNames(
      ['r10.webp', 'm02.webp', 'r2.webp', 'cover.webp', 'r01.txt', 'm1.webp'],
      'standard'
    ),
    ['r2.webp', 'r10.webp']
  );
});

test('places naturally sorted m images after all r images in the extended gallery', () => {
  assert.deepEqual(
    selectGalleryFileNames(
      ['m10.webp', 'r10.webp', 'm2.webp', 'r2.webp', 'r01.webp', 'm01.webp'],
      'extended'
    ),
    ['r01.webp', 'r2.webp', 'r10.webp', 'm01.webp', 'm2.webp', 'm10.webp']
  );
});

test('loads the same images for both variants when no m images exist', async (t) => {
  const directories = await fixture(t, ['r01.webp', 'r02.webp']);
  const [standard, extended] = await Promise.all([
    loadWeddingGallery('standard', directories),
    loadWeddingGallery('extended', directories)
  ]);

  assert.deepEqual(
    extended.galleryImages.map((image) => image.id),
    standard.galleryImages.map((image) => image.id)
  );
});

test('fails when a selected gallery image has no thumbnail', async (t) => {
  const directories = await fixture(t, ['r01.webp', 'm01.webp'], ['r01.webp']);

  await assert.rejects(
    loadWeddingGallery('extended', directories),
    /Missing gallery thumbnail: thumb\/m01\.webp/
  );
});
