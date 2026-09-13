import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Check,
  Plus,
  X,
  Package,
  Sliders,
  FileText,
  Layers,
  Sparkles,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { CreateProductInput, UpdateProductInput, ProductImage } from '../../types/database';
import { productService } from '../../services/productService';
import { ProductImageManager } from '../../components/admin/ProductImageManager';
import { PageLoader } from '../../components/common/PageLoader';
import { SEOHead } from '../../components/layout/SEOHead';

const KNOWN_CATEGORIES = [
  'Air Gauging',
  'Electronic Gauging',
  'Multi-Gauging Systems',
  'Special Gauging Fixtures',
  'Setting Masters & Standards',
  'Pneumatic & Electronic Displays',
];

export const AdminProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(isEditMode);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Air Gauging');
  const [customCategory, setCustomCategory] = useState<string>('');
  const [tagline, setTagline] = useState<string>('');
  const [shortDescription, setShortDescription] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [active, setActive] = useState<boolean>(true);
  const [featured, setFeatured] = useState<boolean>(false);

  // Lists
  const [highlightsText, setHighlightsText] = useState<string>('');
  const [featuresText, setFeaturesText] = useState<string>('');
  const [applicationsText, setApplicationsText] = useState<string>('');

  // Specifications Key-Value Pairs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: 'Diameter Range', value: '' },
    { key: 'Accuracy / Repeatability', value: '' },
    { key: 'Calibration Standard', value: '' },
  ]);

  // Images (in Edit mode)
  const [images, setImages] = useState<ProductImage[]>([]);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // 1. Fetch existing product if in Edit mode
  useEffect(() => {
    if (!id) return;

    let isMounted = true;
    setIsLoading(true);

    productService.getProductById(id).then((result) => {
      if (!isMounted) return;
      setIsLoading(false);

      if (result.error || !result.product) {
        setError(result.error || 'Product could not be loaded.');
        return;
      }

      const p = result.product;
      setName(p.name);
      setSlug(p.slug);
      setIsSlugManuallyEdited(true);

      if (KNOWN_CATEGORIES.includes(p.category || '')) {
        setCategory(p.category || 'Air Gauging');
      } else {
        setCategory('custom');
        setCustomCategory(p.category || '');
      }

      setTagline(p.tagline || '');
      setShortDescription(p.short_description || '');
      setDescription(p.description || '');
      setActive(p.active);
      setFeatured(p.featured);

      setHighlightsText((p.highlights || []).join('\n'));
      setFeaturesText((p.features || []).join('\n'));
      setApplicationsText((p.applications || []).join('\n'));

      // Populate specifications key-value table
      const specEntries = Object.entries(p.specifications || {});
      if (specEntries.length > 0) {
        setSpecs(specEntries.map(([k, v]) => ({ key: k, value: String(v) })));
      }

      setImages(p.product_images || []);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  // 2. Auto-generate slug when name changes (only in Create mode or until manual edit)
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isSlugManuallyEdited) {
      setSlug(productService.generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugManuallyEdited(true);
    setSlug(productService.generateSlug(e.target.value));
  };

  // 3. Specification Table Handlers
  const handleAddSpecRow = () => {
    setSpecs([...specs, { key: '', value: '' }]);
  };

  const handleSpecChange = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...specs];
    updated[index][field] = value;
    setSpecs(updated);
  };

  const handleRemoveSpecRow = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  // 4. Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Basic Validations
    if (!name.trim()) {
      setError('Product Name is required.');
      return;
    }

    const cleanSlug = slug.trim() || productService.generateSlug(name);
    if (!cleanSlug) {
      setError('A valid URL slug is required.');
      return;
    }

    const resolvedCategory = category === 'custom' ? customCategory.trim() : category;
    if (!resolvedCategory) {
      setError('Category is required.');
      return;
    }

    // Specifications map
    const specsMap: Record<string, string> = {};
    specs.forEach((s) => {
      if (s.key.trim() && s.value.trim()) {
        specsMap[s.key.trim()] = s.value.trim();
      }
    });

    // Clean multiline arrays
    const parseList = (text: string) =>
      text
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);

    setIsSaving(true);

    if (isEditMode && id) {
      // UPDATE
      const updatePayload: UpdateProductInput = {
        name: name.trim(),
        slug: cleanSlug,
        category: resolvedCategory,
        tagline: tagline.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        active,
        featured,
        highlights: parseList(highlightsText),
        features: parseList(featuresText),
        applications: parseList(applicationsText),
        specifications: specsMap,
      };

      const result = await productService.updateProduct(id, updatePayload);
      setIsSaving(false);

      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMessage('Product changes saved successfully.');
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } else {
      // CREATE
      const createPayload: CreateProductInput = {
        name: name.trim(),
        slug: cleanSlug,
        category: resolvedCategory,
        tagline: tagline.trim() || undefined,
        short_description: shortDescription.trim() || undefined,
        description: description.trim() || undefined,
        active,
        featured,
        highlights: parseList(highlightsText),
        features: parseList(featuresText),
        applications: parseList(applicationsText),
        specifications: specsMap,
      };

      const result = await productService.createProduct(createPayload);
      setIsSaving(false);

      if (result.error) {
        setError(result.error);
      } else if (result.product) {
        // Redirect to edit page so user can upload images immediately
        navigate(`/admin/products/${result.product.id}/edit`, { replace: true });
      }
    }
  };

  // 5. Delete Product Handler
  const handleDeleteProduct = async () => {
    if (!id) return;
    setIsDeleting(true);
    setError(null);

    const result = await productService.deleteProduct(id);
    setIsDeleting(false);

    if (result.error) {
      setError(result.error);
      setShowDeleteModal(false);
    } else {
      navigate('/admin/products');
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title={`${isEditMode ? 'Edit Product' : 'Create Product'} | AKIRA AUTOMATION Admin`}
        description="Engineering specification editor and photography asset manager."
      />

      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Top Breadcrumb & Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Link
              to="/admin/products"
              className="p-2 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-industrial-dark hover:bg-slate-50 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center shadow-subtle"
              title="Return to products catalogue"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-industrial-dark font-heading tracking-tight">
                {isEditMode ? `Edit Product: ${name}` : 'Create New Metrology Product'}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? 'Update technical parameters, dimensional ranges, and visual assets.'
                  : 'Register a new gauging instrument or custom inspection station in Supabase.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isEditMode && (
              <>
                <a
                  href={`/products/${slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:text-industrial-primary text-xs font-semibold shadow-subtle min-h-[38px]"
                  title="Preview on live public website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Preview</span>
                </a>

                <button
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold min-h-[38px] transition-colors"
                  title="Delete this product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </>
            )}

            <button
              type="submit"
              form="product-form"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-industrial-primary text-white text-xs font-semibold hover:bg-industrial-hover disabled:opacity-50 transition-colors shadow-subtle min-h-[38px]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>{isEditMode ? 'Save Changes' : 'Create Product'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form id="product-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Core Product Specifications */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1: Identification & Overview */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Package className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Product Identification</span>
                </h3>

                <div>
                  <label htmlFor="product-name" className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Air Plug Gauge to Check ID Bore"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-slug" className="block text-xs font-semibold text-slate-700 mb-1">
                    URL Slug Identifier <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-xs">
                      /products/
                    </span>
                    <input
                      id="product-slug"
                      type="text"
                      required
                      value={slug}
                      onChange={handleSlugChange}
                      placeholder="air-plug-gauge"
                      className="w-full pl-24 pr-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Unique public URL path. Use lowercase alphanumeric characters and hyphens.
                  </p>
                </div>

                <div>
                  <label htmlFor="product-tagline" className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Tagline / Subheading
                  </label>
                  <input
                    id="product-tagline"
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="e.g. Precision Internal Diameter & Bore Measurement with Setting Rings"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-short-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                    Card Short Description
                  </label>
                  <textarea
                    id="product-short-desc"
                    rows={2}
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                    placeholder="Brief 1-2 sentence engineering overview for catalogue listings..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-full-desc" className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Engineering Overview
                  </label>
                  <textarea
                    id="product-full-desc"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Comprehensive description of measurement principles, metallurgy, and construction..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>
              </div>

              {/* Card 2: Technical Specifications Table */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 text-industrial-primary" />
                    <span>Technical Specifications Table</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleAddSpecRow}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-semibold bg-sky-50 text-industrial-primary hover:bg-sky-100 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Parameter</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {specs.map((row, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={row.key}
                        onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        placeholder="Parameter (e.g. Diameter Range)"
                        className="w-1/2 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-industrial-primary"
                      />
                      <input
                        type="text"
                        value={row.value}
                        onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        placeholder="Specification Value (e.g. 2 mm to 200 mm)"
                        className="w-1/2 px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:border-industrial-primary"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSpecRow(idx)}
                        className="p-1.5 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete parameter row"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 3: Highlights, Features & Applications */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <FileText className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Technical Lists (One item per line)</span>
                </h3>

                <div>
                  <label htmlFor="product-highlights" className="block text-xs font-semibold text-slate-700 mb-1">
                    Key Highlights (Top Bullet Points)
                  </label>
                  <textarea
                    id="product-highlights"
                    rows={3}
                    value={highlightsText}
                    onChange={(e) => setHighlightsText(e.target.value)}
                    placeholder="Range: 2 mm to 200 mm&#10;Supplied for through bore / blind bore&#10;Hard chrome plated gauging surface"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-features" className="block text-xs font-semibold text-slate-700 mb-1">
                    Technical Features & Capabilities
                  </label>
                  <textarea
                    id="product-features"
                    rows={3}
                    value={featuresText}
                    onChange={(e) => setFeaturesText(e.target.value)}
                    placeholder="Adjustable depth collars for specific depth checks&#10;Two setting rings ensure precise comparative zero"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>

                <div>
                  <label htmlFor="product-applications" className="block text-xs font-semibold text-slate-700 mb-1">
                    Industrial Manufacturing Applications
                  </label>
                  <textarea
                    id="product-applications"
                    rows={3}
                    value={applicationsText}
                    onChange={(e) => setApplicationsText(e.target.value)}
                    placeholder="Automotive engine cylinder and liner inspection&#10;Precision bushings, sleeves, and bearing ID checks"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Publishing, Category, and Media Assets */}
            <div className="space-y-6">
              {/* Card 4: Publishing & Status */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Sparkles className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Publishing Controls</span>
                </h3>

                {/* Active Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold text-industrial-dark block">
                      Active on Public Website
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      When active, visitors can browse and request RFQs.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-industrial-primary rounded focus:ring-industrial-primary"
                  />
                </div>

                {/* Featured Toggle */}
                <div className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50">
                  <div>
                    <span className="text-xs font-bold text-industrial-dark block">
                      Homepage Featured Showcase
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      Display prominently on the website homepage.
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-industrial-primary rounded focus:ring-industrial-primary"
                  />
                </div>
              </div>

              {/* Card 5: Category Assignment */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Layers className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Category Classification</span>
                </h3>

                <div>
                  <label htmlFor="product-category" className="block text-xs font-semibold text-slate-700 mb-1">
                    Metrology Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary bg-white text-slate-800"
                  >
                    {KNOWN_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="custom">+ Custom Category</option>
                  </select>
                </div>

                {category === 'custom' && (
                  <div>
                    <label htmlFor="custom-category" className="block text-xs font-semibold text-slate-700 mb-1">
                      Custom Category Name
                    </label>
                    <input
                      id="custom-category"
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Laser Micrometers"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-industrial-primary/20 focus:border-industrial-primary"
                    />
                  </div>
                )}
              </div>

              {/* Card 6: Visual Assets / Images */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                {isEditMode && id ? (
                  <ProductImageManager
                    productId={id}
                    images={images}
                    onImagesChange={setImages}
                  />
                ) : (
                  <div className="text-center py-6 space-y-2 border border-dashed border-slate-200 rounded-xl bg-slate-50/50 p-4">
                    <p className="text-xs font-bold text-slate-700">Image Uploads</p>
                    <p className="text-[11px] text-slate-500">
                      Save this initial product record first. You will be automatically redirected to upload factory photography, set primary cover images, and reorder gallery assets.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
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
                  Are you sure you want to delete <strong className="text-slate-800 font-semibold">{name}</strong>?
                  This action cannot be undone and will purge all associated photography from Supabase Storage.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 py-2.5 px-4 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteProduct}
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
