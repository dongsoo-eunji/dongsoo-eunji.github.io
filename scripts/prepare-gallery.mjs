import { spawnSync } from 'node:child_process';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_LARGE_DIR = path.resolve('static/wedding/images/gallery/large');
const DEFAULT_THUMB_DIR = path.resolve('static/wedding/images/gallery/thumb');
const IMAGE_EXTENSIONS = new Set(['.avif', '.bmp', '.gif', '.jpeg', '.jpg', '.png', '.tif', '.tiff', '.webp']);

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

export async function prepareGallery({
  largeDir = DEFAULT_LARGE_DIR,
  thumbDir = DEFAULT_THUMB_DIR,
  ffmpegCommand = process.env.FFMPEG_PATH || 'ffmpeg'
} = {}) {
  const entries = await readdir(largeDir, { withFileTypes: true });
  const images = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({ name: entry.name, stem: path.parse(entry.name).name }));

  const duplicateStem = images.find((image, index) =>
    images.some((candidate, candidateIndex) => candidateIndex !== index && candidate.stem === image.stem)
  );
  if (duplicateStem) {
    throw new Error(`Large gallery contains more than one image named "${duplicateStem.stem}".`);
  }

  await mkdir(thumbDir, { recursive: true });
  const thumbnailNames = new Set(await readdir(thumbDir));
  const missing = images.filter((image) => !thumbnailNames.has(`${image.stem}.webp`));

  if (missing.length === 0) return [];

  const version = run(ffmpegCommand, ['-version']);
  if (version.error || version.status !== 0) {
    const names = missing.map((image) => `${image.stem}.webp`).join(', ');
    throw new Error(`FFmpeg is required to create missing gallery thumbnails: ${names}`);
  }

  const created = [];
  for (const image of missing) {
    const inputPath = path.join(largeDir, image.name);
    const outputPath = path.join(thumbDir, `${image.stem}.webp`);
    const temporaryPath = path.join(thumbDir, `.${image.stem}.${process.pid}.${Date.now()}.tmp.webp`);

    try {
      const result = run(ffmpegCommand, [
        '-y',
        '-i', inputPath,
        '-vf', 'scale=400:400:force_original_aspect_ratio=increase,crop=400:400',
        '-c:v', 'libwebp',
        '-quality', '75',
        '-compression_level', '6',
        '-map_metadata', '-1',
        temporaryPath
      ]);

      if (result.error || result.status !== 0) {
        const detail = result.stderr?.trim() || result.error?.message || 'unknown FFmpeg error';
        throw new Error(`Failed to create thumbnail for ${image.name}: ${detail}`);
      }

      await rename(temporaryPath, outputPath);
      created.push(outputPath);
      console.log(`Created gallery thumbnail: ${path.relative(process.cwd(), outputPath)}`);
    } finally {
      await rm(temporaryPath, { force: true });
    }
  }

  return created;
}

const isMain = process.argv[1] && pathToFileURL(fileURLToPath(import.meta.url)).href === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  prepareGallery().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
