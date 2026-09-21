# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Elunite is a static marketing website for a study-abroad/migration consultancy (admissions, scholarships, visas for African students). It is plain HTML/CSS/JS with no framework, no bundler, and no package manager — there is no `package.json`. It deploys to Vercel as a static site, configured entirely by `vercel.json` (clean URLs, cache headers, and security headers including a strict CSP).

## Commands

There is no build, lint, or test tooling in this repo. To preview locally, serve the directory with any static file server, e.g.:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` (or any other page). There is no dev server, hot reload, or asset pipeline — edit HTML/CSS/JS directly and refresh.

Deployment is via Vercel picking up pushes; there is no CI configuration in this repo.

## Architecture

### No templating — every page is a standalone HTML file

There are ~45 top-level `.html` pages and **no includes/partials/SSI/templating system**. The `<head>`, navbar, mobile menu, WhatsApp widget, enquiry slide-in panel, and footer markup are duplicated verbatim in every page. When changing shared UI (nav links, footer, a widget), you must edit every HTML file that contains it — grep for the relevant `id`/`class` across `*.html` first to find all copies, e.g.:

```bash
grep -l 'id="navbar"' *.html
```

### One global stylesheet, one global script

- `styles.css` (~23k lines) is loaded by every page and is the single stylesheet for the whole site — no CSS modules or per-page scoping. Design tokens (colors, gradients, shadows, transitions) are defined once as CSS custom properties in `:root` (around line 899).
- `script.js` (~1600 lines) is loaded by nearly every page and is organized into clearly marked `// ===== SECTION =====` blocks: navigation/mobile menu, services mega-menu search, contact form, the "Get in Touch" slide-in enquiry panel, mobile tab bar panels, testimonials data + carousel, destinations carousel, services "our process" carousel, scroll-to-top, footer nav, the currency converter, the WhatsApp floating widget, and the lead-capture modal. Each block guards itself with `if (element) { ... }` checks so the same file can safely run on pages that lack that particular DOM — keep that pattern when adding new sections.
- Fonts are self-hosted under `fonts/` (woff2) and declared via `@font-face` in `styles.css`, deliberately avoiding a Google Fonts round-trip.

### Blog subsystem: one data file feeds multiple renderers, but blog.html is the exception

- `blog-posts-data.js` defines `ELUNITE_BLOG_POSTS`, the single source of truth for every blog post's metadata (url, title, excerpt, tag, date, readTime, icon/image). To add a post: create its HTML file, then add one object to this array — nothing else needs touching for the teaser widgets.
- `blog-teaser.js` reads `ELUNITE_BLOG_POSTS` and renders the featured card + sidebar cards on `index.html`, `about.html`, `destination.html`, and `service.html` (and on individual blog post pages via `blog-post-enhancements.js`), always newest-first.
- `blog.html` (the full blog listing page) is the exception: its post cards are **hardcoded directly in the HTML**, not generated from `blog-posts-data.js`. `blog-sort.js` sorts those existing `.blog-listing-card` DOM elements newest-first, and `blog-pagination.js` paginates them 6-per-page, driven by a `?page=N` query param with `history.pushState` so back/forward navigation steps through pages. **When adding a new blog post, you must add its card markup to `blog.html` manually in addition to the `ELUNITE_BLOG_POSTS` entry.**
- `blog-date.js` handles relative/formatted date display.

### Content hierarchy

- `index.html` (home) → `destination.html` (country hub) → country pages (`india.html`, `usa.html`, `germany.html`, `australia.html`, `china.html`, `ireland.html`) → for India specifically, city sub-pages (`mumbai.html`, `bangalore.html`, `hydrabad.html`, `chandigarh.html`, `gujarat.html`, `new-delhi.html`).
- `programs.html` and `service.html` are hubs linking out to individual program/service pages: `strategic_program.html`, `graduate_training.html`, `end_to_end.html`, `business-strategy-development.html`, `corporate-institutional-training.html`, `mentorship-capacity-building.html`, `scholarships-exchange-programs.html`, `work-abroad-relocation.html`, `study-abroad-services.html`.
- Checkout-style pages (`end_to_end_purchase.html`, `scholarship_purchase.html`, `visa_purchase.html`) use the currency converter (below) to localize displayed prices.
- Adding a new page means also adding it to `sitemap.xml` by hand — nothing generates that file.

### Currency conversion is client-side and manually maintained

In `script.js` (around line 980), `detectUserCurrency()` calls `https://ipapi.co/json/` to geolocate the visitor by IP, maps country → currency, then `updateAllPrices()` converts every `[data-price]` element using a **hardcoded rate table** (`currencyData`). These are not live FX rates — updating them requires editing `script.js` directly.

### Forms: Formspree + WhatsApp fallback, with basic anti-spam

Contact/enquiry/lead forms POST to a shared Formspree endpoint (`https://formspree.io/f/xkjwyrrg`) via `fetch`. Regardless of whether that request succeeds, the form also opens a pre-filled `wa.me` WhatsApp deep link so the lead reaches the team either way. Anti-spam is handled entirely client-side: a honeypot field, a minimum-fill-time trap (rejects submissions faster than a human could type), and a `localStorage`-based resubmission cooldown. See the `CONTACT FORM` and `GET IN TOUCH` sections of `script.js`.

### CSP locks inline `<script>` blocks to exact-match SHA-256 hashes

`vercel.json` sets a strict `Content-Security-Policy` with `script-src 'self'` plus a fixed allowlist of `sha256-...` hashes for the handful of inline `<script>` blocks used across pages (e.g. the preloader-hide snippet repeated near-verbatim on most pages, and a couple of page-specific inline scripts like the FAQ accordion on `end_to_end.html`). **If you edit the text of an inline `<script>` block at all — even whitespace — its hash changes and the browser will silently block it** under CSP. Either keep inline scripts byte-for-byte identical to the whitelisted ones, move new logic into `script.js` instead, or recompute and add the new hash to `vercel.json`.

### Images

Static assets live under `images/`, organized by section: `destination-images/`, `services-images/`, `about-us-images/`, `blogs/`, `Programs/`, `nav-menu/`, `students/`, `favicon/`. `docs/` contains legal PDFs (Booking and Payment Policy, Privacy Policy) linked from the site — not developer documentation.
