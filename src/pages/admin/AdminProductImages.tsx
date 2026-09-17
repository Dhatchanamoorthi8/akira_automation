import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  ImageIcon,
  Search,
  ExternalLink,
  Package,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  ChevronRight as ChevronRightIcon,
  AlertCircle,
} from 'lucide-react';
import { ProductWithImages, ProductImage } from '../../types/database';
import { productService } from '../../services/productService';
import { productImageService } from '../../services/productImageService';
import { ProductImageManager } from '../../components/admin/ProductImageManager';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';

const ITEMS_PER_PAGE = 10;

export const AdminProductImages: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryProductId = searchParams.get('productId') || '';

  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>(queryProductId);
  const [selectedProductImages, setSelectedProductImages] = useState<ProductImage[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [isLoadingImages, setIsLoadingImages] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Drawer Open State
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(!!queryProductId);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setError(null);
    try {
      const result = await productService.getAdminProducts({
        limit: 150,
        sortBy: 'name',
        sortOrder: 'asc',
      });
      if (result.error) {
        setError(result.error);
      } else {
        setProducts(result.products);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to load products.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Load images for active drawer product
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
    }
  }, [selectedProductId, fetchImagesForProduct]);

  // Handle URL query param sync
  useEffect(() => {
    if (queryProductId) {
      setSelectedProductId(queryProductId);
      setIsDrawerOpen(true);
    }
  }, [queryProductId]);

  const openDrawerForProduct = (prodId: string) => {
    setSelectedProductId(prodId);
    setIsDrawerOpen(true);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('productId', prodId);
      return next;
    }, { replace: true });
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('productId');
      return next;
    }, { replace: true });
  };

  const handleImagesChange = (updated: ProductImage[]) => {
    setSelectedProductImages(updated);
    setProducts((prev) =>
      prev.map((p) => (p.id === selectedProductId ? { ...p, product_images: updated } : p))
    );
  };

  // Currently selected product
  const activeProduct = useMemo(() => {
    return products.find((p) => p.id === selectedProductId) || null;
  }, [products, selectedProductId]);

  // Statistics
  const totalRegisteredImages = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.product_images?.length || 0), 0);
  }, [products]);

  // Filter calculations
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: products.length,
      with_images: 0,
      missing_images: 0,
      'Air Gauging': 0,
      'Electronic Gauging': 0,
      'Multi-Gauging Systems': 0,
      'Special Gauging Fixtures': 0,
      'Setting Masters & Standards': 0,
      'Pneumatic & Electronic Displays': 0,
    };

    products.forEach((p) => {
      const imgCount = p.product_images?.length || 0;
      if (imgCount > 0) res.with_images++;
      else res.missing_images++;

      if (p.category && res[p.category] !== undefined) {
        res[p.category]++;
      }
    });

    return res;
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const imgCount = p.product_images?.length || 0;

      // 1. Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSlug = p.slug.toLowerCase().includes(query);
        const matchesCat = (p.category || '').toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesCat) return false;
      }

      // 2. Segmented Pill Filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'with_images') return imgCount > 0;
      if (selectedFilter === 'missing_images') return imgCount === 0;
      return p.category === selectedFilter;
    });
  }, [products, search, selectedFilter]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  const toggleSelectAll = () => {
    if (selectedRowIds.size === paginatedProducts.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(paginatedProducts.map((p) => p.id)));
    }
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const next = new Set(selectedRowIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedRowIds(next);
  };

  // Filter options
  const filterOptions = [
    { key: 'all', label: 'All Products', count: counts.all },
    { key: 'with_images', label: 'With Images', count: counts.with_images },
    { key: 'missing_images', label: 'Missing Images', count: counts.missing_images },
    { key: 'Air Gauging', label: 'Air Gauging', count: counts['Air Gauging'] || 0 },
    { key: 'Electronic Gauging', label: 'Electronic Gauging', count: counts['Electronic Gauging'] || 0 },
    { key: 'Multi-Gauging Systems', label: 'Multi-Gauging', count: counts['Multi-Gauging Systems'] || 0 },
    { key: 'Special Gauging Fixtures', label: 'Special Fixtures', count: counts['Special Gauging Fixtures'] || 0 },
    { key: 'Setting Masters & Standards', label: 'Setting Masters', count: counts['Setting Masters & Standards'] || 0 },
    { key: 'Pneumatic & Electronic Displays', label: 'Displays & Columns', count: counts['Pneumatic & Electronic Displays'] || 0 },
  ];

  return (
    <>
      <SEOHead
        title="Product Image Library | Akira Precision Automation LLP"
        description="Dedicated product image and CAD diagram manager for Akira Precision Automation LLP precision metrology catalogue."
      />

      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-gray-900">
        {/* Page Title & Top Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Product Image Manager
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 text-industrial-primary border border-sky-200">
                {totalRegisteredImages} Images
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload, organize, and assign high-resolution photography and technical CAD diagrams per catalogue product.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchProducts();
                if (selectedProductId) fetchImagesForProduct(selectedProductId);
              }}
              disabled={isLoadingProducts || isLoadingImages}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh Media Assets"
              aria-label="Refresh Media Assets"
            >
              <RotateCw className={`w-3.5 h-3.5 ${(isLoadingProducts || isLoadingImages) ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/admin/products"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 shadow-2xs transition-all"
            >
              <Package className="w-3.5 h-3.5 text-gray-500" />
              <span>Product Catalogue</span>
            </Link>
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

        {/* Filter Pills with Count Badges */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          {filterOptions.map((opt) => {
            const isSelected = selectedFilter === opt.key;

            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  setSelectedFilter(opt.key);
                  setCurrentPage(1);
                }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-2xs whitespace-nowrap shrink-0 ${
                  isSelected
                    ? 'bg-gray-900 text-white border border-gray-900 shadow-sm'
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono font-bold ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search products by name, category, or slug to manage visual assets..."
            className="w-full pl-10 pr-9 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 placeholder:text-gray-400 shadow-2xs transition-all"
          />
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Table Card matching People Page */}
        {isLoadingProducts ? (
          <AdminTableSkeleton rows={8} />
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <ImageIcon className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || selectedFilter !== 'all'
                ? 'No items match your active search filters. Try adjusting query parameters or reset filters.'
                : 'No products in catalogue yet.'}
            </p>
            {(search || selectedFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setSelectedFilter('all');
                }}
                className="mt-2 text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[950px]">
                {/* Table Header */}
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/40 text-[12px] font-medium text-gray-500">
                    <th className="py-3.5 pl-5 pr-3 w-10">
                      <input
                        type="checkbox"
                        checked={
                          paginatedProducts.length > 0 &&
                          selectedRowIds.size === paginatedProducts.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        aria-label="Select all rows"
                      />
                    </th>
                    <th className="py-3.5 px-4 w-16">Primary Cover</th>
                    <th className="py-3.5 px-4">Product Name & Identifier</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Gallery Previews</th>
                    <th className="py-3.5 px-4 text-center">Total Assets</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedProducts.map((prod) => {
                    const isRowSelected = selectedRowIds.has(prod.id);
                    const images = prod.product_images || [];
                    const primaryImg =
                      images.find((img) => img.is_primary)?.image_url ||
                      images[0]?.image_url;

                    return (
                      <tr
                        key={prod.id}
                        onClick={() => openDrawerForProduct(prod.id)}
                        className={`transition-colors cursor-pointer group ${
                          isRowSelected ? 'bg-blue-50/30' : 'hover:bg-gray-50/70'
                        }`}
                      >
                        {/* Row Checkbox */}
                        <td className="py-3.5 pl-5 pr-3 w-10" onClick={(e) => toggleSelectRow(prod.id, e)}>
                          <input
                            type="checkbox"
                            checked={isRowSelected}
                            onChange={() => {}}
                            className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                            aria-label={`Select ${prod.name}`}
                          />
                        </td>

                        {/* Primary Image Cover */}
                        <td className="py-3 px-4 w-16">
                          <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden relative group/img">
                            {primaryImg ? (
                              <img
                                src={primaryImg}
                                alt={prod.name}
                                className="w-full h-full object-contain p-1"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                                }}
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                        </td>

                        {/* Name & Slug */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                            {prod.name}
                          </div>
                          <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                            /{prod.slug}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                            {prod.category || 'General'}
                          </span>
                        </td>

                        {/* Gallery Previews (Mini thumbnails strip) */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            {images.length === 0 ? (
                              <span className="text-gray-400 italic text-xs">No media uploaded</span>
                            ) : (
                              <>
                                {images.slice(0, 4).map((img) => (
                                  <div
                                    key={img.id}
                                    className="w-8 h-8 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0"
                                  >
                                    <img
                                      src={img.image_url}
                                      alt={img.alt_text || 'Asset'}
                                      className="w-full h-full object-contain p-0.5"
                                    />
                                  </div>
                                ))}
                                {images.length > 4 && (
                                  <span className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 text-gray-600 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                                    +{images.length - 4}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        </td>

                        {/* Total Assets Badge */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          {images.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-blue-700 border border-sky-200">
                              <ImageIcon className="w-3 h-3" />
                              <span>{images.length} {images.length === 1 ? 'Asset' : 'Assets'}</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertCircle className="w-3 h-3" />
                              <span>Missing Cover</span>
                            </span>
                          )}
                        </td>

                        {/* Active/Inactive Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              prod.active
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                prod.active ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            <span>{prod.active ? 'Active' : 'Inactive'}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDrawerForProduct(prod.id);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-2xs transition-all"
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Manage Gallery</span>
                            <ChevronRightIcon className="w-3 h-3 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-between text-xs text-gray-500">
              <div>
                Page {currentPage} of {totalPages} ({filteredProducts.length} results)
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((pageNum) => {
                  const isActive = currentPage === pageNum;
                  return (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                {totalPages > 5 && (
                  <>
                    <span className="px-1 text-gray-400 font-mono">...</span>
                    <button
                      type="button"
                      onClick={() => setCurrentPage(totalPages)}
                      className={`w-7 h-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-900 text-white shadow-2xs'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Image Manager Slide-Over Drawer */}
      {isDrawerOpen && activeProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={closeDrawer}
            aria-hidden="true"
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full overflow-hidden text-gray-900 animate-in slide-in-from-right duration-300">
              {/* Drawer Header */}
              <div className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {selectedProductImages.length > 0 ? (
                      <img
                        src={
                          selectedProductImages.find((img) => img.is_primary)?.image_url ||
                          selectedProductImages[0].image_url
                        }
                        alt={activeProduct.name}
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-gray-400" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                        {activeProduct.category || 'General'}
                      </span>
                      {activeProduct.featured && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-gray-900 tracking-tight mt-1 truncate">
                      {activeProduct.name}
                    </h2>
                    <div className="text-xs font-mono text-gray-400 mt-0.5">
                      /products/{activeProduct.slug} · {selectedProductImages.length} media assets
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <a
                    href={`/products/${activeProduct.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                    title="View live public product page"
                    aria-label="View live public product page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    title="Close drawer"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Drawer Body with ProductImageManager */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <ProductImageManager
                  productId={activeProduct.id}
                  images={selectedProductImages}
                  onImagesChange={handleImagesChange}
                />
              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50/60 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1.5 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CDN Real-time Sync Active</span>
                </div>

                <button
                  type="button"
                  onClick={closeDrawer}
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white font-semibold hover:bg-gray-800 transition-colors shadow-2xs"
                >
                  Done Managing
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProductImages;
