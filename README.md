# Voices of St. Gen

Static website for the St. Genevieve 8:30 AM choir. It shows Sunday Mass song plans, PDF packets, practice videos, and the cantor/pianist calendar.

## Run Locally

From this repo:

```bash
python3 -m http.server 4173
```

Then open:

```text
http://127.0.0.1:4173/
```

Press `Ctrl+C` in the terminal to stop the server.

## Files

- `index.html` - page structure and content containers.
- `styles.css` - responsive layout and visual styling.
- `script.js` - temporary static song data and rendering logic.

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

## Notes

This first version is public and static. It is intended for St. Genevieve Choir use, with the first audience being the 8:30 AM Sunday Mass choir.
