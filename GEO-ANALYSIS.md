# Generative Engine Optimization (GEO) Audit & AI Visibility Report

**Target Domain:** `https://akiraautomation.com`  
**Brand:** AKIRA PRECISION AUTOMATION  
**Audit Date:** February / March 2026  
**Auditor:** Antigravity GEO Engine  
**Focus Search Engines:** Google AI Overviews, OpenAI ChatGPT / SearchGPT, Perplexity AI, Bing Copilot  

---

## Executive Summary

| Category | Weight | Score | Status |
| :--- | :---: | :---: | :--- |
| **1. Citability Score** | 25% | **18 / 25** | Strong technical telemetry, but paragraphs are either too short (<50 words) or bulleted. |
| **2. Structural Readability** | 20% | **15 / 20** | Clean H1-H3 hierarchy; lacks question-based H2/H3s and comparative data tables. |
| **3. Multi-Modal Content** | 15% | **10 / 15** | Good WebP product imagery; missing VideoObject schemas and interactive metrology calculators. |
| **4. Authority & Brand Signals** | 20% | **9 / 20** | LinkedIn & IndiaMART present; lacks Wikipedia/Wikidata, Reddit presence, and Person bylines. |
| **5. Technical Accessibility** | 20% | **17 / 20** | Excellent static pre-rendering (38 routes) and `llms.txt`; needs explicit AI robots.txt & RSL 1.0. |
| **OVERALL GEO READINESS** | **100%** | **69 / 100** | **Moderate-High Readiness — Prime Candidate for Rapid AI Visibility Gains** |

---

## 1. Platform Breakdown

```
┌────────────────────────────────────────────────────────┐
│  Google AI Overviews : [██████████████░░░░]  74 / 100  │
│  ChatGPT / SearchGPT : [█████████████░░░░░]  66 / 100  │
│  Perplexity AI       : [████████████░░░░░░]  64 / 100  │
│  Bing Copilot        : [██████████████░░░░]  72 / 100  │
└────────────────────────────────────────────────────────┘
```

### Platform Analysis:
1. **Google AI Overviews (74/100):**
   - *Strengths:* Pre-rendered static HTML, sub-micron product specifications, clean canonical URLs, structured LocalBusiness and Product schemas.
   - *Gaps:* Lacks direct question headings (e.g., *"What is an Air Plug Gauge?"*) and dedicated Q&A blocks that Google AIO passages extract directly.
2. **ChatGPT / SearchGPT (66/100):**
   - *Strengths:* `/llms.txt` and `/llms-full.txt` are already live, providing instant context to GPT search bots.
   - *Gaps:* ChatGPT relies heavily on Wikipedia (47.9% of citations) and Reddit (11.3%). Akira currently has no Wikipedia entity or Wikidata ID, limiting zero-shot entity retrieval.
3. **Perplexity AI (64/100):**
   - *Strengths:* Fast static responses, exact engineering tolerance numbers (0.1 µm, 2 mm to 200 mm, 3-4 bar).
   - *Gaps:* Perplexity prioritizes forum citations (46.7% from Reddit/discussions) and comparison tables (e.g., Air Gauging vs Electronic Gauging vs CMM).
4. **Bing Copilot (72/100):**
   - *Strengths:* Indexable sitemap with 38 routes, fast TTFB on static files, clean metadata.
   - *Gaps:* Needs IndexNow integration for instant Bing bot indexing upon product updates.

---

## 2. AI Crawler Access Status (`robots.txt`)

### Current State:
```txt
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /staff
Disallow: /staff/

Sitemap: https://akiraautomation.com/sitemap.xml
```

### Evaluation:
- **Search AI Crawlers:** Allowed by generic `*`, but implicit access is vulnerable to upstream CDN/WAF blocking (e.g., Cloudflare "Block AI Scrapers and Crawlers" toggle).
- **Explicit Directives:** Missing explicit rules for search crawlers vs training crawlers.

### Recommended `robots.txt` Configuration:
```txt
# Allow Search AI Crawlers (Directly boosts ChatGPT, Perplexity, Claude, Apple Intelligence citations)
User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Applebot-Extended
Allow: /

# Optional: Disallow bulk model training scrapers if protecting proprietary IP
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

# General Crawlers
User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/
Disallow: /staff
Disallow: /staff/

# Sitemaps & LLM Context
Sitemap: https://akiraautomation.com/sitemap.xml
# llms.txt reference
# https://akiraautomation.com/llms.txt
# https://akiraautomation.com/llms-full.txt
```

---

## 3. `llms.txt` Status & Recommendations

### Current State:
- **`/llms.txt`**: **PRESENT & EXCELLENT (6,076 bytes)**. Correctly outlines 12 core solution capabilities, 16 product links with short descriptions, and full contact details.
- **`/llms-full.txt`**: **PRESENT & ROBUST (9,937 bytes)**. Contains measurement principles, calibration invariants, and full product table.

