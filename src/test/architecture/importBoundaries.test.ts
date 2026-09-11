import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('Architectural Dependency Boundaries (Regression)', () => {
  const rootSrc = path.resolve(__dirname, '../../');

  const rootLevelComponents = [
    { name: 'Header', relativePath: 'components/layout/Header.tsx' },
    { name: 'FeaturedProducts', relativePath: 'components/home/FeaturedProducts.tsx' },
    { name: 'Footer', relativePath: 'components/layout/Footer.tsx' },
    { name: 'EnquiryForm', relativePath: 'components/common/EnquiryForm.tsx' },
    { name: 'ProductCard', relativePath: 'components/common/ProductCard.tsx' },
    { name: 'Products Catalogue', relativePath: 'pages/Products.tsx' },
    { name: 'Home Page', relativePath: 'pages/Home.tsx' },
  ];

  it('verifies root UI components do NOT statically import the heavy products dataset', () => {
    // Regex matches static import: import ... from '...data/products' (with or without extension, relative or aliased)
    const staticImportRegex = /^\s*import\s+(?!type\s).*\s+from\s+['"][^'"]*data\/products['"]/m;

    for (const comp of rootLevelComponents) {
      const fullPath = path.join(rootSrc, comp.relativePath);
      expect(fs.existsSync(fullPath), `File must exist: ${comp.relativePath}`).toBe(true);

      const fileContent = fs.readFileSync(fullPath, 'utf-8');
      const hasStaticImport = staticImportRegex.test(fileContent);

      expect(
        hasStaticImport,
        `Architectural Violation: ${comp.name} (${comp.relativePath}) statically imports heavy data/products dataset.`
      ).toBe(false);
    }
  });

  it('verifies ProductDetail accesses specifications via productService rather than static data imports', () => {
    const productDetailPath = path.join(rootSrc, 'pages/ProductDetail.tsx');
    const content = fs.readFileSync(productDetailPath, 'utf-8');

    // Should NOT statically import data/products
    const staticProductsImport = /import\s+.*from\s+['"][^'"]*data\/products['"]/.test(content);
    expect(staticProductsImport).toBe(false);

    // Must use productService abstraction
    expect(content).toContain('productService');
  });

  it('verifies productService uses dynamic code-splitting import for heavy products data', () => {
    const productServicePath = path.join(rootSrc, 'services/productService.ts');
    const content = fs.readFileSync(productServicePath, 'utf-8');

    // Must NOT have a top-level static import of products
    const topLevelStaticImport = /^import\s+.*from\s+['"][^'"]*data\/products['"]/m.test(content);
    expect(topLevelStaticImport).toBe(false);

    // Must contain dynamic import
    const dynamicImportPresent = /import\(['"][^'"]*data\/products['"]\)/.test(content);
    expect(
      dynamicImportPresent,
      'productService must dynamically load data/products to ensure bundle decoupling'
    ).toBe(true);
  });
});
