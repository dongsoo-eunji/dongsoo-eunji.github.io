import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  loadWeddingGallery,
  selectGalleryFileNames
} from '../src/lib/server/wedding-gallery.ts';
import {
  galleryRefreshInterval,
  shouldRefreshGallery
} from '../src/lib/gallery/gallery-refresh.ts';

const sourceDirectory = path.resolve('static/wedding/images/gallery/large');
const sourceImage = path.join(
  sourceDirectory,
  (await readdir(sourceDirectory)).find((name) => name.endsWith('.webp'))
);

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

test('selects only shared images for the standard gallery', () => {
  assert.deepEqual(
    selectGalleryFileNames(
      ['r10m.webp', 'r03.webp', 'r2.webp', 'cover.webp', 'r01.txt', 'm1.webp'],
      'standard'
    ),
    ['r2.webp', 'r03.webp']
  );
});

test('includes m-suffixed images in natural order for the extended gallery', () => {
  assert.deepEqual(
    selectGalleryFileNames(
      ['r10m.webp', 'r10.webp', 'r2m.webp', 'r2.webp', 'r01.webp', 'm01.webp'],
      'extended'
    ),
    ['r01.webp', 'r2.webp', 'r2m.webp', 'r10.webp', 'r10m.webp']
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
  const directories = await fixture(t, ['r01.webp', 'r02m.webp'], ['r01.webp']);

  await assert.rejects(
    loadWeddingGallery('extended', directories),
    /Missing gallery thumbnail: thumb\/r02m\.webp/
  );
});

test('fails when a gallery variant has no images', async (t) => {
  const directories = await fixture(t, ['r01m.webp']);

  await assert.rejects(
    loadWeddingGallery('standard', directories),
    /standard wedding gallery requires at least one image/
  );
});

test('refreshes the gallery on first open or after one hour', () => {
  const now = Date.parse('2026-07-25T12:00:00Z');

  assert.equal(shouldRefreshGallery(null, now), true);
  assert.equal(shouldRefreshGallery(String(now - galleryRefreshInterval), now), true);
  assert.equal(shouldRefreshGallery(String(now - galleryRefreshInterval + 1), now), false);
});

test('refreshes the gallery when its stored open time is invalid', () => {
  const now = Date.parse('2026-07-25T12:00:00Z');

  assert.equal(shouldRefreshGallery('invalid', now), true);
  assert.equal(shouldRefreshGallery(String(now + 1), now), true);
});
