// Local design artifact only. No product services, credentials, API, upload or provider.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
const entries = new Map([
  ["/", ["preview.html", "text/html; charset=utf-8"]],
  ["/preview.html", ["preview.html", "text/html; charset=utf-8"]],
  ["/preview.css", ["preview.css", "text/css; charset=utf-8"]],
  ["/preview.mjs", ["preview.mjs", "text/javascript; charset=utf-8"]],
  [
    "/fonts/latin.woff2",
    [
      "../../../.next/dev/static/media/a343f882a40d2cc9-s.p.1sj6eobyi31rd.woff2",
      "font/woff2",
    ],
  ],
  [
    "/fonts/arabic.woff2",
    [
      "../../../.next/dev/static/media/3fd1b3eda9c5392f-s.p.28efgb-r-zxeb.woff2",
      "font/woff2",
    ],
  ],
]);
const server = createServer(async (request, response) => {
  const entry = entries.get(
    new URL(request.url, "http://127.0.0.1:3103").pathname,
  );
  if (request.method !== "GET" || !entry) {
    response.writeHead(404);
    response.end();
    return;
  }
  try {
    const data = await readFile(
      fileURLToPath(new URL(entry[0], import.meta.url)),
    );
    response.writeHead(200, {
      "Content-Type": entry[1],
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end();
  }
});
server.listen(3103, "127.0.0.1", () =>
  console.log("UniMind Phase 1 proposal: http://127.0.0.1:3103"),
);
