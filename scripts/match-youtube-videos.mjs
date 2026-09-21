import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const DEFAULT_INPUT_PATH = "data/choir-plans.fallback.js";
const DEFAULT_REPORT_PATH = "data/choir-video-report.json";
const ACCEPTANCE_SCORE = 80;
const MINIMUM_LEAD = 10;
const API_URL = "https://www.googleapis.com/youtube/v3/search";

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  const inputPath = process.env.CHOIR_PLANS_FALLBACK || DEFAULT_INPUT_PATH;
  const reportPath = process.env.CHOIR_VIDEO_REPORT || DEFAULT_REPORT_PATH;
  const apiKey = process.env.YOUTUBE_API_KEY || "";
  const inputFile = resolve(process.cwd(), inputPath);
  const source = await readFile(inputFile, "utf8");
  const plans = readWindowArray(source, inputFile, "CHOIR_PLANS_FALLBACK");
  const result = await matchYouTubeVideos(plans, { apiKey });

  if (result.report.requiresApiKey && !apiKey) {
    throw new Error("YOUTUBE_API_KEY is required to match songs that do not reuse an approved video. Enable YouTube Data API v3 and add the key to your environment or GitHub Actions secrets.");
  }

  const reportFile = resolve(process.cwd(), reportPath);
  await mkdir(dirname(reportFile), { recursive: true });
  await writeFile(reportFile, `${JSON.stringify(result.report, null, 2)}\n`);

  if (shouldWrite) {
    await writeIfChanged(
      inputFile,
      applyVideoIdUpdates(source, plans, result.plans)
    );
  }

  printReport(result.report, shouldWrite);
}

export async function matchYouTubeVideos(plans, { apiKey = "", search = searchYouTube } = {}) {
  const nextPlans = clone(plans);
  const report = {
    accepted: [],
    reused: [],
    ambiguous: [],
    skipped: [],
    rejected: [],
    requiresApiKey: false
  };
  const approvedByTitle = collectApprovedVideosByTitle(plans);
  const pending = new Map();

  for (const plan of nextPlans) {
    for (const song of plan.songs || []) {
      if (song.videoId) {
        continue;
      }

      const context = songContext(plan, song);

      if (isNonSong(song)) {
        report.skipped.push({ ...context, reason: "Non-song plan row" });
        continue;
      }

      const approvedIds = approvedByTitle.get(normalize(song.title));
      if (approvedIds?.size === 1) {
        song.videoId = [...approvedIds][0];
        report.reused.push({ ...context, videoId: song.videoId });
        continue;
      }

      const key = getSongKey(song);
      const group = pending.get(key) || { song, rows: [] };
      group.rows.push({ plan, song, context });
      pending.set(key, group);
    }
  }

  if (pending.size > 0 && !apiKey) {
    report.requiresApiKey = true;
    for (const { rows } of pending.values()) {
      for (const { context } of rows) {
        report.skipped.push({ ...context, reason: "Missing YOUTUBE_API_KEY" });
      }
    }
    return { plans: nextPlans, report };
  }

  for (const { song, rows } of pending.values()) {
    const query = buildSearchQuery(song);
    let candidates;

    try {
      candidates = await search(query, apiKey);
    } catch (error) {
      for (const { context } of rows) {
        report.rejected.push({ ...context, query, reason: `YouTube API error: ${error.message}` });
      }
      continue;
    }

    const ranked = candidates
      .map((candidate) => ({ ...candidate, ...scoreCandidate(song, candidate) }))
      .sort((left, right) => right.score - left.score || left.videoId.localeCompare(right.videoId));
    const best = ranked[0];
    const runnerUp = ranked[1];
    const lead = best ? best.score - (runnerUp?.score || 0) : 0;
    const candidateSummary = ranked.map(summarizeCandidate);

    if (!best || !best.eligible || best.score < ACCEPTANCE_SCORE) {
      for (const { context } of rows) {
        report.rejected.push({
          ...context,
          query,
          reason: best?.reason || "No video results",
          candidates: candidateSummary
        });
      }
      continue;
    }

    if (runnerUp && lead < MINIMUM_LEAD) {
      for (const { context } of rows) {
        report.ambiguous.push({
          ...context,
          query,
          reason: `Top candidates are separated by only ${lead} point(s)`,
          candidates: candidateSummary
        });
      }
      continue;
    }

    for (const { song: rowSong, context } of rows) {
      rowSong.videoId = best.videoId;
      report.accepted.push({
        ...context,
        query,
        videoId: best.videoId,
        videoTitle: best.title,
        channelTitle: best.channelTitle,
        score: best.score
      });
    }
  }

  return { plans: nextPlans, report };
}

