import assert from "node:assert/strict";
import test from "node:test";
import { shiftAccountDigits } from "../src/lib/account-shift.ts";

test("shifts every digit by five", () => {
  assert.equal(shiftAccountDigits("0123456789"), "5678901234");
});

test("preserves separators and other non-digit characters", () => {
  assert.equal(shiftAccountDigits("012-34 567"), "567-89 012");
});

test("restores the original value when applied twice", () => {
  const shifted = shiftAccountDigits("012-345-6789");
  assert.equal(shiftAccountDigits(shifted), "012-345-6789");
});
