import { spawnSync } from 'node:child_process';
import { mkdir, readdir, rename, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const DEFAULT_INPUT_DIR = path.resolve('source_images/새 폴더');
const IMAGE_EXTENSIONS = new Set([
  '.avif',
  '.bmp',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
  '.tif',
  '.tiff',
  '.webp'
]);

function run(command, args) {
  return spawnSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}

async function convert(ffmpegCommand, inputPath, outputPath, videoFilter) {
  const temporaryPath = path.join(
    path.dirname(outputPath),
    `.${path.basename(outputPath, '.webp')}.${process.pid}.${Date.now()}.tmp.webp`
  );

  try {
    const result = run(ffmpegCommand, [
      '-y',
      '-i', inputPath,
      '-vf', videoFilter,
      '-c:v', 'libwebp',
      '-quality', '75',
      '-compression_level', '6',
      '-map_metadata', '-1',
      temporaryPath
    ]);

    if (result.error || result.status !== 0) {
      const detail = result.stderr?.trim() || result.error?.message || 'unknown FFmpeg error';
      throw new Error(`Failed to convert ${path.basename(inputPath)}: ${detail}`);
    }

    await rename(temporaryPath, outputPath);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function convertImages({
  inputDir = DEFAULT_INPUT_DIR,
  largeDir = path.join(inputDir, 'large'),
  thumbDir = path.join(inputDir, 'thumb'),
  ffmpegCommand = process.env.FFMPEG_PATH || 'ffmpeg'
} = {}) {
  const entries = await readdir(inputDir, { withFileTypes: true });
  const images = entries
    .filter((entry) => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
    .map((entry) => ({ name: entry.name, stem: path.parse(entry.name).name }))
    .sort((left, right) => left.name.localeCompare(right.name));

  if (images.length === 0) {
    throw new Error(`No images found in ${inputDir}`);
  }

  const duplicateStem = images.find((image, index) =>
    images.some(
      (candidate, candidateIndex) =>
        candidateIndex !== index && candidate.stem.toLowerCase() === image.stem.toLowerCase()
    )
  );
  if (duplicateStem) {
    throw new Error(`More than one source image is named "${duplicateStem.stem}".`);
  }

  const version = run(ffmpegCommand, ['-version']);
  if (version.error || version.status !== 0) {
    throw new Error('FFmpeg is required to convert images.');
  }

  await Promise.all([mkdir(largeDir, { recursive: true }), mkdir(thumbDir, { recursive: true })]);

  const converted = [];
  for (const image of images) {
    const inputPath = path.join(inputDir, image.name);
    const largePath = path.join(largeDir, `${image.stem}.webp`);
    const thumbPath = path.join(thumbDir, `${image.stem}.webp`);

    await convert(
      ffmpegCommand,
      inputPath,
      largePath,
      "scale='if(gt(iw,ih),min(1800,iw),-2)':'if(gt(iw,ih),-2,min(1800,ih))'"
    );
    await convert(
      ffmpegCommand,
      inputPath,
      thumbPath,
      'scale=400:400:force_original_aspect_ratio=increase,crop=400:400'
    );

    converted.push({ largePath, thumbPath });
    console.log(`Converted image: ${image.name}`);
  }

  return converted;
}

const isMain =
  process.argv[1] &&
  pathToFileURL(fileURLToPath(import.meta.url)).href ===
    pathToFileURL(path.resolve(process.argv[1])).href;

if (isMain) {
  const inputDir = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_INPUT_DIR;
  convertImages({ inputDir }).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
