# PSS Pakistan — End-to-End QA Report

**Product:** Pakistan Surveillance Shield (Unit 47)  
**Environment tested:** `http://localhost:5176/` (Vite 6 / React 18)  
**Date:** 23 Jul 2026  
**Scope:** Full single-page site — Header, Hero, Workflow, About Us, Dividends (CasesSolved), GeoIntReel, OsintReel  
**Method:** Static code review of all `src/` components + live browser E2E (desktop ~1920×1080, mobile emulation 390×844), DOM/CDP probes, asset & network inspection, animation/perf sampling  

---

## Executive summary

The site renders and navigates end-to-end without hard crashes. All referenced `/public` assets returned HTTP 200 in this environment (~14.3 MB transferred on first load). The highest risks are **accessibility (keyboard/focus)**, **hero carousel behavior on narrow viewports**, **always-on multi-canvas CPU cost**, **broken/misleading project CTAs**, and **orphan sections** (GeoInt / Cyber Int) that cannot be reached from the header. The page also **ends abruptly** because `Footer` is implemented but never mounted.

| Priority | Count |
|----------|------:|
| Critical | 5 |
| High     | 8 |
| Medium   | 10 |
| Low      | 7 |

---

## Test matrix (executed)

| Area | Result |
|------|--------|
| Header nav → Home / Capabilities / Workflow / About / Dividends | Pass (smooth scroll + active state) |
| Header nav → GeoInt / Cyber Int | Fail — no nav entries |
| Scroll spy on GeoInt / Osint | Fail — stays on “Dividends” |
| Hero typewriter + card assemble → carousel | Pass on desktop |
| Hero carousel on 390px width | Fail — cards positioned far off-screen; sparse visible coverage |
| Explore Project CTAs | Partial — RAVEN no-ops; Trustworthy AI port conflicts with this Vite port |
| Workflow Forward (NIGRAN reel) | Pass (opens 3D case reel) |
| Dividends / GeoInt / Osint autoplay reels + thumbs | Pass |
| Footer | Fail — not in DOM |
| Broken image 404s | Pass (0 failures this run) |
| `:focus` / `:focus-visible` styles | Fail — 0 rules found |
| `prefers-reduced-motion` | Partial — Hero seals / reel CSS only; canvases & Workflow/About uncapped |
| Horizontal page overflow (desktop) | Pass (`scrollWidth ≈ clientWidth`) |
| First-load transfer | ~14.3 MB (logos dominate) |
| Concurrent CSS animations | ~80–100 running |
| Particle canvases | 4 active (Header, Hero, Workflow ~5.4k px tall, About) |

---

## Critical

### C1. Hero capability cards are not keyboard-accessible
**Where:** `src/components/Hero.jsx` (card `div` + nested CTA)  
**Evidence:** Cards use `onClick` with `cursor: pointer`, `tabIndex: -1`, no `role`. Nested `<button class="hero__card-cta">` sits inside the clickable card (invalid interactive nesting). CDP found **0** `:focus` / `:focus-visible` rules site-wide.  
**Impact:** Keyboard and many AT users cannot operate primary CTAs; focus is invisible even on real `<button>`s in the header.  
**Recommended fix:**
- Make each card a single `<button>` or `<a>`, **or** keep the card as a container and put only the CTA as the interactive control (remove card-level `onClick`).
- Add global `:focus-visible { outline: 2px solid …; outline-offset: 2px; }`.
- Give each CTA an accessible name: `Explore AGEX IRIS`, etc.

### C2. Infinite carousel clones pollute the accessibility tree
**Where:** Hero slider clones (`hero__card--clone`)  
**Evidence:** 7 real + 7 clone “Explore Project” buttons; clones also have `tabIndex: 0`. Snapshot exposes 14 identically named buttons.  
**Impact:** Tab order is doubled; screen readers announce duplicate controls.  
**Recommended fix:**
- Set `tabIndex={-1}` and `aria-hidden="true"` on clone cards (and disable pointer events if clones are decorative for infinite scroll).
- Or use `inert` on offscreen clones.

