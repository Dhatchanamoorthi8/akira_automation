import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  ExternalLink,
  Edit,
  Trash2,
  Package,
  Star,
  CheckCircle2,
  XCircle,
  ImageIcon,
  Layers,
  Clock,
} from 'lucide-react';
import { ProductWithImages } from '../../types/database';
import { formatDateTimeDDMMYYYY } from '../../utils/date';

interface AdminProductDossierDrawerProps {
  product: ProductWithImages | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleActive?: (product: ProductWithImages) => void;
  onToggleFeatured?: (product: ProductWithImages) => void;
  onDeleteRequest?: (product: ProductWithImages) => void;
}

export const AdminProductDossierDrawer: React.FC<AdminProductDossierDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onToggleActive,
  onToggleFeatured,
  onDeleteRequest,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'gallery'>('overview');

  if (!isOpen || !product) return null;

  const primaryImg =
    product.product_images?.find((img) => img.is_primary)?.image_url ||
    product.product_images?.[0]?.image_url;

  const imagesCount = product.product_images?.length || 0;

  // Format specifications if stored as JSON object
  const specs =
    typeof product.specifications === 'object' && product.specifications !== null
      ? Object.entries(product.specifications as Record<string, any>)
      : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-full max-w-2xl bg-white shadow-2xl flex flex-col h-full overflow-hidden text-gray-900 animate-in slide-in-from-right duration-300">
          {/* Drawer Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-white sticky top-0 z-10 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3.5 min-w-0">
              {/* Product Thumbnail */}
              <div className="w-14 h-14 rounded-xl border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                {primaryImg ? (
                  <img
                    src={primaryImg}
                    alt={product.name}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <Package className="w-6 h-6 text-gray-400" />
                )}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                    {product.category || 'General'}
                  </span>
                  {product.featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-gray-900 tracking-tight mt-1 truncate">
                  {product.name}
                </h2>
                <div className="text-xs font-mono text-gray-400 mt-0.5">
                  /products/{product.slug}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <a
                href={`/products/${product.slug}`}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                title="View live product page"
                aria-label="View live product page"
              >
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                title="Close drawer"
                aria-label="Close drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Controls Subheader */}
          <div className="px-6 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              {/* Active Toggle Button */}
              {onToggleActive && (
                <button
                  type="button"
                  onClick={() => onToggleActive(product)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shadow-2xs ${
                    product.active
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  title={product.active ? 'Click to deactivate product' : 'Click to activate product'}
                >
                  {product.active ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Active in Catalogue</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-gray-400" />
                      <span>Inactive (Draft)</span>
                    </>
                  )}
                </button>
              )}

              {/* Featured Toggle */}
              {onToggleFeatured && (
                <button
                  type="button"
                  onClick={() => onToggleFeatured(product)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all shadow-2xs ${
                    product.featured
                      ? 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                  title={product.featured ? 'Featured on homepage' : 'Mark as featured'}
                >
                  <Star className={`w-3.5 h-3.5 ${product.featured ? 'fill-amber-400 text-amber-500' : 'text-gray-400'}`} />
                  <span>{product.featured ? 'Featured on Home' : 'Standard'}</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/admin/product-images?productId=${product.id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>{imagesCount} {imagesCount === 1 ? 'Image' : 'Images'}</span>
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="px-6 border-b border-gray-200 flex items-center gap-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-3 border-b-2 transition-all ${
                activeTab === 'overview'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specs')}
              className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'specs'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Specifications</span>
              <span className="px-1.5 py-0.2 rounded-md bg-gray-100 text-[10px] text-gray-600 font-mono">
                {specs.length}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('gallery')}
              className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>Visual Assets</span>
              <span className="px-1.5 py-0.2 rounded-md bg-gray-100 text-[10px] text-gray-600 font-mono">
                {imagesCount}
              </span>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {/* Short Description */}
                {product.short_description && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono mb-1.5">
                      Short Summary
                    </h4>
                    <p className="text-sm text-gray-800 leading-relaxed bg-gray-50/60 p-3.5 rounded-xl border border-gray-100">
                      {product.short_description}
                    </p>
                  </div>
                )}

                {/* Full Description */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono mb-1.5">
                    Catalogue Description
                  </h4>
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line bg-white p-3.5 rounded-xl border border-gray-100 shadow-2xs">
                    {product.description || 'No detailed technical description provided yet.'}
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Internal Slug</span>
                    <span className="text-xs font-bold text-gray-800 font-mono truncate block">
                      {product.slug}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Category</span>
                    <span className="text-xs font-bold text-gray-800 block truncate">
                      {product.category || 'Unassigned'}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Created Date</span>
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDateTimeDDMMYYYY(product.created_at)}
                    </span>
                  </div>

                  <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                    <span className="text-[11px] font-mono text-gray-400 block uppercase">Last Modified</span>
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDateTimeDDMMYYYY(product.updated_at || product.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                    Technical Specifications
                  </h4>
                  <Link
                    to={`/admin/products/${product.id}/edit`}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit Specifications</span>
                  </Link>
                </div>

                {specs.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <Layers className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-medium text-gray-600">No specifications defined</p>
                    <p className="text-[11px] text-gray-400 max-w-xs mx-auto">
                      Add parameters such as measurement range, repeat precision, and gauging pressure in the editor.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-gray-200 overflow-hidden shadow-2xs divide-y divide-gray-100">
                    {specs.map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between px-4 py-2.5 text-xs bg-white hover:bg-gray-50 transition-colors">
                        <span className="font-medium text-gray-700 capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-mono font-semibold text-gray-900">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 font-mono">
                    Product Photography ({imagesCount})
                  </h4>
                  <Link
                    to={`/admin/product-images?productId=${product.id}`}
                    className="text-xs font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                  >
                    <ImageIcon className="w-3 h-3" />
                    <span>Manage in Image Library</span>
                  </Link>
                </div>

                {imagesCount === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-gray-50 border border-gray-100 space-y-2">
                    <ImageIcon className="w-8 h-8 text-gray-300 mx-auto" />
                    <p className="text-xs font-medium text-gray-600">No images uploaded</p>
                    <Link
                      to={`/admin/product-images?productId=${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold shadow-2xs mt-2"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Upload Photos</span>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {product.product_images?.map((img) => (
                      <div
                        key={img.id}
                        className={`relative rounded-xl border bg-gray-50 overflow-hidden aspect-square flex items-center justify-center p-2 group ${
                          img.is_primary ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-200'
                        }`}
                      >
                        <img
                          src={img.image_url}
                          alt={img.alt_text || product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                        {img.is_primary && (
                          <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[10px] font-bold bg-gray-900 text-amber-300 shadow-sm flex items-center gap-1">
                            <Star className="w-2.5 h-2.5 fill-amber-300" />
                            <span>Primary</span>
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-between gap-3">
            {onDeleteRequest && (
              <button
                type="button"
                onClick={() => onDeleteRequest(product)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors shadow-2xs"
                title="Delete product"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Link
                to={`/admin/product-images?productId=${product.id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 transition-colors shadow-2xs"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>Media Assets</span>
              </Link>

              <Link
                to={`/admin/products/${product.id}/edit`}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-2xs"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Product</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
