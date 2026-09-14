import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  RotateCw,
  AlertCircle,
  ImageIcon,
  X,
  Clock,
  GripVertical,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProductWithImages, ProductFilters } from '../../types/database';
import { productService } from '../../services/productService';
import { formatDateTimeDDMMYYYY } from '../../utils/date';
import { AdminTableSkeleton } from '../../components/admin/AdminSkeleton';
import { AdminErrorState } from '../../components/admin/AdminErrorState';
import { SEOHead } from '../../components/layout/SEOHead';
import { AdminProductDossierDrawer } from '../../components/admin/AdminProductDossierDrawer';

const ITEMS_PER_PAGE = 10;
const STORAGE_KEY = 'akira_products_columns_v1';

export type ProductColumnKey =
  | 'image'
  | 'name'
  | 'category'
  | 'status'
  | 'featured'
  | 'images_count'
  | 'updated_at';

export interface ProductColumnConfig {
  key: ProductColumnKey;
  label: string;
  visible: boolean;
}

export const DEFAULT_PRODUCT_COLUMNS: ProductColumnConfig[] = [
  { key: 'image', label: 'Image', visible: true },
  { key: 'name', label: 'Product Name & Identifier', visible: true },
  { key: 'category', label: 'Category', visible: true },
  { key: 'status', label: 'Status', visible: true },
  { key: 'featured', label: 'Featured', visible: true },
  { key: 'images_count', label: 'Visual Assets', visible: true },
  { key: 'updated_at', label: 'Last Updated', visible: true },
];