### C3. Hero carousel layout breaks on mobile (~390px)
**Where:** `Hero.jsx` sliding-phase transforms + `Hero.css` / `responsive.css`  
**Evidence:** At `innerWidth: 390`, most cards had `left` from about **-2000 to +2000**; only 1–2 clones partially in view; PSS card `opacity: 0` while still occupying layout.  
**Impact:** Primary “Capabilities” experience is largely unusable on phones.  
**Recommended fix:**
- Recalculate slide spacing from measured card width + viewport (not desktop assumptions).
- On `max-width: 640px`, prefer a simpler 1-card peek carousel (or CSS scroll-snap) instead of 3D perspective offsets.
- Re-run layout on `resize` / orientation change.

### C4. Misleading / conflicting Explore Project links
**Where:** `src/components/Hero.jsx` (`projectCards`, `openApp`)  
**Evidence:**
- **RAVEN** has no `port` but still shows CTA; `openApp` returns early → dead click.
- Comment says “DEFENSIVE SUITE (in progress)” but Defensive **has** `port: 8130`; RAVEN is the incomplete one.
- **TRUSTWORTHY AI** uses `port: 5176` — same port this site was served on during QA → opens this marketing site, not a separate app.
**Impact:** Broken trust in primary CTAs; wrong destination in common local setups.  
**Recommended fix:**
- Hide CTA (or show “Coming soon”) when `!card.port`.
- Fix comment / port map; assign Trustworthy AI a dedicated port or env-based URL map (`VITE_APP_URLS`).
- Prefer absolute configured URLs over `hostname:port` guessing.

### C5. Multi-canvas + ~14 MB assets = severe performance bottleneck
**Where:** Header / Hero / Workflow / About particle canvases; logos in `/public`  
**Evidence:**
- 4 `requestAnimationFrame` particle systems; Workflow canvas sized ~**1912×5408**.
- ~**80–100** CSS animations running concurrently.
- Logo files: `agex-logo` ~1.2 MB, `nigran` ~1.1 MB, `nox` ~1.1 MB, `geoint` ~1.0 MB, `raven` ~1.0 MB, `cyberint-logo` ~1.5 MB, `responsible-ai` ~1.1 MB.
- First-load transfer ≈ **14.3 MB**.
- `processLogo` canvas work runs at module load for every logo.  
**Impact:** Jank on laptops, thermal throttling on LED walls the CSS targets, slow first paint on constrained networks.  
**Recommended fix:**
- Pause canvases when section is offscreen (`IntersectionObserver`) and when `prefers-reduced-motion: reduce`.
- Cap Workflow canvas to viewport height (or use CSS background, not full-section bitmap).
- Compress/resize logos to ≤100–150 KB WebP/AVIF; avoid 1K+ PNG marks for card icons.
- Defer `processLogo` until card is near viewport; cache results.

---

## High

### H1. Footer built but never rendered — page ends abruptly
**Where:** `src/components/Footer.jsx` exists; `src/App.jsx` omits it  
**Evidence:** CDP `hasFooter: false`; last node after `#osint-technique` is `null`. LED CSS still styles `.footer`.  
**Recommended fix:** Import and render `<Footer />` after `OsintReel`, or delete dead Footer files and LED footer rules.

### H2. GeoInt & Cyber Int sections are orphaned from navigation
**Where:** `Header.jsx` `navItems` / scroll spy; section IDs `geoint-terrain`, `osint-technique`  
**Evidence:** Live scroll to end of page left active tab as **Dividends**. No header entries for those sections.  
**Recommended fix:** Add nav items (e. and g. “Terrain”, “Cyber Int”) **or** nest them under Dividends with subnav; extend `sectionIds` in scroll spy.

### H3. Incomplete `prefers-reduced-motion` coverage
**Where:** Partial in `responsive.css`, `Hero.css`, reel CSS; **missing** in About / Workflow / Header canvases / typewriter / carousel rAF / `scroll-behavior: smooth`  
**Impact:** Vestibular and attention-sensitive users get continuous motion.  
**Recommended fix:** Central reduced-motion policy: kill infinite keyframes, cancel rAF loops, disable typewriter (show full title), set `scroll-behavior: auto`.

