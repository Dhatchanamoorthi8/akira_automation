import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertCircle,
  Check,
  Sliders,
  FileText,
  Layers,
  Sparkles,
  Loader2,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";
import {
  Button,
  Modal,
  Input,
  TextArea,
  Select,
  ListBox,
  Label,
  Checkbox,
  TextField,
  InputGroup,
  Card,
} from "@heroui/react";
import {
  CreateProductInput,
  UpdateProductInput,
  ProductImage,
} from "../../types/database";
import { productService } from "../../services/productService";
import { productImageService } from "../../services/productImageService";
import { ProductImageManager } from "../../components/admin/ProductImageManager";
import { DropZone, DropZoneFile } from "../../components/common/DropZone";
import { PageLoader } from "../../components/common/PageLoader";
import { SEOHead } from "../../components/layout/SEOHead";
import { Box, Plus, TrashBin } from "@gravity-ui/icons";
const KNOWN_CATEGORIES = [
  "Air Gauging",
  "Electronic Gauging",
  "Multi-Gauging Systems",
  "Special Gauging Fixtures",
  "Setting Masters & Standards",
  "Pneumatic & Electronic Displays",
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
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] =
    useState<boolean>(false);
  const [category, setCategory] = useState<string>("Air Gauging");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [tagline, setTagline] = useState<string>("");
  const [shortDescription, setShortDescription] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);
  const [featured, setFeatured] = useState<boolean>(false);

  // Lists
  const [highlightsText, setHighlightsText] = useState<string>("");
  const [featuresText, setFeaturesText] = useState<string>("");
  const [applicationsText, setApplicationsText] = useState<string>("");

  // Specifications Key-Value Pairs
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([
    { key: "Diameter Range", value: "" },
    { key: "Accuracy / Repeatability", value: "" },
    { key: "Calibration Standard", value: "" },
  ]);

  // Images (in Edit mode)
  const [images, setImages] = useState<ProductImage[]>([]);

  // Staged Images (in Create mode with DropZone)
  const [stagedFiles, setStagedFiles] = useState<DropZoneFile[]>([]);
  const [uploadProgressStatus, setUploadProgressStatus] = useState<string | null>(null);
  const [isGalleryFullWidth, setIsGalleryFullWidth] = useState<boolean>(false);

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
        setError(result.error || "Product could not be loaded.");
        return;
      }

      const p = result.product;
      setName(p.name);
      setSlug(p.slug);
      setIsSlugManuallyEdited(true);

      if (KNOWN_CATEGORIES.includes(p.category || "")) {
        setCategory(p.category || "Air Gauging");
      } else {
        setCategory("custom");
        setCustomCategory(p.category || "");
      }

      setTagline(p.tagline || "");
      setShortDescription(p.short_description || "");
      setDescription(p.description || "");
      setActive(p.active);
      setFeatured(p.featured);

      setHighlightsText((p.highlights || []).join("\n"));
      setFeaturesText((p.features || []).join("\n"));
      setApplicationsText((p.applications || []).join("\n"));

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
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const handleSpecChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
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
      setError("Product Name is required.");
      return;
    }

    const cleanSlug = slug.trim() || productService.generateSlug(name);
    if (!cleanSlug) {
      setError("A valid URL slug is required.");
      return;
    }

    const resolvedCategory =
      category === "custom" ? customCategory.trim() : category;
    if (!resolvedCategory) {
      setError("Category is required.");
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
        .split("\n")
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
        setSuccessMessage("Product changes saved successfully.");
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

      if (result.error) {
        setIsSaving(false);
        setError(result.error);
      } else if (result.product) {
        // Upload staged images to the new product if any were selected in DropZone
        if (stagedFiles.length > 0) {
          setUploadProgressStatus(`Uploading ${stagedFiles.length} product image(s)...`);
          for (let i = 0; i < stagedFiles.length; i++) {
            const item = stagedFiles[i];
            if (item.file) {
              await productImageService.upload({
                productId: result.product.id,
                file: item.file,
                altText: item.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " "),
                isPrimary: i === 0,
                sortOrder: i,
              });
            }
          }
        }

        setIsSaving(false);
        // Redirect to edit page so user can manage photography immediately
        navigate(`/admin/products/${result.product.id}/edit`, {
          replace: true,
        });
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
      navigate("/admin/products");
    }
  };

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <>
      <SEOHead
        title={`${isEditMode ? "Edit Product" : "Create Product"} | Akira Precision Automation Admin`}
        description="Engineering specification editor and photography asset manager."
      />

      <div className="space-y-6 w-full">
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
                {isEditMode
                  ? `Edit Product: ${name}`
                  : "Create New Metrology Product"}
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditMode
                  ? "Update technical parameters, dimensional ranges, and visual assets."
                  : "Register a new gauging instrument or custom inspection station in Supabase."}
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
                  <span>{isEditMode ? "Save Changes" : "Create Product"}</span>
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
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-1.5">
                    <Box className="text-primary size-4" />
                    Product Identification
                  </Card.Title>
                </Card.Header>

                <Card.Content className="space-y-2">
                  <div>
                    <Label
                      htmlFor="product-name"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Official Product Name{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      id="product-name"
                      type="text"
                      required
                      value={name}
                      onChange={handleNameChange}
                      placeholder="e.g. Air Plug Gauge to Check ID Bore"
                      fullWidth
                      variant="secondary"
                      //className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-slug"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      URL Slug Identifier{" "}
                      <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <TextField className="w-full" name="slug">
                        <InputGroup variant="secondary">
                          <InputGroup.Prefix> /products/ </InputGroup.Prefix>
                          <InputGroup.Input
                            placeholder="air-plug-gauge"
                            id="product-slug"
                            type="text"
                            required
                            value={slug}
                            onChange={handleSlugChange}
                          />
                        </InputGroup>
                      </TextField>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Unique public URL path. Use lowercase alphanumeric
                      characters and hyphens.
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="product-tagline"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Technical Tagline / Subheading
                    </Label>
                    <Input
                      id="product-tagline"
                      type="text"
                      value={tagline}
                      onChange={(e) => setTagline(e.target.value)}
                      placeholder="e.g. Precision Internal Diameter & Bore Measurement with Setting Rings"
                      fullWidth
                      variant="secondary"
                      //className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-short-desc"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Card Short Description
                    </Label>
                    <TextArea
                      id="product-short-desc"
                      rows={2}
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="Brief 1-2 sentence engineering overview for catalogue listings..."
                      fullWidth
                      variant="secondary"
                      //className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-full-desc"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Detailed Engineering Overview
                    </Label>
                    <TextArea
                      id="product-full-desc"
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Comprehensive description of measurement principles, metallurgy, and construction..."
                      fullWidth
                      variant="secondary"
                      //className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-sans"
                    />
                  </div>
                </Card.Content>
              </Card>

              {/* Card 2: Technical Specifications Table */}
              <Card className="min-w-0 overflow-hidden">
                <Card.Header className="relative">
                  <Card.Title className="flex items-center gap-1.5 text-sm sm:text-base pr-10">
                    <Sliders className="text-primary size-4 shrink-0" />
                    <span>Technical Specifications Table</span>
                  </Card.Title>
                  <Button
                    onClick={handleAddSpecRow}
                    className="absolute end-3 top-3"
                    isIconOnly
                    size="sm"
                    aria-label="Add Parameter"
                  >
                    <Plus />
                  </Button>
                </Card.Header>

                <Card.Content className="mt-2 min-w-0">
                  <div className="space-y-3 sm:space-y-2.5">
                    {specs.map((row, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2.5 sm:p-0 rounded-xl sm:rounded-none bg-slate-50/70 sm:bg-transparent border border-slate-200/60 sm:border-none"
                      >
                        <div className="flex-1 min-w-0">
                          <Input
                            type="text"
                            value={row.key}
                            onChange={(e) =>
                              handleSpecChange(idx, "key", e.target.value)
                            }
                            placeholder="Parameter (e.g. Diameter Range)"
                            variant="secondary"
                            className="w-full min-w-0"
                            aria-label={`Parameter (row ${idx + 1})`}
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex items-center gap-2">
                          <Input
                            type="text"
                            value={row.value}
                            onChange={(e) =>
                              handleSpecChange(idx, "value", e.target.value)
                            }
                            placeholder="Specification Value (e.g. 2 mm to 200 mm)"
                            variant="secondary"
                            className="w-full flex-1 min-w-0"
                            aria-label={`Specification value for ${row.key || `parameter ${idx + 1}`}`}
                          />
                          <Button
                            onClick={() => handleRemoveSpecRow(idx)}
                            isIconOnly
                            variant="danger"
                            size="md"
                            className="shrink-0 rounded-xl cursor-pointer"
                            aria-label={`Remove parameter ${row.key || idx + 1}`}
                          >
                            <TrashBin className="w-4 h-4 text-white" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {specs.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                        <p className="text-xs text-slate-500 mb-2">
                          No technical specification parameters added yet.
                        </p>
                        <Button
                          onClick={handleAddSpecRow}
                          size="sm"
                          variant="outline"
                          className="inline-flex items-center gap-1.5 text-xs"
                          aria-label="Add Parameter"
                        >
                          <Plus />
                          <span>Add First Parameter</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </Card.Content>
              </Card>

              {/* Card 3: Highlights, Features & Applications */}
              <Card>
                <Card.Header>
                  <Card.Title className="flex items-center gap-1.5">
                    <FileText className="text-primary size-4" />
                    Technical Lists (One item per line)
                  </Card.Title>
                </Card.Header>

                <Card.Content className="mt-2 space-y-2">
                  <div>
                    <Label
                      htmlFor="product-highlights"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Key Highlights (Top Bullet Points)
                    </Label>
                    <TextArea
                      id="product-highlights"
                      rows={3}
                      value={highlightsText}
                      onChange={(e) => setHighlightsText(e.target.value)}
                      placeholder="Range: 2 mm to 200 mm&#10;Supplied for through bore / blind bore&#10;Hard chrome plated gauging surface"
                      variant="secondary"
                      fullWidth
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-features"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Technical Features & Capabilities
                    </Label>
                    <TextArea
                      id="product-features"
                      rows={3}
                      value={featuresText}
                      onChange={(e) => setFeaturesText(e.target.value)}
                      placeholder="Adjustable depth collars for specific depth checks&#10;Two setting rings ensure precise comparative zero"
                      variant="secondary"
                      fullWidth
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="product-applications"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Industrial Manufacturing Applications
                    </Label>
                    <TextArea
                      id="product-applications"
                      rows={3}
                      value={applicationsText}
                      onChange={(e) => setApplicationsText(e.target.value)}
                      placeholder="Automotive engine cylinder and liner inspection&#10;Precision bushings, sleeves, and bearing ID checks"
                      variant="secondary"
                      fullWidth
                    />
                  </div>
                </Card.Content>
              </Card>
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
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <Checkbox
                    isSelected={active}
                    onChange={(isSelected) => setActive(isSelected)}
                    className="w-full cursor-pointer"
                  >
                    <Checkbox.Content className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex-1 pr-3">
                        <span className="text-xs font-bold text-industrial-dark block">
                          Active on Public Website
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          When active, visitors can browse and request RFQs.
                        </span>
                      </div>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                </div>

                {/* Featured Toggle */}
                <div className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-100/50 transition-colors">
                  <Checkbox
                    isSelected={featured}
                    onChange={(isSelected) => setFeatured(isSelected)}
                    className="w-full cursor-pointer"
                  >
                    <Checkbox.Content className="flex items-center justify-between w-full cursor-pointer">
                      <div className="flex-1 pr-3">
                        <span className="text-xs font-bold text-industrial-dark block">
                          Homepage Featured Showcase
                        </span>
                        <span className="text-[11px] text-slate-500 block mt-0.5">
                          Display prominently on the website homepage.
                        </span>
                      </div>
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Content>
                  </Checkbox>
                </div>
              </div>

              {/* Card 5: Category Assignment */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <Layers className="w-3.5 h-3.5 text-industrial-primary" />
                  <span>Category Classification</span>
                </h3>

                <div>
                  <Label
                    htmlFor="product-category"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Metrology Category <span className="text-rose-500">*</span>
                  </Label>
                  <Select
                    value={category}
                    onChange={(val) => setCategory((val as string) || "")}
                    className="w-full"
                    aria-label="Metrology Category"
                  >
                    <Select.Trigger className="w-full h-9 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white text-slate-800 flex items-center justify-between cursor-pointer shadow-2xs">
                      <Select.Value className="text-xs font-medium text-slate-800 truncate" />
                      <Select.Indicator className="text-slate-400 text-xs ml-1 shrink-0" />
                    </Select.Trigger>
                    <Select.Popover className="bg-white rounded-xl shadow-xl border border-slate-200 p-1 z-50 min-w-[240px] max-h-60 overflow-y-auto">
                      <ListBox className="outline-none space-y-0.5">
                        {KNOWN_CATEGORIES.map((c) => (
                          <ListBox.Item
                            key={c}
                            id={c}
                            textValue={c}
                            className="px-2.5 py-1.5 text-xs rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900 data-[selected=true]:bg-sky-50 data-[selected=true]:text-sky-700 data-[selected=true]:font-semibold cursor-pointer outline-none transition-colors"
                          >
                            {c}
                            <ListBox.ItemIndicator />
                          </ListBox.Item>
                        ))}
                        <ListBox.Item
                          id="custom"
                          textValue="+ Custom Category"
                          className="px-2.5 py-1.5 text-xs rounded-lg text-sky-700 font-semibold hover:bg-sky-50 cursor-pointer outline-none"
                        >
                          + Custom Category
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      </ListBox>
                    </Select.Popover>
                  </Select>
                </div>

                {category === "custom" && (
                  <div>
                    <Label
                      htmlFor="custom-category"
                      className="block text-xs font-semibold text-slate-700 mb-1"
                    >
                      Custom Category Name
                    </Label>
                    <Input
                      id="custom-category"
                      type="text"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="e.g. Laser Micrometers"
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 bg-white font-sans"
                    />
                  </div>
                )}
              </div>

              {/* Card 6: Visual Assets / Images */}
              {isGalleryFullWidth && isEditMode && id ? (
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-subtle flex items-center justify-between gap-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5 font-mono uppercase tracking-wider">
                      <ImageIcon className="w-3.5 h-3.5 text-industrial-primary" />
                      <span>Gallery Expanded</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Viewing photography in full-width below specifications.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onPress={() => setIsGalleryFullWidth(false)}
                    onClick={() => setIsGalleryFullWidth(false)}
                    className="text-xs shrink-0 cursor-pointer"
                  >
                    Dock to Sidebar
                  </Button>
                </div>
              ) : (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
                  {isEditMode && id ? (
                    <ProductImageManager
                      productId={id}
                      images={images}
                      onImagesChange={setImages}
                      isFullWidth={false}
                      onToggleFullWidth={() => setIsGalleryFullWidth(true)}
                    />
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100">
                        <div>
                          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                            <ImageIcon className="w-3.5 h-3.5 text-industrial-primary" />
                            <span>Product Photography & Visual Assets</span>
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Drag and drop factory photography or product documentation.
                          </p>
                        </div>
                        {stagedFiles.length > 0 && (
                          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200/80 self-start sm:self-auto">
                            {stagedFiles.length} {stagedFiles.length === 1 ? "file" : "files"} staged
                          </span>
                        )}
                      </div>

                      <DropZone
                        files={stagedFiles}
                        onFilesChange={setStagedFiles}
                        accept="image/jpeg,image/png,image/webp,application/pdf,video/mp4"
                        maxSizeMB={50}
                        title="Drag files here or click to browse"
                        subtext="Supports JPEG, PNG, PDF, and MP4 up to 50 MB."
                        buttonText="Select File"
                      />

                      {uploadProgressStatus && (
                        <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-200 text-sky-800 rounded-xl text-xs animate-in fade-in duration-150">
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                          <span>{uploadProgressStatus}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Full-Width Gallery when expanded */}
          {isGalleryFullWidth && isEditMode && id && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-subtle space-y-4">
              <ProductImageManager
                productId={id}
                images={images}
                onImagesChange={setImages}
                isFullWidth={true}
                onToggleFullWidth={() => setIsGalleryFullWidth(false)}
              />
            </div>
          )}
        </form>

        {/* Delete Confirmation Modal */}
        <Modal.Backdrop
          isOpen={showDeleteModal}
          onOpenChange={setShowDeleteModal}
        >
          <Modal.Container>
            <Modal.Dialog className="sm:max-w-md">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Icon className="bg-rose-50 text-rose-600">
                  <Trash2 className="w-5 h-5" />
                </Modal.Icon>
                <Modal.Heading>Delete Product Permanently?</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete{" "}
                  <strong className="text-slate-800 font-semibold">
                    {name}
                  </strong>
                  ? This action cannot be undone and will purge all associated
                  photography from Supabase Storage.
                </p>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  variant="secondary"
                  size="md"
                  onPress={() => setShowDeleteModal(false)}
                  onClick={() => setShowDeleteModal(false)}
                  isDisabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  size="md"
                  onPress={handleDeleteProduct}
                  onClick={handleDeleteProduct}
                  isDisabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Delete Product"}
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </div>
    </>
  );
};
