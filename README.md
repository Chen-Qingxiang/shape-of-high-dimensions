# The Shape of High Dimensions

**How Big Is a Ball in 50 Dimensions?**

A polished interactive web visualisation project for building intuition about high-dimensional geometry. The app is a static Vite + React + TypeScript visual lab designed for GitHub Pages at:

<https://chen-qingxiang.github.io/shape-of-high-dimensions/>

## Inspiration

This project was inspired by watching a [3Blue1Brown video about high-dimensional spheres](https://www.youtube.com/watch?v=fsLh-NYhOoU). After watching it, I wanted to build a small hands-on visual lab for myself so I could experiment with the formulas, sliders, sampling, and charts directly.

## What is inside?

The page explores why 2D and 3D intuition breaks down in high dimensions:

- **n-dimensional ball volume explorer** for the formula

  ```text
  V_n(r) = π^(n/2) / Γ(n/2 + 1) * r^n
  ```

- **High-dimensional shell visualiser** showing that the fraction inside radius `r` is `r^n`.
- **Cube vs ball comparison** showing that `V_n(1) / 2^n` is also the probability that a random point in `[-1, 1]^n` lands inside the unit ball.
- **Monte Carlo estimator** that samples points in the cube and demonstrates why naive estimation becomes inefficient in high dimensions.
- **Distance distribution histogram** for random cube points, with the typical distance `sqrt(n / 3)`.
- **Gamma function mini explainer** for factorials and half-integers.

## Run locally

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the static site:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Deployment

This is a GitHub Pages **project site**, so Vite is configured to serve assets from the repository-name base path. By default that is:

```ts
base: '/shape-of-high-dimensions/'
```

The config derives the base from `GITHUB_REPOSITORY` during GitHub Actions builds, and it can be overridden with `VITE_BASE_PATH` if the repository is renamed, for example `VITE_BASE_PATH=/high-dimensional-ball-lab/ npm run build`.

Deployment is handled by `.github/workflows/deploy.yml` using the official GitHub Pages Actions flow:

1. Build with `npm run build`.
2. Upload the `dist` directory with `actions/upload-pages-artifact`.
3. Deploy with `actions/deploy-pages`.

The workflow runs on pushes to `main` and can also be launched manually with `workflow_dispatch`.

To enable deployment in GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Build and deployment** to **GitHub Actions**.
4. Push to `main` or run the deploy workflow manually.

## Mathematical notes

The implementation uses log-volume calculations for numerical stability:

```text
log V_n(r) = (n / 2) log π - logΓ(n / 2 + 1) + n log r
```

A Lanczos approximation provides a robust lightweight `logGamma` implementation without adding a large numerical dependency.
