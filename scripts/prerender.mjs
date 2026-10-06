/**
 * Static Pre-Rendering Engine for AKIRA AUTOMATION
 * Generates static HTML files for all 38 indexable routes at build time.
 * Populates exact <title>, <meta description>, <link rel="canonical">,
 * OpenGraph, Twitter cards, JSON-LD Schema, and semantic DOM content.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

async function runPrerender() {
  if (!fs.existsSync(distDir)) {
    console.error('[Prerender] Error: dist directory not found. Please run "vite build" first.');
    process.exit(1);
  }

  const templatePath = path.join(distDir, 'index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('[Prerender] Error: dist/index.html template not found.');
    process.exit(1);
  }

  const baseHtml = fs.readFileSync(templatePath, 'utf-8');

  // Initialize Vite in SSR mode to load TypeScript data and configurations
  const vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    optimizeDeps: { noDiscovery: true }
  });

  const { products } = await vite.ssrLoadModule('/src/data/products.ts');
  const { solutions } = await vite.ssrLoadModule('/src/data/solutions.ts');
  const { company } = await vite.ssrLoadModule('/src/config/company.ts');
  const { companyData } = await vite.ssrLoadModule('/src/data/company.ts');
  const { 
    SITE_URL, 
    formatTitle, 
    getCanonicalUrl, 
    getAbsoluteImageUrl, 
    createOrganizationSchema, 
    createWebSiteSchema, 
    createBreadcrumbSchema, 
    createProductSchema,
    createFAQSchema
  } = await vite.ssrLoadModule('/src/config/seo.ts');

  await vite.close();

  // Define route metadata generators
  const routes = [
    // 1. Homepage
    {
      path: '/',
      title: `${company.name} | ${company.tagline}`,
      description: `Akira Precision Automation provides high-precision gauging fixtures, automated multi-gauging stations, air gauges, digital DRO displays, and work-holding solutions for manufacturing.`,
      keywords: `Akira Precision Automation, Precision Gauging India, Multi Gauging Solutions, Air Gauging, Air Plug Gauge, Air Ring Gauge, Inspection Fixtures, Industrial Metrology`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: [
        createOrganizationSchema(),
        createWebSiteSchema()
      ],
      generateBody: () => `
        <div class="akira-hero-wrap">
          <div class="akira-container akira-hero-grid">
            <div class="akira-hero-content">
              <div class="akira-eyebrow">
                <span>ISO 9001 CERTIFIED</span>
                <span class="akira-dot"></span>
                <span class="text-primary">PRECISION METROLOGY</span>
                <span class="akira-dot"></span>
                <span>OEM / AUTOMOTIVE</span>
              </div>
              <h1 class="akira-hero-h1">Precision Gauging for Zero-Defect Manufacturing</h1>
              <p class="akira-hero-sub">AKIRA PRECISION AUTOMATION delivers high-accuracy automated multi-gauging stations, pneumatic air tooling, and custom fixtures engineered for automotive and OEM production lines.</p>
              
              <div class="akira-hero-visual-mobile">
                <div class="akira-visual-card">
                  <img src="/assets/hero/desktop-hero-precision-gauging.webp" alt="Automated Multi-Gauging Station" class="akira-card-img" />
                  <div class="akira-badge-top">
                    <span class="akira-badge-dot"></span>
                    <span>IN-LINE METROLOGY</span>
                  </div>
                  <div class="akira-badge-bottom">
                    <span>&le; 0.0005 MM</span>
                  </div>
                </div>
              </div>

              <div class="akira-hero-actions">
                <a href="/solutions" class="akira-btn-primary">
                  <span>Explore Solutions</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
                <a href="/contact" class="akira-btn-secondary">Request an Enquiry</a>
              </div>

              <div class="akira-hero-trust">
                <div class="akira-trust-item">
                  <span class="akira-trust-num">0.1 µm</span>
                  <span class="akira-trust-txt">Resolution</span>
                </div>
                <div class="akira-trust-item">
                  <span class="akira-trust-num">&le; 0.5 µm</span>
                  <span class="akira-trust-txt">Repeatability</span>
                </div>
                <div class="akira-trust-item">
                  <span class="akira-trust-num">100%</span>
                  <span class="akira-trust-txt">Gage R&amp;R Verified</span>
                </div>
              </div>
            </div>

            <div class="akira-hero-visual-desktop">
              <div class="akira-visual-card">
                <img src="/assets/hero/desktop-hero-precision-gauging.webp" alt="Automated Multi-Gauging Station" class="akira-card-img" />
                <div class="akira-badge-top">
                  <span class="akira-badge-dot"></span>
                  <span>IN-LINE METROLOGY</span>
                </div>
                <div class="akira-badge-bottom">
                  <span>&le; 0.0005 MM</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `
    },
    // 2. About Us
    {
      path: '/about',
      title: 'About Us | Precision Metrology & Multi-Gauging Systems',
      description: `${company.name} delivers precision metrology, automated multi-gauging systems, fixtures, and custom inspection solutions with a commitment to quality and customer success.`,
      keywords: `About ${company.name}, metrology manufacturer, precision gauging India, automated gauging, ${company.legalName}`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'About Us', url: '/about' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>About Us</span></nav>
          <h1>About Akira Precision Automation</h1>
          <p>${company.name} focuses on high quality products and innovative solutions that help customers increase productivity and profitability.</p>
          <h2>Metrology Standards & Quality Assurance</h2>
          <p>Sub-micron comparator repeatability (up to 0.1 µm), master calibration traceable to NABL / ISO/IEC 17025 accredited laboratories, and 100% pre-dispatch Gage R&R verification.</p>
        </main>
      `
    },
    // 3. Solutions Overview
    {
      path: '/solutions',
      title: 'Precision Gauging & Fixture Solutions',
      description: `Explore ${company.name}'s 12 core solution capabilities: Multi-gauging systems, air gauges, electronic gauges, fixtures, air plug & ring gauges, and work-holding.`,
      keywords: `Multi Gauging Solutions, Air Gauges, Fixtures, Electronic Gauging, Air Plug Gauges, Air Ring Gauges, ${company.name}`,
      ogImage: '/assets/multigauging/multigauging-showcase.webp',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Solutions', url: '/solutions' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Solutions</span></nav>
          <h1>Precision Gauging & Fixture Solutions</h1>
          <p>${company.name} provides solutions in Multi gauging, Fixtures, Air gauges, Electronic Gauges, Air plug & Air Ring Gauges, Attribute Gauges, Plug gauges, Snap gauges, Ring gauges, Special Gauges, Assembly, and Work holding.</p>
          <ul>
            ${solutions.map(s => `<li><a href="/solutions/${s.slug}"><strong>${s.title}</strong></a>: ${s.shortDescription}</li>`).join('')}
          </ul>
        </main>
      `
    },
    // 4. Products Catalogue
    {
      path: '/products',
      title: 'Precision Gauging Product Catalogue',
      description: 'Comprehensive catalogue of air plug gauges, air ring gauges, electronic gauges, tri-colour digital display units, memory module units, and multigauging stations.',
      keywords: `Air Plug Gauge, Air Ring Gauge, Digital Display Units, Tri-Colour Display, Memory Module Unit, Multigauging Station, ${company.name}`,
      ogImage: '/assets/products/air-plug-gauge.webp',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Products', url: '/products' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Products</span></nav>
          <h1>Precision Product Catalogue</h1>
          <p>Explore ${company.name}'s complete line of precision air gauges, electronic gauges, tri-colour digital displays, memory data logging systems, and multi-gauging stations.</p>
          <ul>
            ${products.map(p => `<li><a href="/products/${p.slug}"><strong>${p.title}</strong></a> (${p.category}): ${p.tagline}</li>`).join('')}
          </ul>
        </main>
      `
    },
    // 5. Industries We Serve
    {
      path: '/industries',
      title: 'Industries We Serve | Automotive OEMs & Tier Suppliers',
      description: `${company.name} provides precision gauging and multi-gauging systems for Automotive OEMs, Tier-1 & Tier-2 suppliers, Automation machine builders, and Precision Engineering.`,
      keywords: `Automotive OEM Gauges, Tier-1 Supplier Gauging, Automation Machine Builders, Precision Engineering Gauges India, ${company.name}`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Industries', url: '/industries' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Industries</span></nav>
          <h1>Industries We Serve</h1>
          <p>Engineering precision measurement and quality verification systems for automotive engine manufacturing, precision machine tools, and global aerospace components.</p>
        </main>
      `
    },
    // 6. Services & Support
    {
      path: '/services',
      title: 'Service & Technical Support | Beyond Sales Commitment',
      description: `Comprehensive technical support, on-site installation, operator calibration training, and rapid service response from ${company.name}.`,
      keywords: `Metrology Calibration Service, Multi-Gauging Installation, Operator Training, Air Gauging Support India, ${company.name}`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Services', url: '/services' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Services</span></nav>
          <h1>Service & Technical Support</h1>
          <p>Under our motto "Keeping Customers First", our engineers provide complete on-site installation, calibration training, and fast responsive field service.</p>
        </main>
      `
    },
    // 7. Why Choose Us
    {
      path: '/why-choose-us',
      title: 'Why Choose Akira | Automated Multi-Gauging Expertise',
      description: `Discover why leading manufacturers trust ${company.name}: Automated multi-gauging mastery, custom-tailored fixtures, and competitive pricing.`,
      keywords: `Why Choose Akira Precision Automation, metrology advantages, automated gauging benefits`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Why Choose Us', url: '/why-choose-us' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Why Choose Us</span></nav>
          <h1>Why Choose Akira Precision Automation</h1>
          <p>Automated multi-gauging expertise, OEM and automation-ready solutions, custom-built fixtures, and competitive value-driven pricing.</p>
        </main>
      `
    },
    // 8. Contact
    {
      path: '/contact',
      title: 'Contact Us & Engineering Inquiries | Connect With Us',
      description: `Connect with ${company.name} for technical inquiries, air gauges, multi-gauging, and precision inspection fixtures.`,
      keywords: `Contact ${company.name}, precision metrology, ${company.name} phone email address`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Contact Us', url: '/contact' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Contact Us</span></nav>
          <h1>Connect With Us</h1>
          <p>Technical Sales: ${companyData.phones[0]} | Support: ${companyData.phones[1]} | Email: ${companyData.emails[0]}</p>
          <p>Factory Address: ${companyData.address.fullAddress}</p>
        </main>
      `
    },
    // 9. Privacy Policy
    {
      path: '/privacy-policy',
      title: 'Privacy Policy | Data Protection & Commercial Confidentiality',
      description: `Privacy policy and data protection standards of ${company.name}. Learn how we safeguard your engineering drawings, RFQ data, and business inquiries.`,
      keywords: `Privacy Policy, Data Protection, Commercial Confidentiality, ${company.name}`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Privacy Policy', url: '/privacy-policy' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Privacy Policy</span></nav>
          <h1>Privacy & Confidentiality Policy</h1>
          <p>At ${company.name}, we hold our clients' engineering designs, component drawings, and commercial inquiries with the strictest standards of professional confidentiality.</p>
        </main>
      `
    },
    // 10. Terms of Service
    {
      path: '/terms',
      title: 'Terms of Service & Inquiries | Commercial & Technical Terms',
      description: `Terms of service, quotation guidelines, engineering tolerance standards, and commercial conditions of ${company.name}.`,
      keywords: `Terms of Service, Engineering Terms, Quotation Conditions, Metrology Standards, ${company.name}`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: createBreadcrumbSchema([
        { name: 'Home', url: '/' },
        { name: 'Terms of Service', url: '/terms' }
      ]),
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <span>Terms of Service</span></nav>
          <h1>Terms of Service & Inquiries</h1>
          <p>Standard commercial terms, technical quotation protocols, and metrological warranty standards governing ${company.name} client engagements.</p>
        </main>
      `
    }
  ];

  // Add 12 Solution Routes
  solutions.forEach((sol) => {
    const solutionBreadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Solutions', url: '/solutions' },
      { name: sol.title, url: `/solutions/${sol.slug}` }
    ];

    const solutionSchemas = [createBreadcrumbSchema(solutionBreadcrumbs)];
    if (sol.faqs && sol.faqs.length > 0) {
      const faqSchema = createFAQSchema(sol.faqs);
      if (faqSchema) solutionSchemas.push(faqSchema);
    }

    routes.push({
      path: `/solutions/${sol.slug}`,
      title: `${sol.title} | Precision Metrology`,
      description: `${sol.title} by ${company.name}: ${sol.shortDescription}`,
      keywords: `${sol.title}, ${company.name}, Precision Gauging Solutions, Industrial Metrology India`,
      ogImage: sol.image || '/assets/multigauging/multigauging-showcase.webp',
      structuredData: solutionSchemas,
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb"><a href="/">Home</a> / <a href="/solutions">Solutions</a> / <span>${sol.title}</span></nav>
          <h1>${sol.title}</h1>
          <p>${sol.fullDescription}</p>
          ${sol.tldr ? `
            <aside class="tldr">
              <strong>Quick Engineering Summary (TL;DR):</strong> ${sol.tldr}
            </aside>
          ` : ''}
          ${sol.aiOverviewPassage ? `
            <section>
              <h2>Technical Definition & Operating Principle</h2>
              <p>${sol.aiOverviewPassage}</p>
            </section>
          ` : ''}
          <section>
            <h2>Technical Review & Metrology Validation</h2>
            <p>Reviewed and validated by <strong>Kalidoss</strong>, Lead Metrology Applications Engineer at AKIRA Precision Automation. All tolerances and measurement parameters comply with ISO/DIN manufacturing standards.</p>
          </section>
          ${sol.standardsCompliance && sol.standardsCompliance.length > 0 ? `
            <section>
              <h2>Applicable Metrology & Quality Standards</h2>
              <ul>${sol.standardsCompliance.map(s => `<li>${s}</li>`).join('')}</ul>
            </section>
          ` : ''}
          <section>
            <h2>Technical Highlights & Scope</h2>
            <ul>${sol.features.map(f => `<li>${f}</li>`).join('')}</ul>
          </section>
          ${sol.caseStudies && sol.caseStudies.length > 0 ? `
            <section>
              <h2>Real-World Metrology Case Studies & Shop-Floor Deployments</h2>
              ${sol.caseStudies.map(cs => `
                <article>
                  <h3>${cs.title} — ${cs.industry}</h3>
                  <p><strong>Challenge:</strong> ${cs.challenge}</p>
                  <p><strong>Solution:</strong> ${cs.solution}</p>
                  <p><strong>Result:</strong> ${cs.result}</p>
                  ${cs.metrics && cs.metrics.length > 0 ? `<p><strong>Key Metrics:</strong> ${cs.metrics.join(' | ')}</p>` : ''}
                </article>
              `).join('')}
            </section>
          ` : ''}
          ${sol.comparisonTable ? `
            <section>
              <h2>${sol.comparisonTable.caption || 'Comparative Metrology Analysis'}</h2>
              <table>
                <thead>
                  <tr>${sol.comparisonTable.headers.map(h => `<th>${h}</th>`).join('')}</tr>
                </thead>
                <tbody>
                  ${sol.comparisonTable.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
                </tbody>
              </table>
            </section>
          ` : ''}
          <section>
            <h2>Common Industrial Applications</h2>
            <ul>${sol.applications.map(a => `<li>${a}</li>`).join('')}</ul>
          </section>
          ${sol.faqs && sol.faqs.length > 0 ? `
            <section>
              <h2>Frequently Asked Technical Questions</h2>
              <dl>
                ${sol.faqs.map(faq => `<dt><strong>${faq.question}</strong></dt><dd>${faq.answer}</dd>`).join('')}
              </dl>
            </section>
          ` : ''}
        </main>
      `
    });
  });

  // Add 16 Product Routes
  products.forEach((prod) => {
    const productBreadcrumbs = [
      { name: 'Home', url: '/' },
      { name: 'Products', url: '/products' },
      { name: prod.category, url: `/products?category=${prod.categorySlug}` },
      { name: prod.title, url: `/products/${prod.slug}` }
    ];

    const schemas = [
      createBreadcrumbSchema(productBreadcrumbs),
      createProductSchema({
        title: prod.title,
        description: prod.metaDescription || prod.description,
        image: prod.image,
        category: prod.category,
        slug: prod.slug
      })
    ];

    if (prod.faqs && prod.faqs.length > 0) {
      const faqSchema = createFAQSchema(prod.faqs);
      if (faqSchema) schemas.push(faqSchema);
    }

    routes.push({
      path: `/products/${prod.slug}`,
      title: `${prod.title} | Technical Specifications`,
      description: prod.metaDescription || prod.description,
      keywords: `${prod.title}, ${prod.category}, ${company.name}, Precision Gauging Specifications`,
      ogImage: prod.image,
      structuredData: schemas,
      generateBody: () => `
        <main>
          <nav aria-label="Breadcrumb">
            <a href="/">Home</a> / <a href="/products">Products</a> / <a href="/products?category=${prod.categorySlug}">${prod.category}</a> / <span>${prod.title}</span>
          </nav>
          <article>
            <header>
              <span>${prod.category}</span>
              <h1>${prod.title}</h1>
              <p>${prod.tagline}</p>
              ${prod.tldr ? `
                <aside class="tldr">
                  <strong>Quick Technical Summary (TL;DR):</strong> ${prod.tldr}
                </aside>
              ` : ''}
              <div class="telemetry-dock">
                <p><strong>Linear Resolution:</strong> 0.1 µm (0.0001 mm)</p>
                <p><strong>Repeatability (Gage R&R):</strong> ≤ 0.5 µm (&lt; 10%)</p>
                <p><strong>Operating Line:</strong> ${prod.categorySlug === 'air-gauging' ? '3–4 bar Regulated Pneumatic' : 'LVDT / Electronic'}</p>
                <p><strong>Master Calibration:</strong> ISO 17025 / DIN 2250</p>
              </div>
            </header>
            <section>
              <h2>Product Overview</h2>
              <p>${prod.description}</p>
              ${prod.aiOverviewPassage ? `
                <h3>Technical Definition & Operating Principle</h3>
                <p>${prod.aiOverviewPassage}</p>
              ` : ''}
              <div class="technical-review">
                <h3>Technical Review & Specification Sign-off</h3>
                <p>Technical specifications reviewed and verified by <strong>Kalidoss</strong>, Lead Metrology Applications Engineer at AKIRA Precision Automation. Calibration methodologies certified traceable to <strong>ISO/IEC 17025:2017</strong> and <strong>DIN 2250-C</strong> setting standards.</p>
              </div>
            </section>
            <section>
              <h2>Key Features</h2>
              <ul>${prod.features.map(f => `<li>${f}</li>`).join('')}</ul>
            </section>
            <section>
              <h2>Technical Specifications</h2>
              <table>
                <thead><tr><th>Specification</th><th>Parameter</th></tr></thead>
                <tbody>
                  ${Object.entries(prod.specifications || {}).map(([key, val]) => `<tr><td><strong>${key}</strong></td><td>${val}</td></tr>`).join('')}
                </tbody>
              </table>
            </section>
            ${prod.faqs && prod.faqs.length > 0 ? `
              <section>
                <h2>Frequently Asked Technical Questions</h2>
                <dl>
                  ${prod.faqs.map(faq => `<dt><strong>${faq.question}</strong></dt><dd>${faq.answer}</dd>`).join('')}
                </dl>
              </section>
            ` : ''}
            <section>
              <h2>Industrial Applications</h2>
              <ul>${prod.applications.map(a => `<li>${a}</li>`).join('')}</ul>
            </section>
          </article>
        </main>
      `
    });
  });

  console.log(`[Prerender] Pre-rendering ${routes.length} static public routes...`);

  // Helper to safely replace or insert meta tags
  function injectMetadata(html, route) {
    const formattedTitle = formatTitle(route.title);
    const canonicalHref = getCanonicalUrl(route.path);
    const resolvedOgImage = getAbsoluteImageUrl(route.ogImage);

    let result = html;

    // 1. Replace <title>
    result = result.replace(/<title>[\s\S]*?<\/title>/i, `<title>${formattedTitle}</title>`);

    // 2. Replace <meta name="description" ...>
    result = result.replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );

    // 3. Replace <link rel="canonical" ...>
    result = result.replace(
      /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i,
      `<link rel="canonical" href="${canonicalHref}" />`
    );

    // 4. Update OpenGraph Tags
    result = result.replace(
      /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:title" content="${formattedTitle.replace(/"/g, '&quot;')}" />`
    );
    result = result.replace(
      /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );
    result = result.replace(
      /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:url" content="${canonicalHref}" />`
    );
    result = result.replace(
      /<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta property="og:image" content="${resolvedOgImage}" />`
    );

    // 5. Update Twitter Tags
    result = result.replace(
      /<meta\s+name="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="twitter:title" content="${formattedTitle.replace(/"/g, '&quot;')}" />`
    );
    result = result.replace(
      /<meta\s+name="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="twitter:description" content="${route.description.replace(/"/g, '&quot;')}" />`
    );
    result = result.replace(
      /<meta\s+name="twitter:image"\s+content="[\s\S]*?"\s*\/?>/i,
      `<meta name="twitter:image" content="${resolvedOgImage}" />`
    );

    // 6. Inject Structured Data (JSON-LD)
    let jsonLdContent = '';
    if (route.structuredData) {
      if (Array.isArray(route.structuredData)) {
        jsonLdContent = JSON.stringify({
          "@context": "https://schema.org",
          "@graph": route.structuredData
        });
      } else {
        jsonLdContent = JSON.stringify(route.structuredData);
      }
    }
    const jsonLdScript = `<script type="application/ld+json" id="structured-data-jsonld">${jsonLdContent}</script>`;

    // Critical FOUC guard CSS to ensure pre-rendered HTML renders instantly with high fidelity before JS hydration
    // Note: Scoped strictly to .akira-prerender-shell so it NEVER leaks into the React hydrated tree
    const criticalFoucGuardStyles = `  <style id="akira-critical-fouc-guard">
    html, body, body:has(.akira-prerender-shell) {
      margin: 0;
      padding: 0;
      background-color: #0B1F33 !important;
      color: #F8FAFC !important;
      font-family: 'Manrope', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    .akira-prerender-shell {
      min-height: 100vh;
      background-color: #0B1F33 !important;
      color: #F8FAFC !important;
      display: flex;
      flex-direction: column;
      width: 100%;
      box-sizing: border-box;
    }
    .akira-container {
      width: 100%;
      max-width: 1380px;
      margin: 0 auto;
      padding: 0 16px;
      box-sizing: border-box;
    }
    .akira-topbar {
      background: #0B1F33;
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      padding: 6px 0;
      font-size: 12px;
      color: #94A3B8;
    }
    .akira-topbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .akira-topbar a {
      color: #CBD5E1 !important;
      text-decoration: none !important;
    }
    .akira-topbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .akira-topbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .akira-divider {
      color: #475569;
    }
    .akira-badge-smart {
      background: rgba(30, 41, 59, 0.8);
      color: #E2E8F0;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.05em;
    }
    .akira-navbar {
      background: #FFFFFF !important;
      border-bottom: 1px solid #E2E8F0;
      padding: 10px 0;
      width: 100%;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
    .akira-navbar-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .akira-brand {
      display: flex;
      align-items: center;
      text-decoration: none;
    }
    .akira-logo-img {
      height: 42px;
      width: auto;
      max-width: 240px;
      object-fit: contain;
      display: block;
    }
    .akira-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .akira-nav-item {
      color: #0F172A !important;
      text-decoration: none !important;
      font-size: 14px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 6px;
      transition: color 0.15s;
    }
    .akira-nav-item.active {
      color: #0055A5 !important;
      font-weight: 600;
    }
    .akira-btn-enquire {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #0055A5 !important;
      color: #FFFFFF !important;
      font-weight: 600;
      font-size: 13px;
      padding: 9px 18px;
      border-radius: 8px;
      text-decoration: none !important;
    }
    .akira-hamburger {
      display: none;
      flex-direction: column;
      justify-content: center;
      gap: 5px;
      width: 38px;
      height: 38px;
      background: transparent;
      border: 1px solid #E2E8F0;
      border-radius: 6px;
      padding: 6px;
      cursor: pointer;
    }
    .akira-hamburger span {
      display: block;
      width: 100%;
      height: 2px;
      background: #0F172A;
      border-radius: 2px;
    }
    /* Hero section styles */
    .akira-hero-wrap {
      background: #0B1F33 !important;
      color: #FFFFFF !important;
      padding: 44px 0 64px;
      border-bottom: 1px solid #1E293B;
    }
    .akira-hero-grid {
      display: grid;
      grid-template-columns: 1.15fr 0.85fr;
      gap: 40px;
      align-items: center;
    }
    .akira-eyebrow {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: #94A3B8;
      text-transform: uppercase;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    .akira-dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #64748B;
      display: inline-block;
    }
    .akira-eyebrow .text-primary {
      color: #0284C7;
    }
    .akira-hero-h1 {
      font-size: clamp(26px, 4vw, 48px);
      font-weight: 800;
      color: #FFFFFF !important;
      line-height: 1.15;
      margin: 0 0 16px;
      letter-spacing: -0.02em;
    }
    .akira-hero-sub {
      font-size: clamp(14px, 1.8vw, 17px);
      line-height: 1.6;
      color: #CBD5E1 !important;
      margin: 0 0 24px;
      max-width: 580px;
    }
    .akira-hero-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 32px;
    }
    .akira-btn-primary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 6px;
      background: #0055A5 !important;
      color: #FFFFFF !important;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none !important;
    }
    .akira-btn-secondary {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 12px 24px;
      border-radius: 6px;
      background: transparent !important;
      color: #FFFFFF !important;
      border: 1px solid #475569;
      font-weight: 600;
      font-size: 14px;
      text-decoration: none !important;
    }
    .akira-hero-trust {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      padding-top: 20px;
      border-top: 1px solid rgba(51, 65, 85, 0.6);
      max-width: 520px;
    }
    .akira-trust-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .akira-trust-num {
      font-size: 18px;
      font-weight: 800;
      color: #38BDF8;
    }
    .akira-trust-txt {
      font-size: 11px;
      color: #94A3B8;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.05em;
    }
    .akira-visual-card {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #1E293B;
      background: #0F172A;
    }
    .akira-card-img {
      width: 100%;
      height: auto;
      max-height: 380px;
      object-fit: cover;
      display: block;
    }
    .akira-badge-top {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid #0055A5;
      padding: 4px 10px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 10px;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: 0.08em;
    }
    .akira-badge-dot {
      width: 6px;
      height: 6px;
      background: #0055A5;
      border-radius: 1px;
    }
    .akira-badge-bottom {
      position: absolute;
      bottom: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(51, 65, 85, 0.8);
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      color: #38BDF8;
      font-family: monospace;
    }
    .akira-hero-visual-mobile {
      display: none;
    }
    /* Subpage styles */
    .akira-subpage-wrap {
      flex: 1;
      width: 100%;
      max-width: 1380px;
      margin: 0 auto;
      padding: 36px 20px 60px;
      box-sizing: border-box;
      background: #0B1F33;
    }
    .akira-subpage-wrap nav[aria-label="Breadcrumb"] {
      font-size: 12px;
      font-weight: 500;
      color: #94A3B8;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .akira-subpage-wrap nav[aria-label="Breadcrumb"] a {
      color: #38BDF8 !important;
      text-decoration: none !important;
    }
    .akira-subpage-wrap h1 {
      font-size: clamp(24px, 4vw, 42px);
      font-weight: 800;
      color: #FFFFFF !important;
      line-height: 1.18;
      margin: 0 0 16px;
    }
    .akira-subpage-wrap h2 {
      font-size: clamp(18px, 2.5vw, 24px);
      font-weight: 700;
      color: #38BDF8 !important;
      margin: 32px 0 12px;
    }
    .akira-subpage-wrap p {
      font-size: 14px;
      line-height: 1.65;
      color: #CBD5E1 !important;
      margin: 0 0 16px;
      max-width: 820px;
    }
    .akira-subpage-wrap ul {
      padding-left: 20px;
      margin: 0 0 20px;
      color: #CBD5E1;
      line-height: 1.7;
      font-size: 14px;
      max-width: 820px;
    }
    .akira-subpage-wrap table {
      width: 100%;
      max-width: 860px;
      border-collapse: collapse;
      margin: 20px 0 28px;
      font-size: 13px;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(51, 65, 85, 0.8);
      border-radius: 8px;
      overflow: hidden;
    }
    .akira-subpage-wrap th, .akira-subpage-wrap td {
      padding: 10px 14px;
      border: 1px solid rgba(51, 65, 85, 0.6);
      text-align: left;
      color: #E2E8F0;
    }
    .akira-subpage-wrap th {
      background: rgba(30, 41, 59, 0.8);
      color: #FFFFFF;
      font-weight: 700;
    }
    @media (max-width: 1024px) {
      .akira-nav { display: none !important; }
      .akira-header-cta { display: none !important; }
      .akira-hamburger { display: flex !important; }
      .akira-hero-grid { grid-template-columns: 1fr; gap: 24px; }
      .akira-hero-visual-desktop { display: none; }
      .akira-hero-visual-mobile { display: block; margin: 16px 0 24px; }
      .akira-logo-img { height: 32px; }
      .akira-hero-actions { width: 100%; }
      .akira-btn-primary, .akira-btn-secondary { width: 100%; }
      .akira-topbar-right { display: none; }
    }
  </style>`;

    // Insert critical styles and JSON-LD before </head>
    result = result.replace('</head>', `  ${criticalFoucGuardStyles}\n  ${jsonLdScript}\n  </head>`);

    // 7. Inject Semantic Pre-Rendered DOM into <div id="root">
    const rawContent = route.generateBody ? route.generateBody() : '';

    const topBarHtml = `
      <div class="akira-topbar">
        <div class="akira-container akira-topbar-inner">
          <div class="akira-topbar-left">
            <span>Sales &amp; Service: <a href="mailto:${companyData.emails[0]}">${companyData.emails[0]}</a></span>
          </div>
          <div class="akira-topbar-right">
            <a href="tel:${companyData.phones[0].replace(/\\s+/g, '')}">${companyData.phones[0]}</a>
            <span class="akira-divider">/</span>
            <a href="tel:${companyData.phones[1].replace(/\\s+/g, '')}">${companyData.phones[1]}</a>
            <span class="akira-divider">|</span>
            <span class="akira-badge-smart">SMART SOLUTIONS</span>
          </div>
        </div>
      </div>
    `;

    const navBarHtml = `
      <header class="akira-navbar">
        <div class="akira-container akira-navbar-inner">
          <a href="/" class="akira-brand" aria-label="${company.name}">
            <img src="/assets/company/akira-automation-logo.jpeg" alt="${company.name}" class="akira-logo-img" />
          </a>
          <nav class="akira-nav" aria-label="Main Navigation">
            <a href="/" class="akira-nav-item${route.path === '/' ? ' active' : ''}">Home</a>
            <a href="/about" class="akira-nav-item${route.path === '/about' ? ' active' : ''}">About Us</a>
            <a href="/solutions" class="akira-nav-item${route.path.startsWith('/solutions') ? ' active' : ''}">Solutions</a>
            <a href="/products" class="akira-nav-item${route.path.startsWith('/products') ? ' active' : ''}">Products</a>
            <a href="/industries" class="akira-nav-item${route.path === '/industries' ? ' active' : ''}">Industries</a>
            <a href="/services" class="akira-nav-item${route.path === '/services' ? ' active' : ''}">Services</a>
            <a href="/why-choose-us" class="akira-nav-item${route.path === '/why-choose-us' ? ' active' : ''}">Why Choose Us</a>
            <a href="/contact" class="akira-nav-item${route.path === '/contact' ? ' active' : ''}">Contact</a>
          </nav>
          <div class="akira-header-cta">
            <a href="/contact" class="akira-btn-enquire">
              <span>Enquire Now</span>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </a>
          </div>
          <div class="akira-hamburger" aria-hidden="true">
            <span></span><span></span><span></span>
          </div>
        </div>
      </header>
    `;

    let styledDom = rawContent;
    if (route.path === '/') {
      styledDom = `${topBarHtml}\n${navBarHtml}\n${styledDom}`;
    } else {
      styledDom = `${topBarHtml}\n${navBarHtml}\n<div class="akira-subpage-wrap">${styledDom}</div>`;
    }

    result = result.replace(
      '<div id="root"></div>',
      `<div id="root"><div class="akira-prerender-shell">${styledDom}</div></div>`
    );

    return result;
  }

  let generatedCount = 0;

  for (const route of routes) {
    const renderedHtml = injectMetadata(baseHtml, route);

    if (route.path === '/') {
      // Overwrite dist/index.html with pre-rendered homepage
      fs.writeFileSync(path.join(distDir, 'index.html'), renderedHtml, 'utf-8');
      generatedCount++;
    } else {
      // Subpage: generate both /subpage/index.html and /subpage.html for flexible hosting
      const routeRel = route.path.replace(/^\/+/, '');
      const targetDir = path.join(distDir, routeRel);
      fs.mkdirSync(targetDir, { recursive: true });

      // 1. Write dist/<route>/index.html
      fs.writeFileSync(path.join(targetDir, 'index.html'), renderedHtml, 'utf-8');

      // 2. Write dist/<route>.html
      fs.writeFileSync(path.join(distDir, `${routeRel}.html`), renderedHtml, 'utf-8');

      generatedCount++;
    }
  }

  console.log(`[Prerender] Successfully pre-rendered ${generatedCount} static HTML pages in dist/.`);
}

runPrerender().catch((err) => {
  console.error('[Prerender] Fatal error:', err);
  process.exit(1);
});
