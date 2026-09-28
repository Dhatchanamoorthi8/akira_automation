import React, { useState, useRef, useCallback } from 'react';
import { UploadCloud, Trash2, AlertCircle, X, Loader2 } from 'lucide-react';
import { Button } from '@heroui/react';

export interface DropZoneFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file?: File;
  previewUrl?: string;
  progress?: number; // e.g. 100
  status?: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string;
}

export interface DropZoneProps {
  /** List of files (controlled mode) */
  files?: DropZoneFile[];
  /** Callback when files change (controlled mode) */
  onFilesChange?: (files: DropZoneFile[]) => void;
  /** Callback fired when raw files are selected or dropped */
  onFileSelect?: (selectedFiles: File[]) => void;
  /** Callback fired when a file is removed */
  onFileRemove?: (index: number, file: DropZoneFile) => void;
  /** Accepted mime types or extensions, e.g. "image/jpeg,image/png,application/pdf,video/mp4" */
  accept?: string;
  /** Maximum file size allowed in megabytes (default 50 MB) */
  maxSizeMB?: number;
  /** Whether multiple files can be selected (default true) */
  multiple?: boolean;
  /** Primary dropzone title */
  title?: string;
  /** Secondary subtitle describing supported formats and limits */
  subtext?: string;
  /** Text on the selection pill button */
  buttonText?: string;
  /** Whether user interactions are disabled */
  disabled?: boolean;
  /** Additional custom class names for the outer wrapper */
  className?: string;
  /** Whether to show the bottom list of uploaded / selected files */
  showFileList?: boolean;
}

/**
 * Format bytes to readable string (e.g. 1.4 MB, 820 KB)
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);
  // Matches "1.4 MB" format from design
  return `${parseFloat(value.toFixed(1))} ${sizes[i]}`;
};

/**
 * Extract clean 3-4 character uppercase extension badge label
 */
export const getFileExtensionLabel = (fileName: string, mimeType?: string): string => {
  const parts = fileName.split('.');
  if (parts.length > 1) {
    const rawExt = parts.pop()?.toUpperCase() || '';
    if (rawExt === 'JPEG') return 'JPG';
    return rawExt.slice(0, 4);
  }
  if (mimeType) {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('png')) return 'PNG';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'JPG';
    if (mimeType.includes('mp4')) return 'MP4';
    if (mimeType.includes('webp')) return 'WEBP';
  }
  return 'FILE';
};

/**
 * Document icon with folded dog-ear corner and colored format badge
 * matches the exact visual specification from the reference design.
 */
export const FileTypeBadgeIcon: React.FC<{
  extension: string;
  className?: string;
}> = ({ extension, className = 'w-9 h-11' }) => {
  const ext = extension.toUpperCase();
  
  // Format badge background color (Blue by default as in design, distinct accents for PDF / MP4)
  const badgeColorClass =
    ext === 'PDF'
      ? 'bg-rose-600'
      : ext === 'MP4'
      ? 'bg-purple-600'
      : 'bg-[#0066FF]'; // Vibrant brand blue matching screenshot

  return (
    <div className={`relative shrink-0 select-none ${className}`}>
      {/* Document outline with folded top-right corner */}
      <svg
        viewBox="0 0 36 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full text-slate-300 stroke-current drop-shadow-2xs"
      >
        <path
          d="M5 2H22L31 11V40C31 41.1046 30.1046 42 29 42H5C3.89543 42 3 41.1046 3 40V4C3 2.89543 3.89543 2 5 2Z"
          fill="white"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M22 2V11H31"
          stroke="#CBD5E1"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Solid format pill badge at bottom-left corner */}
      <div
        className={`absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded-[4px] text-[8.5px] font-bold text-white tracking-wider leading-none shadow-xs uppercase select-none ${badgeColorClass}`}
      >
        {ext}
      </div>
    </div>
  );
};

