import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const START_URL = process.env.SCRAPE_START_URL || "https://sites.google.com/view/stgenchoir/";
const OUTPUT_PATH = resolve(process.cwd(), process.env.SCRAPE_OUTPUT || "data/stgenchoir-scrape.json");
const MAX_PAGES = Number.parseInt(process.env.SCRAPE_MAX_PAGES || "10", 10);
const REQUEST_HEADERS = {
  "user-agent": "voicesofstgen-scraper/1.0 (+https://voicesofstgen.com)"
};

const siteOrigin = new URL(START_URL).origin;
const sitePathPrefix = normalizePath(new URL(START_URL).pathname);
const seen = new Set();
const queue = [START_URL];
const pages = [];

while (queue.length > 0 && pages.length < MAX_PAGES) {
  const url = queue.shift();
  const normalizedUrl = normalizeUrl(url);

  if (seen.has(normalizedUrl) || !isSitePage(normalizedUrl)) {
    continue;
  }

  seen.add(normalizedUrl);
  const page = await scrapePage(normalizedUrl);
  pages.push(page);

  for (const link of page.internalLinks) {
    if (!seen.has(link) && queue.length + pages.length < MAX_PAGES) {
      queue.push(link);
    }
  }
}

const result = {
  startUrl: START_URL,
  pageCount: pages.length,
  counts: {
    youtubeVideos: unique(pages.flatMap((page) => page.youtubeVideos.map((video) => video.videoId))).length,
    driveLinks: unique(pages.flatMap((page) => page.driveLinks.map((link) => link.url))).length,
    pdfLinks: unique(pages.flatMap((page) => page.pdfLinks.map((link) => link.url))).length
  },
  pages
};

await mkdir(dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(result, null, 2)}\n`);

console.log(`Scraped ${pages.length} page${pages.length === 1 ? "" : "s"} from ${START_URL}`);
console.log(`Found ${result.counts.youtubeVideos} YouTube videos, ${result.counts.driveLinks} Drive links, and ${result.counts.pdfLinks} PDF links.`);
console.log(`Wrote ${OUTPUT_PATH}`);

async function scrapePage(url) {
  const response = await fetch(url, { headers: REQUEST_HEADERS });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  const links = extractLinks(html, url);
  const linkDetails = extractLinkDetails(html, url);
  const internalLinks = unique(links.filter(isSitePage).map(normalizeUrl));
  const externalLinks = unique(links.filter((link) => !isSitePage(link)).map(normalizeUrl));
  const driveLinks = linkDetails
    .filter((link) => !isSitePage(link.url))
    .filter((link) => new URL(link.url).hostname.endsWith("drive.google.com"));
  const pdfLinks = linkDetails
    .filter((link) => !isSitePage(link.url))
    .filter((link) => isPdfUrl(link.url));

  return {
    url,
    title: extractTitle(html),
    text: extractReadableText(html),
    youtubeVideos: extractYouTubeVideos(html, links),
    driveLinks,
    pdfLinks,
    internalLinks,
    externalLinks
  };
}

function extractLinks(html, baseUrl) {
  const links = [];
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;

  while ((match = attributePattern.exec(html))) {
    const href = decodeHtml(match[1]);
    const resolved = resolveUrl(href, baseUrl);

    if (resolved) {
      links.push(unwrapGoogleRedirect(resolved));
    }
  }

  return unique(links);
}

function extractLinkDetails(html, baseUrl) {
  const links = [];
  const anchorPattern = /<a\b[^>]*\bhref=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  const attributePattern = /\b(?:href|src)=["']([^"']+)["']/gi;
  let match;

  while ((match = anchorPattern.exec(html))) {
    const href = decodeHtml(match[1]);
    const resolved = resolveUrl(href, baseUrl);

    if (!resolved) {
      continue;
    }

    links.push({
      url: normalizeUrl(unwrapGoogleRedirect(resolved)),
      text: normalizeWhitespace(decodeHtml(stripTags(match[2]))),
      context: getTextContext(html, match.index, match[0].length)
    });
  }

  while ((match = attributePattern.exec(html))) {
    const href = decodeHtml(match[1]);
    const resolved = resolveUrl(href, baseUrl);

    if (!resolved) {
      continue;
    }

    links.push({
      url: normalizeUrl(unwrapGoogleRedirect(resolved)),
      text: "",
      context: getTextContext(html, match.index, match[0].length)
    });
  }

  return uniqueLinkDetails(links);
}

function getTextContext(html, start, length) {
  const contextStart = Math.max(0, start - 600);
  const contextEnd = Math.min(html.length, start + length + 600);

  return normalizeWhitespace(decodeHtml(stripTags(html.slice(contextStart, contextEnd))));
}

function extractTitle(html) {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeWhitespace(decodeHtml(stripTags(match[1]))) : "";
}

function extractReadableText(html) {
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");

  return normalizeWhitespace(decodeHtml(body));
}

function extractYouTubeVideos(html, links) {
  const candidates = [...links];
  const idPattern = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/g;
  let match;

  while ((match = idPattern.exec(html))) {
    candidates.push(`https://www.youtube.com/watch?v=${match[1]}`);
  }

  const videos = [];
  const seenIds = new Set();

  for (const candidate of candidates) {
    const videoId = getYouTubeVideoId(candidate);

    if (!videoId || seenIds.has(videoId)) {
      continue;
    }

    seenIds.add(videoId);
    videos.push({
      videoId,
      url: `https://www.youtube.com/watch?v=${videoId}`
    });
  }

  return videos;
}

function getYouTubeVideoId(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || "";
    }

    if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (parsed.searchParams.has("v")) {
        return parsed.searchParams.get("v");
      }

      const parts = parsed.pathname.split("/").filter(Boolean);
      if (["embed", "shorts"].includes(parts[0])) {
        return parts[1] || "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function resolveUrl(href, baseUrl) {
  if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
    return "";
  }

  try {
    return new URL(href, baseUrl).toString();
  } catch {
    return "";
  }
}

function unwrapGoogleRedirect(url) {
  const parsed = new URL(url);
  const redirectUrl = parsed.searchParams.get("q") || parsed.searchParams.get("url");

  if (parsed.pathname.endsWith("/url") && redirectUrl) {
    return new URL(redirectUrl).toString();
  }

  return url;
}

function isPdfUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

function isSitePage(url) {
  try {
    const parsed = new URL(url);
    return parsed.origin === siteOrigin && normalizePath(parsed.pathname).startsWith(sitePathPrefix);
  } catch {
    return false;
  }
}

function normalizeUrl(url) {
  const parsed = new URL(url);
  parsed.hash = "";
  parsed.search = "";
  return parsed.toString();
}

function normalizePath(pathname) {
  return pathname.replace(/\/+$/, "");
}

function stripTags(value) {
  return value.replace(/<[^>]+>/g, " ");
}

function decodeHtml(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/");
}

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function unique(values) {
  return [...new Set(values)];
}

function uniqueLinkDetails(links) {
  const byKey = new Map();

  for (const link of links) {
    const key = link.url;
    const existing = byKey.get(key);

    if (!existing) {
      byKey.set(key, link);
      continue;
    }

    if (!existing.text && link.text) {
      existing.text = link.text;
    }

    if (!existing.context && link.context) {
      existing.context = link.context;
    }
  }

  return [...byKey.values()];
}
