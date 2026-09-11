---
name: ui-ux-audit
description: >-
  Run an in-depth UI/UX and accessibility audit on a web application across multiple viewports
  (Desktop 1440x900, Tablet 768x1024, Mobile 375x812 / 390x844). Evaluates usability heuristics,
  responsive layout defects, axe-core WCAG 2.1 AA compliance, and Lighthouse performance/SEO.
  Produces ./audit/report.md, screenshots in ./audit/screenshots/, and prioritized P0-P3 fixes.
  Triggers on "audit ui/ux", "ui audit", "ux audit", "ux review", "a11y audit", "accessibility audit",
  "audit this website", "run a ui-ux-audit", or any request to evaluate UI/UX of a URL or local dev server.
---

# UI/UX & Accessibility Audit Skill (Antigravity Edition)

A systematic, multi-stage UI/UX and accessibility audit pipeline for web applications. Identifies design system inconsistencies, visual bugs, responsive breakage, WCAG 2.1 AA violations, and performance bottlenecks, then outputs a prioritized punch-list of fixes.

---

## Capabilities & Tooling

In Google Antigravity, this skill leverages:
1. **`browser_subagent`**: Real Chromium browser orchestration to resize viewports (Desktop 1440×900, Tablet 768×1024, Mobile 390×844), interact with flows, take full-page screenshots, inspect console messages, and record sessions.
2. **`run_command` (@axe-core/cli & lighthouse)**: Automated WCAG 2.1 AA accessibility checks and Lighthouse mobile auditing via `npx`.
3. **Artifacts & Markdown Reports**: Generates `./audit/report.md` and saves visual evidence in `./audit/screenshots/`.

---

## Invocation Triggers

The user or model triggers this skill when:
- "audit ui/ux http://localhost:3000"
- "run a ui/ux audit on https://akira-automation.vercel.app"
- "ux review this page"
- "check accessibility and responsive layout on mobile and desktop"
- If no URL is provided, detect the current local dev server (e.g. `http://localhost:3000` or `5173`) or ask the user.

---

## 4-Stage Audit Pipeline

### Stage 0: Pre-Flight & Environment Check
1. **Verify target URL availability**: Check that the dev server or production URL is running and returns HTTP 200 before launching browsers (`curl -s -o /dev/null -w "%{http_code}" <url>`).
2. **Ensure audit directory exists**: Create `./audit/screenshots/` if it does not exist.

### Stage 1: Responsive Visual & Interaction Walkthrough (`browser_subagent`)
Audit each of the 3 primary viewports in sequence:
* **Desktop**: `1440 × 900`
* **Tablet**: `768 × 1024`
* **Mobile**: `390 × 844` (or `375 × 812`)

For each viewport:
1. Resize window and navigate to the target page.
2. Capture full-page screenshot to `./audit/screenshots/{NN}-{page}-{viewport}.png` (e.g. `01-home-1440.png`, `01-home-390.png`).
3. Walk the primary user flow (e.g., Header navigation, Enquiry modal, search/filter, form interactions).
4. Inspect console logs for JavaScript errors, unhandled rejections, or network 404s.
5. **Evaluate key UX criteria**:
   - **Visual Hierarchy & Layout**: Unintended text wrapping, misaligned buttons, excessive or zero whitespace, horizontal overflow/scrollbar on mobile.
   - **Affordances & States**: Missing active/hover/focus states, dead buttons, missing loading spinners on submit.
   - **Form Usability**: Input labels, required field markers, mobile keypad types (`tel`, `email`), clear error messages.
   - **Micro-copy & Brand Consistency**: Typos, placeholder texts (e.g. "Slide 24"), broken icons/images.

### Stage 2: Accessibility (a11y) & WCAG 2.1 AA Audit
Run automated axe-core scanning:
```bash
npx -y @axe-core/cli "<TARGET_URL>" --tags wcag2a,wcag2aa,wcag21a,wcag21aa,best-practice
```
Categorize violations by severity:
- **Critical / Serious**: Missing alt attributes, color contrast failing 4.5:1 ratio, missing accessible form labels (`aria-label`, `<label htmlFor>`), keyboard traps.
- **Moderate / Minor**: Missing landmarks, heading order hierarchy skipped (`h1` -> `h3`).

### Stage 3: Lighthouse Performance & Core Web Vitals
Run Lighthouse for mobile:
```bash
npx -y lighthouse "<TARGET_URL>" --form-factor=mobile --output=json --output-path=./audit/lighthouse.json --quiet --chrome-flags="--headless=new --no-sandbox"
```
Extract:
- Performance, Accessibility, Best Practices, SEO scores.
- Core Web Vitals: LCP (Largest Contentful Paint), FCP, CLS (Cumulative Layout Shift), TBT (Total Blocking Time).
- Top 3 highest-impact speed optimization opportunities.

---

## Deliverables & Output Format

The skill produces:

### 1. `./audit/report.md`
Structured as:
```markdown
# UI/UX & Accessibility Audit Report — {AppName}

**Date:** {YYYY-MM-DD}  
**Audited URL:** {URL}  
**Viewports Audited:** Desktop (1440×900), Tablet (768×1024), Mobile (390×844)  

---

## Executive Summary
| Category | Score / Status | Key Highlight |
|---|---|---|
| **UX & Usability** | {Grade / Score} | {Summary of visual & interaction health} |
| **Accessibility (WCAG 2.1 AA)** | {Pass / X Violations} | {Summary of a11y compliance} |
| **Mobile Responsiveness** | {Grade} | {Layout & touch target status} |
| **Lighthouse Performance** | {Score}/100 | {Key Web Vitals summary} |

---

## 1. Prioritized UX & Design Findings

### [P0] Critical Blockers
*(Broken user flows, unusable elements, critical data loss or navigation traps)*
- **Finding:** ...
- **Impact:** ...
- **Screenshot:** `audit/screenshots/...`
- **Recommended Code Fix:** ...

### [P1] Major Friction & Responsive Defects
*(Text truncation, awkward wrapping, layout shift, poor contrast on CTA)*

### [P2] Minor Polish & Consistency
*(Spacing inconsistencies, icon alignment, subtitle sizing)*

---

## 2. Accessibility (a11y) Violations Table
| Rule ID | Severity | Failing Selector | Issue | Required Fix |
|---|---|---|---|---|

---

## 3. Lighthouse Mobile Audit & Web Vitals
| Metric | Value | Target | Status |
|---|---|---|---|
| First Contentful Paint (FCP) | ... | < 1.8s | ... |
| Largest Contentful Paint (LCP) | ... | < 2.5s | ... |
| Cumulative Layout Shift (CLS) | ... | < 0.1 | ... |
| Total Blocking Time (TBT) | ... | < 200ms | ... |

---

## 4. Immediate Action Plan
Step-by-step checklist of files to edit to resolve all P0 & P1 findings.
```

### 2. Screenshots in `./audit/screenshots/`
Numbered sequentially by screen and viewport (`01-home-1440.png`, `01-home-390.png`, `02-modal-390.png`).