export const DropZone: React.FC<DropZoneProps> = ({
  files: controlledFiles,
  onFilesChange,
  onFileSelect,
  onFileRemove,
  accept = 'image/jpeg,image/png,image/webp,application/pdf,video/mp4',
  maxSizeMB = 50,
  multiple = true,
  title = 'Drag files here or click to browse',
  subtext = 'Supports JPEG, PNG, PDF, and MP4 up to 50 MB.',
  buttonText = 'Select File',
  disabled = false,
  className = '',
  showFileList = true,
}) => {
  const [internalFiles, setInternalFiles] = useState<DropZoneFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Files in either controlled or uncontrolled mode
  const currentFiles = controlledFiles !== undefined ? controlledFiles : internalFiles;

  const updateFiles = useCallback(
    (newFiles: DropZoneFile[]) => {
      if (onFilesChange) {
        onFilesChange(newFiles);
      } else {
        setInternalFiles(newFiles);
      }
    },
    [onFilesChange]
  );

  // Validate and process selected raw files
  const processFiles = (rawFiles: FileList | File[]) => {
    if (disabled) return;
    setErrorMessage(null);

    const validNewFiles: DropZoneFile[] = [];
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    const acceptedList = accept
      .split(',')
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);

    const filesArray = Array.from(rawFiles);
    if (filesArray.length === 0) return;

    for (const file of filesArray) {
      // 1. Validate file size
      if (file.size > maxSizeBytes) {
        setErrorMessage(
          `"${file.name}" exceeds the ${maxSizeMB} MB size limit (${formatFileSize(file.size)}).`
        );
        continue;
      }

      // 2. Validate MIME type or file extension if accept prop is specified
      if (acceptedList.length > 0) {
        const fileExt = '.' + (file.name.split('.').pop() || '').toLowerCase();
        const fileMime = file.type.toLowerCase();

        const isAccepted = acceptedList.some((pat) => {
          if (pat.startsWith('.')) {
            return fileExt === pat;
          }
          if (pat.endsWith('/*')) {
            const prefix = pat.replace('/*', '');
            return fileMime.startsWith(prefix);
          }
          return fileMime === pat;
        });

        if (!isAccepted) {
          setErrorMessage(
            `"${file.name}" has an unsupported format. Allowed: ${accept.replace(/image\//g, '').replace(/application\//g, '')}.`
          );
          continue;
        }
      }

      const fileObj: DropZoneFile = {
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        file: file,
        previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        progress: 100,
        status: 'complete',
      };

      validNewFiles.push(fileObj);
    }

    if (validNewFiles.length > 0) {
      if (multiple) {
        updateFiles([...currentFiles, ...validNewFiles]);
      } else {
        updateFiles(validNewFiles.slice(0, 1));
      }

      onFileSelect?.(validNewFiles.map((f) => f.file!).filter(Boolean));
    }
  };

  // Drag and Drop event handlers
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only deactivate if leaving the container boundaries
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input so same file can be picked again if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number, file: DropZoneFile) => {
    if (disabled) return;
    if (file.previewUrl) {
      URL.revokeObjectURL(file.previewUrl);
    }
    const updated = currentFiles.filter((_, i) => i !== index);
    updateFiles(updated);
    onFileRemove?.(index, file);
  };

  const triggerSelect = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={`w-full space-y-3.5 ${className}`}>
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        disabled={disabled}
        className="hidden"
        aria-hidden="true"
      />

      {/* Main Dashed Dropzone Card */}
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            triggerSelect();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-label="Upload files drop zone"
        className={`relative w-full rounded-2xl sm:rounded-3xl border border-dashed py-8 sm:py-9 px-4 sm:px-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 ${
          disabled
            ? 'opacity-60 cursor-not-allowed bg-slate-50/50 border-slate-200'
            : isDragging
            ? 'border-sky-500 bg-sky-50/60 ring-4 ring-sky-500/10 scale-[1.005]'
            : 'border-slate-300/90 hover:border-slate-400 bg-slate-50/40 hover:bg-slate-50/80'
        }`}
      >
        {/* Upload Cloud Icon */}
        <div className="flex items-center justify-center transition-transform duration-200 group-hover:scale-105">
          <UploadCloud
            className={`w-9 h-9 sm:w-10 sm:h-10 transition-colors duration-200 stroke-[1.6] ${
              isDragging ? 'text-sky-600' : 'text-slate-600'
            }`}
          />
        </div>

        {/* Primary Prompt */}
        <h4 className="mt-3.5 text-sm sm:text-base font-semibold text-slate-800 tracking-tight">
          {isDragging ? 'Drop files here to upload' : title}
        </h4>

        {/* Support specifications note */}
        <p className="mt-1 text-xs text-slate-500 max-w-sm sm:max-w-md px-2">
          {subtext}
        </p>

        {/* Select File Pill Button */}
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="outline"
            size="sm"
            onPress={triggerSelect}
            onClick={triggerSelect}
            isDisabled={disabled}
            className="rounded-full px-5 sm:px-6 py-2 text-xs sm:text-sm font-medium border border-slate-300 text-slate-800 bg-white hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 shadow-2xs transition-colors cursor-pointer"
          >
            {buttonText}
          </Button>
        </div>
      </div>

      {/* Inline Validation / Error Message */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-md text-rose-500 hover:text-rose-800 hover:bg-rose-100/50 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Files List / Preview Cards */}
      {showFileList && currentFiles.length > 0 && (
        <div className="space-y-2.5">
          {currentFiles.map((item, index) => {
            const ext = getFileExtensionLabel(item.name, item.type);
            const fileSize = formatFileSize(item.size);
            const isUploading = item.status === 'uploading';
            const progress = item.progress ?? 100;

            return (
              <div
                key={item.id || `${item.name}-${index}`}
                className="group relative rounded-2xl border border-slate-200 bg-white p-3 sm:p-3.5 flex items-center justify-between gap-3 shadow-2xs hover:border-slate-300/90 transition-all duration-150 animate-in fade-in slide-in-from-top-1"
              >
                {/* File Information (Left) */}
                <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
                  <FileTypeBadgeIcon extension={ext} />

                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-semibold text-slate-800 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </p>

                    <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 font-normal mt-0.5">
                      <span>{fileSize}</span>
                      <span className="text-slate-300 font-light">|</span>
                      {isUploading ? (
                        <span className="inline-flex items-center gap-1 text-sky-600 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>{progress}%</span>
                        </span>
                      ) : (
                        <span className="text-emerald-500 font-medium">
                          {progress}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete / Remove Action (Right) */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index, item);
                    }}
                    disabled={disabled}
                    className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    aria-label={`Remove file ${item.name}`}
                    title="Remove file"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
