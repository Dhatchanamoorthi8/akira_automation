import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ImageIcon,
  Search,
  ExternalLink,
  Edit,
  Package,
  Layers,
  Sparkles,
  RotateCw,
  CheckCircle2,
} from 'lucide-react';
import { ProductWithImages, ProductImage } from '../../types/database';
import { productService } from '../../services/productService';
import { productImageService } from '../../services/productImageService';
import { ProductImageManager } from '../../components/admin/ProductImageManager';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';

export const AdminProductImages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialProductId = searchParams.get('productId') || '';

  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(initialProductId);
  const [selectedProductImages, setSelectedProductImages] = useState<ProductImage[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [productSearch, setProductSearch] = useState<string>('');

  // Fetch all products for selector
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const result = await productService.getAdminProducts({ limit: 150, sortBy: 'name', sortOrder: 'asc' });
      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.products);
        // If initialProductId was not set or invalid, select first product
        if (!selectedProductId && result.products.length > 0) {
          setSelectedProductId(result.products[0].id);
        } else if (selectedProductId) {
          const found = result.products.find(p => p.id === selectedProductId);
          if (found && found.product_images) {
            setSelectedProductImages(found.product_images);
          }
        }
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load products.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, [selectedProductId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load images whenever selectedProductId changes
  const fetchImagesForProduct = useCallback(async (productId: string) => {
    if (!productId) {
      setSelectedProductImages([]);
      return;
    }
    setIsLoadingImages(true);
    try {
      const images = await productImageService.list(productId);
      setSelectedProductImages(images);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load product images.');
    } finally {
      setIsLoadingImages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedProductId) {
      fetchImagesForProduct(selectedProductId);
      // Synchronize URL param
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.set('productId', selectedProductId);
        return next;
      }, { replace: true });
    }
  }, [selectedProductId, fetchImagesForProduct, setSearchParams]);

  // Currently selected product object
  const currentProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Filter products in dropdown by search query
  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const term = productSearch.toLowerCase();
    return products.filter(
      p => p.name.toLowerCase().includes(term) || p.slug.toLowerCase().includes(term) || (p.category && p.category.toLowerCase().includes(term))
    );
  }, [products, productSearch]);

  const handleImagesChange = (updated: ProductImage[]) => {
    setSelectedProductImages(updated);
    // Also update cached count in local products state
    setProducts(prev =>
      prev.map(p => (p.id === selectedProductId ? { ...p, product_images: updated } : p))
    );
  };

  const totalRegisteredImages = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.product_images?.length || 0), 0);
  }, [products]);

  return (
    <>
      <SEOHead
        title="Product Image Library | AKIRA AUTOMATION"
        description="Dedicated product image and CAD diagram manager for AKIRA AUTOMATION precision metrology catalogue."
      />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                Product Image Manager
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-industrial-primary border border-sky-200">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Media Assets</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Upload, reorder, and configure high-resolution photography and technical CAD diagrams per catalogue product
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="text-right hidden md:block">
              <div className="text-xs font-mono font-bold text-industrial-dark">
                {products.length} Products · {totalRegisteredImages} Images
              </div>
              <span className="text-[10px] text-slate-400">CDN Storage Active</span>
            </div>
            <button
              type="button"
              onClick={() => {
                fetchProducts();
                if (selectedProductId) fetchImagesForProduct(selectedProductId);
              }}
              disabled={isLoadingProducts || isLoadingImages}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-industrial-dark hover:bg-slate-50 shadow-subtle min-h-[36px] min-w-[36px] flex items-center justify-center transition-colors"
              title="Refresh Media Assets"
            >
              <RotateCw className={`w-3.5 h-3.5 ${(isLoadingProducts || isLoadingImages) ? 'animate-spin text-industrial-primary' : ''}`} />
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <AdminErrorState
            title="Image Manager Error"
            message={error}
            onRetry={() => {
              fetchProducts();
              if (selectedProductId) fetchImagesForProduct(selectedProductId);
            }}
          />
        )}

        {/* Product Selection & Context Bar */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-subtle space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Left: Product Selector */}
            <div className="flex-1 max-w-xl space-y-1.5">
              <label htmlFor="product-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Select Catalogue Product
              </label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    id="product-select"
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    disabled={isLoadingProducts || products.length === 0}
                    className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-industrial-dark focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:bg-white transition-all cursor-pointer"
                  >
                    {filteredProducts.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.product_images?.length || 0} images) — {p.category || 'General'}
                      </option>
                    ))}
                    {filteredProducts.length === 0 && (
                      <option value="">No products match search</option>
                    )}
                  </select>
                  <Package className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right: Quick Search Filter */}
            <div className="w-full md:w-72 space-y-1.5">
              <label htmlFor="quick-search" className="block text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                Filter Products
              </label>
              <div className="relative">
                <input
                  id="quick-search"
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filter by name or slug..."
                  className="w-full px-3 py-2 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:bg-white transition-all"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Selected Product Context Banner */}
          {currentProduct && (
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                  {selectedProductImages.length > 0 ? (
                    <img
                      src={selectedProductImages[0].image_url}
                      alt={selectedProductImages[0].alt_text || currentProduct.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-5 h-5 text-slate-400" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-industrial-dark text-sm">{currentProduct.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200">
                      {currentProduct.category}
                    </span>
                    {currentProduct.featured && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Sparkles className="w-3 h-3" />
                        <span>Featured</span>
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Slug: <span className="text-slate-600">/products/{currentProduct.slug}</span> · {selectedProductImages.length} image assets
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <Link
                  to={`/admin/products/${currentProduct.id}/edit`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-industrial-dark hover:bg-slate-50 transition-colors font-medium text-xs shadow-2xs"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </Link>
                <Link
                  to={`/products/${currentProduct.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-industrial-primary text-white hover:bg-industrial-hover transition-colors font-semibold text-xs shadow-xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Public Page</span>
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Embedded Product Image Manager */}
        {selectedProductId ? (
          <div className="space-y-4">
            <ProductImageManager
              productId={selectedProductId}
              images={selectedProductImages}
              onImagesChange={handleImagesChange}
            />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-subtle space-y-3">
            <Layers className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 font-heading">No Product Selected</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Please choose a product from the dropdown above to manage its image gallery, upload new assets, or assign primary photography.
            </p>
          </div>
        )}

        {/* Informational Guidance Footer */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 space-y-1.5">
          <div className="flex items-center gap-1.5 font-bold text-industrial-dark font-mono text-[11px] uppercase tracking-wider">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Industrial Photography & Storage Best Practices</span>
          </div>
          <p className="leading-relaxed">
            - Primary images represent the hero banner on customer product catalog pages and quote previews.
            - Secondary images provide multiple angles, gauge calibration setups, and dimensional blueprints.
            - All uploads are automatically optimized and served via Supabase high-speed CDN storage.
          </p>
        </div>
      </div>
    </>
  );
};

export default AdminProductImages;
