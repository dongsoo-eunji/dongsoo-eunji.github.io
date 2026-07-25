export const galleryRefreshInterval = 60 * 60 * 1000;

export function shouldRefreshGallery(
  lastOpenedAt: string | null,
  now = Date.now()
): boolean {
  if (lastOpenedAt === null) return true;

  const previous = Number(lastOpenedAt);
  const elapsed = now - previous;

  return !Number.isFinite(previous) || elapsed < 0 || elapsed >= galleryRefreshInterval;
}