### H4. Workflow case explorer / media panels lack dialog a11y
**Where:** `Workflow.jsx` (`CaseExplorer` portal, media Back/Forward)  
**Evidence:** Escape closes (good) but missing `role="dialog"`, `aria-modal="true"`, labelled title, focus trap, restore focus.  
**Recommended fix:** Implement standard modal a11y pattern (or use a small dialog primitive).

### H5. Reel autoplay pause is mouse-only
**Where:** CasesSolved / GeoIntReel / OsintReel (`onMouseEnter` / `onMouseLeave`)  
**Impact:** Touch and keyboard users cannot pause autoplay.  
**Recommended fix:** Pause on focus within reel; expose Play/Pause toggle with `aria-pressed`.

### H6. Decorative canvases not hidden from AT
**Where:** `header__canvas-bg`, `hero__canvas`, `workflow__particles`, `about__canvas`  
**Evidence:** `aria-hidden` is `null` on all four.  
**Recommended fix:** `aria-hidden="true"` + `role="presentation"`; never put interactive content on canvas.

### H7. Hero `logo.png.png` naming / PSS card background
**Where:** PSS card `bgImage: '/logo.png.png'`  
**Evidence:** File exists and loads (200), but double extension is a maintenance footgun and odd asset name.  
**Recommended fix:** Rename to `pss-card-bg.png` (or reuse `pss-logo.png`) and update reference.

### H8. `hasCase = false` disables Workflow case-entry UX
**Where:** `Workflow.jsx` (~L2239)  
**Evidence:** Hardcoded `const hasCase = false` deadens title click / case chip path while Forward reels still work — inconsistent discovery.  
**Recommended fix:** Wire real case availability or remove dead UI affordances.

---

## Medium

### M1. UI theme inconsistency across sections
Light sand/grid (Hero, Workflow, About, GeoInt in places) vs dark ops panels (Dividends, Cyber Int). Header stays light over dark sections → visual clash.  
**Fix:** Shared section tokens; optionally invert header when over dark sections.

### M2. Naming inconsistencies
“UNIT 47” vs “UNIT-47”; “CyberInt” / “Cyber Int” / “OSINT” / “CyberINT”; alt “Pak Surveillance Shield” vs title “Pakistan Surveillance Shield”.  
**Fix:** Copy deck + single brand string constants.

### M3. Missing document meta
No `<meta name="description">`, no Open Graph/Twitter tags in `index.html`.  
**Fix:** Add description + OG image (`team_logo` or hero still).

### M4. No skip link / landmark labels
No skip-to-content; `<nav>` lacks `aria-label`; active tab lacks `aria-current="page"`.  
**Fix:** Add skip link targeting `#home` or a `#main` wrapper; label nav; set `aria-current` on active item.

### M5. Metric label truncation
Dividends/Osint ledger labels (e.g. “MSISDN Artifacts”) clamp/ellipsis on 5-column grids.  
**Fix:** Shorter labels, `title` tooltip, or wrap to 2 lines with consistent min-height.

### M6. Google Fonts payload
Orbitron + Rajdhani + Inter with many weights — render-blocking. Inter underused relative to Orbitron/Rajdhani.  
**Fix:** Subset weights actually used; self-host; drop unused family.

### M7. Dead code / CSS debt
Unused `osintCases` array; unused Header logo CSS; Hero modal CSS without JSX; unused `ICONS.cyber`.  
**Fix:** Delete or wire up — reduces bundle and confusion.

### M8. Local app deep-links assume sibling services
Ports 8120, 5173, 5174, 5177, 8130, 5176 open blank/error tabs if apps are down (no user feedback).  
**Fix:** Health-check or toast “App unavailable”; document required stack.

### M9. `width: 100vw` on hero cards section
Can cause horizontal overflow when combined with body safe-area padding on some browsers. Not reproduced on desktop this run; still a known footgun.  
**Fix:** Prefer `100%` / `100dvw` with `overflow-x: clip` on root only.

### M10. About / Workflow reduced-motion & animation density
About pulses/scans and Workflow dashed connectors run unbounded; no reduced-motion block in those CSS files.  
**Fix:** Same policy as H3.

---

## Low

### L1. Brand absent from header chrome
Header is nav-only; brand appears in hero H1/document title only.  
**Fix:** Compact wordmark left of nav (existing Header logo CSS may already anticipate this).

