import type { RegisteredCollectionUpload } from "@/lib/collection/collection.application";

export type CollectionUploadClient = (
  file: File,
  itemId: string,
  clientKey: string,
  progress: (value: number) => void,
  signal: AbortSignal,
) => Promise<RegisteredCollectionUpload>;

// Existing one-file endpoint and cancellation semantics, without new transport.
export function collectionUploadClient(
  endpoint: string,
): CollectionUploadClient {
  return (file, itemId, clientKey, progress, signal) =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const abort = () => xhr.abort();
      const cleanup = () => signal.removeEventListener("abort", abort);
      if (signal.aborted) {
        reject(new Error("UPLOAD_INTERRUPTED"));
        return;
      }
      const body = new FormData();
      body.set("requestedItemId", itemId);
      body.set("clientIdempotencyKey", clientKey);
      body.set("file", file);
      xhr.open("POST", endpoint);
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable && !signal.aborted)
          progress(
            Math.min(100, Math.round((event.loaded / event.total) * 100)),
          );
      });
      xhr.addEventListener("load", () => {
        cleanup();
        if (xhr.status < 200 || xhr.status >= 300) {
          reject(new Error("UPLOAD_FAILED"));
          return;
        }
        try {
          resolve(JSON.parse(xhr.responseText) as RegisteredCollectionUpload);
        } catch {
          reject(new Error("UPLOAD_FAILED"));
        }
      });
      for (const event of ["error", "abort"])
        xhr.addEventListener(event, () => {
          cleanup();
          reject(new Error("UPLOAD_INTERRUPTED"));
        });
      signal.addEventListener("abort", abort, { once: true });
      xhr.send(body);
    });
}
