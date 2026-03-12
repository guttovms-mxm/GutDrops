# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static HTML/CSS/JS marketing site for **SlimFix** (weight loss supplement). No build tools, no frameworks, no package manager — pure vanilla JavaScript served via relative file paths.

**Dev server:** VSCode Live Server on port 5501. Open any `index.html` to serve from the repo root.

## Architecture

### Sales Funnels

- **VSL funnel** (`pages/vsl/`) — Video Sales Letter page with Vturb embedded video. Content reveals after video reaches a timed CTA via `.smartplayer-anchor-button` detection polling.
- **DTC funnel** (`pages/dtc/`) — Direct-to-consumer multi-step checkout:
  - `step1/` — Package selection (2/3/6 bottles)
  - `step2/` — Upsell with VSL gate (content hidden until Vturb CTA fires)
  - `upsell/` — Post-purchase upsell offer

### Shared Assets (`assets/`)

- `shared/css/main.css` — Global styles with CSS custom properties (`--primary-color: #2E7D32`)
- `shared/js/` — Reusable scripts (see below)
- `shared/products/` — Product images (WebP) and bottle SVGs (`bottles-2.svg`, `bottles-3.svg`, etc.)
- `shared/img/` — Badges, icons, social share images
- `vendor/bootstrap/` — Bootstrap 5 (CSS, JS, icon fonts) — vendored locally
- `components/quiz/` — Interactive product recommendation quiz

### Legal Pages (`lgl/`)

Seven compliance pages (privacy, terms, refund, shipping, disclaimer, references, contact) sharing consistent header nav and green theme.

## Key Scripts

| Script | Purpose |
|--------|---------|
| `vturb.js` | Detects Vturb CTA button visibility, reveals `.esconder` elements, hides CTA. Uses `slimfix_cta_displayed` localStorage key. |
| `purchase-notifications.js` | Simulated purchase popups with random names/locations. Injects HTML via `insertAdjacentHTML`. Uses absolute paths (`/assets/...`) for bottle images. |
| `kits02.js` / `kits.js` | Product kit selection, stores choice in localStorage |
| `cpda-parameters.js` | Propagates URL query parameters to checkout links |
| `funnel-tracking.js` | Injects funnel ID into checkout URLs |
| `countdown.js` | Dynamic countdown timer display |

## Important Patterns

- **VTurb CTA detection**: Poll `.smartplayer-anchor-button` every 500ms checking `el.offsetParent !== null && el.offsetHeight > 0`. Used in both `vturb.js` (VSL page) and inline script in `step2/index.html` (with separate localStorage key `slimfix_step2_cta`).
- **Path depth matters**: Pages at different depths use different relative path prefixes (`../../` for `pages/vsl/`, `../../../` for `pages/dtc/step1/`). Shared JS that injects HTML should use absolute paths (`/assets/...`).
- **CSS theming**: Primary green `#2E7D32`, dark `#1B5E20`, gold accent `#FFD700`, font Nunito Sans.
- **Bootstrap 5**: Vendored in `assets/vendor/bootstrap/`, not loaded from CDN.
- **Google Analytics**: Tag `G-9TQWE18FMG` added to all pages in `<head>`.

## Gotchas

- Vturb errors on localhost (CORS, license) are expected — only works on production domain `theslimfix.shop`.
- The VSL page CSS (`pages/vsl/css/vsl.css`) has `.smartplayer-anchor-button { display: none !important; }` which may conflict with `vturb.js` CTA detection via `offsetParent`.
- Checkout links in step1/step2 are currently set to `#` (placeholder).
