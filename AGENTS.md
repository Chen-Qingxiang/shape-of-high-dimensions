# Project instructions for coding agents

- This repository is a Vite + React + TypeScript static app for GitHub Pages.
- Keep the Vite `base` option set to `/shape-of-high-dimensions/`; this is a project page, not a root user page.
- Do not commit `dist`; deployment is handled by GitHub Actions using `actions/deploy-pages`.
- Prefer lightweight dependencies and reusable components for interactive visualisations.
- Mathematical calculations should use log-space where practical, especially for high-dimensional volumes.
- Before committing, run `npm run build` and fix TypeScript or Vite errors.
