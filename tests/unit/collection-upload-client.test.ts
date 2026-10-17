import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { collectionUploadClient } from "../../src/app/batch-leader/_components/collection-upload-client";

// The real Batch Leader intake posts one file per request through this XHR
// client. A deterministic in-memory XHR records each request and lets the
// test choose its outcome; no network or server is involved.
type Listener = (event?: {
  lengthComputable: boolean;
  loaded: number;
  total: number;
}) => void;

class FakeXhr {
  static sent: FakeXhr[] = [];
  method = "";
  url = "";
  body: FormData | null = null;
  status = 0;
  responseText = "";
  aborted = false;
  private listeners = new Map<string, Listener[]>();
  readonly upload = {
    addEventListener: (type: string, listener: Listener) =>
      this.on(`upload:${type}`, listener),
  };
  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }
  addEventListener(type: string, listener: Listener) {
    this.on(type, listener);
  }
  send(body: FormData) {
    this.body = body;
    FakeXhr.sent.push(this);
  }
  abort() {
    this.aborted = true;
    this.emit("abort");
  }
  respond(status: number, body: unknown) {
    this.status = status;
    this.responseText = typeof body === "string" ? body : JSON.stringify(body);
    this.emit("load");
  }
  progress(loaded: number, total: number) {
    this.emit("upload:progress", { lengthComputable: true, loaded, total });
  }
  fail() {
    this.emit("error");
  }
  private on(type: string, listener: Listener) {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  private emit(type: string, event?: Parameters<Listener>[0]) {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

const original = globalThis.XMLHttpRequest;
beforeEach(() => {
  FakeXhr.sent = [];
  globalThis.XMLHttpRequest = FakeXhr as unknown as typeof XMLHttpRequest;
});
afterEach(() => {
  globalThis.XMLHttpRequest = original;
});

const endpoint = "/api/batch-leader/campaigns/campaign-a/uploads";
const file = () =>
  new File(["%PDF-1.7\nSynthetic only"], "synthetic.pdf", {
    type: "application/pdf",
  });
const receipt = {
  uploadId: "upload-a",
  checksum: "a".repeat(64),
  mimeType: "application/pdf",
  byteSize: 22,
};

describe("real collection upload client", () => {
  it("posts one file with its request and idempotency key and reports progress", async () => {
    const progress: number[] = [];
    const pending = collectionUploadClient(endpoint)(
      file(),
      "item-a",
      "key-a",
      (value) => progress.push(value),
      new AbortController().signal,
    );
    const request = FakeXhr.sent[0]!;
    expect(request.method).toBe("POST");
    expect(request.url).toBe(endpoint);
    expect(request.body?.get("requestedItemId")).toBe("item-a");
    expect(request.body?.get("clientIdempotencyKey")).toBe("key-a");
    expect((request.body?.get("file") as File).name).toBe("synthetic.pdf");
    request.progress(11, 22);
    request.respond(201, receipt);
    await expect(pending).resolves.toEqual(receipt);
    expect(progress).toEqual([50]);
  });

  it.each([
    [413, "FILE_TOO_LARGE"],
    [403, "CAMPAIGN_UNAVAILABLE"],
    [400, "VALIDATION_REJECTED"],
    [503, "UPLOAD_FAILED"],
  ])(
    "maps HTTP %s to %s without exposing the response",
    async (status, code) => {
      const pending = collectionUploadClient(endpoint)(
        file(),
        "item-a",
        "key-a",
        () => {},
        new AbortController().signal,
      );
      FakeXhr.sent[0]!.respond(status, { error: "UPLOAD_REJECTED" });
      await expect(pending).rejects.toThrow(code);
    },
  );

  it("rejects an unreadable receipt as a failed upload", async () => {
    const pending = collectionUploadClient(endpoint)(
      file(),
      "item-a",
      "key-a",
      () => {},
      new AbortController().signal,
    );
    FakeXhr.sent[0]!.respond(201, "<html>");
    await expect(pending).rejects.toThrow("UPLOAD_FAILED");
  });

  it("treats cancellation and network loss as an interruption the queue may retry", async () => {
    const controller = new AbortController();
    const cancelled = collectionUploadClient(endpoint)(
      file(),
      "item-a",
      "key-a",
      () => {},
      controller.signal,
    );
    controller.abort();
    await expect(cancelled).rejects.toThrow("UPLOAD_INTERRUPTED");
    expect(FakeXhr.sent[0]!.aborted).toBe(true);

    const lost = collectionUploadClient(endpoint)(
      file(),
      "item-a",
      "key-a",
      () => {},
      new AbortController().signal,
    );
    FakeXhr.sent[1]!.fail();
    await expect(lost).rejects.toThrow("UPLOAD_INTERRUPTED");
    expect(FakeXhr.sent[1]!.body?.get("clientIdempotencyKey")).toBe("key-a");

    const alreadyCancelled = new AbortController();
    alreadyCancelled.abort();
    await expect(
      collectionUploadClient(endpoint)(
        file(),
        "item-a",
        "key-a",
        () => {},
        alreadyCancelled.signal,
      ),
    ).rejects.toThrow("UPLOAD_INTERRUPTED");
    expect(FakeXhr.sent).toHaveLength(2);
  });
});
