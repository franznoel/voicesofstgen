import assert from "node:assert/strict";
import test from "node:test";

import {
  applyVideoIdUpdates,
  buildSearchQuery,
  formatPlanData,
  matchYouTubeVideos,
  scoreCandidate
} from "../scripts/match-youtube-videos.mjs";

function planWithSongs(songs) {
  return [{
    date: "2026-10-18",
    title: "Twenty-ninth Sunday in Ordinary Time (A)",
    pdfLinks: [],
    songs,
    optionalSongs: []
  }];
}

test("reuses a unique approved ID and never searches for it", async () => {
  const plans = planWithSongs([
    { role: "Entrance", title: "Table of Plenty", composer: "Dan Schutte", videoId: "approved123" },
    { role: "Communion", title: "Table of Plenty", composer: "", videoId: "" }
  ]);
  let searches = 0;
  const { plans: matched, report } = await matchYouTubeVideos(plans, {
    apiKey: "test-key",
    search: async () => {
      searches += 1;
      return [];
    }
  });

  assert.equal(matched[0].songs[1].videoId, "approved123");
  assert.equal(report.reused.length, 1);
  assert.equal(searches, 0);
});

test("does not reuse a title that has conflicting approved IDs", async () => {
  const plans = planWithSongs([
    { role: "Entrance", title: "The Supper of the Lord", composer: "Rosania", videoId: "version0001" },
    { role: "Communion", title: "The Supper of the Lord", composer: "", videoId: "version0002" },
    { role: "Communion", title: "The Supper of the Lord", composer: "Rosania", videoId: "" }
  ]);
  const { plans: matched, report } = await matchYouTubeVideos(plans, {
    apiKey: "test-key",
    search: async () => []
  });

  assert.equal(matched[0].songs[2].videoId, "");
  assert.equal(report.reused.length, 0);
  assert.equal(report.rejected.length, 1);
});

test("accepts a strong official title and composer match", async () => {
  const plans = planWithSongs([
    { role: "Entrance", title: "Table of Plenty", composer: "Dan Schutte · BB 310", videoId: "" }
  ]);
  const { plans: matched, report } = await matchYouTubeVideos(plans, {
    apiKey: "test-key",
    search: async () => [{
      videoId: "official001",
      title: "Table of Plenty - Dan Schutte (Official Audio)",
      channelTitle: "OCP",
      description: "Full recording"
    }]
  });

  assert.equal(matched[0].songs[0].videoId, "official001");
  assert.equal(report.accepted[0].score, 110);
  assert.match(report.accepted[0].query, /Dan Schutte/);
});

test("rejects wrong composers, partial titles, and accompaniment-only results", () => {
  const song = { title: "Shepherd Me, O God", composer: "Marty Haugen" };
  const wrongComposer = scoreCandidate(song, {
    videoId: "wrong000001",
    title: "Shepherd Me O God",
    channelTitle: "Another Composer",
    description: ""
  });
  const partialTitle = scoreCandidate(song, {
    videoId: "partial0001",
    title: "Shepherd Me",
    channelTitle: "Marty Haugen",
    description: ""
  });
  const accompaniment = scoreCandidate(song, {
    videoId: "backing0001",
    title: "Shepherd Me O God - Marty Haugen instrumental backing track",
    channelTitle: "Marty Haugen",
    description: ""
  });

  assert.equal(wrongComposer.eligible, false);
  assert.equal(partialTitle.eligible, false);
  assert.ok(accompaniment.score < 80);
});

test("leaves close high-confidence candidates ambiguous", async () => {
  const plans = planWithSongs([
    { role: "Entrance", title: "City of God", composer: "Dan Schutte", videoId: "" }
  ]);
  const { plans: matched, report } = await matchYouTubeVideos(plans, {
    apiKey: "test-key",
    search: async () => [
      { videoId: "candidate01", title: "City of God - Dan Schutte", channelTitle: "OCP", description: "Official audio" },
      { videoId: "candidate02", title: "City of God (Dan Schutte)", channelTitle: "Dan Schutte", description: "Official audio" }
    ]
  });

  assert.equal(matched[0].songs[0].videoId, "");
  assert.equal(report.ambiguous.length, 1);
  assert.equal(report.ambiguous[0].candidates.length, 2);
});

test("preserves existing IDs, skips note rows, and reports API errors", async () => {
  const plans = planWithSongs([
    { role: "Entrance", title: "Existing Song", composer: "Composer", videoId: "keepthis001" },
    { role: "Note", title: "10:30 Ugandan Choir", composer: "", videoId: "" },
    { role: "Communion", title: "Unknown Song", composer: "Composer", videoId: "" }
  ]);
  const { plans: matched, report } = await matchYouTubeVideos(plans, {
    apiKey: "test-key",
    search: async () => {
      throw new Error("quota exceeded");
    }
  });

  assert.equal(matched[0].songs[0].videoId, "keepthis001");
  assert.equal(matched[0].songs[1].videoId, "");
  assert.equal(matched[0].songs[2].videoId, "");
  assert.equal(report.skipped[0].reason, "Non-song plan row");
  assert.match(report.rejected[0].reason, /quota exceeded/);
});

test("reports a missing API key without modifying unresolved songs", async () => {
  const plans = planWithSongs([
    { role: "Communion", title: "Unknown Song", composer: "Composer", videoId: "" }
  ]);
  const { plans: matched, report } = await matchYouTubeVideos(plans);

  assert.equal(matched[0].songs[0].videoId, "");
  assert.equal(report.requiresApiKey, true);
  assert.equal(report.skipped[0].reason, "Missing YOUTUBE_API_KEY");
});

test("search queries and formatted output are deterministic", () => {
  const song = { title: "Song of Mary", composer: "Dan Schutte · BB 696" };
  const plans = planWithSongs([{ role: "Entrance", ...song, videoId: "" }]);

  assert.equal(buildSearchQuery(song), '"Song of Mary" Dan Schutte Catholic hymn');
  assert.equal(
    formatPlanData("CHOIR_PLANS_FALLBACK", plans),
    formatPlanData("CHOIR_PLANS_FALLBACK", plans)
  );
});

test("write mode preserves source formatting and changes only blank video IDs", () => {
  const original = planWithSongs([
    { role: "Entrance", title: "Existing", composer: "", videoId: "keepthis001" },
    { role: "Communion", title: "Matched", composer: "", videoId: "" },
    { role: "Recessional", title: "Unmatched", composer: "", videoId: "" }
  ]);
  const updated = structuredClone(original);
  updated[0].songs[1].videoId = "newmatch001";
  const source = `window.CHOIR_PLANS_FALLBACK = [\n  { songs: [\n    { videoId: "keepthis001" },\n    { videoId: "" },\n    { videoId: "" }\n  ] }\n];\n`;

  const output = applyVideoIdUpdates(source, original, updated);

  assert.equal(output, `window.CHOIR_PLANS_FALLBACK = [\n  { songs: [\n    { videoId: "keepthis001" },\n    { videoId: "newmatch001" },\n    { videoId: "" }\n  ] }\n];\n`);
});