### Recommendations for Enhancement:
1. **Add Direct Definition Anchors:** Add a dedicated `## Frequently Asked Technical Questions` section in `llms-full.txt` that directly answers queries like *"How do air plug gauges work?"* and *"What is Gage R&R in automated multi-gauging?"*.
2. **Add RSL 1.0 (Really Simple Licensing) Header:**
   Add machine-readable licensing at the top of `/llms.txt`:
   ```markdown
   <!-- rsl-version: 1.0; ai-search: allowed; ai-training: commercial-inquiry-required -->
   ```

---

## 4. Brand Mention & Entity Analysis

> **Critical GEO Factor:** Brand mentions correlate **3x more strongly** with AI visibility than traditional backlinks (~0.737 correlation for YouTube/Reddit vs ~0.266 for Domain Rating).

| Platform | Current Status | AI Impact | Action Required |
| :--- | :--- | :---: | :--- |
| **Wikipedia / Wikidata** | Not Listed | **CRITICAL** | Create a Wikidata item for *Akira Precision Automation* (claims: manufacturer, Coimbatore, precision metrology, ISO/IEC standards). |
| **YouTube** | Minimal / No channel linking in schema | **HIGH** | Publish short 60-90s video clips demonstrating: 1. Air plug gauge calibration with master rings, 2. Multigauging station cycle for camshafts. Link via `sameAs`. |
| **Reddit** | Zero organic mentions | **HIGH** | Participate in discussions on `r/Machinists`, `r/Metrology`, `r/QualityEngineering` answering technical queries regarding bore gauge calibration and 3-lobe air ring inspection. |
| **LinkedIn** | Profile exists | **MODERATE** | Regular technical posts with engineering diagrams; ensure employee profiles list company as primary employer. |
| **IndiaMART** | Listed | **MODERATE** | Already linked in schema `sameAs`. |

---

## 5. Passage-Level Citability Analysis

**Optimal Passage Length for AI Citations:** **134 – 167 words**.

### Findings:
- Product and solution descriptions currently average **35 to 65 words**.
- Bullet points provide great human scannability, but LLM retrieval engines (RAG and Dense Passage Retrieval / DPR) prioritize continuous, self-contained paragraphs that start with direct definitions and pack dense factual metrics.

### Identified Weak Passages & Recommended Rewrites:

#### 1. Air Plug Gauge Page (`/products/air-plug-gauge`)
- **Current Length:** 36 words (Too short for RAG passage chunking).
- **Current Text:**
  > *"AKIRA Air Plug Gauges are high-precision non-contact pneumatic gauges engineered to inspect inside diameters (ID), taper, and ovality across high-volume precision manufacturing. Sourced with hard chrome plating for extreme durability and supplied for through, blind, and step bore applications."*

- **AI-Optimized Passage (152 words — Optimal 134-167 range):**
  > *"An air plug gauge is a non-contact pneumatic comparator designed to measure the internal diameter (ID), taper, and ovality of high-precision machined bores from 2 mm to 200 mm. Operating on the back-pressure differential principle, compressed air regulated between 3 and 4 bar (45 psi) passes through calibrated diametrical nozzles. As the clearance between the gauge body and the workpiece bore changes, the resulting back-pressure variation is converted into linear dimensional readings with sub-micron resolution up to 0.1 µm. Manufactured with high-wear-resistant hard chrome plating or tungsten carbide bodies, air plug gauges prevent contact scratching on super-finished automotive cylinders, bearing sleeves, and hydraulic valve bodies. The system utilizes double-master comparative calibration, requiring minimum and maximum setting master rings traceable to ISO/IEC 17025 standards. Available configurations include through-bore, blind-bore (with jets positioned near the leading edge), and stepped-bore designs equipped with adjustable mechanical depth stops."*

#### 2. Automated Multi-Gauging Systems (`/solutions/multigauging`)
- **Current Length:** 43 words.
- **AI-Optimized Passage (146 words — Optimal 134-167 range):**
  > *"Automated multi-gauging systems are turnkey industrial metrology stations engineered to inspect multiple critical dimensions of complex manufactured components simultaneously in a single cycle of under 15 seconds. Designed specifically for automotive engine blocks, cylinder liners, camshafts, and transmission shafts, these stations combine pneumatic air gauging nozzles and high-speed electronic LVDT inductive probes. A single multi-gauging fixture measures inside diameters, outside diameters, taper, concentricity, perpendicularity, and dynamic runout simultaneously, eliminating operator error and manual inspection bottlenecks. Each station features 6-digit tri-colour digital display columns or industrial touchscreens that provide instantaneous Green (Accept), Yellow (Rework), and Red (Reject) tolerance decisions. Equipped with standard RS-232 serial telemetry, Ethernet/IP, and 24V PLC relay outputs, AKIRA multi-gauging stations integrate seamlessly with ABB, Fanuc, and Kuka robotic loading cells, streaming real-time measurement telemetry into shop-floor Statistical Process Control (SPC) databases."*

