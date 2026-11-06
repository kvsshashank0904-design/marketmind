# MarketMind 3.0

An educational financial-research and learning platform built with React, TypeScript, Vite, and Cloudflare Pages.

## Highlights

- Research Lab for 24 US issuers using SEC EDGAR Company Facts
- Five-year annual statements, transparent accounting ratios, and health diagnostics
- Comparison Studio and a hypothetical portfolio-compounding simulator
- Six Academy modules and a financial-concepts tutor
- Cloudflare Pages Function proxy for SEC requests with one-hour caching
- Privacy, terms, methodology, and financial-disclaimer pages

## Run locally

Requires Node.js 20 or later.

```bash
npm install
npm run dev
```

Run the quality checks with:

```bash
npm test
npm run build
```

## Deploy to Cloudflare Pages

1. Connect this repository in **Workers & Pages**.
2. Select the Vite framework preset.
3. Set the build command to `npm run build` and the output directory to `dist`.
4. Deploy. The `functions/api/company-facts.ts` proxy is deployed with the application.

## Data boundaries

- SEC Company Facts supplies public US filing facts, not live stock prices.
- Values can be delayed, amended, or incomplete; users should consult primary filings.
- Calculations and simulations are educational and are not investment recommendations.
- The Financial Tutor provides fixed educational explanations; it is not a live AI adviser.

See `PROJECT_STATUS.md` for the latest audit and release status.
