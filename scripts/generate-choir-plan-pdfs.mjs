import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import vm from "node:vm";

const DEFAULT_SCRAPE_PATH = "data/stgenchoir-scrape.json";
const DEFAULT_FALLBACK_PATH = "data/choir-plans.fallback.js";
const DEFAULT_OUTPUT_PATH = "data/choir-plans.generated.js";
const DEFAULT_REPORT_PATH = "data/choir-plan-pdf-report.json";

const args = new Set(process.argv.slice(2));
const shouldWrite = args.has("--write");
const isDirectExecution = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;

if (isDirectExecution) {
  const result = await runGenerator({
    scrapePath: process.env.SCRAPE_INPUT || DEFAULT_SCRAPE_PATH,
    fallbackPath: process.env.CHOIR_PLANS_FALLBACK || DEFAULT_FALLBACK_PATH,
    outputPath: process.env.CHOIR_PLANS_OUTPUT || DEFAULT_OUTPUT_PATH,
    reportPath: process.env.CHOIR_PLANS_REPORT || DEFAULT_REPORT_PATH,
    write: shouldWrite
  });

  printReport(result.report, shouldWrite);
}

export async function runGenerator({ scrapePath, fallbackPath, outputPath, reportPath, write }) {
  const scrape = JSON.parse(await readFile(resolve(process.cwd(), scrapePath), "utf8"));
  const fallbackPlans = await readWindowArray(resolve(process.cwd(), fallbackPath), "CHOIR_PLANS_FALLBACK");
  const { plans, report } = generatePlansWithPdfLinks(fallbackPlans, scrape);
  const output = formatPlanData("CHOIR_PLANS_GENERATED", plans);
  const outputFile = resolve(process.cwd(), outputPath);
  const reportFile = resolve(process.cwd(), reportPath);

  report.outputPath = outputPath;
  report.reportPath = reportPath;
  report.writeMode = write;

  if (write) {
    await writeIfChanged(outputFile, output);
  }

  await mkdir(dirname(reportFile), { recursive: true });
  await writeFile(reportFile, `${JSON.stringify(report, null, 2)}\n`);

  return { plans, report, output };
}

export function generatePlansWithPdfLinks(fallbackPlans, scrape) {
  const report = {
    matchedPlans: [],
    changedPlans: [],
    skippedPlans: [],
    warnings: []
  };
  const candidatesByDate = collectPdfCandidatesByDate(fallbackPlans, scrape, report);
  const plans = fallbackPlans.map((plan) => {
    const candidates = candidatesByDate.get(plan.date) || [];

    if (candidates.length === 0) {
      report.skippedPlans.push({
        date: plan.date,
        title: plan.title,
        reason: "No confidently matched PDF links found"
      });
      return clonePlan(plan);
    }

    const duplicateLabels = findDuplicateLabels(candidates);
    if (duplicateLabels.length > 0) {
      report.warnings.push({
        date: plan.date,
        title: plan.title,
        reason: "Skipped because multiple different URLs used the same PDF label",
        labels: duplicateLabels
      });
      return clonePlan(plan);
    }

    const pdfLinks = candidates.map(({ label, url }) => ({ label, url }));
    const nextPlan = { ...clonePlan(plan), pdfLinks };
    const changed = JSON.stringify(plan.pdfLinks) !== JSON.stringify(pdfLinks);

    report.matchedPlans.push({
      date: plan.date,
      title: plan.title,
      pdfLinks,
      changed
    });

    if (changed) {
      report.changedPlans.push({
        date: plan.date,
        title: plan.title,
        before: plan.pdfLinks,
        after: pdfLinks
      });
    }

    return nextPlan;
  });

  return { plans, report };
}

