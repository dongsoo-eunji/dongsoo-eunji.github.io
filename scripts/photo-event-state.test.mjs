import assert from "node:assert/strict";
import test from "node:test";
import {
  canSubmitPhotoUpload,
  getPhotoEventPhase,
  isAcceptedPhotoFile,
  photoUploadFailureMessage,
} from "../src/lib/photo-event/photo-event-state.ts";

const cases = [
  ["2026-08-29T12:00:00+09:00", "open"],
  ["2026-10-04T14:29:59+09:00", "open"],
  ["2026-10-04T14:30:00+09:00", "open"],
  ["2026-10-04T19:59:59+09:00", "open"],
  ["2026-10-04T20:00:00+09:00", "selecting"],
  ["2026-10-04T21:59:59+09:00", "selecting"],
  ["2026-10-04T22:00:00+09:00", "published"],
];

for (const [time, expected] of cases) {
  test(`${time} is ${expected}`, () => {
    assert.equal(getPhotoEventPhase(Date.parse(time)), expected);
  });
}

test("prevents duplicate upload submission while a request is running", () => {
  assert.equal(canSubmitPhotoUpload("open", true, "idle"), true);
  assert.equal(canSubmitPhotoUpload("open", true, "error"), true);
  assert.equal(canSubmitPhotoUpload("open", true, "uploading"), false);
  assert.equal(canSubmitPhotoUpload("selecting", true, "idle"), false);
  assert.equal(canSubmitPhotoUpload("open", false, "idle"), false);
});

test("keeps network, timeout and server failures understandable and retryable", () => {
  assert.match(photoUploadFailureMessage("network"), /네트워크/);
  assert.match(photoUploadFailureMessage("timeout"), /다시 시도/);
  assert.equal(photoUploadFailureMessage("server", "사진 접수가 마감되었습니다"), "사진 접수가 마감되었습니다");
  assert.match(photoUploadFailureMessage("server"), /다시 시도/);
});

test("accepts HEIC from browsers that omit a useful MIME type", () => {
  assert.equal(isAcceptedPhotoFile({ name: "IMG_1001.HEIC", type: "" }), true);
  assert.equal(
    isAcceptedPhotoFile({ name: "IMG_1001.heif", type: "application/octet-stream" }),
    true,
  );
  assert.equal(isAcceptedPhotoFile({ name: "photo.jpg", type: "image/jpeg" }), true);
  assert.equal(isAcceptedPhotoFile({ name: "notes.txt", type: "" }), false);
  assert.equal(isAcceptedPhotoFile({ name: "photo.jpg", type: "text/plain" }), false);
});
