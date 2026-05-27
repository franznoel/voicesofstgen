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

After scraping, every run uploads `data/stgenchoir-scrape.json` and a choir plan PDF report as artifacts. Scheduled hourly runs only check/report generated plan changes. Manual runs also run the PDF-link generator in write mode and commit `data/stgenchoir-scrape.json` plus `data/choir-plans.generated.js` when either file changes.

## Generated PDF Links

Sunday plan data is split into:

```text
data/choir-plans.fallback.js
data/choir-plans.generated.js
```

The fallback file keeps the hand-curated plan data. The generated file is allowed to update only `pdfLinks`; curated song titles, composers, notes, YouTube IDs, and optional songs remain authoritative.

To preview PDF-link matching without changing generated plan data:

```bash
npm run report:choir-plan-pdfs
```

To update the generated plan data locally:

```bash
npm run generate:choir-plan-pdfs
```

The generator writes `data/choir-plan-pdf-report.json` for review. That report is ignored by Git.

## Limitations

The generator currently targets PDF packet links only. It skips links that cannot be tied to exactly one known Sunday date, so some valid source-site changes may need manual review before they appear on the public site.
