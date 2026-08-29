export const PHOTO_EVENT_TIMES = {
  uploadStart: Date.parse("2026-10-04T14:30:00+09:00"),
  uploadCutoff: Date.parse("2026-10-04T20:00:00+09:00"),
  publish: Date.parse("2026-10-04T22:00:00+09:00"),
} as const;

export type PhotoEventPhase =
  | "before"
  | "open"
  | "selecting"
  | "published";

export type PhotoUploadState = "idle" | "uploading" | "success" | "error";

const acceptedPhotoMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function getPhotoEventPhase(now: number): PhotoEventPhase {
  if (now < PHOTO_EVENT_TIMES.uploadStart) return "before";
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
  return /\.(?:jpe?g|png|webp|heic|heif)$/i.test(file.name);
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
