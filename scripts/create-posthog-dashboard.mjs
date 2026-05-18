import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const DASHBOARD_NAME = "Voices of St. Gen Web Analytics";
const DASHBOARD_DESCRIPTION = "Choir member usage of the Sunday music practice website.";
const ENV_PATH = resolve(process.cwd(), ".env");

loadDotEnv(ENV_PATH);

const config = {
  apiKey: requireEnv("POSTHOG_API_KEY"),
  host: normalizeHost(requireEnv("POSTHOG_HOST")),
  projectId: requireEnv("POSTHOG_PROJECT_ID")
};

validateApiKey(config.apiKey);

const apiBase = `${config.host}/api/environments/${encodeURIComponent(config.projectId)}`;

const insights = [
  trendInsight("Daily visitors", [
    eventSeries("$pageview", "Daily visitors", "dau")
  ]),
  trendInsight("Pageviews over time", [
    eventSeries("$pageview", "Pageviews", "total")
  ]),
  tableInsight("Top pages", "$pageview", "$pathname", "total"),
  tableInsight("Clicks on Songs, Videos, Gallery, Calendar", [
    eventSeries("open_songs", "Songs", "total"),
    eventSeries("open_videos", "Videos", "total"),
    eventSeries("open_gallery", "Gallery", "total"),
    eventSeries("open_calendar", "Calendar", "total")
  ]),
  trendInsight("Clicks on View this Sunday", [
    eventSeries("view_current_sunday", "View this Sunday", "total")
  ]),
  trendInsight("Practice video plays", [
    eventSeries("play_practice_video", "Practice video plays", "total")
  ]),
  trendInsight("PDF packet downloads", [
    eventSeries("download_pdf_packet", "PDF packet downloads", "total")
  ]),
  trendInsight("Archive views", [
    eventSeries("view_archive", "Archive views", "total")
  ]),
  tableInsight("Returning visitors", "site_loaded", "returning_visitor", "dau"),
  tableInsight("Device/browser breakdown", "$pageview", "$browser", "dau"),
  tableInsight("Referrers", "$pageview", "$referrer", "total")
];

await main();

async function main() {
  const dashboard = await findOrCreateDashboard();
  const existingTiles = await getDashboardTileNames(dashboard.id);
  const missingInsights = insights.filter((insight) => !existingTiles.has(insight.name));

  if (missingInsights.length === 0) {
    console.log(`Dashboard already up to date: ${DASHBOARD_NAME}`);
    console.log(`${config.host}/project/${config.projectId}/dashboard/${dashboard.id}`);
    return;
  }

  for (const insight of missingInsights) {
    await createInsight(dashboard.id, insight);
    console.log(`Added tile: ${insight.name}`);
  }

  console.log(`Dashboard ready: ${DASHBOARD_NAME}`);
  console.log(`${config.host}/project/${config.projectId}/dashboard/${dashboard.id}`);
}

async function findOrCreateDashboard() {
  const dashboards = await requestJson(`/dashboards/?limit=100`);
  const existing = dashboards.results?.find((dashboard) => dashboard.name === DASHBOARD_NAME);

  if (existing) {
    console.log(`Using existing dashboard: ${DASHBOARD_NAME}`);
    return existing;
  }

  const dashboard = await requestJson("/dashboards/", {
    method: "POST",
    body: {
      name: DASHBOARD_NAME,
      description: DASHBOARD_DESCRIPTION,
      pinned: true
    }
  });

  console.log(`Created dashboard: ${DASHBOARD_NAME}`);
  return dashboard;
}

async function getDashboardTileNames(dashboardId) {
  const dashboard = await requestJson(`/dashboards/${encodeURIComponent(dashboardId)}/`);
  const names = new Set();

  for (const tile of dashboard.tiles || []) {
    const insight = tile.insight || tile;
    if (insight?.name) {
      names.add(insight.name);
    }
  }

  return names;
}

async function createInsight(dashboardId, insight) {
  return requestJson("/insights/", {
    method: "POST",
    body: {
      name: insight.name,
      description: insight.description,
      dashboards: [dashboardId],
      query: insight.query
    }
  });
}

function trendInsight(name, series) {
  return {
    name,
    description: DASHBOARD_DESCRIPTION,
    query: {
      kind: "InsightVizNode",
      source: {
        kind: "TrendsQuery",
        series,
        interval: "day",
        dateRange: { date_from: "-30d" },
        trendsFilter: { display: "ActionsLineGraph" }
      }
    }
  };
}

function tableInsight(name, eventOrSeries, breakdown, math = "total") {
  const series = Array.isArray(eventOrSeries)
    ? eventOrSeries
    : [eventSeries(eventOrSeries, eventOrSeries, math)];

  return {
    name,
    description: DASHBOARD_DESCRIPTION,
    query: {
      kind: "InsightVizNode",
      source: {
        kind: "TrendsQuery",
        series,
        interval: "day",
        dateRange: { date_from: "-30d" },
        breakdownFilter: breakdown ? {
          breakdown,
          breakdown_type: "event",
          breakdown_limit: 10
        } : undefined,
        trendsFilter: { display: "ActionsTable" }
      }
    }
  };
}

function eventSeries(event, name, math) {
  return {
    kind: "EventsNode",
    event,
    name,
    math
  };
}

async function requestJson(path, options = {}) {
  const response = await fetch(`${apiBase}${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`PostHog API ${response.status} ${response.statusText}: ${message}`);
  }

  return response.json();
}

function loadDotEnv(path) {
  let contents = "";

  try {
    contents = readFileSync(path, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      return;
    }

    throw error;
  }

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, "");

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function validateApiKey(apiKey) {
  if (apiKey.startsWith("phc_")) {
    throw new Error("POSTHOG_API_KEY must be a personal API key, not the public phc_ browser project token.");
  }

  if (!apiKey.startsWith("phx_")) {
    console.warn("POSTHOG_API_KEY does not look like a phx_ personal API key. PostHog may reject it.");
  }
}

function normalizeHost(host) {
  return host.replace(/\/+$/, "");
}
