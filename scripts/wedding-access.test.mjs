import assert from "node:assert/strict";
import { pbkdf2Sync } from "node:crypto";
import test from "node:test";
import {
  WEDDING_LOCK_AT,
  hashWeddingPassword,
  isWeddingLocked,
} from "../src/lib/wedding-access.ts";

test("locks at 2026-10-10 23:59 KST", () => {
  assert.equal(WEDDING_LOCK_AT, Date.parse("2026-10-10T23:59:00+09:00"));
  assert.equal(isWeddingLocked(WEDDING_LOCK_AT - 1), false);
  assert.equal(isWeddingLocked(WEDDING_LOCK_AT), true);
});

test("password comparison uses salted PBKDF2-SHA256", async () => {
  const password = "sample-password";
  const salt = "00112233445566778899aabbccddeeff";
  const iterations = 1_000;
  const expected = pbkdf2Sync(password, Buffer.from(salt, "hex"), iterations, 32, "sha256").toString("hex");
  const passwordHash = await hashWeddingPassword(password, salt, iterations);
  assert.equal(passwordHash, expected);
  assert.match(passwordHash, /^[a-f0-9]{64}$/);
  assert.notEqual(passwordHash, password);
});
