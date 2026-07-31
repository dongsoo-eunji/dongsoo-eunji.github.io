import assert from 'node:assert/strict';
import { copyFile, mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { imageSize } from 'image-size';
import { convertImages } from './convert-images.mjs';

const sourceImage = path.resolve('static/wedding/images/gallery/large/r0100.webp');

test('creates ratio-preserving large images and square thumbnails', async (t) => {
  const inputDir = await mkdtemp(path.join(os.tmpdir(), 'wedding-images-'));
  t.after(() => rm(inputDir, { recursive: true, force: true }));
  await copyFile(sourceImage, path.join(inputDir, 'portrait.webp'));

  const converted = await convertImages({ inputDir });
  const large = imageSize(await readFile(path.join(inputDir, 'large', 'portrait.webp')));
  const thumb = imageSize(await readFile(path.join(inputDir, 'thumb', 'portrait.webp')));

  assert.equal(converted.length, 1);
  assert.deepEqual(large, { height: 1800, type: 'webp', width: 1200 });
  assert.deepEqual(thumb, { height: 400, type: 'webp', width: 400 });
});

test('fails clearly when FFmpeg is unavailable', async (t) => {
  const inputDir = await mkdtemp(path.join(os.tmpdir(), 'wedding-images-'));
  t.after(() => rm(inputDir, { recursive: true, force: true }));
  await mkdir(path.join(inputDir, 'nested'));
  await copyFile(sourceImage, path.join(inputDir, 'portrait.webp'));

  await assert.rejects(
    convertImages({ inputDir, ffmpegCommand: 'missing-ffmpeg-command' }),
    /FFmpeg is required/
  );
});
