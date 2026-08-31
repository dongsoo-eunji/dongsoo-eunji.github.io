export const WEDDING_LOCK_AT = Date.parse("2026-10-10T23:59:00+09:00");

export function isWeddingLocked(now: number, lockAt = WEDDING_LOCK_AT): boolean {
  return now >= lockAt;
}

function hexBytes(value: string): ArrayBuffer {
  const pairs = value.match(/.{2}/g) ?? [];
  const buffer = new ArrayBuffer(pairs.length);
  const bytes = new Uint8Array(buffer);
  pairs.forEach((pair, index) => (bytes[index] = Number.parseInt(pair, 16)));
  return buffer;
}

export async function hashWeddingPassword(
  password: string,
  salt: string,
  iterations: number,
): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: hexBytes(salt), iterations },
    key,
    256,
  );
  return Array.from(new Uint8Array(derived), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
