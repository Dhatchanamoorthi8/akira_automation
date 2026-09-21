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
    appType: 'custom'
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
      description: `Akira Precision Automation LLP provides high-precision gauging fixtures, automated multi-gauging stations, air gauges, digital DRO displays, and work-holding solutions for manufacturing.`,
      keywords: `Akira Precision Automation LLP, Precision Gauging India, Multi Gauging Solutions, Air Gauging, Air Plug Gauge, Air Ring Gauge, Inspection Fixtures, Industrial Metrology`,
      ogImage: '/assets/company/akira-automation-logo.jpeg',
      structuredData: [
        createOrganizationSchema(),
        createWebSiteSchema()
      ],
      generateBody: () => `
        <header>
          <nav aria-label="Main Navigation">
            <a href="/">Home</a> | <a href="/about">About</a> | <a href="/solutions">Solutions</a> | <a href="/products">Products</a> | <a href="/contact">Contact</a>
          </nav>
        </header>
        <main>
          <h1>Precision Gauging Solutions for Modern Manufacturing</h1>
          <p>Delivering high-quality precision instruments and automated multi-gauging systems for OEMs and automotive manufacturing, engineered for accuracy, productivity, and reliability.</p>
          <section>
            <h2>Core Solutions</h2>
            <p>Automated Multi-Gauging, Air Gauges, Electronic Gauges, Fixtures, Air Plug & Ring Gauges, and Work-Holding Tooling.</p>
          </section>
        </main>
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
          <h1>About Akira Precision Automation LLP</h1>
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
          <h1>Why Choose Akira Precision Automation LLP</h1>
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
            <p>Reviewed and validated by <strong>Kalidoss</strong>, Lead Metrology Applications Engineer at AKIRA Precision Automation LLP. All tolerances and measurement parameters comply with ISO/DIN manufacturing standards.</p>
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
                <p>Technical specifications reviewed and verified by <strong>Kalidoss</strong>, Lead Metrology Applications Engineer at AKIRA Precision Automation LLP. Calibration methodologies certified traceable to <strong>ISO/IEC 17025:2017</strong> and <strong>DIN 2250-C</strong> setting standards.</p>
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

    // Insert JSON-LD before </head>
    result = result.replace('</head>', `  ${jsonLdScript}\n  </head>`);

    // 7. Inject Semantic Pre-Rendered DOM into <div id="root">
    const preRenderedContent = route.generateBody ? route.generateBody() : '';
    result = result.replace(
      '<div id="root"></div>',
      `<div id="root">${preRenderedContent}</div>`
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
