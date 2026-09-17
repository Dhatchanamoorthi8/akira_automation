/**
 * Production Sitemap Generator
 * Synchronizes sitemap.xml with solutions and products data sources.
 * Generates valid sitemap XML in both public/ and dist/ (if present).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const SITE_URL = 'https://akiraautomation.com';

// 1. Static Core Public Routes
const coreRoutes = [
  { loc: `${SITE_URL}/`, priority: '1.0', changefreq: 'weekly' },
  { loc: `${SITE_URL}/about`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/solutions`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/products`, priority: '0.9', changefreq: 'weekly' },
  { loc: `${SITE_URL}/industries`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/services`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/why-choose-us`, priority: '0.8', changefreq: 'monthly' },
  { loc: `${SITE_URL}/contact`, priority: '0.8', changefreq: 'monthly' },
];

// 2. Extract Solution Slugs from src/data/solutions.ts
function extractSolutionSlugs() {
  const solutionsFilePath = path.join(rootDir, 'src', 'data', 'solutions.ts');
  const content = fs.readFileSync(solutionsFilePath, 'utf-8');
  const slugRegex = /slug:\s*["']([^"']+)["']/g;
  const slugs = new Set();
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.add(match[1]);
  }
  return Array.from(slugs);
}

// 3. Extract Product Slugs from src/data/products.ts
function extractProductSlugs() {
  const productsFilePath = path.join(rootDir, 'src', 'data', 'products.ts');
  const content = fs.readFileSync(productsFilePath, 'utf-8');
  // Match product slug definitions
  const slugRegex = /id:\s*["']([^"']+)["'],\s*slug:\s*["']([^"']+)["']/g;
  const slugs = new Set();
  let match;
  while ((match = slugRegex.exec(content)) !== null) {
    slugs.add(match[2]);
  }
  return Array.from(slugs);
}

export function generateSitemapXml() {
  const solutionSlugs = extractSolutionSlugs();
  const productSlugs = extractProductSlugs();

  const solutionRoutes = solutionSlugs.map((slug) => ({
    loc: `${SITE_URL}/solutions/${slug}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));

  const productRoutes = productSlugs.map((slug) => ({
    loc: `${SITE_URL}/products/${slug}`,
    priority: '0.8',
    changefreq: 'monthly'
  }));

  const allUrls = [
    ...coreRoutes,
    ...solutionRoutes,
    ...productRoutes
  ];

  const today = new Date().toISOString().split('T')[0];

  const xmlEntries = allUrls
    .map(
      (entry) => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join('\n');

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>
`;

  return {
    sitemapXml,
    count: allUrls.length,
    solutionsCount: solutionSlugs.length,
    productsCount: productSlugs.length
  };
}

// Execute and write files
const { sitemapXml, count, solutionsCount, productsCount } = generateSitemapXml();

// 1. Write to public/sitemap.xml
const publicSitemapPath = path.join(rootDir, 'public', 'sitemap.xml');
fs.writeFileSync(publicSitemapPath, sitemapXml, 'utf-8');
console.log(`[Sitemap] Generated ${publicSitemapPath} (${count} URLs: 8 core, ${solutionsCount} solutions, ${productsCount} products)`);

// 2. Write to dist/sitemap.xml if dist exists
const distDir = path.join(rootDir, 'dist');
if (fs.existsSync(distDir)) {
  const distSitemapPath = path.join(distDir, 'sitemap.xml');
  fs.writeFileSync(distSitemapPath, sitemapXml, 'utf-8');
  console.log(`[Sitemap] Synced to production build: ${distSitemapPath}`);
}
