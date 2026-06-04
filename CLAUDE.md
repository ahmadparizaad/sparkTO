# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SparkTO Cleaning Co. is a static single-page marketing website for a Toronto-based residential and short-term rental cleaning business. No build step, no dependencies, no package manager — open `index.html` in a browser to run it.

## Running the Site

```bash
# Any local HTTP server works. Examples:
npx serve .
python3 -m http.server 8080
```

There is no build, lint, or test command. Changes take effect immediately on browser refresh.

## File Structure

| File | Role |
|------|------|
| `index.html` | Full page markup — all 10 sections in document order |
| `styles.css` | All styling; uses CSS custom properties defined in `:root` |
| `script.js` | All interactivity; each feature is an IIFE |

## Architecture Notes

### CSS custom properties
All colours, spacing, and shadow tokens are declared in `:root` in `styles.css`. Edit values there — don't hardcode hex codes elsewhere.

```
--bg       #F9F8F5   page background
--charcoal #1C1C1E   primary text / dark sections
--sage     #7A9E7E   primary accent (CTAs, highlights)
--sand     #E8DCC8   secondary accent (step numbers, subtle fills)
```

### Responsive breakpoints
Two breakpoints inside `styles.css`, declared at the bottom:
- `≤ 900px` — tablet: collapses nav to hamburger, 2-col grids
- `≤ 580px` — mobile: single-column everything

### Fade-in animation pattern
Elements with class `fade-in` start invisible (`opacity: 0; transform: translateY(28px)`). The `IntersectionObserver` in `script.js` adds class `visible` when they enter the viewport. Siblings inside the same parent are staggered by 80 ms each.

### Before/After slider
Each `.ba-slider[data-slider]` element contains `.ba-before` and `.ba-after` siblings. The after-panel is clipped with `clip-path: inset(0 X% 0 0)`. The `initSliders()` IIFE in `script.js` drives the drag via the Pointer Events API (covers mouse and touch). The handle also responds to ArrowLeft/ArrowRight for keyboard accessibility.

### Contact form
Client-side only — no backend. On successful validation a 1.2 s simulated delay fires, then the form resets and `.form-success` becomes visible. To wire up a real endpoint, replace the `setTimeout` block in `initForm()` with a `fetch()` call.

### Navbar state
Starts transparent (overlaid on the hero gradient). The class `scrolled` is toggled on `#navbar` at `window.scrollY > 40`, which activates the frosted-glass background via CSS. The mobile menu is driven by `.open` toggled on `#navLinks` and `#navToggle`.

## Key Design Conventions

- **Typography**: Playfair Display (headings) + DM Sans (body) loaded from Google Fonts in `<head>`.
- **Section structure**: every content section uses `.section` (padding) + `.container` (max-width + horizontal padding).
- **Section header pattern**: `<span class="section-tag">` → `<h2 class="section-title">` → `<p class="section-sub">`, wrapped in `.section-header`.
- **Button variants**: `.btn.btn-primary` (sage green fill) and `.btn.btn-outline` (transparent + border).
- `prefers-reduced-motion` media query at the bottom of `styles.css` disables all transitions and sets `.fade-in` to immediately visible.
