import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  ExternalLink,
  Edit,
  Trash2,
  Star,
  CheckCircle2,
  XCircle,
  RotateCw,
  AlertCircle,
  Eye,
  ImageIcon,
} from 'lucide-react';
import { ProductWithImages, ProductFilters } from '../../types/database';
import { productService } from '../../services/productService';
import { formatDate } from '../../utils/date';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [category, setCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [featuredFilter, setFeaturedFilter] = useState<'all' | 'featured' | 'standard'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'updated_at' | 'created_at'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<ProductWithImages | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: ProductFilters = {
      search: search.trim() || undefined,
      category: category !== 'all' ? category : undefined,
      active: statusFilter === 'all' ? undefined : statusFilter === 'active',
      featured: featuredFilter === 'all' ? undefined : featuredFilter === 'featured',
      sortBy,
      sortOrder,
      limit: 100,
      offset: 0,
    };

    const result = await productService.getAdminProducts(filters);
    if (result.error) {
      setError(result.error);
    } else {
      setProducts(result.products);
      setTotalCount(result.total);
    }
    setIsLoading(false);
  }, [search, category, statusFilter, featuredFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Quick Toggles
  const handleToggleActive = async (prod: ProductWithImages) => {
    const nextState = !prod.active;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, active: nextState } : p))
    );
    const result = await productService.setProductActive(prod.id, nextState);
    if (result.error) {
      fetchProducts();
    }
  };

  const handleToggleFeatured = async (prod: ProductWithImages) => {
    const nextState = !prod.featured;
    // Optimistic UI update
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, featured: nextState } : p))
    );
    const result = await productService.setProductFeatured(prod.id, nextState);
    if (result.error) {
      fetchProducts();
    }
  };

  // Confirm Delete Product
  const handleConfirmDelete = async () => {
    if (!deletingProduct) return;
    setIsDeleting(true);
    setDeleteError(null);

    const result = await productService.deleteProduct(deletingProduct.id);
    setIsDeleting(false);

    if (result.error) {
      setDeleteError(result.error);
    } else {
      setDeletingProduct(null);
      fetchProducts();
    }
  };

  // Known categories for filtering
  const knownCategories = [
    'Air Gauging',
    'Electronic Gauging',
    'Multi-Gauging Systems',
    'Special Gauging Fixtures',
    'Setting Masters & Standards',
    'Pneumatic & Electronic Displays',
  ];

  return (
    <>
      <SEOHead
        title="Product Catalogue Management | AKIRA AUTOMATION Admin"
        description="Administrative control for precision metrology products, specifications, and images."
      />

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                Product Catalogue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 text-industrial-primary border border-sky-200">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Manage precision instruments, technical specifications, and factory photography.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => fetchProducts()}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-industrial-dark hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 shadow-subtle min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
              title="Refresh product list"
              aria-label="Refresh product list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-industrial-primary' : ''}`} />
            </button>

            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover shadow-subtle transition-all min-h-[38px]"
            >
              <Plus className="w-4 h-4" />
              <span>Create Product</span>
            </Link>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="relative lg:col-span-2">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, or slug..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary transition-colors text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Category Filter */}
            <div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {knownCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Filter by active status"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Featured Filter */}
            <div>
              <select
                value={featuredFilter}
                onChange={(e) => setFeaturedFilter(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-700"
                aria-label="Filter by featured status"
              >
                <option value="all">All Showcase Types</option>
                <option value="featured">Featured On Home</option>
                <option value="standard">Standard Catalog</option>
              </select>
            </div>
          </div>

          {/* Sort bar */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort by:</span>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'name') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy('name');
                    setSortOrder('asc');
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium ${
                  sortBy === 'name' ? 'bg-sky-50 text-industrial-primary font-semibold' : 'hover:text-slate-800'
                }`}
              >
                Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'updated_at') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else {
                    setSortBy('updated_at');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2 py-0.5 rounded font-medium ${
                  sortBy === 'updated_at' ? 'bg-sky-50 text-industrial-primary font-semibold' : 'hover:text-slate-800'
                }`}
              >
                Updated {sortBy === 'updated_at' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
              </button>
            </div>

            {(search || category !== 'all' || statusFilter !== 'all' || featuredFilter !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setCategory('all');
                  setStatusFilter('all');
                  setFeaturedFilter('all');
                }}
                className="text-xs text-industrial-primary hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        {error ? (
          <AdminErrorState
            title="Database Connection Issue"
            message={`Unable to load products: ${error}`}
            onRetry={fetchProducts}
          />
        ) : isLoading ? (
          <AdminTableSkeleton rows={8} />
        ) : products.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-subtle space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-industrial-dark">No products found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search || category !== 'all' || statusFilter !== 'all'
                ? 'No items match your active search filters. Try adjusting query parameters.'
                : 'Your product catalogue is currently empty. Get started by creating your first precision instrument.'}
            </p>
            <div>
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover shadow-subtle mt-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Desktop Table (lg+) */}
            <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/75 border-b border-slate-200 text-[11px] font-mono uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4 w-16">Image</th>
                      <th className="py-3 px-4">Product Name & Identifier</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-center">Featured</th>
                      <th className="py-3 px-4">Last Updated</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {products.map((prod) => {
                      const primaryImg =
                        prod.product_images?.find((img) => img.is_primary)?.image_url ||
                        prod.product_images?.[0]?.image_url;

                      return (
                        <tr key={prod.id} className="hover:bg-slate-50/60 transition-colors">
                          {/* Image Thumbnail */}
                          <td className="py-3 px-4">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
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
                                <ImageIcon className="w-5 h-5 text-slate-300" />
                              )}
                            </div>
                          </td>

                          {/* Name & Slug */}
                          <td className="py-3 px-4">
                            <div className="font-bold text-industrial-dark hover:text-industrial-primary transition-colors">
                              <Link to={`/admin/products/${prod.id}/edit`}>{prod.name}</Link>
                            </div>
                            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                              /{prod.slug}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {prod.category || 'Unassigned'}
                            </span>
                          </td>

                          {/* Active Status Toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(prod)}
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors min-h-[24px] ${
                                prod.active
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
                              }`}
                              title={prod.active ? 'Click to deactivate' : 'Click to activate'}
                            >
                              {prod.active ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Active</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3 h-3 text-slate-400" />
                                  <span>Inactive</span>
                                </>
                              )}
                            </button>
                          </td>

                          {/* Featured Toggle */}
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleFeatured(prod)}
                              className={`p-1.5 rounded-lg transition-colors min-h-[32px] min-w-[32px] inline-flex items-center justify-center ${
                                prod.featured
                                  ? 'text-amber-500 hover:bg-amber-50'
                                  : 'text-slate-300 hover:text-amber-500 hover:bg-slate-100'
                              }`}
                              title={prod.featured ? 'Featured on homepage. Click to unfeature.' : 'Click to feature on homepage.'}
                              aria-label={prod.featured ? 'Featured on homepage' : 'Not featured'}
                            >
                              <Star className={`w-4 h-4 ${prod.featured ? 'fill-amber-400 text-amber-400' : ''}`} />
                            </button>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">
                            {formatDate(prod.updated_at || prod.created_at)}
                          </td>

                          {/* Action Links */}
                          <td className="py-3 px-4 text-right space-x-1">
                            {/* View on public site */}
                            <a
                              href={`/products/${prod.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 inline-flex items-center min-h-[32px] min-w-[32px] justify-center transition-colors"
                              title="View on public site"
                              aria-label="View on public site"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            {/* Edit */}
                            <Link
                              to={`/admin/products/${prod.id}/edit`}
                              className="p-1.5 rounded text-slate-600 hover:text-industrial-primary hover:bg-slate-100 inline-flex items-center min-h-[32px] min-w-[32px] justify-center transition-colors"
                              title="Edit product specifications"
                              aria-label="Edit product"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </Link>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={() => setDeletingProduct(prod)}
                              className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center min-h-[32px] min-w-[32px] justify-center transition-colors"
                              title="Delete product"
                              aria-label="Delete product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile / Tablet Cards (<lg) */}
            <div className="lg:hidden space-y-3">
              {products.map((prod) => {
                const primaryImg =
                  prod.product_images?.find((img) => img.is_primary)?.image_url ||
                  prod.product_images?.[0]?.image_url;

                return (
                  <div
                    key={prod.id}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      {/* Image Thumbnail */}
                      <div className="w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center shrink-0">
                        {primaryImg ? (
                          <img
                            src={primaryImg}
                            alt={prod.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-slate-300" />
                        )}
                      </div>

                      {/* Header Information */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate max-w-[140px]">
                            {prod.category || 'General'}
                          </span>
                          {prod.featured && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span>Featured</span>
                            </span>
                          )}
                        </div>

                        <h4 className="text-xs font-bold text-industrial-dark mt-1 truncate">
                          <Link to={`/admin/products/${prod.id}/edit`}>{prod.name}</Link>
                        </h4>
                        <p className="text-[11px] font-mono text-slate-400 truncate">/{prod.slug}</p>
                      </div>
                    </div>

                    {/* Status and Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(prod)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold min-h-[28px] ${
                          prod.active
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {prod.active ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-slate-400" />}
                        <span>{prod.active ? 'Active' : 'Inactive'}</span>
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={`/products/${prod.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-industrial-primary min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="View on site"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Link
                          to={`/admin/products/${prod.id}/edit`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-industrial-primary text-white text-xs font-semibold min-h-[36px]"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setDeletingProduct(prod)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 min-h-[36px] min-w-[36px] flex items-center justify-center"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Delete Confirmation Modal */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-industrial-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-base font-bold text-industrial-dark">
                  Delete Product Permanently?
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete{' '}
                  <strong className="text-slate-800 font-semibold">{deletingProduct.name}</strong>?
                  This action will permanently purge the product, its technical specifications, and all associated photography from Supabase Storage.
                </p>
              </div>

              {deleteError && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{deleteError}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setDeletingProduct(null);
                    setDeleteError(null);
                  }}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 min-h-[44px] shadow-sm flex items-center justify-center gap-2"
                >
                  {isDeleting ? 'Deleting...' : 'Delete Product'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
