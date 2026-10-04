import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { imageSize } from 'image-size';
import { convertImages } from './convert-images.mjs';

const defaultInputDir = path.resolve('source_images/베스트샷');
const defaultOutputDir = path.resolve('static/wedding/images/best-shots');
const managedFileName = /^best-[a-f0-9]{64}\.webp$/;

export async function prepareBestShots({
  inputDir = defaultInputDir,
  outputDir = defaultOutputDir,
  order,
  ifPresent = false,
  ffmpegCommand = process.env.FFMPEG_PATH || 'ffmpeg'
} = {}) {
  // Originals are ignored by Git; CI deploys the committed WebP assets.
  try {
    await readdir(inputDir);
  } catch (error) {
    if (ifPresent && error.code === 'ENOENT') return [];
    throw error;
  }

  order ??= JSON.parse(await readFile(new URL('./best-shots-order.json', import.meta.url), 'utf8'));
  if (!Array.isArray(order) || order.some((id) => typeof id !== 'string') || new Set(order).size !== order.length) {
    throw new Error('Best-shot order must contain unique image IDs.');
  }

  const largeDir = path.join(outputDir, 'large');
  const thumbDir = path.join(outputDir, 'thumb');
  const converted = await convertImages({
    inputDir,
    largeDir,
    thumbDir,
    maxDimension: 1920,
    allowEmpty: true,
    outputStem: async (_image, inputPath) =>
      `best-${createHash('sha256').update(await readFile(inputPath)).digest('hex')}`,
    ffmpegCommand
  });
  const preparedImages = await Promise.all(converted.map(async ({ largePath, thumbPath }) => {
    const { width, height } = imageSize(await readFile(largePath));
    const fileName = path.basename(largePath);
    return {
      id: path.parse(fileName).name,
      src: `/wedding/images/best-shots/large/${fileName}`,
      thumbnailSrc: `/wedding/images/best-shots/thumb/${path.basename(thumbPath)}`,
      width,
      height
    };
  }));
  const ranks = new Map(order.map((id, index) => [id, index]));
  const galleryImages = preparedImages
    .sort((left, right) => (ranks.get(left.id) ?? order.length) - (ranks.get(right.id) ?? order.length))
    .map((image, index) => ({ ...image, alt: `베스트 사진 ${String(index + 1).padStart(2, '0')}` }));

  await mkdir(outputDir, { recursive: true });
  const manifestPath = path.join(outputDir, 'gallery.json');
  const temporaryPath = path.join(outputDir, `.gallery.${process.pid}.tmp.json`);
  try {
    await writeFile(temporaryPath, `${JSON.stringify({ galleryImages }, null, 2)}\n`);
    await rename(temporaryPath, manifestPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }

  // Prune only this script's assets, after the new gallery has been saved.
  const currentNames = new Set(converted.map(({ largePath }) => path.basename(largePath)));
  for (const directory of [largeDir, thumbDir]) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.isFile() && managedFileName.test(entry.name) && !currentNames.has(entry.name)) {
        await rm(path.join(directory, entry.name));
      }
    }
  }
  console.log(`Prepared ${galleryImages.length} best shots.`);
  return galleryImages;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  prepareBestShots({ ifPresent: process.argv.includes('--if-present') }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
