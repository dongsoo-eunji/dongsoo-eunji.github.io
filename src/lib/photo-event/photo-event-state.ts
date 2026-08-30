export const PHOTO_EVENT_TIMES = {
  uploadCutoff: Date.parse("2026-10-04T20:00:00+09:00"),
  publish: Date.parse("2026-10-04T22:00:00+09:00"),
} as const;

export type PhotoEventPhase = "open" | "selecting" | "published";

export type PhotoUploadState = "idle" | "uploading" | "success" | "error";

export const MAXIMUM_PHOTOS_PER_UPLOAD = 5;
export const MAXIMUM_PHOTO_BYTES = 15 * 1024 * 1024;
export const MAXIMUM_UPLOAD_BYTES = MAXIMUM_PHOTOS_PER_UPLOAD * MAXIMUM_PHOTO_BYTES;

export type PhotoSelectionError = "too-many" | "unsupported" | "file-too-large" | "total-too-large";

const acceptedPhotoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/heic",
  "image/heif",
]);

export function getPhotoEventPhase(now: number): PhotoEventPhase {
  if (now < PHOTO_EVENT_TIMES.uploadCutoff) return "open";
  if (now < PHOTO_EVENT_TIMES.publish) return "selecting";
  return "published";
}

export function canSubmitPhotoUpload(
  phase: PhotoEventPhase,
  hasFile: boolean,
  uploadState: PhotoUploadState,
): boolean {
  return phase === "open" && hasFile && uploadState !== "uploading";
}

export function isAcceptedPhotoFile(file: { name: string; type: string }): boolean {
  const mimeType = file.type.toLowerCase();
  if (acceptedPhotoMimeTypes.has(mimeType)) return true;
  if (mimeType && mimeType !== "application/octet-stream") return false;
  return /\.(?:jpe?g|png|webp|avif|heic|heif)$/i.test(file.name);
}

export function validatePhotoSelection(
  files: ArrayLike<{ name: string; type: string; size: number }>,
): PhotoSelectionError | null {
  const selected = Array.from(files);
  if (selected.length > MAXIMUM_PHOTOS_PER_UPLOAD) return "too-many";
  if (selected.some((file) => !isAcceptedPhotoFile(file))) return "unsupported";
  if (selected.some((file) => file.size > MAXIMUM_PHOTO_BYTES)) return "file-too-large";
  if (selected.reduce((total, file) => total + file.size, 0) > MAXIMUM_UPLOAD_BYTES) {
    return "total-too-large";
  }
  return null;
}

export function photoUploadFailureMessage(
  kind: "network" | "timeout" | "server",
  serverMessage = "",
): string {
  if (kind === "network") {
    return "네트워크 연결을 확인한 뒤 다시 시도해 주세요.";
  }
  if (kind === "timeout") {
    return "업로드 시간이 오래 걸리고 있습니다. 다시 시도해 주세요.";
  }
  return serverMessage || "사진을 올리지 못했습니다. 잠시 후 다시 시도해 주세요.";
}