### L2. Horizontal nav on very small screens
≤480px rules hide scrollbar; Dividends may be easy to miss without affordance.  
**Fix:** Fade edges or “swipe” hint.

### L3. Content sensitivity in Dividends imagery
Case reels include graphic forensic imagery without content warning.  
**Fix:** Optional blur-until-interact / “Sensitive material” disclosure for public demos.

### L4. Stat presentation polish
About counters animate numeric prefixes (`20 Mn`); intermediate frames can look odd.  
**Fix:** Animate number only; keep suffix static.

### L5. Duplicate Naukandi cases in Dividends thumbs
Two thumbs share “Naukandi Case – 2ⁿᵈ Dec 2025” with different IDs — clarify distinction in labels.

### L6. Workflow “Back” disabled on overview
Asymmetric vs Forward — acceptable but teach users with tooltip (“Open case reel”).

### L7. LED / kiosk CSS assumes Footer
`led-display.css` still targets `.footer` while Footer is unmounted — dead rules.

---

## What looks solid

- Section IDs for the five header targets exist and scroll correctly.
- Workflow Forward/Back controls expose `aria-label`s.
- Reel fallbacks in Geo/Osint use `aria-hidden` on decorative SVG scenes.
- Broad responsive breakpoints exist (`responsive.css`, `led-display.css`).
- No console-level image 404s in this run; public asset set is complete (~63 files).
- Dividends / GeoInt / Cyber Int reels autoplay and thumb switching work on desktop.

---

## Recommended fix order

1. **A11y baseline:** focus rings, hero card semantics, hide clone CTAs (`C1`, `C2`, `H6`).
2. **CTA honesty:** RAVEN / port map / env URLs (`C4`).
3. **Mobile carousel:** rework sliding math or simplify (`C3`).
4. **Perf:** compress logos; pause offscreen canvases; shrink Workflow canvas (`C5`).
5. **IA:** mount Footer; add GeoInt/Cyber Int to nav + scroll spy (`H1`, `H2`).
6. **Motion:** full `prefers-reduced-motion` policy (`H3`, `M10`).
7. **Cleanup:** dead code, meta tags, naming constants (`M3`, `M7`, `M2`).

---

## Appendix A — Component inventory

| Component | Role | Notes |
|-----------|------|-------|
| Header | Fixed nav + particle canvas + scroll spy | No brand mark; spy incomplete |
| Hero | Typewriter H1 + 3D card carousel + local app links | A11y + mobile + CTA issues |
| Workflow | Multi-phase intelligence pipeline (~2.5k LOC) | Heavy canvas; modal a11y gaps |
| AboutUs | Hierarchy + mission stats | No reduced-motion |
| CasesSolved | Dividends / AGEX IRIS reel (`#dividends`) | Dark theme; autoplay |
| GeoIntReel | Terrain analysis reel (`#geoint-terrain`) | Not in nav |
| OsintReel | Cyber Int reel (`#osint-technique`) | Not in nav; dead `osintCases` |
| Footer | “THANK YOU !” | **Not mounted** |

## Appendix B — Nav ↔ section map

| Nav ID | Target | Status |
|--------|--------|--------|
| `home` | `#home` | OK |
| `capabilities` | `#capabilities` | OK |
| `workflow` | `#workflow` | OK |
| `about` | `#about` | OK |
| `dividends` | `#dividends` | OK |
| — | `#geoint-terrain` | Orphan |
| — | `#osint-technique` | Orphan |

## Appendix C — Explore Project port map

| Card | Port | QA note |
|------|------|---------|
| AGEX IRIS | 8120 | OK if service up |
| NIGRAN | 5173 | OK if service up |
| GEO INT | 5174 | OK if service up |
| PSS | — | Intentional non-link |
| NOX CYBERINT | 5177 | OK if service up |
| RAVEN | — | **CTA still shown — dead** |
| DEFENSIVE SUITE | 8130 | OK if service up |
| TRUSTWORTHY AI | 5176 | **Conflicts with this site’s Vite port** |

---

*Report generated from combined static analysis and live browser E2E on 23 Jul 2026. Re-verify after asset compression and carousel fixes on real iOS Safari and Android Chrome.*
