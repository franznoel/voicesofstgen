# PostHog Guide

This site uses PostHog for simple web analytics: pageviews, section clicks, practice video plays, PDF packet downloads, gallery opens, archive views, device/browser breakdowns, and referrers.

## Tokens

There are two different PostHog tokens involved:

- Public project token: starts with `phc_`. This belongs in `index.html` and is safe for browser analytics.
- Personal API key: starts with `phx_`. This is private and is required for creating the dashboard through the API.

Do not put the personal API key in `index.html` or commit it to git.

## Local Environment

Create a local `.env` file in the repo root:

```bash
POSTHOG_API_KEY=phx_your_personal_api_key
POSTHOG_HOST=https://us.posthog.com
POSTHOG_PROJECT_ID=429363
```

The `.env` file is ignored by git.

## Create The Dashboard

Run:

```bash
npm run posthog:create-dashboard
```

The script in `scripts/create-posthog-dashboard.mjs` creates or reuses a dashboard named:

```text
Voices of St. Gen Web Analytics
```

It adds dashboard tiles for:

- Daily visitors
- Pageviews over time
- Top pages
- Clicks on Songs, Videos, Gallery, Calendar
- Clicks on View this Sunday
- Practice video plays
- PDF packet downloads
- Archive views
- Returning visitors
- Device/browser breakdown
- Referrers

The script is intentionally idempotent where practical. If a dashboard with the same name already exists, it uses that dashboard and only adds missing tiles by name.

## Custom Events

The static site sends these custom events from `script.js`:

```text
site_loaded
view_current_sunday
open_songs
open_videos
play_practice_video
download_pdf_packet
view_archive
open_calendar
open_gallery
```

Each event includes shared properties when available:

```text
site
current_plan_date
current_plan_title
returning_visitor
```

Video and PDF events include extra details such as video ID, video title, PDF label, URL, and plan information.

## Session Replay

Session Replay is configured in `index.html` as part of `posthog.init`.

Current replay settings:

```js
disable_session_recording: false,
session_recording: {
  maskAllInputs: true,
  maskTextSelector: ".sensitive, [data-private]",
  blockSelector: "[data-ph-no-capture]"
}
```

PostHog only initializes on the production domains:

```text
voicesofstgen.com
www.voicesofstgen.com
```

That means local development and preview hosts do not send replay data.

To finish enabling Session Replay:

1. Open the PostHog project.
2. Go to **Settings**.
3. Open **Session replay**.
4. Make sure recording is enabled for the project.
5. Visit `https://voicesofstgen.com/` and check **Activity > Replays** after a short delay.

Use `data-ph-no-capture` on any element that should be excluded from replay capture later. Use `data-private` or the `sensitive` class for text that should be masked.

## Localhost Behavior

PostHog capture is disabled anywhere outside:

```text
voicesofstgen.com
www.voicesofstgen.com
```

This keeps local development, LAN hosts, and preview deployments from polluting production analytics or session replays.

## Troubleshooting

If you see this error:

```text
POSTHOG_API_KEY must be a personal API key, not the public phc_ browser project token.
```

replace the `.env` value with a personal API key that starts with `phx_`.

If PostHog returns `401 Unauthorized`, create a new personal API key in PostHog and make sure it has access to the project.

If the dashboard appears but some tiles are empty, that usually means the matching event has not been captured in production yet. Interact with the live site, then check PostHog again after events arrive.
