import { describe, expect, it } from "vitest";

import {
  inspectCollectionFile,
  MAX_COLLECTION_FILE_BYTES,
} from "../../src/lib/collection/collection.domain";

const pdf = new TextEncoder().encode("%PDF-1.7\nsynthetic fixture");
const wav = new Uint8Array([
  0x52, 0x49, 0x46, 0x46, 0x04, 0x00, 0x00, 0x00, 0x57, 0x41, 0x56, 0x45,
]);

describe("collection file inspection", () => {
  it("derives PDF format from the signature while treating client MIME as advisory", () => {
    expect(
      inspectCollectionFile({
        fileName: "synthetic-notes.bin",
        clientMimeType: "application/octet-stream",
        bytes: pdf,
      }),
    ).toEqual({
      ok: true,
      actualMimeType: "application/pdf",
      declaredFormat: "PDF",
      expectedType: "DOCUMENT",
      byteSize: pdf.byteLength,
    });
  });

  it("recognizes an allowed WAV signature", () => {
    expect(
      inspectCollectionFile({
        fileName: "synthetic-audio.wav",
        clientMimeType: "audio/wav",
        bytes: wav,
      }),
    ).toMatchObject({
      ok: true,
      actualMimeType: "audio/wav",
      expectedType: "AUDIO",
    });
  });

  it("rejects forbidden, empty, and oversized content before upload", () => {
    expect(
      inspectCollectionFile({
        fileName: "lecture.exe",
        clientMimeType: "application/pdf",
        bytes: new Uint8Array([0x4d, 0x5a, 0x90]),
      }),
    ).toMatchObject({ ok: false, code: "FORBIDDEN_TYPE" });
    expect(
      inspectCollectionFile({
        fileName: "empty.pdf",
        clientMimeType: "application/pdf",
        bytes: new Uint8Array(),
      }),
    ).toMatchObject({ ok: false, code: "EMPTY_FILE" });
    expect(
      inspectCollectionFile({
        fileName: "too-large.pdf",
        clientMimeType: "application/pdf",
        bytes: new Uint8Array(MAX_COLLECTION_FILE_BYTES + 1),
      }),
    ).toMatchObject({ ok: false, code: "FILE_TOO_LARGE" });
  });
});
