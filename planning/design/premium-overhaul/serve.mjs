// Local design artifact only: serves this folder on 127.0.0.1:3104.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const folder = fileURLToPath(new URL(".", import.meta.url));
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};
createServer(async (request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname;
  const file = normalize(folder + (path === "/" ? "index.html" : path.slice(1)));
  if (request.method !== "GET" || !file.startsWith(folder) || file.includes(`${sep}..`)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const data = await readFile(file);
    response.writeHead(200, {
      "Content-Type": types[extname(file)] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(data);
  } catch {
    response.writeHead(404).end();
  }
}).listen(3104, "127.0.0.1", () => console.log("http://127.0.0.1:3104/"));