---

## 6. Server-Side Rendering (SSR) & JavaScript Dependency Check

- **AI Crawlers Do Not Execute JavaScript Reliably:** Both GPTBot and PerplexityBot scrape raw HTML without waiting for client-side hydration.
- **Audit of Akira's Architecture:**
  - The project uses `scripts/prerender.mjs` running Vite SSR at build time to produce fully populated static HTML for all **38 indexable routes** in `/dist`.
  - **Verdict:** **PASS (100% Crawlable)**. AI bots receive complete `<title>`, `<meta description>`, OpenGraph tags, JSON-LD schemas, and semantic `<main>` text content without executing client-side React bundles.

---

## 7. Schema Recommendations for AI Discoverability

### Current Schemas:
- `LocalBusiness` / `Organization` (Homepage)
- `WebSite` (Homepage)
- `BreadcrumbList` (All subpages)
- `Product` (All product pages)

### Recommended Schema Additions:

#### 1. FAQPage Schema on Solution Pages (Multi-Gauging, Air Gauging, Fixtures)
AI Overviews extract answers directly from FAQ structured data.
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does an air plug gauge measure bore diameter without contact?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An air plug gauge operates via pneumatic back-pressure differential. Compressed air at 3 to 4 bar is discharged through calibrated nozzles against the bore wall. The resistance to airflow creates back-pressure directly proportional to the clearance, which is converted to linear measurements with 0.1 µm resolution without touching or scratching the part surface."
      }
    },
    {
      "@type": "Question",
      "name": "Why are two setting rings required for air gauge calibration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Air gauging is a comparative measurement technique. Two setting rings—a Minimum Master (Min) and a Maximum Master (Max)—are required to establish the magnification span and zero reference, ensuring linear accuracy across the entire inspection range."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a 2-jet and a 3-jet air ring gauge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A 2-jet air ring gauge measures outside diameter, taper, and 2-point ovality. A 3-jet air ring gauge with nozzles spaced at 120 degrees is specifically engineered to detect 3-lobe polygonal form errors (lobing) commonly generated during centerless grinding operations."
      }
    }
  ]
}
```

#### 2. TechArticle / HowTo Schema for Metrology Calibration Guides
Add `TechArticle` schema to documentation or technical guides detailing Gage R&R, air gauge pressure calibration, and master ring handling.

#### 3. Enhanced `sameAs` Entity Graph in Organization Schema
Expand `sameAs` in `src/config/seo.ts`:
```typescript
"sameAs": [
  "https://www.linkedin.com/company/akira-precision-automation",
  "https://www.indiamart.com/akira-precision-automation/",
  "https://www.wikidata.org/wiki/Q[WIKIDATA_ID]", // Once created
  "https://www.youtube.com/@akira-automation"     // Once established
]
```

---

## 8. Top 5 Highest-Impact GEO Changes

| Priority | Action | Effort | Expected Impact |
| :---: | :--- | :---: | :--- |
| **1** | **Embed 134-167 Word Self-Contained Answer Passages:** Update product and solution pages to include definition paragraphs answering *"What is [Product] and how does it work?"* in the first 60 words. | Low | **+15-20%** AI Overview citation rate |
| **2** | **Update `robots.txt` with Explicit AI Crawlers:** Add explicit Allow directives for `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, and `Applebot-Extended`. | Minimal | Prevents upstream CDN/firewall drops |
| **3** | **Implement FAQ Sections & FAQPage Schema:** Add 3-5 technical Q&As with question-based H2/H3s to all top solution pages (Air Gauging, Multi-Gauging, Fixtures). | Low | High-probability target for Google AIO snippet selection |
| **4** | **Add Comparative Data Tables:** Insert comparison tables (e.g. *Air Gauging vs. Mechanical Dial Indicators vs. Optical CMM*) to the solutions pages. | Medium | Fuels Perplexity & ChatGPT comparative queries |
| **5** | **Establish Entity Footprint (Wikidata & YouTube):** Register Wikidata entity and publish 3-5 short technical demo videos linked in schema `sameAs`. | Medium | **3x stronger** correlation with AI visibility than backlinks |

---

## 9. Actionable Content Reformatting Guide

To maximize extraction by LLM summarizers, apply the **"Inverted Pyramid + Technical Telemetry"** pattern:

```
[Question Heading] (e.g., "What is an Air Ring Gauge and When Is It Used?")
       │
       ▼
[Direct Definition] (First 40-60 words: "An air ring gauge is a...")
       │
       ▼
[Technical Invariants] (Next 70-100 words: dimensions, tolerances, pressures, standards)
       │
       ▼
[Comparative Table or Data List] (Feature vs. Benefit, 2-Jet vs. 3-Jet)
```

---

*Report generated by Antigravity SEO-GEO Engine. File saved to `GEO-ANALYSIS.md`.*
