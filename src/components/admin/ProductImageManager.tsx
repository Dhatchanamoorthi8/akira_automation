import React, { useState, useRef } from 'react';
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
} from 'lucide-react';
import { ProductImage } from '../../types/database';
import { productImageService } from '../../services/productImageService';

interface ProductImageManagerProps {
  productId: string;
  images: ProductImage[];
  onImagesChange: (updatedImages: ProductImage[]) => void;
  disabled?: boolean;
}

export const ProductImageManager: React.FC<ProductImageManagerProps> = ({
  productId,
  images,
  onImagesChange,
  disabled = false,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAltId, setEditingAltId] = useState<string | null>(null);
  const [altDraft, setAltDraft] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [replacingId, setReplacingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // Refresh helper
  const reloadImages = async () => {
    try {
      const refreshed = await productImageService.list(productId);
      onImagesChange(refreshed);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh images.');
    }
  };

  // 1. Upload new image(s)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
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
        onChange={handleFileUpload}
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

      {/* Header & Upload Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-industrial-primary" />
            <span>Product Gallery & Visual Assets</span>
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Upload JPEG, PNG, or WebP photography (max 5 MB). Set primary cover photo and arrange ordering.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-industrial-primary text-white hover:bg-industrial-hover disabled:opacity-50 transition-colors shadow-subtle min-h-[38px] self-start sm:self-auto"
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
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            className="ml-auto text-rose-500 hover:text-rose-800 p-1"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Gallery Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => !disabled && fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-industrial-primary/60 rounded-xl p-8 text-center cursor-pointer transition-colors bg-slate-50/50 hover:bg-sky-50/30"
        >
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">No product images uploaded yet</p>
          <p className="text-[11px] text-slate-500 mt-1">
            Click here or use the button above to upload primary and detail gallery images.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={img.id}
              className={`group relative rounded-xl border bg-white overflow-hidden shadow-subtle flex flex-col transition-all ${
                img.is_primary ? 'border-industrial-primary ring-1 ring-industrial-primary/30' : 'border-slate-200'
              }`}
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                <img
                  src={img.image_url}
                  alt={img.alt_text || 'Product asset'}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                  }}
                />

                {/* Primary Tag */}
                {img.is_primary ? (
                  <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-industrial-dark text-amber-300 shadow-sm">
                    <Star className="w-3 h-3 fill-amber-300 text-amber-300" />
                    <span>Primary</span>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(img.id)}
                    disabled={disabled}
                    className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-white/90 text-slate-700 hover:text-industrial-primary hover:bg-white shadow-sm transition-all min-h-[24px]"
                  >
                    <Star className="w-3 h-3 text-slate-400 hover:text-amber-500" />
                    <span>Set Primary</span>
                  </button>
                )}

                {/* Reorder Arrows */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 'left')}
                    disabled={disabled || idx === 0}
                    className="p-1 rounded bg-white/90 text-slate-700 hover:bg-white shadow-sm disabled:opacity-30 min-h-[26px] min-w-[26px] flex items-center justify-center"
                    title="Move earlier in gallery"
                    aria-label="Move image left"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReorder(idx, 'right')}
                    disabled={disabled || idx === images.length - 1}
                    className="p-1 rounded bg-white/90 text-slate-700 hover:bg-white shadow-sm disabled:opacity-30 min-h-[26px] min-w-[26px] flex items-center justify-center"
                    title="Move later in gallery"
                    aria-label="Move image right"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Card Meta & Actions */}
              <div className="p-3 bg-white border-t border-slate-100 flex-1 flex flex-col justify-between space-y-2">
                {/* Alt Text / Title */}
                {editingAltId === img.id ? (
                  <div className="space-y-1.5">
                    <input
                      type="text"
                      value={altDraft}
                      onChange={(e) => setAltDraft(e.target.value)}
                      placeholder="Image alt description..."
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded focus:outline-none focus:border-industrial-primary"
                      autoFocus
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSaveAltText(img.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-industrial-primary text-white flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingAltId(null)}
                        className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] text-slate-600 truncate flex-1" title={img.alt_text || 'No alt text'}>
                      {img.alt_text || <span className="text-slate-400 italic">No alt text</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingAltId(img.id);
                        setAltDraft(img.alt_text || '');
                      }}
                      className="text-slate-400 hover:text-industrial-primary p-0.5"
                      title="Edit alt text"
                      aria-label="Edit alt text"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Footer Action Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-50 text-xs">
                  <button
                    type="button"
                    onClick={() => triggerReplace(img.id)}
                    disabled={disabled}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-industrial-primary py-1"
                    title="Replace with updated photography"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Replace</span>
                  </button>

                  {confirmDeleteId === img.id ? (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDelete(img.id)}
                        className="text-[10px] font-bold text-rose-600 hover:underline px-1 py-0.5"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-[10px] text-slate-400 hover:text-slate-600 px-1 py-0.5"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(img.id)}
                      disabled={disabled}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-colors"
                      title="Delete image"
                      aria-label="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
