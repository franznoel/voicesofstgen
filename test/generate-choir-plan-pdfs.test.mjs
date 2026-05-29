import assert from "node:assert/strict";
import test from "node:test";

import {
  formatPlanData,
  generatePlansWithPdfLinks
} from "../scripts/generate-choir-plan-pdfs.mjs";

const fallbackPlans = [
  {
    date: "2026-04-12",
    title: "Second Sunday of Easter (A)",
    pdfLinks: [{ label: "All PDFs", url: "https://drive.google.com/file/d/original/view?usp=sharing" }],
    songs: [
      { role: "Entrance", title: "Join in the Dance", composer: "Schutte", videoId: "m1YfdgWn8NI", notes: "Keep me" }
    ],
    optionalSongs: [{ title: "Divine Mercy", videoId: "SazCpHzkLwk" }]
  },
  {
    date: "2026-05-10",
    title: "Sixth Sunday of Easter (A)",
    pdfLinks: [],
    songs: [
      { role: "Mother's Day Song", title: "A Mother's Prayer", composer: "Celine Dion", videoId: "Jz9y4x1NhJo" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-06-07",
    title: "The Most Holy Body and Blood of Christ (A)",
    pdfLinks: [],
    songs: [
      { role: "Entrance", title: "Table of Plenty", composer: "Dan Schutte", videoId: "okAMb_ra8Uw" }
    ],
    optionalSongs: []
  },
  {
    date: "2026-05-31",
    title: "The Most Holy Trinity (A)",
    pdfLinks: [],
    songs: [
      { role: "Entrance", title: "Holy, Holy, Holy", composer: "", videoId: "ntdcY8q7a9E" }
    ],
    optionalSongs: []
  }
];

test("updates only confidently matched PDF links and preserves curated fields", () => {
  const scrape = {
    pages: [
      {
        title: "Fixture",
        driveLinks: [
          {
            url: "https://drive.google.com/file/d/new-april/view",
            text: "ALL PDFs",
            context: "April 12, 2026 Second Sunday of Easter (A) ALL PDFs Entrance"
          },
          {
            url: "https://drive.google.com/file/d/may-all/view",
            text: "ALL PDFs",
            context: "May 10 ALL PDFs The Prayer PDF Entrance"
          },
          {
            url: "https://drive.google.com/file/d/may-prayer/view",
            text: "The Prayer PDF",
            context: "May 10 The Prayer PDF change lyrics to A mothers Prayer"
          }
        ],
        pdfLinks: []
      }
    ]
  };

  const { plans, report } = generatePlansWithPdfLinks(fallbackPlans, scrape);

  assert.deepEqual(plans[0].pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/new-april/view?usp=sharing" }
  ]);
  assert.deepEqual(plans[1].pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/may-all/view?usp=sharing" },
    { label: "The Prayer PDF", url: "https://drive.google.com/file/d/may-prayer/view?usp=sharing" }
  ]);
  assert.equal(plans[0].songs[0].videoId, "m1YfdgWn8NI");
  assert.equal(plans[0].songs[0].notes, "Keep me");
  assert.deepEqual(plans[0].optionalSongs, [{ title: "Divine Mercy", videoId: "SazCpHzkLwk" }]);
  assert.equal(report.changedPlans.length, 2);
});

test("skips ambiguous links instead of guessing", () => {
  const scrape = {
    pages: [
      {
        title: "Ambiguous",
        driveLinks: [
          {
            url: "https://drive.google.com/file/d/ambiguous/view",
            text: "ALL PDFs",
            context: "April 12 and May 10 ALL PDFs"
          }
        ],
        pdfLinks: []
      }
    ]
  };

  const { plans, report } = generatePlansWithPdfLinks(fallbackPlans, scrape);

  assert.deepEqual(plans, fallbackPlans);
  assert.equal(report.changedPlans.length, 0);
  assert.equal(report.warnings.length, 1);
});

test("matches a PDF link by readable text order when Google Sites hides date context in markup", () => {
  const scrape = {
    pages: [
      {
        title: "Pentecost",
        text: "The Most Holy Trinity May 31, 2025 All PDFs Entrance Holy, Holy, Holy June 07, 2026 The Most Holy Body and Blood of Christ (A) ALL PDFs Entrance Table of Plenty",
        driveLinks: [
          {
            url: "https://drive.google.com/file/d/trinity-live/view",
            text: "All PDFs",
            context: "All PDFs Entrance"
          },
          {
            url: "https://drive.google.com/file/d/body-blood/view",
            text: "ALL PDFs",
            context: "ALL PDFs Entrance"
          }
        ],
        pdfLinks: []
      }
    ]
  };

  const { plans, report } = generatePlansWithPdfLinks(fallbackPlans, scrape);

  assert.deepEqual(plans.find((plan) => plan.date === "2026-05-31").pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/trinity-live/view?usp=sharing" }
  ]);
  assert.deepEqual(plans.find((plan) => plan.date === "2026-06-07").pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/body-blood/view?usp=sharing" }
  ]);
  assert.equal(report.warnings.length, 0);
});

test("keeps fallback link order aligned when some links already match by context", () => {
  const scrape = {
    pages: [
      {
        title: "Mixed matching",
        text: "The Most Holy Trinity May 31, 2025 All PDFs June 07, 2026 The Most Holy Body and Blood of Christ (A) ALL PDFs",
        driveLinks: [
          {
            url: "https://drive.google.com/file/d/trinity-order/view",
            text: "All PDFs",
            context: "All PDFs Entrance"
          },
          {
            url: "https://drive.google.com/file/d/body-blood-context/view",
            text: "ALL PDFs",
            context: "June 07, 2026 The Most Holy Body and Blood of Christ (A) ALL PDFs"
          }
        ],
        pdfLinks: []
      }
    ]
  };

  const { plans } = generatePlansWithPdfLinks(fallbackPlans, scrape);

  assert.deepEqual(plans.find((plan) => plan.date === "2026-05-31").pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/trinity-order/view?usp=sharing" }
  ]);
  assert.deepEqual(plans.find((plan) => plan.date === "2026-06-07").pdfLinks, [
    { label: "All PDFs", url: "https://drive.google.com/file/d/body-blood-context/view?usp=sharing" }
  ]);
});

test("formatted generated output is stable for idempotent comparisons", () => {
  const output = formatPlanData("CHOIR_PLANS_GENERATED", fallbackPlans);

  assert.equal(output, formatPlanData("CHOIR_PLANS_GENERATED", fallbackPlans));
  assert.match(output, /^window\.CHOIR_PLANS_GENERATED = \[/);
  assert.match(output, /\n$/);
});
