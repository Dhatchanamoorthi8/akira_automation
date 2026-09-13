import { describe, it, expect } from 'vitest';
import { productImageService } from './productImageService';

describe('ProductImageService Validation', () => {
  it('approves valid WebP, PNG, and JPEG files within 5 MB', () => {
    const webpFile = new File(['dummy content'], 'gauge.webp', { type: 'image/webp' });
    const pngFile = new File(['dummy content'], 'display.png', { type: 'image/png' });
    const jpegFile = new File(['dummy content'], 'stand.jpeg', { type: 'image/jpeg' });

    expect(productImageService.validateFile(webpFile).valid).toBe(true);
    expect(productImageService.validateFile(pngFile).valid).toBe(true);
    expect(productImageService.validateFile(jpegFile).valid).toBe(true);
  });

  it('rejects unsupported file formats like executable, SVG, or PDF', () => {
    const pdfFile = new File(['dummy'], 'specs.pdf', { type: 'application/pdf' });
    const exeFile = new File(['dummy'], 'run.exe', { type: 'application/octet-stream' });
    const svgFile = new File(['<svg/>'], 'icon.svg', { type: 'image/svg+xml' });

    expect(productImageService.validateFile(pdfFile).valid).toBe(false);
    expect(productImageService.validateFile(pdfFile).error).toContain('Invalid file format');
    expect(productImageService.validateFile(exeFile).valid).toBe(false);
    expect(productImageService.validateFile(svgFile).valid).toBe(false);
  });

  it('rejects image files exceeding 5 MB limit', () => {
    // 6 MB buffer
    const largeBuffer = new Uint8Array(6 * 1024 * 1024);
    const largeFile = new File([largeBuffer], 'giant.webp', { type: 'image/webp' });

    const result = productImageService.validateFile(largeFile);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('5 MB');
  });

  it('rejects null or undefined file input', () => {
    // @ts-expect-error Testing runtime invalid input
    const result = productImageService.validateFile(null);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('No file provided');
  });

  it('allows exact boundary 5 MB file', () => {
    const exactBoundaryBuffer = new Uint8Array(5 * 1024 * 1024);
    const boundaryFile = new File([exactBoundaryBuffer], 'boundary.png', { type: 'image/png' });
    const result = productImageService.validateFile(boundaryFile);
    expect(result.valid).toBe(true);
  });
});
