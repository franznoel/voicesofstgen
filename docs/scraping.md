# Google Site Scraping

The repo includes a small Node scraper for the source Google Site:

```text
https://sites.google.com/view/stgenchoir/
```

It does not need an OpenAI API key. The scraper uses regular HTTP requests and deterministic parsing to collect page text, internal Google Site links, YouTube video IDs, Google Drive links, and PDF-like links.

## Run Locally

```bash
npm run scrape:google-site
```

The default output is:

```text
data/stgenchoir-scrape.json
```

Optional environment variables:

```bash
SCRAPE_START_URL=https://sites.google.com/view/stgenchoir/
SCRAPE_OUTPUT=data/stgenchoir-scrape.json
SCRAPE_MAX_PAGES=10
```

## GitHub Actions

The workflow at `.github/workflows/scrape-google-site.yml` runs:

- manually through `workflow_dispatch`
- hourly

After scraping, every run uploads `data/stgenchoir-scrape.json` as an artifact. Manual runs also commit the file back to the repo when the scrape result changes; hourly scheduled runs are artifact-only to avoid noisy bot commits and deployments.

## Limitations

The scraper stores a raw snapshot. It does not automatically rewrite the Sunday plan data in `script.js` yet. That can be added later once the source content format is stable enough to map safely into the site's choir plan model.