export function scoreCandidate(song, candidate) {
  const songTitle = normalize(song.title);
  const candidateTitle = normalize(candidate.title);
  const evidence = normalize(`${candidate.title} ${candidate.channelTitle} ${candidate.description || ""}`);
  const titleTokens = significantTokens(songTitle);
  const exactTitle = containsPhrase(candidateTitle, songTitle);
  const allTitleTokens = titleTokens.length > 0 && titleTokens.every((token) => candidateTitle.split(" ").includes(token));

  if (!exactTitle && !allTitleTokens) {
    return { score: 0, eligible: false, reason: "Candidate title does not match the complete song title" };
  }

  let score = exactTitle ? 60 : 45;
  const composer = cleanComposer(song.composer || "");
  const composerTokens = significantTokens(composer);
  const composerMatched = composerTokens.length === 0 || composerTokens.some((token) => evidence.split(" ").includes(token));

  if (composerTokens.length > 0 && !composerMatched) {
    return { score, eligible: false, reason: "Composer or tune name does not match" };
  }

  if (composerTokens.length > 0) {
    score += 25;
  }

  const channel = normalize(candidate.channelTitle);
  const preferredSource = /\b(ocp|oregon catholic press|official|giamusic|gia publications)\b/.test(channel)
    || composerTokens.some((token) => channel.split(" ").includes(token));

  if (preferredSource) {
    score += 20;
  }

  if (/\b(full|vocal|official audio|lyrics|lyric video|music video)\b/.test(evidence)) {
    score += 5;
  }

  const penalties = [
    /\b(karaoke|instrumental|minus one|backing track)\b/,
    /\b(shorts?|excerpt|sample|preview|clip)\b/,
    /\b(cover|reaction|tutorial|lesson)\b/
  ].filter((pattern) => pattern.test(evidence)).length;
  score -= penalties * 30;

  if (composerTokens.length === 0 && !preferredSource) {
    return { score, eligible: false, reason: "A song without composer data requires an official or publisher channel" };
  }

  return { score, eligible: true, reason: "" };
}

export function buildSearchQuery(song) {
  return [`"${song.title}"`, cleanComposer(song.composer || ""), "Catholic hymn"]
    .filter(Boolean)
    .join(" ");
}

export function normalize(value) {
  return String(value || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function formatPlanData(globalName, plans) {
  return `window.${globalName} = ${JSON.stringify(plans, null, 2)};\n`;
}

export function applyVideoIdUpdates(source, originalPlans, updatedPlans) {
  const originalRows = getVideoRows(originalPlans).filter((song) => song.videoId === "");
  const updatedRows = getVideoRows(updatedPlans);
  const updates = [];
  let updatedIndex = 0;

  for (const song of getVideoRows(originalPlans)) {
    const updatedSong = updatedRows[updatedIndex];
    updatedIndex += 1;

    if (song.videoId === "") {
      updates.push(updatedSong?.videoId || "");
    }
  }

  let matchIndex = 0;
  const output = source.replace(/((?:"videoId"|videoId)\s*:\s*)(["'])\2/g, (match, prefix, quote) => {
    const videoId = updates[matchIndex];
    matchIndex += 1;
    return `${prefix}${quote}${videoId}${quote}`;
  });

  if (matchIndex !== originalRows.length) {
    throw new Error(`Expected ${originalRows.length} blank videoId field(s) in the source but found ${matchIndex}`);
  }

  return output;
}

async function searchYouTube(query, apiKey) {
  const url = new URL(API_URL);
  url.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    maxResults: "5",
    safeSearch: "moderate",
    relevanceLanguage: "en",
    regionCode: "US",
    q: query,
    key: apiKey
  });
  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${response.status} ${response.statusText}${body ? `: ${body.slice(0, 200)}` : ""}`);
  }

  const data = await response.json();
  return (data.items || [])
    .filter((item) => item.id?.videoId && item.snippet)
    .map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title || "",
      channelTitle: item.snippet.channelTitle || "",
      description: item.snippet.description || ""
    }));
}

function collectApprovedVideosByTitle(plans) {
  const videos = new Map();

  for (const plan of plans) {
    for (const song of plan.songs || []) {
      if (!song.videoId) {
        continue;
      }

      const key = normalize(song.title);
      const ids = videos.get(key) || new Set();
      ids.add(song.videoId);
      videos.set(key, ids);
    }
  }

  return videos;
}

function cleanComposer(value) {
  const cleaned = String(value)
    .replace(/[·|].*$/u, "")
    .replace(/\bBB\s*\d+\b/gi, "")
    .trim();

  return /^(?:r\s*&\s*a|traditional)?$/i.test(cleaned) ? "" : cleaned;
}

function significantTokens(value) {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 2 && !["the", "and", "with", "from"].includes(token));
}

function containsPhrase(text, phrase) {
  return ` ${text} `.includes(` ${phrase} `);
}

function isNonSong(song) {
  return normalize(song.role) === "note" || /^\d{1,2}:\d{2}\b/.test(song.title || "");
}

function getSongKey(song) {
  return `${normalize(song.title)}|${normalize(cleanComposer(song.composer || ""))}`;
}

function songContext(plan, song) {
  return {
    date: plan.date,
    planTitle: plan.title,
    role: song.role,
    songTitle: song.title,
    composer: song.composer || ""
  };
}

function summarizeCandidate(candidate) {
  return {
    videoId: candidate.videoId,
    title: candidate.title,
    channelTitle: candidate.channelTitle,
    score: candidate.score,
    eligible: candidate.eligible,
    reason: candidate.reason
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readWindowArray(source, filePath, globalName) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: filePath });

  if (!Array.isArray(sandbox.window[globalName])) {
    throw new Error(`${filePath} did not define window.${globalName} as an array`);
  }

  return sandbox.window[globalName];
}

function getVideoRows(plans) {
  return plans.flatMap((plan) => [
    ...(plan.songs || []),
    ...(plan.optionalSongs || []).filter((song) => typeof song === "object")
  ]);
}

async function writeIfChanged(filePath, content) {
  let current = "";
  try {
    current = await readFile(filePath, "utf8");
  } catch {
    // The caller may intentionally target a new output file.
  }

  if (current !== content) {
    await mkdir(dirname(filePath), { recursive: true });
    await writeFile(filePath, content);
  }
}

function printReport(report, write) {
  console.log(`${write ? "Updated" : "Checked"} choir-plan YouTube videos.`);
  console.log(`Accepted: ${report.accepted.length}`);
  console.log(`Reused: ${report.reused.length}`);
  console.log(`Ambiguous: ${report.ambiguous.length}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Rejected: ${report.rejected.length}`);
}
