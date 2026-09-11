import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowRight, Phone, Mail } from 'lucide-react';
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

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { openEnquiry } = useEnquiry();

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

    productService.getProductBySlug(slug).then((foundProduct) => {
      if (!isMounted) return;

      if (foundProduct) {
        setProduct(foundProduct);
        productService.getRelatedProducts(foundProduct).then((related) => {
          if (isMounted) setRelatedProducts(related);
        });
      } else {
        setProduct(null);
      }
      setIsLoading(false);
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
        <div className="industrial-container max-w-md mx-auto space-y-4">
          <h1 className="text-2xl font-bold text-industrial-dark font-heading">
            Product Not Found
          </h1>
          <p className="text-xs text-industrial-muted">
            The requested gauging system or product specification page does not exist.
          </p>
          <Link to="/products" className="btn-primary text-xs">
            Back to Products Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHead
        title={`${product.title} | Technical Specifications`}
        description={product.description}
        keywords={`${product.title}, ${product.category}, ${company.name}, Precision Gauging Specifications`}
        canonicalPath={`/products/${product.slug}`}
        ogImage={product.image}
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
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-industrial-primary/30 text-sky-300 border border-sky-400/30">
                {product.category}
              </span>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-heading text-white mt-2">
                {product.title}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {product.tagline}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => openEnquiry(product.title)}
                className="btn-primary text-xs py-2.5 px-5 bg-sky-500 hover:bg-sky-400 text-white group"
              >
                <span>Enquire About This Model</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </Reveal>
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
                <p className="font-bold text-industrial-dark uppercase tracking-wider text-[11px]">
                  Direct Factory Assistance
                </p>
                <div className="space-y-1.5 text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-industrial-primary" />
                    <span className="font-mono">{companyData.phones[0]} / {companyData.phones[1]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-industrial-primary" />
                    <span>{companyData.emails[0]}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Technical Specs & Details (7 cols) */}
            <div className="lg:col-span-7 space-y-8">
              {/* Product Overview */}
              <div>
                <h2 className="text-xl font-bold text-industrial-dark font-heading">
                  Product Overview
                </h2>
                <p className="text-sm text-slate-700 mt-3 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Key Features List Component */}
              <ProductFeatures features={product.features} />

              {/* Technical Specifications Table Component */}
              <ProductSpecsTable specifications={product.specifications} />

              {/* Industrial Applications Tag Pills */}
              {product.applications.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-industrial-dark font-heading uppercase tracking-wider text-slate-500">
                    Industrial Applications
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.applications.map((app, idx) => (
                      <span 
                        key={idx} 
                        className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200"
                      >
                        {app}
                      </span>
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
