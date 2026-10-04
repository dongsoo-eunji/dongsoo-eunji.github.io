import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { imageSize } from 'image-size';
import { prepareBestShots } from './prepare-best-shots.mjs';

const sourceImage = path.resolve('static/wedding/images/gallery/large/r0100.webp');

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'best-shots-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const inputDir = path.join(root, 'originals');
  const outputDir = path.join(root, 'public');
  await mkdir(inputDir);
  return { inputDir, outputDir };
}

function createImage(filePath, dimensions) {
  const result = spawnSync(process.env.FFMPEG_PATH || 'ffmpeg', [
    '-y', '-f', 'lavfi', '-i', `color=c=blue:s=${dimensions}`, '-frames:v', '1', filePath
  ], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
}

test('limits both orientations to 1920px and preserves small originals and square thumbnails', async (t) => {
  const options = await fixture(t);
  createImage(path.join(options.inputDir, '01-portrait.webp'), '2400x3600');
  createImage(path.join(options.inputDir, '02-landscape.webp'), '3600x2400');
  createImage(path.join(options.inputDir, '03-small.webp'), '600x400');
  const images = await prepareBestShots(options);
  assert.deepEqual(images.map(({ width, height }) => [width, height]), [
    [1280, 1920], [1920, 1280], [600, 400]
  ]);
  for (const image of images) {
    const name = path.basename(image.src);
    assert.deepEqual(imageSize(await readFile(path.join(options.outputDir, 'thumb', name))), {
      width: 400, height: 400, type: 'webp'
    });
    assert.equal(imageSize(await readFile(path.join(options.outputDir, 'large', name))).type, 'webp');
  }

  const orderedOptions = { ...options, order: [images[2].id, images[0].id] };
  const ordered = await prepareBestShots(orderedOptions);
  assert.deepEqual(ordered.map(({ id }) => id), [images[2].id, images[0].id, images[1].id]);
  assert.deepEqual(ordered.map(({ alt }) => alt), ['베스트 사진 01', '베스트 사진 02', '베스트 사진 03']);
  assert.deepEqual(await prepareBestShots(orderedOptions), ordered);
});

test('reruns reflect additions, replacement, deletion and an empty folder without exposing names', async (t) => {
  const options = await fixture(t);
  const original = path.join(options.inputDir, '이름01012345678.webp');
  await copyFile(sourceImage, original);
  const first = await prepareBestShots(options);
  assert.equal(first.length, 1);
  assert.equal(JSON.stringify(first).includes('01012345678'), false);
  assert.deepEqual(await prepareBestShots(options), first);

  createImage(original, '600x400');
  await copyFile(sourceImage, path.join(options.inputDir, '추가.webp'));
  const second = await prepareBestShots(options);
  assert.equal(second.length, 2);
  assert.notEqual(second[0].src, first[0].src);
  await rm(path.join(options.inputDir, '추가.webp'));
  const third = await prepareBestShots(options);
  assert.equal(third.length, 1);
  assert.deepEqual(await readdir(path.join(options.outputDir, 'large')), [path.basename(third[0].src)]);
  assert.deepEqual(await readdir(path.join(options.outputDir, 'thumb')), [path.basename(third[0].src)]);

  await writeFile(path.join(options.outputDir, 'large', 'keep.txt'), 'unmanaged');
  await rm(original);
  assert.deepEqual(await prepareBestShots(options), []);
  assert.deepEqual(JSON.parse(await readFile(path.join(options.outputDir, 'gallery.json'), 'utf8')), {
    galleryImages: []
  });
  assert.deepEqual(await readdir(path.join(options.outputDir, 'large')), ['keep.txt']);
});

test('CI without originals keeps committed assets, and failures keep the previous manifest', async (t) => {
  const options = await fixture(t);
  await copyFile(sourceImage, path.join(options.inputDir, 'photo.webp'));
  const first = await prepareBestShots(options);
  await assert.rejects(prepareBestShots({ ...options, ffmpegCommand: 'missing-ffmpeg-command' }), /FFmpeg/);
  const manifestPath = path.join(options.outputDir, 'gallery.json');
  assert.deepEqual(JSON.parse(await readFile(manifestPath, 'utf8')).galleryImages, first);
  await rm(path.join(options.inputDir, 'photo.webp'));
  await rm(options.inputDir, { recursive: true });
  assert.deepEqual(await prepareBestShots({ ...options, ifPresent: true }), []);
  assert.deepEqual(JSON.parse(await readFile(manifestPath, 'utf8')).galleryImages, first);
});
