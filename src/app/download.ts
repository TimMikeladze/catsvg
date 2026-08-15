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

/** Rasterise an SVG string through an offscreen canvas. */
export function downloadPng(filename: string, svg: string, width: number, height: number): Promise<void> {
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
        downloadBlob(filename, blob);
        resolve();
      }, 'image/png');
    };
    img.onerror = () => reject(new Error('SVG could not be rasterised'));
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  });
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