export function collectPdfCandidatesByDate(plans, scrape, report = { warnings: [] }) {
  const candidatesByDate = new Map(plans.map((plan) => [plan.date, []]));
  const planDateMatchers = plans.map((plan) => ({
    plan,
    patterns: [...getPlanDatePatterns(plan.date), getPlanTitlePattern(plan.title)]
  }));

  for (const page of scrape.pages || []) {
    const links = getPagePdfLinks(page);
    const unmatchedLinks = [];
    const fallbackMatches = matchLinksByReadableTextOrder(page, links, planDateMatchers);
    const fallbackByUrl = new Map(fallbackMatches.map((match) => [match.link.url, match]));

    for (const link of links) {
      const evidence = `${link.text || ""} ${link.context || ""}`;
      const matchingDates = planDateMatchers
        .filter(({ patterns }) => patterns.some((pattern) => pattern.test(evidence)))
        .map(({ plan }) => plan.date);

      if (matchingDates.length !== 1) {
        unmatchedLinks.push({ link, matchingDates });
        continue;
      }

      candidatesByDate.get(matchingDates[0])?.push({
        label: getPdfLabel(link),
        url: normalizePdfUrl(link.url)
      });
    }

    for (const { link } of unmatchedLinks) {
      const fallbackMatch = fallbackByUrl.get(link.url);

      if (!fallbackMatch) {
        continue;
      }

      candidatesByDate.get(fallbackMatch.date)?.push({
        label: getPdfLabel(link),
        url: normalizePdfUrl(link.url)
      });
    }

    for (const { link, matchingDates } of unmatchedLinks) {
      if (fallbackByUrl.has(link.url)) {
        continue;
      }

      report.warnings.push({
        page: page.title || page.url,
        url: link.url,
        text: link.text || "",
        reason: matchingDates.length === 0
          ? "Skipped PDF-like link because no plan date or title was found nearby"
          : "Skipped PDF-like link because multiple plan dates or titles were found nearby"
      });
    }
  }

  for (const [date, candidates] of candidatesByDate) {
    candidatesByDate.set(date, uniqueCandidates(candidates));
  }

  return candidatesByDate;
}

export function formatPlanData(globalName, plans) {
  return `window.${globalName} = ${JSON.stringify(plans, null, 2)};\n`;
}

function getPagePdfLinks(page) {
  return [...(page.driveLinks || []), ...(page.pdfLinks || [])]
    .filter((link) => link?.url)
    .filter((link) => isPdfLikeLink(link))
    .map((link) => ({
      url: link.url,
      text: link.text || "",
      context: link.context || ""
    }));
}

function isPdfLikeLink(link) {
  const evidence = `${link.text || ""} ${link.context || ""} ${link.url || ""}`;
  return /\bpdfs?\b/i.test(evidence) || /\.pdf(?:$|[?#])/i.test(link.url);
}

function getPdfLabel(link) {
  const evidence = link.text || link.context || "";

  if (/\bprayer\b/i.test(evidence)) {
    return "The Prayer PDF";
  }

  return "All PDFs";
}

function matchLinksByReadableTextOrder(page, links, planMatchers) {
  if (!page.text || links.length === 0) {
    return [];
  }

  const markers = [...page.text.matchAll(/\b(?:all\s+pdfs?|the\s+prayer\s+pdf|pdf)\b/gi)];
  const sections = findPlanSections(page.text, planMatchers);
  const matches = [];
  const markerCount = Math.min(markers.length, links.length);

  for (let index = 0; index < markerCount; index += 1) {
    const section = findSectionForIndex(sections, markers[index].index);

    if (section) {
      matches.push({ link: links[index], date: section.date });
    }
  }

  return matches;
}

function findPlanSections(text, planMatchers) {
  const sections = [];

  for (const { plan, patterns } of planMatchers) {
    const positions = patterns
      .map((pattern) => {
        pattern.lastIndex = 0;
        const match = pattern.exec(text);
        return match ? match.index : -1;
      })
      .filter((position) => position >= 0);

    if (positions.length === 0) {
      continue;
    }

    sections.push({
      date: plan.date,
      index: Math.min(...positions),
      patterns,
      text
    });
  }

  return sections.sort((left, right) => left.index - right.index);
}

function findSectionForIndex(sections, index) {
  let section = null;

  for (const candidate of sections) {
    if (candidate.index > index) {
      break;
    }

    section = candidate;
  }

  if (section && hasInterveningDateMismatch(section, index)) {
    return null;
  }

  return section;
}

function hasInterveningDateMismatch(section, markerIndex) {
  const interveningDates = [...section.text.slice(section.index, markerIndex).matchAll(getDateMarkerPattern())];
  const latestDate = interveningDates.at(-1);

  if (!latestDate) {
    return false;
  }

  const latestDateText = latestDate[0];
  return !section.patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(latestDateText);
  });
}

