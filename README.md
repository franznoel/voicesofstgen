# Voices of St. Gen

Static website for the St. Genevieve 8:30 AM choir. It shows Sunday Mass song plans, PDF packets, practice videos, and the cantor/pianist calendar.

## Run Locally

From this repo:

```bash
npm start
```

Then open:

```text
http://127.0.0.1:4173/
```

Press `Ctrl+C` in the terminal to stop the server.

You can choose a different port with:

```bash
PORT=3000 npm start
```

## Files

- `index.html` - page structure and content containers.
- `styles.css` - responsive layout and visual styling.
- `script.js` - rendering logic, gallery behavior, and analytics.
- `data/choir-plans.fallback.js` - hand-curated Sunday plan fallback data.
- `data/choir-plans.generated.js` - generated Sunday plan data with conservative PDF-link updates.
- `server.js` - small dependency-free Node static server.
- `package.json` - local scripts for running and checking the site.

## Content Model

The current static data in `script.js` is shaped to be replaceable by Pang CMS later:

```js
{
  date: "2026-05-17",
  title: "Seventh Sunday of Easter (A)",
  pdfLinks: [{ label: "All PDFs", url: "https://..." }],
  songs: [{ role: "Entrance", title: "Canticle of the Sun", composer: "Haugen", videoId: "..." }],
  optionalSongs: []
}
```

## YouTube Loading

Practice videos are not embedded on initial page load. The page renders lightweight thumbnail buttons first, then creates a `youtube-nocookie.com` iframe only after a choir member presses play. This keeps the page usable even with many practice videos.

## PostHog Dashboard

The site uses PostHog for pageviews, section clicks, video plays, PDF downloads, gallery opens, archive views, device/browser breakdowns, and referrers.

To create or refresh the PostHog dashboard:

1. Add a local `.env` file with a personal PostHog API key.
2. Run `npm run posthog:create-dashboard`.

See [docs/posthog.md](docs/posthog.md) for setup, event names, and troubleshooting.

## Google Site Scraping

The repo includes a GitHub Actions workflow that scrapes the source Google Site hourly and on manual dispatch. Manual runs can save the snapshot to `data/stgenchoir-scrape.json` when the result changes.

The generated Sunday plan path updates PDF packet links only and preserves curated song/video fields. See [docs/scraping.md](docs/scraping.md) for the schedule, local commands, reports, and limitations.

## Notes

This first version is public and static. It is intended for St. Genevieve Choir use, with the first audience being the 8:30 AM Sunday Mass choir.