function loadProductColumns(): ProductColumnConfig[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const keysSet = new Set(parsed.map((c: any) => c.key));
        const merged: ProductColumnConfig[] = parsed
          .filter((c: any) => DEFAULT_PRODUCT_COLUMNS.some((d) => d.key === c.key))
          .map((c: any) => {
            const def = DEFAULT_PRODUCT_COLUMNS.find((d) => d.key === c.key)!;
            return {
              key: c.key,
              label: def.label,
              visible: typeof c.visible === 'boolean' ? c.visible : true,
            };
          });

        DEFAULT_PRODUCT_COLUMNS.forEach((def) => {
          if (!keysSet.has(def.key)) {
            merged.push(def);
          }
        });

        return merged;
      }
    }
  } catch {}
  return DEFAULT_PRODUCT_COLUMNS;
}

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<ProductWithImages[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  // Column customization
  const [columns, setColumns] = useState<ProductColumnConfig[]>(loadProductColumns);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isColumnMenuOpen, setIsColumnMenuOpen] = useState<boolean>(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Selected Product for Dossier Drawer
  const [selectedProduct, setSelectedProduct] = useState<ProductWithImages | null>(null);

  // Delete modal state
  const [deletingProduct, setDeletingProduct] = useState<ProductWithImages | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close column dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.column-customizer-container')) {
        setIsColumnMenuOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const saveColumns = (updated: ProductColumnConfig[]) => {
    setColumns(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  const toggleColumn = (key: ProductColumnKey) => {
    const updated = columns.map((col) =>
      col.key === key ? { ...col, visible: !col.visible } : col
    );
    saveColumns(updated);
  };

  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const updated = [...columns];
    const item = updated.splice(draggedIndex, 1)[0];
    updated.splice(idx, 0, item);
    setDraggedIndex(idx);
    saveColumns(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const moveColumn = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= columns.length) return;
    const updated = [...columns];
    const item = updated.splice(fromIdx, 1)[0];
    updated.splice(toIdx, 0, item);
    saveColumns(updated);
  };

  const resetColumns = () => {
    saveColumns(DEFAULT_PRODUCT_COLUMNS);
  };

  const activeColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  // Fetch all products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const filters: ProductFilters = {
      limit: 150,
      offset: 0,
      sortBy: 'name',
      sortOrder: 'asc',
    };

    const result = await productService.getAdminProducts(filters);
    if (result.error) {
      setError(result.error);
    } else {
      setProducts(result.products);
      setTotalCount(result.total);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Quick Toggles
  const handleToggleActive = async (prod: ProductWithImages) => {
    const nextState = !prod.active;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, active: nextState } : p))
    );
    if (selectedProduct && selectedProduct.id === prod.id) {
      setSelectedProduct((prev) => (prev ? { ...prev, active: nextState } : null));
    }
    const result = await productService.setProductActive(prod.id, nextState);
    if (result.error) {
      fetchProducts();
    }
  };

  const handleToggleFeatured = async (prod: ProductWithImages) => {
    const nextState = !prod.featured;
    setProducts((prev) =>
      prev.map((p) => (p.id === prod.id ? { ...p, featured: nextState } : p))
    );
    if (selectedProduct && selectedProduct.id === prod.id) {
      setSelectedProduct((prev) => (prev ? { ...prev, featured: nextState } : null));
    }
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
      if (selectedProduct && selectedProduct.id === deletingProduct.id) {
        setSelectedProduct(null);
      }
      setDeletingProduct(null);
      fetchProducts();
    }
  };

  // Calculate dynamic counts for filter pills
  const counts = useMemo(() => {
    const res: Record<string, number> = {
      all: products.length,
      active: 0,
      inactive: 0,
      featured: 0,
      'Air Gauging': 0,
      'Electronic Gauging': 0,
      'Multi-Gauging Systems': 0,
      'Special Gauging Fixtures': 0,
      'Setting Masters & Standards': 0,
      'Pneumatic & Electronic Displays': 0,
    };

    products.forEach((p) => {
      if (p.active) res.active++;
      else res.inactive++;

      if (p.featured) res.featured++;

      if (p.category && res[p.category] !== undefined) {
        res[p.category]++;
      }
    });

    return res;
  }, [products]);

  // Filter products by search & segmented filter
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // 1. Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(query);
        const matchesSlug = p.slug.toLowerCase().includes(query);
        const matchesCat = (p.category || '').toLowerCase().includes(query);
        const matchesDesc = (p.short_description || '').toLowerCase().includes(query);
        if (!matchesName && !matchesSlug && !matchesCat && !matchesDesc) return false;
      }

      // 2. Segmented Pill Filter
      if (selectedFilter === 'all') return true;
      if (selectedFilter === 'active') return p.active;
      if (selectedFilter === 'inactive') return !p.active;
      if (selectedFilter === 'featured') return p.featured;
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

  // Filter pill options
  const filterOptions = [
    { key: 'all', label: 'All Products', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'inactive', label: 'Inactive', count: counts.inactive },
    { key: 'featured', label: 'Featured', count: counts.featured },
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
        title="Product Catalogue | AKIRA AUTOMATION Admin"
        description="Administrative control for precision metrology products, specifications, and images."
      />

      <div className="space-y-4 max-w-7xl mx-auto pb-12 font-sans text-gray-900">
        {/* Page Title & Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Product Catalogue
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sky-100 text-industrial-primary border border-sky-200">
                {totalCount} Total
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Manage precision instruments, technical specifications, and factory photography.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Customize Columns Dropdown with LocalStorage */}
            <div className="relative column-customizer-container">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsColumnMenuOpen(!isColumnMenuOpen);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all shadow-2xs ${
                  isColumnMenuOpen
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                }`}
                title="Customize visible columns"
                aria-label="Customize visible columns"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Customize Columns</span>
              </button>

              {isColumnMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-40 text-xs animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-gray-800 block">Display & Order</span>
                      <span className="text-[10px] text-gray-400">Drag or use arrows to reorder</span>
                    </div>
                    <button
                      type="button"
                      onClick={resetColumns}
                      className="text-[11px] text-blue-600 hover:underline font-medium"
                    >
                      Reset All
                    </button>
                  </div>

                  <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                    {columns.map((col, idx) => (
                      <div
                        key={col.key}
                        draggable
                        onDragStart={() => handleDragStart(idx)}
                        onDragOver={(e) => handleDragOver(e, idx)}
                        onDragEnd={handleDragEnd}
                        className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs cursor-grab active:cursor-grabbing transition-all ${
                          draggedIndex === idx
                            ? 'bg-blue-50 border-blue-300 opacity-60'
                            : 'bg-white hover:bg-gray-50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <GripVertical className="w-3.5 h-3.5 text-gray-400 shrink-0 cursor-grab" />
                          <label className="flex items-center gap-2 cursor-pointer select-none truncate">
                            <input
                              type="checkbox"
                              checked={col.visible}
                              onChange={() => toggleColumn(col.key)}
                              className="w-3.5 h-3.5 rounded border-gray-300 text-gray-900 focus:ring-0 focus:ring-offset-0 cursor-pointer shrink-0"
                            />
                            <span
                              className={`text-xs font-medium truncate ${
                                col.visible ? 'text-gray-900' : 'text-gray-400 line-through'
                              }`}
                            >
                              {col.label}
                            </span>
                          </label>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumn(idx, idx - 1);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 transition-colors"
                            title="Move column up"
                            aria-label={`Move ${col.label} column up`}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            disabled={idx === columns.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              moveColumn(idx, idx + 1);
                            }}
                            className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-25 hover:bg-gray-100 transition-colors"
                            title="Move column down"
                            aria-label={`Move ${col.label} column down`}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-3 pt-1.5 border-t border-gray-100 text-[10px] text-gray-400 flex items-center justify-between">
                    <span>Reorder applies to table</span>
                    <span className="text-emerald-600">Auto-saved</span>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={fetchProducts}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-50 shadow-2xs transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Refresh product list"
              aria-label="Refresh product list"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
              <span>Refresh</span>
            </button>

            <Link
              to="/admin/products/new"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-2xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Product</span>
            </Link>
          </div>
        </div>

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
            placeholder="Search by product name, category, or slug..."
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

        {/* Content Table Card */}
        {error ? (
          <AdminErrorState
            title="Database Connection Issue"
            message={`Unable to load products: ${error}`}
            onRetry={fetchProducts}
          />
        ) : isLoading ? (
          <AdminTableSkeleton rows={8} />
        ) : paginatedProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-xs space-y-3">
            <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-400 flex items-center justify-center mx-auto">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {search || selectedFilter !== 'all'
                ? 'No items match your active search filters. Try adjusting query parameters.'
                : 'Your product catalogue is currently empty. Get started by creating your first precision instrument.'}
            </p>
            <div>
              <Link
                to="/admin/products/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 shadow-2xs mt-2"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Product</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/90 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[980px]">
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

                    {activeColumns.map((col) => (
                      <th
                        key={col.key}
                        className={`py-3.5 px-4 font-medium whitespace-nowrap ${
                          col.key === 'status' || col.key === 'featured' || col.key === 'images_count'
                            ? 'text-center'
                            : ''
                        }`}
                      >
                        {col.label}
                      </th>
                    ))}
                    <th className="py-3.5 px-4 text-right font-medium">Actions</th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-gray-100 text-xs">
                  {paginatedProducts.map((prod) => {
                    const isRowSelected = selectedRowIds.has(prod.id);
                    const primaryImg =
                      prod.product_images?.find((img) => img.is_primary)?.image_url ||
                      prod.product_images?.[0]?.image_url;
                    const imagesCount = prod.product_images?.length || 0;

                    return (
                      <tr
                        key={prod.id}
                        onClick={() => setSelectedProduct(prod)}
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

                        {/* Dynamic Ordered Columns */}
                        {activeColumns.map((col) => {
                          switch (col.key) {
                            case 'image':
                              return (
                                <td key={col.key} className="py-3 px-4 w-16">
                                  <div className="w-12 h-12 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
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
                              );

                            case 'name':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="font-semibold text-gray-900 text-sm group-hover:text-blue-600 transition-colors">
                                    {prod.name}
                                  </div>
                                  <div className="text-[11px] font-mono text-gray-400 mt-0.5">
                                    /{prod.slug}
                                  </div>
                                </td>
                              );

                            case 'category':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                    {prod.category || 'General'}
                                  </span>
                                </td>
                              );

                            case 'status':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleActive(prod);
                                    }}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                                      prod.active
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                        : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
                                    }`}
                                    title={prod.active ? 'Click to deactivate' : 'Click to activate'}
                                  >
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full ${
                                        prod.active ? 'bg-emerald-500' : 'bg-gray-400'
                                      }`}
                                    />
                                    <span>{prod.active ? 'Active' : 'Inactive'}</span>
                                  </button>
                                </td>
                              );

                            case 'featured':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-center">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleFeatured(prod);
                                    }}
                                    className={`p-1.5 rounded-lg transition-colors inline-flex items-center justify-center ${
                                      prod.featured
                                        ? 'text-amber-500 hover:bg-amber-50'
                                        : 'text-gray-300 hover:text-amber-500 hover:bg-gray-100'
                                    }`}
                                    title={
                                      prod.featured
                                        ? 'Featured on homepage. Click to unfeature.'
                                        : 'Click to feature on homepage.'
                                    }
                                    aria-label={prod.featured ? 'Featured on homepage' : 'Not featured'}
                                  >
                                    <Star
                                      className={`w-4 h-4 ${
                                        prod.featured ? 'fill-amber-400 text-amber-400' : ''
                                      }`}
                                    />
                                  </button>
                                </td>
                              );

                            case 'images_count':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-center">
                                  <Link
                                    to={`/admin/product-images?productId=${prod.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
                                    title="Manage visual assets"
                                  >
                                    <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
                                    <span>{imagesCount}</span>
                                  </Link>
                                </td>
                              );

                            case 'updated_at':
                              return (
                                <td key={col.key} className="py-3.5 px-4 whitespace-nowrap text-gray-500 font-mono text-[11px]">
                                  <div className="flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                    <span>{formatDateTimeDDMMYYYY(prod.updated_at || prod.created_at)}</span>
                                  </div>
                                </td>
                              );

                            default:
                              return null;
                          }
                        })}

                        {/* Actions Column */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap space-x-1">
                          <a
                            href={`/products/${prod.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 inline-flex items-center justify-center transition-colors"
                            title="View on public site"
                            aria-label="View on public site"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <Link
                            to={`/admin/products/${prod.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-600 hover:bg-blue-50 inline-flex items-center justify-center transition-colors"
                            title="Edit product"
                            aria-label="Edit product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Link>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeletingProduct(prod);
                            }}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-rose-600 hover:bg-rose-50 inline-flex items-center justify-center transition-colors"
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

      {/* Product Dossier Slide-Over Drawer */}
      <AdminProductDossierDrawer
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onToggleActive={handleToggleActive}
        onToggleFeatured={handleToggleFeatured}
        onDeleteRequest={(prod) => {
          setSelectedProduct(null);
          setDeletingProduct(prod);
        }}
      />

      {/* Delete Confirmation Modal */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-gray-900">
                Delete Product Permanently?
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Are you sure you want to delete{' '}
                <strong className="text-gray-800 font-semibold">{deletingProduct.name}</strong>?
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
                className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 min-h-[44px] shadow-sm flex items-center justify-center gap-2"
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminProducts;
