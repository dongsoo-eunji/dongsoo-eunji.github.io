import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { imageSize } from 'image-size';
import { prepareGallery } from './prepare-gallery.mjs';

const sourceImage = path.resolve('static/wedding/images/gallery/large/r01.webp');

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'wedding-gallery-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const largeDir = path.join(root, 'large');
  const thumbDir = path.join(root, 'thumb');
  await mkdir(largeDir);
  await mkdir(thumbDir);
  await copyFile(sourceImage, path.join(largeDir, 'r01.webp'));
  return { largeDir, thumbDir };
}

test('keeps an existing thumbnail without requiring FFmpeg', async (t) => {
  const { largeDir, thumbDir } = await fixture(t);
  const thumbnail = path.join(thumbDir, 'r01.webp');
  await writeFile(thumbnail, 'existing thumbnail');
  const before = await stat(thumbnail);

  const created = await prepareGallery({ largeDir, thumbDir, ffmpegCommand: 'missing-ffmpeg-command' });

  assert.deepEqual(created, []);
  assert.equal((await stat(thumbnail)).size, before.size);
});

test('creates a 400 by 400 WebP thumbnail', async (t) => {
  const { largeDir, thumbDir } = await fixture(t);
  await prepareGallery({ largeDir, thumbDir });

  const dimensions = imageSize(await readFile(path.join(thumbDir, 'r01.webp')));
  assert.equal(dimensions.width, 400);
  assert.equal(dimensions.height, 400);
  assert.equal(dimensions.type, 'webp');
});

test('fails when a thumbnail is missing and FFmpeg is unavailable', async (t) => {
  const { largeDir, thumbDir } = await fixture(t);

  await assert.rejects(
    prepareGallery({ largeDir, thumbDir, ffmpegCommand: 'missing-ffmpeg-command' }),
    /FFmpeg is required.*r01\.webp/
  );
});
