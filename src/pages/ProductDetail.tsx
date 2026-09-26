import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail, ShieldCheck, CheckCircle2, Gauge } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Breadcrumb';
import { SEOHead } from '../components/layout/SEOHead';
import { company } from '../config/company';
import { Product } from '../types';
import { productService } from '../services/productService';
import { companyData } from '../data/company';
import { useEnquiry } from '../context/EnquiryContext';
import { EnquiryCTA } from '../components/home/EnquiryCTA';
import { PageLoader } from '../components/common/PageLoader';
import { ProductGallery } from '../components/products/ProductGallery';
import { ProductSpecsTable } from '../components/products/ProductSpecsTable';
import { ProductFeatures } from '../components/products/ProductFeatures';
import { RelatedProducts } from '../components/products/RelatedProducts';
import { SectionReveal } from '../components/animation/SectionReveal';
import { Reveal } from '../components/animation/Reveal';
import { useCompanyEmails } from '../hooks/useCompanyEmails';
import { createBreadcrumbSchema, createProductSchema, createFAQSchema } from '../config/seo';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openEnquiry } = useEnquiry();
  const emails = useCompanyEmails();

  const [product, setProduct] = useState<Product | null | undefined>(undefined);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!slug) {
      setProduct(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    productService.getProductBySlug(slug).then(async (foundProduct) => {
      if (!isMounted) return;

      if (foundProduct) {
        setProduct(foundProduct);
        try {
          const related = await productService.getRelatedProducts(foundProduct);
          if (isMounted) setRelatedProducts(related);
        } catch {
          if (isMounted) setRelatedProducts([]);
        }
      } else {
        setProduct(null);
      }
      if (isMounted) setIsLoading(false);
    }).catch(() => {
      if (isMounted) {
        setProduct(null);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (isLoading) {
    return <PageLoader />;
  }

  if (!product) {
    return (
      <div className="py-32 bg-industrial-bg text-center">
        <SEOHead
          title="Product Not Found"
          description="The requested precision gauging system or product specification page does not exist."
          noIndex={true}
        />
        <div className="industrial-container max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-industrial-dark font-heading">
            Product Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-700 font-medium">
            The requested gauging system or product specification page does not exist.
          </p>
          <Link to="/products" className="btn-primary text-xs">
            Back to Products Catalogue
          </Link>
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Products', url: '/products' },
    { name: product.category, url: `/products?category=${product.categorySlug}` },
    { name: product.title, url: `/products/${product.slug}` }
  ];

  const productSchemas: object[] = [
    createBreadcrumbSchema(breadcrumbs),
    createProductSchema({
      title: product.title,
      description: product.description,
      image: product.image,
      category: product.category,
      slug: product.slug
    })
  ];

  if (product.faqs && product.faqs.length > 0) {
    const faqSchema = createFAQSchema(product.faqs);
    if (faqSchema) {
      productSchemas.push(faqSchema);
    }
  }

  return (
    <>
      <SEOHead
        title={`${product.title} | Technical Specifications`}
        description={product.metaDescription || product.description}
        keywords={`${product.title}, ${product.category}, ${company.name}, Precision Gauging Specifications`}
        canonicalPath={`/products/${product.slug}`}
        ogImage={product.image}
        structuredData={productSchemas}
      />

      {/* Header & Breadcrumb */}
      <section className="bg-industrial-dark text-white py-10 border-b border-slate-800">
        <div className="industrial-container">
          <Breadcrumb
            items={[
              { label: 'Products', href: '/products' },
              { label: product.category, href: `/products?category=${product.categorySlug}` },
              { label: product.title }
            ]}
          />
          <Reveal direction="up" className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-sans font-semibold uppercase tracking-wider bg-sky-950/70 text-sky-300 border border-sky-800/70">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white mt-2">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-sans">
                {product.tagline}
              </p>

              {/* AEO TL;DR Direct-Answer Capsule */}
              {product.tldr && (
                <div className="mt-4 p-3.5 rounded-lg bg-sky-950/60 border-l-4 border-sky-400 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-sm font-sans">
                  <strong className="text-sky-300 font-semibold block mb-0.5 font-sans">
                    Quick Technical Summary (TL;DR):
                  </strong>
                  {product.tldr}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => openEnquiry(product.title)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-white font-semibold text-xs transition-all shadow-md active:scale-[0.98] group font-sans"
              >
                <span>Enquire About This Model</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1 shrink-0" />
              </button>
            </div>
          </Reveal>

          {/* Above-the-Fold Quick Telemetry Dock */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
              <Gauge className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 block">Linear Resolution</span>
                <span className="text-xs sm:text-sm font-bold text-sky-400 font-sans tabular-nums">0.1 µm (0.0001 mm)</span>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 block">Repeatability</span>
                <span className="text-xs sm:text-sm font-bold text-emerald-400 font-sans tabular-nums">≤ 0.5 µm (R&amp;R &lt; 10%)</span>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
              <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 font-sans">P</span>
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 block">Operating Line</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 font-sans tabular-nums">
                  {product.categorySlug === 'air-gauging' ? '3–4 bar Regulated' : 'LVDT / Electronic'}
                </span>
              </div>
            </div>
            <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-lg flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-sans uppercase tracking-wider text-slate-400 block">Master Calibration</span>
                <span className="text-xs sm:text-sm font-bold text-white font-sans tabular-nums">ISO 17025 / DIN 2250</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Section */}
      <SectionReveal className="py-16 bg-white border-b border-slate-200">
        <div className="industrial-container">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Left: Product Media Gallery & Direct Contact (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <ProductGallery
                mainImage={product.image}
                title={product.title}
                secondaryImages={product.secondaryImages}
                specsImage={product.specsImage}
                cadImage={product.cadImage}
              />

              {/* Quick Factory Assistance Box */}
              <div className="p-5 rounded-xl bg-slate-50 border border-slate-200/90 text-xs space-y-3">
                <p className="font-bold text-industrial-dark uppercase tracking-wider text-xs">
                  Direct Factory Assistance
                </p>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-industrial-primary" />
                    <span className="font-sans tabular-nums">{companyData.phones[0]} / {companyData.phones[1]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-industrial-primary" />
                    <a href={`mailto:${emails[0]}`} className="hover:underline hover:text-industrial-primary">
                      {emails[0]}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Product Overview */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-bold text-industrial-dark font-heading">
                    Product Overview
                  </h2>
                  <p className="text-sm text-slate-700 mt-2 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* 134-167 Word AI-Extractable Technical Definition Block */}
                {product.aiOverviewPassage && (
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-industrial-primary" />
                      <h3 className="text-xs font-sans font-bold uppercase tracking-wider text-industrial-primary">
                        Technical Definition & Operating Principle
                      </h3>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                      {product.aiOverviewPassage}
                    </p>
                  </div>
                )}

                {/* E-E-A-T Verified Metrology Reviewer Box */}
                <div className="p-4 rounded-xl bg-sky-50/80 border border-sky-200/90 flex items-start gap-3.5 font-sans">
                  <div className="p-2 rounded-lg bg-sky-600 text-white shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-xs space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold text-slate-900 text-xs">Technical Review &amp; Specification Sign-off</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 font-sans">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Verified E-E-A-T Metrology
                      </span>
                    </div>
                    <p className="text-slate-700 text-xs leading-relaxed">
                      Technical specifications reviewed and verified by <strong className="text-slate-900">Kalidoss</strong>, Lead Metrology Applications Engineer at AKIRA Precision Automation. Calibration methodologies certified traceable to <span className="font-sans tabular-nums text-slate-800 font-semibold">ISO/IEC 17025:2017</span> and <span className="font-sans tabular-nums text-slate-800 font-semibold">DIN 2250-C</span> setting standards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Key Features List Component */}
              <ProductFeatures features={product.features} />

              {/* Technical Specifications Table Component */}
              <ProductSpecsTable specifications={product.specifications} />

              {/* Industrial Applications Tag Pills */}
              {product.applications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 font-heading uppercase tracking-wider">
                    Industrial Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((app, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 font-sans"
                      >
                        {app}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Product Technical FAQs for AEO & Engineers */}
              {product.faqs && product.faqs.length > 0 && (
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-500" />
                    <h3 className="text-base font-bold font-heading text-industrial-dark">
                      Frequently Asked Technical Questions
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {product.faqs.map((faq, fIdx) => (
                      <div key={fIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="text-xs sm:text-sm font-bold text-industrial-dark mb-1.5 flex items-start gap-2 font-sans">
                          <span className="text-industrial-primary font-sans tabular-nums font-semibold">Q{fIdx + 1}:</span>
                          <span>{faq.question}</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed pl-6 font-sans">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Banner */}
              <div className="p-6 rounded-xl bg-industrial-dark text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h4 className="text-sm font-bold font-heading">
                    Require Custom Tolerances or Mounting?
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Our engineering team customizes setting masters, depth collars, and multi-jet arrays.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => openEnquiry(product.title)}
                  className="btn-primary text-xs py-2 px-4 whitespace-nowrap bg-industrial-primary hover:bg-sky-500 text-white shrink-0"
                >
                  Request Technical Quotation
                </button>
              </div>
            </div>

          </div>
        </div>
      </SectionReveal>

      {/* Related Products Component */}
      <RelatedProducts products={relatedProducts} />

      {/* Global Bottom Enquiry Strip */}
      <EnquiryCTA />
    </>
  );
};