function normalizePdfUrl(url) {
  try {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

    if (parsed.hostname.endsWith("drive.google.com") && match) {
      return `https://drive.google.com/file/d/${match[1]}/view?usp=sharing`;
    }
  } catch {
    return url;
  }

  return url;
}

function getPlanDatePatterns(date) {
  const [year, month, day] = date.split("-").map(Number);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month - 1, day)));
  const dayText = String(day);
  const paddedDay = String(day).padStart(2, "0");

  return [
    new RegExp(`\\b${escapeRegExp(monthName)}\\s+${dayText},\\s*${year}\\b`, "i"),
    new RegExp(`\\b${escapeRegExp(monthName)}\\s+${paddedDay},\\s*${year}\\b`, "i"),
    new RegExp(`\\b${escapeRegExp(monthName)}\\s+${dayText}\\b`, "i"),
    new RegExp(`\\b${escapeRegExp(monthName)}\\s+${paddedDay}\\b`, "i")
  ];
}

function getDateMarkerPattern() {
  return /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s*\d{4})?\b/gi;
}

function getPlanTitlePattern(title) {
  const titleWithoutCycle = title.replace(/\s*\([A-Z]\)\s*$/i, "");
  const words = titleWithoutCycle
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map(escapeRegExp);

  return new RegExp(`\\b${words.join("\\s+")}\\b`, "i");
}

function uniqueCandidates(candidates) {
  const seen = new Set();
  const unique = [];

  for (const candidate of candidates) {
    const key = `${candidate.label}\n${candidate.url}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(candidate);
    }
  }

  return unique;
}

function findDuplicateLabels(candidates) {
  const urlsByLabel = new Map();

  for (const candidate of candidates) {
    const urls = urlsByLabel.get(candidate.label) || new Set();
    urls.add(candidate.url);
    urlsByLabel.set(candidate.label, urls);
  }

  return [...urlsByLabel.entries()]
    .filter(([, urls]) => urls.size > 1)
    .map(([label]) => label);
}

function clonePlan(plan) {
  return JSON.parse(JSON.stringify(plan));
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readWindowArray(filePath, globalName) {
  const source = await readFile(filePath, "utf8");
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox, { filename: filePath });

  if (!Array.isArray(sandbox.window[globalName])) {
    throw new Error(`${filePath} did not define window.${globalName} as an array`);
  }

  return sandbox.window[globalName];
}

async function writeIfChanged(filePath, content) {
  let current = "";

  try {
    current = await readFile(filePath, "utf8");
  } catch {
    // Missing output is expected on the first generation run.
  }

  if (current === content) {
    return;
  }

  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, content);
}

function printReport(report, write) {
  console.log(`${write ? "Generated" : "Checked"} choir plan PDF links.`);
  console.log(`Matched: ${report.matchedPlans.length}`);
  console.log(`Changed: ${report.changedPlans.length}`);
  console.log(`Skipped: ${report.skippedPlans.length}`);
  console.log(`Warnings: ${report.warnings.length}`);

  for (const change of report.changedPlans) {
    console.log(`- ${change.date} ${change.title}: ${change.before.length} -> ${change.after.length} PDF link(s)`);
  }
}
