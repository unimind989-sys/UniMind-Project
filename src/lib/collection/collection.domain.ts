export const MAX_COLLECTION_FILE_BYTES = 10 * 1024 * 1024;

export type CollectionExpectedType = "DOCUMENT" | "AUDIO" | "IMAGE" | "OTHER";

export type CollectionFileInspection =
  | Readonly<{
      ok: true;
      actualMimeType: "application/pdf" | "audio/wav" | "image/png";
      declaredFormat: "PDF" | "WAV" | "PNG";
      expectedType: Exclude<CollectionExpectedType, "OTHER">;
      byteSize: number;
    }>
  | Readonly<{
      ok: false;
      code: "EMPTY_FILE" | "FILE_TOO_LARGE" | "FORBIDDEN_TYPE";
    }>;

type CollectionFileInput = Readonly<{
  fileName: string;
  clientMimeType: string;
  bytes: Uint8Array;
}>;

function startsWith(bytes: Uint8Array, signature: readonly number[]) {
  return signature.every((value, index) => bytes[index] === value);
}

export function inspectCollectionFile(
  input: CollectionFileInput,
): CollectionFileInspection {
  if (input.bytes.byteLength === 0) return { ok: false, code: "EMPTY_FILE" };
  if (input.bytes.byteLength > MAX_COLLECTION_FILE_BYTES) {
    return { ok: false, code: "FILE_TOO_LARGE" };
  }

  if (startsWith(input.bytes, [0x25, 0x50, 0x44, 0x46, 0x2d])) {
    return {
      ok: true,
      actualMimeType: "application/pdf",
      declaredFormat: "PDF",
      expectedType: "DOCUMENT",
      byteSize: input.bytes.byteLength,
    };
  }

  if (
    startsWith(input.bytes, [0x52, 0x49, 0x46, 0x46]) &&
    input.bytes[8] === 0x57 &&
    input.bytes[9] === 0x41 &&
    input.bytes[10] === 0x56 &&
    input.bytes[11] === 0x45
  ) {
    return {
      ok: true,
      actualMimeType: "audio/wav",
      declaredFormat: "WAV",
      expectedType: "AUDIO",
      byteSize: input.bytes.byteLength,
    };
  }

  if (
    startsWith(input.bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return {
      ok: true,
      actualMimeType: "image/png",
      declaredFormat: "PNG",
      expectedType: "IMAGE",
      byteSize: input.bytes.byteLength,
    };
  }

  return { ok: false, code: "FORBIDDEN_TYPE" };
}
