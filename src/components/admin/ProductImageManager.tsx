import React, { useState, useRef, useEffect } from 'react';
import {
  UploadCloud,
  Star,
  Trash2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Check,
  X,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { ProductImage } from '../../types/database';
import { productImageService } from '../../services/productImageService';
import { Button, Card, Chip, Input, Modal } from '@heroui/react';
import { DropZone, getFileExtensionLabel } from '../common/DropZone';

interface ProductImageManagerProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (updatedImages: ProductImage[]) => void;
  disabled?: boolean;
  isFullWidth?: boolean;
  onToggleFullWidth?: () => void;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productId,
  images,
  onImagesChange,
  disabled = false,
  isFullWidth = false,
  onToggleFullWidth,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Preview Modal States
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Keyboard navigation for Preview Modal
  useEffect(() => {
    if (previewIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
        setIsZoomed(false);
      } else if (e.key === 'ArrowRight') {
        setPreviewIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
        setIsZoomed(false);
      } else if (e.key === 'Escape') {
        setPreviewIndex(null);
        setIsZoomed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewIndex, images.length]);

  // Refresh helper
  const reloadImages = async () => {
    try {
      const refreshed = await productImageService.list(productId);
      onImagesChange(refreshed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh images.');
    }
  };

  // 1. Batch upload files (from DropZone or file picker)
  const handleFilesUpload = async (files: File[]) => {
    if (!files || files.length === 0) return;

    setError(null);
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isFirst = images.length === 0 && i === 0;
        const sortOrder = images.length + i;

        const result = await productImageService.upload({
          productId,
          file,
          altText: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          isPrimary: isFirst,
          sortOrder,
        });

        if (result.error) {
          setError(result.error);
          break;
        }
      }
      await reloadImages();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Image upload failed.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleNativeFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    await handleFilesUpload(Array.from(files));
  };

  // 2. Set as primary
  const handleSetPrimary = async (imageId: string) => {
    if (disabled) return;
    setError(null);
    const result = await productImageService.setPrimary(productId, imageId);
    if (result.error) {
      setError(result.error);
    } else {
      await reloadImages();
    }
  };

  // 3. Move image left / right
  const handleReorder = async (index: number, direction: 'left' | 'right') => {
    if (disabled) return;
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;

    // Optimistic local update
    onImagesChange(newImages);

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      sort_order: idx,
    }));

    const result = await productImageService.reorder(productId, updates);
    if (result.error) {
      setError(result.error);
      await reloadImages();
    }
  };

  // 4. Save Alt Text
  const handleSaveAltText = async (imageId: string) => {
    setError(null);
    const result = await productImageService.updateAltText(imageId, altDraft);
    if (result.error) {
      setError(result.error);
    } else {
      setEditingAltId(null);
      await reloadImages();
    }
  };

  // 5. Replace Image
  const triggerReplace = (imageId: string) => {
    setReplacingId(imageId);
    if (replaceInputRef.current) {
      replaceInputRef.current.click();
    }
  };

  const handleReplaceFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingId) return;

    setError(null);
    setIsUploading(true);

    try {
      const result = await productImageService.replace({
        imageId: replacingId,
        productId,
        newFile: file,
      });

      if (result.error) {
        setError(result.error);
      } else {
        await reloadImages();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Replacement failed.');
    } finally {
      setIsUploading(false);
      setReplacingId(null);
      if (replaceInputRef.current) {
        replaceInputRef.current.value = '';
      }
    }
  };

  // 6. Delete Image
  const handleDelete = async (imageId: string) => {
    setError(null);
    const result = await productImageService.delete(imageId);
    setConfirmDeleteId(null);

    if (result.error) {
      setError(result.error);
    } else {
      await reloadImages();
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleNativeFileUpload}
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFile}
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
      />

      {/* Header Bar: Clean 2-row layout prevents text & button horizontal collisions */}
      <div className="pb-3 border-b border-slate-100 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5 min-w-0">
            <ImageIcon className="w-3.5 h-3.5 text-industrial-primary shrink-0" />
            <span className="truncate">Product Gallery & Visual Assets</span>
          </h3>

          <div className="flex items-center gap-1.5 shrink-0">
            {onToggleFullWidth && (
              <Button
                variant="outline"
                size="sm"
                onPress={onToggleFullWidth}
                onClick={onToggleFullWidth}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border border-slate-200 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs"
                aria-label={isFullWidth ? 'Dock to sidebar' : 'Expand to full width'}
              >
                {isFullWidth ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span>Dock</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Expand</span>
                  </>
                )}
              </Button>
            )}

            <Button
              variant="primary"
              size="sm"
              onPress={() => fileInputRef.current?.click()}
              onClick={() => fileInputRef.current?.click()}
              isDisabled={disabled || isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload Images</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Subtitle has full width underneath header row */}
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Upload JPEG, PNG, or WebP photography (max 5 MB). Set primary cover photo and arrange ordering.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            isIconOnly
            onPress={() => setError(null)}
            onClick={() => setError(null)}
            className="ml-auto text-rose-500 hover:text-rose-800 p-1 cursor-pointer"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}

      {/* Upload Progress Banner */}
      {isUploading && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs animate-in fade-in duration-150">
          <Loader2 className="w-4 h-4 animate-spin text-sky-600 shrink-0" />
          <span>Uploading and processing photography to gallery...</span>
        </div>
      )}

      {/* Interactive DropZone Component */}
      <div className="w-full">
        {images.length === 0 ? (
          <DropZone
            onFileSelect={handleFilesUpload}
            disabled={disabled || isUploading}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            title="No product images uploaded yet"
            subtext="Click here or use the button above to upload primary and detail gallery images. Supports JPEG, PNG, and WebP up to 5 MB."
            buttonText="Select File"
            showFileList={false}
          />
        ) : (
          <DropZone
            onFileSelect={handleFilesUpload}
            disabled={disabled || isUploading}
            accept="image/jpeg,image/png,image/webp"
            maxSizeMB={5}
            title="Drag files here or click to browse"
            subtext="Supports JPEG, PNG, and WebP up to 5 MB."
            buttonText="Select File"
            showFileList={false}
          />
        )}
      </div>

      {/* Gallery Section with Proper Grid / List View */}
      {images.length > 0 && (
        <div className="space-y-3 pt-1">
          {/* Subheader with View Switcher */}
          <div className="flex items-center justify-between pb-1 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-700">
              Gallery Photography ({images.length})
            </span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Grid View"
                aria-label="Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
                title="List View"
                aria-label="List View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* View Mode: Grid */}
          {viewMode === 'grid' && (
            <div
              className={`grid gap-3.5 ${
                isFullWidth
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}
            >
              {images.map((img, idx) => (
                <Card
                  key={img.id}
                  className={`group relative rounded-xl border bg-white overflow-hidden shadow-2xs hover:shadow-subtle hover:border-slate-300 flex flex-col transition-all p-0 ${
                    img.is_primary
                      ? 'border-industrial-primary ring-1 ring-industrial-primary/30'
                      : 'border-slate-200'
                  }`}
                >
                  {/* Thumbnail Container (Clicking opens high-res preview!) */}
                  <div
                    onClick={() => {
                      setPreviewIndex(idx);
                      setIsZoomed(false);
                    }}
                    className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden cursor-pointer group/img"
                    title="Click to preview image"
                  >
                    <img
                      src={img.image_url}
                      alt={img.alt_text || 'Product asset'}
                      className="w-full h-full object-contain p-2 group-hover/img:scale-105 transition-transform duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                      }}
                    />

                    {/* Hover Zoom Overlay */}
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity">
                      <div className="p-2 rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur-2xs flex items-center gap-1.5 text-[11px] font-medium px-3 py-1">
                        <ZoomIn className="w-3.5 h-3.5" />
                        <span>Preview</span>
                      </div>
                    </div>

                    {/* Primary Tag */}
                    {img.is_primary ? (
                      <Chip
                        size="sm"
                        variant="soft"
                        color="warning"
                        className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-industrial-dark text-amber-300 shadow-sm"
                      >
                        <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                        <Chip.Label>Primary</Chip.Label>
                      </Chip>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onPress={(e) => {
                          e?.continuePropagation?.();
                          handleSetPrimary(img.id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetPrimary(img.id);
                        }}
                        isDisabled={disabled}
                        className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/95 text-slate-700 hover:text-industrial-primary hover:bg-white shadow-sm transition-all min-h-[24px] cursor-pointer"
                      >
                        <Star className="w-3 h-3 text-slate-400 hover:text-amber-500" />
                        <span>Set Primary</span>
                      </Button>
                    )}

                    {/* Reorder Arrows */}
                    <div
                      className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onPress={() => handleReorder(idx, 'left')}
                        onClick={() => handleReorder(idx, 'left')}
                        isDisabled={disabled || idx === 0}
                        className="p-1 rounded bg-white/95 text-slate-700 hover:bg-white shadow-sm disabled:opacity-30 min-h-[26px] min-w-[26px] flex items-center justify-center cursor-pointer"
                        aria-label="Move image left"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        isIconOnly
                        onPress={() => handleReorder(idx, 'right')}
                        onClick={() => handleReorder(idx, 'right')}
                        isDisabled={disabled || idx === images.length - 1}
                        className="p-1 rounded bg-white/95 text-slate-700 hover:bg-white shadow-sm disabled:opacity-30 min-h-[26px] min-w-[26px] flex items-center justify-center cursor-pointer"
                        aria-label="Move image right"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Card Meta & Actions */}
                  <div className="p-3 bg-white border-t border-slate-100 flex-1 flex flex-col justify-between space-y-2">
                    {/* Alt Text / Title */}
                    {editingAltId === img.id ? (
                      <div className="space-y-1.5">
                        <Input
                          type="text"
                          value={altDraft}
                          onChange={(e) => setAltDraft(e.target.value)}
                          placeholder="Image alt description..."
                          className="w-full px-2 py-1 text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-industrial-primary bg-white"
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5">
                          <Button
                            variant="primary"
                            size="sm"
                            onPress={() => handleSaveAltText(img.id)}
                            onClick={() => handleSaveAltText(img.id)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-industrial-primary text-white flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Save</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onPress={() => setEditingAltId(null)}
                            onClick={() => setEditingAltId(null)}
                            className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 cursor-pointer"
                          >
                            <span>Cancel</span>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between gap-1.5">
                        <p
                          className="text-[11px] text-slate-600 truncate flex-1 font-medium cursor-pointer hover:text-industrial-primary"
                          title={img.alt_text || 'Click to preview'}
                          onClick={() => {
                            setPreviewIndex(idx);
                            setIsZoomed(false);
                          }}
                        >
                          {img.alt_text || (
                            <span className="text-slate-400 italic">No alt text</span>
                          )}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          isIconOnly
                          onPress={() => {
                            setEditingAltId(img.id);
                            setAltDraft(img.alt_text || '');
                          }}
                          onClick={() => {
                            setEditingAltId(img.id);
                            setAltDraft(img.alt_text || '');
                          }}
                          className="text-slate-400 hover:text-industrial-primary p-0.5 cursor-pointer shrink-0"
                          aria-label="Edit alt text"
                        >
                          <span
                            title="Edit alt text"
                            className="inline-flex items-center justify-center pointer-events-none"
                          >
                            <Edit2 className="w-3 h-3" />
                          </span>
                        </Button>
                      </div>
                    )}

                    {/* Footer Action Bar */}
                    {confirmDeleteId === img.id ? (
                      <div className="flex items-center justify-between gap-1.5 w-full bg-rose-50/90 border border-rose-200/90 rounded-lg px-2.5 py-1.5 animate-in fade-in duration-150">
                        <span className="text-[11px] font-semibold text-rose-700 flex items-center gap-1 min-w-0 truncate">
                          <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span className="truncate">Delete asset?</span>
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleDelete(img.id)}
                            className="px-2.5 py-1 rounded-md text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded-md text-[10px] font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                        <button
                          type="button"
                          onClick={() => triggerReplace(img.id)}
                          disabled={disabled}
                          className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-industrial-primary py-1 cursor-pointer transition-colors"
                          aria-label="Replace with updated photography"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Replace</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(img.id)}
                          disabled={disabled}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors cursor-pointer"
                          aria-label="Delete image"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* View Mode: List (Redesigned with proper layout, preview trigger & non-clipping badges) */}
          {viewMode === 'list' && (
            <div className="space-y-2.5">
              {images.map((img, idx) => {
                const ext = getFileExtensionLabel(img.image_url);
                return (
                  <div
                    key={img.id}
                    className="group relative rounded-2xl border border-slate-200 bg-white p-3 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300 transition-all duration-150"
                  >
                    {/* Left: Thumbnail & Information */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Thumbnail wrapper with hover preview trigger & non-clipped badge */}
                      <div
                        onClick={() => {
                          setPreviewIndex(idx);
                          setIsZoomed(false);
                        }}
                        className="relative shrink-0 w-12 h-12 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center cursor-pointer group/thumb hover:border-sky-400 hover:ring-2 hover:ring-sky-500/20 transition-all"
                        title="Click to preview full image"
                      >
                        <div className="w-full h-full rounded-xl overflow-hidden flex items-center justify-center p-0.5">
                          <img
                            src={img.image_url}
                            alt={img.alt_text || `Product asset ${idx + 1}`}
                            className="w-full h-full object-contain transition-transform group-hover/thumb:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                            }}
                          />
                        </div>

                        {/* Format badge sitting on bottom-left, cleanly visible without clip */}
                        <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-[4px] text-[8px] font-bold text-white bg-[#0066FF] shadow-xs uppercase select-none leading-none">
                          {ext}
                        </span>

                        {/* Hover Preview Hint */}
                        <div className="absolute inset-0 rounded-xl bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 flex items-center justify-center transition-opacity">
                          <ZoomIn className="w-3.5 h-3.5 text-white drop-shadow-xs" />
                        </div>
                      </div>

                      {/* Content Meta Info */}
                      <div className="min-w-0 flex-1 pl-0.5">
                        <div className="flex items-center gap-1.5">
                          <p
                            onClick={() => {
                              setPreviewIndex(idx);
                              setIsZoomed(false);
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-800 truncate cursor-pointer hover:text-industrial-primary transition-colors"
                            title={img.alt_text || `Product asset ${idx + 1}`}
                          >
                            {img.alt_text || `Asset ${idx + 1}`}
                          </p>
                          {img.is_primary && (
                            <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </div>

                        {/* Second Row: Actions & Details */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-0.5 flex-wrap">
                          <span className="font-mono text-[10px] text-slate-400 font-medium">
                            #{idx + 1}
                          </span>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => {
                              setPreviewIndex(idx);
                              setIsZoomed(false);
                            }}
                            className="text-sky-600 hover:text-sky-800 hover:underline font-medium inline-flex items-center gap-0.5 cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Preview</span>
                          </button>
                          <span className="text-slate-300">•</span>
                          <button
                            type="button"
                            onClick={() => triggerReplace(img.id)}
                            className="text-slate-600 hover:text-industrial-primary hover:underline font-medium cursor-pointer"
                          >
                            Replace
                          </button>
                          {!img.is_primary && (
                            <>
                              <span className="text-slate-300">•</span>
                              <button
                                type="button"
                                onClick={() => handleSetPrimary(img.id)}
                                className="text-amber-600 hover:text-amber-800 hover:underline font-medium cursor-pointer"
                              >
                                Set Primary
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right: Actions (Arrows & Delete) */}
                    <div className="flex items-center gap-0.5 shrink-0 self-center">
                      <button
                        type="button"
                        onClick={() => handleReorder(idx, 'left')}
                        disabled={disabled || idx === 0}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Move Up"
                        aria-label="Move Up"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(idx, 'right')}
                        disabled={disabled || idx === images.length - 1}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 disabled:opacity-20 disabled:hover:bg-transparent transition-colors cursor-pointer"
                        title="Move Down"
                        aria-label="Move Down"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      {confirmDeleteId === img.id ? (
                        <div className="flex items-center gap-1 ml-1">
                          <button
                            type="button"
                            onClick={() => handleDelete(img.id)}
                            className="px-2 py-1 rounded-md text-[10px] font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-2xs transition-colors cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-1.5 py-1 rounded-md text-[10px] font-medium text-slate-500 hover:bg-slate-100 transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(img.id)}
                          disabled={disabled}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-20 transition-colors cursor-pointer ml-0.5"
                          title="Delete image"
                          aria-label="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* High-Resolution Interactive Image Preview Modal */}
      {previewIndex !== null && images[previewIndex] && (
        <Modal.Backdrop
          isOpen={previewIndex !== null}
          onOpenChange={(open) => {
            if (!open) {
              setPreviewIndex(null);
              setIsZoomed(false);
            }
          }}
          variant="blur"
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150"
        >
          <Modal.Container size="cover" className="w-full max-w-5xl h-[88vh] flex flex-col p-1 sm:p-4">
            <Modal.Dialog className="bg-slate-900 border border-slate-800 rounded-2xl text-white w-full h-full overflow-hidden flex flex-col shadow-2xl focus:outline-none">
              {/* Modal Header */}
              <div className="px-4 sm:px-6 py-3.5 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between gap-3 sm:gap-4 shrink-0">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span className="text-xs font-mono font-semibold text-slate-300 bg-slate-800/90 border border-slate-700/80 px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 select-none">
                    {previewIndex + 1} / {images.length}
                  </span>
                  <span className="text-slate-600 shrink-0 select-none">•</span>
                  <h4
                    className="text-xs sm:text-sm font-semibold text-white truncate min-w-0"
                    title={images[previewIndex].alt_text || `Product Photography #${previewIndex + 1}`}
                  >
                    {images[previewIndex].alt_text || `Product Photography #${previewIndex + 1}`}
                  </h4>
                  {images[previewIndex].is_primary && (
                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-950/70 border border-amber-600/50 px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                      <Star className="w-2.5 h-2.5 fill-amber-300" />
                      <span>Primary</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  {!images[previewIndex].is_primary && (
                    <Button
                      variant="outline"
                      size="sm"
                      onPress={() => handleSetPrimary(images[previewIndex].id)}
                      onClick={() => handleSetPrimary(images[previewIndex].id)}
                      className="text-xs text-amber-300 border-amber-500/40 hover:bg-amber-500/10 cursor-pointer inline-flex items-center gap-1 px-2.5 py-1"
                    >
                      <Star className="w-3 h-3 text-amber-400" />
                      <span className="hidden sm:inline">Set as Primary</span>
                    </Button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsZoomed(!isZoomed)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title={isZoomed ? 'Zoom Out' : 'Zoom In'}
                    aria-label={isZoomed ? 'Zoom Out' : 'Zoom In'}
                  >
                    {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
                  </button>

                  <a
                    href={images[previewIndex].image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Open full resolution in new tab"
                    aria-label="Open full resolution"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIndex(null);
                      setIsZoomed(false);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
                    title="Close Preview (Esc)"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Image Display Area with Left/Right Navigation */}
              <div className="relative flex-1 bg-slate-950 flex items-center justify-center p-4 sm:p-8 min-h-0 overflow-auto select-none">
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIndex((prev) => (prev! > 0 ? prev! - 1 : images.length - 1));
                      setIsZoomed(false);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white shadow-xl backdrop-blur-xs transition-all cursor-pointer border border-slate-700/80 hover:scale-105"
                    title="Previous image (←)"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img
                    src={images[previewIndex].image_url}
                    alt={images[previewIndex].alt_text || 'Preview'}
                    className={`transition-transform duration-200 rounded-lg shadow-2xl object-contain max-w-full ${
                      isZoomed ? 'scale-150 cursor-zoom-out' : 'max-h-[66vh] cursor-zoom-in'
                    }`}
                    onClick={() => setIsZoomed(!isZoomed)}
                  />
                </div>

                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewIndex((prev) => (prev! < images.length - 1 ? prev! + 1 : 0));
                      setIsZoomed(false);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white shadow-xl backdrop-blur-xs transition-all cursor-pointer border border-slate-700/80 hover:scale-105"
                    title="Next image (→)"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Bottom Thumbnail Filmstrip */}
              {images.length > 1 && (
                <div className="px-4 py-3 bg-slate-900/95 border-t border-slate-800 flex items-center justify-center gap-2.5 overflow-x-auto shrink-0">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => {
                        setPreviewIndex(i);
                        setIsZoomed(false);
                      }}
                      className={`relative shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        i === previewIndex
                          ? 'border-sky-400 ring-2 ring-sky-400/40 scale-105 shadow-md'
                          : 'border-slate-700/80 opacity-50 hover:opacity-100 hover:border-slate-500'
                      }`}
                      title={img.alt_text || `Image ${i + 1}`}
                    >
                      <img
                        src={img.image_url}
                        alt={`Thumb ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      )}
    </div>
  );
};
