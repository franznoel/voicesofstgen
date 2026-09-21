# YouTube Practice Videos

Each song in `data/choir-plans.fallback.js` can have an approved YouTube `videoId`:

```js
{
  role: "Entrance",
  title: "Table of Plenty",
  composer: "Dan Schutte",
  videoId: "okAMb_ra8Uw"
}
```

The public site turns that ID into a thumbnail and loads a privacy-enhanced `youtube-nocookie.com` embed only after a visitor presses play. A song without an approved ID displays **No video**.

## Automatic Matching

The matcher uses the official YouTube Data API. It never replaces an existing `videoId`.

```bash
npm run report:youtube
npm run match:youtube
```

`report:youtube` evaluates matches and writes `data/choir-video-report.json` without changing plan data. `match:youtube` also writes accepted IDs to `data/choir-plans.fallback.js`. Run `npm run generate:choir-plan-pdfs` afterward to update generated plan data.

Before searching, the matcher reuses an existing approved ID when the same normalized title has exactly one approved video. Conflicting existing versions are left for review. Non-song rows, such as choir scheduling notes, are skipped.

For each unresolved song, the matcher requests five embeddable YouTube videos using the title, cleaned composer, and `Catholic hymn`. Candidates are ranked deterministically:

- the complete title must match;
- a listed composer or tune name must also match;
- official OCP, publisher, or composer channels are preferred;
- full vocal recordings are preferred;
- karaoke, accompaniment-only, excerpts, shorts, covers, reactions, and tutorials are penalized.

A result is accepted only when its score is at least 80 and it leads the next candidate by at least 10 points. Uncertain results remain blank and appear under `ambiguous` or `rejected` in the report.

The report contains `accepted`, `reused`, `ambiguous`, `skipped`, and `rejected` sections. Review the accepted video title and channel as well as unresolved candidates after every run.

## API Key

Create a Google Cloud project, enable YouTube Data API v3, and create an API key. Add it locally without committing it:

```text
YOUTUBE_API_KEY=your_key
```

For automation, add the same name as a GitHub Actions repository secret. The key is used only by the Node matcher and is never sent to site visitors or browser JavaScript.

Public video searches require an API key but not OAuth. Visitors do not need a YouTube login. `ICRMUSIC_LOGIN` and `ICRMUSIC_PASSWORD` are unrelated and are not used by this workflow.

YouTube applies API quotas. The matcher avoids searches for songs that already have IDs, groups repeated unresolved songs into one query, and reuses unique approved title matches.

## Automation

`.github/workflows/match-youtube-videos.yml` runs when fallback choir-plan data changes or when manually dispatched. It uploads the report, regenerates derived plan data, and commits accepted IDs. If `YOUTUBE_API_KEY` is missing, it fails with setup instructions rather than silently producing incomplete results.

The Google Site scraper still records embedded YouTube IDs as source evidence, but it does not automatically associate them with songs because the source markup lacks a consistently reliable song-to-video relationship.
