import { createServer } from "node:http";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const publicDir = resolve(__dirname);
const port = Number.parseInt(process.env.PORT || "4173", 10);
const host = process.env.HOST || "127.0.0.1";

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);
    const pathname = decodeURIComponent(requestUrl.pathname);
    const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
    let filePath = resolve(join(publicDir, safePath));

    if (!filePath.startsWith(publicDir)) {
      sendStatus(response, 403, "Forbidden");
      return;
    }

    const fileStat = await getStat(filePath);
    if (fileStat?.isDirectory()) {
      filePath = join(filePath, "index.html");
    }

    const resolvedStat = await getStat(filePath);
    if (!resolvedStat?.isFile()) {
      sendStatus(response, 404, "Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Length": resolvedStat.size,
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(filePath).pipe(response);
  } catch (error) {
    console.error(error);
    sendStatus(response, 500, "Server error");
  }
});

server.listen(port, host, () => {
  console.log(`Voices of St. Gen is running at http://${host}:${port}/`);
});

async function getStat(filePath) {
  try {
    return await stat(filePath);
  } catch {
    return null;
  }
}

function sendStatus(response, statusCode, message) {
  response.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  response.end(message);
}
