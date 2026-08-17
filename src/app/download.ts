/** Browser-side export helpers: file downloads, PNG rasterising, clipboard. */

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSvg(filename: string, svg: string): void {
  downloadBlob(filename, new Blob([svg], { type: 'image/svg+xml' }));
}

/**
 * Rasterise an SVG string to a PNG blob through an offscreen canvas. Downloads
 * and share sheets both want bytes, so the raster lives here once.
 */
export function svgToPngBlob(svg: string, width: number, height: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('canvas 2d context unavailable'));
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error('canvas toBlob failed'));
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('SVG could not be rasterised'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

export async function downloadPng(filename: string, svg: string, width: number, height: number): Promise<void> {
  downloadBlob(filename, await svgToPngBlob(svg, width, height));
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
