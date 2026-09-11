# Animation & Interaction Architecture (Phase 4)

## Overview

Milestone Engineering Services features a custom **Precision Motion System** tailored for high-precision industrial metrology. Drawing inspiration from precision metrology leaders like Mitutoyo and modern motion systems (Motion / React Bits), every transition reinforces mechanical trust, calibration accuracy, and industrial stability.

---

## 1. Core Principles

1. **Precision Mechanical Feel**:
   - High initial velocity with gentle settling (`cubic-bezier(0.16, 1, 0.3, 1)`).
   - Micro-interactions (0.15s – 0.25s) for hover/tap feedback.
   - Section reveals (0.65s) with subtle translation (20px max).

2. **Performance & Lightweight Footprint**:
   - Zero heavyweight CSS animation libraries.
   - Single core motion engine: `motion` (`motion/react` v13).
   - Only transforms (`translateY`, `scale`) and `opacity` are animated to ensure off-main-thread GPU acceleration.
   - Chunks are split with Vite: `vendor-motion` (96 kB / 31 kB gzip) and `vendor-react` (51 kB / 18 kB gzip).
   - Full product data remains lazy-loaded on demand (`products.ts`).

3. **Accessibility First (`prefers-reduced-motion`)**:
   - Full compliance with WCAG 2.1 Criterion 2.3.3.
   - Any user with `prefers-reduced-motion: reduce` configured gets immediate static renders or subtle opacity-only transitions (`duration: 0.15s`). No spatial movement or scaling.

---

## 2. Animation Tokens (`src/animations/config.ts`)

| Token | Duration | Usage |
| :--- | :--- | :--- |
| `DURATION.instant` | 0.1s | Tab switching indicator transitions |
| `DURATION.micro` | 0.2s | Button active scale, arrow nudges, icon hovers |
| `DURATION.card` | 0.35s | Card hover elevations, modal entrances, dialog transitions |
| `DURATION.section` | 0.65s | Viewport scroll entrance for headings and grids |
| `DURATION.hero` | 0.85s | Initial landing hero entrance sequences |
| `DURATION.stagger` | 0.08s | Delay between sibling cards in grid collections |

### Easing Curve
- **Precision Ease**: `[0.16, 1, 0.3, 1]` — mimics calibrated mechanical inertia.

---

## 3. Reusable Motion Components (`src/components/animation/`)

### `Reveal`
Viewport-triggered directional entrance for headings, text blocks, and media.
- Props: `direction` (`'up' | 'down' | 'left' | 'right' | 'none'`), `delay`, `duration`, `distance`, `once`.

### `SectionReveal`
Semantic `<motion.section>` wrapper with standard viewport triggers (`margin: '-60px 0px'`, `once: true`).

### `StaggerContainer` & `StaggerItem`
Orchestrates children with sequential stagger delays (`0.08s`). Used in solutions grids, benefit cards, product listings, and service pillars.

### `SpotlightCard`
React Bits-adapted industrial cursor-tracking radial sheen (`rgba(0, 85, 165, 0.07)`). Renders a dynamic radial spotlight tracking mouse coordinates over the card surface, elevating cards with a calibrated lift (`y: -3px`). Includes automated touch device detection (`(pointer: coarse)`) to suppress cursor spotlights on mobile/tablets, preventing frozen light artifacts.

### `ScaleReveal`
Subtle scale entrance (`0.95 -> 1.0`) with opacity fade for technical imagery and CAD models.

### `ShinyText`
Subtle metallic sheen for high-trust badges (e.g., "INDUSTRY 4.0 READY", "PPT SOURCED"). Automatically falls back to standard text under reduced-motion and maintains WCAG AA contrast ratios.

### `PrecisionText` (Phase 4.1)
Accessible word-staggered typography entrance primitive for primary headlines. Preserves raw text string in the DOM for search engines and screen readers while staggering tokens (`0.06s`) with calibrated mechanical settling (`[0.16, 1, 0.3, 1]`). Falls back to immediate static text under `prefers-reduced-motion`.

### `PrecisionRuler` (Phase 4.1)
Calibrated measurement millimeter ticks component positioned at structural section boundaries, visually reinforcing the precision metrology engineering identity.

---

## 4. Key Page Interactions

- **Header**:
  - Active route indicator.
  - Desktop dropdowns animated with `AnimatePresence` (`opacity` and `y: [6, 0]`).
  - Mobile slide-out drawer with backdrop blur, escape key listener, and staggered navigation links (`0.03s`).
  - Header shadow elevation and backdrop blur on scroll.
- **Hero**:
  - Orchestrated entrance: Category badge -> `PrecisionText` headline -> Subtitle -> Value points -> CTAs -> Metrology workbench image with 1px optical laser scanning sweep.
- **Multi-Gauging Showcase**:
  - Mechanical sliding `layoutId="activeStationTab"` underline indicator between the Engine Block Liner Bore Station and Camshaft Multigauging Station.
  - 1px luminous horizontal laser scanning beam across the active station hardware preview.
  - `AnimatePresence mode="wait"` cross-fades smoothly between station specifications.
- **Featured Products**:
  - Mechanical sliding `layoutId="activeFeaturedTabPill"` background indicator when switching product category filters.
  - Staggered re-entrance of filtered product cards.
- **Product Gallery**:
  - Smooth `layoutId="activeThumbRing"` selection indicator ring on active thumbnail.
  - `AnimatePresence mode="wait"` cross-fades between high-resolution product photos, CAD schematics, and specification charts.
- **Product & Solution Cards**:
  - Unified `ProductCard` with touch-safe `SpotlightCard` sheen, calibrated lift (`y: -3px`), restrained image zoom (`1.03`), and smooth arrow translation.
