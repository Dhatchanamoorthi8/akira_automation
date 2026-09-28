import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DropZone, DropZoneFile, formatFileSize, getFileExtensionLabel } from './DropZone';

describe('DropZone Component', () => {
  it('formats file sizes accurately', () => {
    expect(formatFileSize(1468006)).toBe('1.4 MB');
    expect(formatFileSize(512000)).toBe('500 KB');
    expect(formatFileSize(0)).toBe('0 B');
  });

  it('extracts correct extension labels', () => {
    expect(getFileExtensionLabel('calibration-certificate.jpg')).toBe('JPG');
    expect(getFileExtensionLabel('schematic.jpeg')).toBe('JPG');
    expect(getFileExtensionLabel('manual.pdf')).toBe('PDF');
    expect(getFileExtensionLabel('demo.mp4')).toBe('MP4');
    expect(getFileExtensionLabel('unknown', 'application/pdf')).toBe('PDF');
  });

  it('renders default title, subtext, and select button', () => {
    render(<DropZone />);

    expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument();
    expect(
      screen.getByText('Supports JPEG, PNG, PDF, and MP4 up to 50 MB.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /select file/i })).toBeInTheDocument();
  });

  it('renders uploaded file item card with format badge, size, 100% status, and remove button', () => {
    const mockFiles: DropZoneFile[] = [
      {
        id: 'file-1',
        name: 'calibration-certificate-01-3487339.jpg',
        size: 1468006, // ~1.4 MB
        type: 'image/jpeg',
        progress: 100,
        status: 'complete',
      },
    ];

    const handleRemove = vi.fn();

    render(
      <DropZone
        files={mockFiles}
        onFileRemove={handleRemove}
      />
    );

    // Filename displayed
    expect(
      screen.getByText('calibration-certificate-01-3487339.jpg')
    ).toBeInTheDocument();

    // Format badge JPG
    expect(screen.getByText('JPG')).toBeInTheDocument();

    // Size and percentage
    expect(screen.getByText('1.4 MB')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();

    // Remove button
    const removeBtn = screen.getByRole('button', { name: /remove file/i });
    expect(removeBtn).toBeInTheDocument();

    fireEvent.click(removeBtn);
    expect(handleRemove).toHaveBeenCalledWith(0, mockFiles[0]);
  });

  it('supports drag over and drag leave states', () => {
    render(<DropZone />);

    const dropArea = screen.getByRole('button', { name: /upload files drop zone/i });

    fireEvent.dragOver(dropArea);
    expect(screen.getByText('Drop files here to upload')).toBeInTheDocument();

    fireEvent.dragLeave(dropArea);
    expect(screen.getByText('Drag files here or click to browse')).toBeInTheDocument();
  });

  it('validates file size limit and shows error alert', () => {
    render(<DropZone maxSizeMB={5} />);

    // Create a mock oversized file (6 MB)
    const largeFile = new File(['x'.repeat(100)], 'huge-scan.png', {
      type: 'image/png',
    });
    Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024 });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { files: [largeFile] } });

    expect(screen.getByText(/exceeds the 5 MB size limit/i)).toBeInTheDocument();
  });
});
