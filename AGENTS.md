# Project instructions for coding agents

- This repository is a Vite + React + TypeScript static app for GitHub Pages.
- Keep the Vite `base` configured for a GitHub Pages project path; the default is `/shape-of-high-dimensions/`, with `GITHUB_REPOSITORY`/`VITE_BASE_PATH` support for repository renames.
- Do not commit `dist`; deployment is handled by GitHub Actions using `actions/deploy-pages`.
- Prefer lightweight dependencies and reusable components for interactive visualisations.
- Mathematical calculations should use log-space where practical, especially for high-dimensional volumes.
- Before committing, run `npm run build` and fix TypeScript or Vite errors.
