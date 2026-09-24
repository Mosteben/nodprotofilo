"use client";

/** Browser-side image editing: crop, rotate, resize and re-encode with <canvas>. */

export type PixelCrop = { x: number; y: number; width: number; height: number };

export type OutputFormat = "image/webp" | "image/jpeg" | "image/png";

const OUTPUT_EXTENSION: Record<OutputFormat, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
};

export type ProcessOptions = {
  crop: PixelCrop;
  /** Degrees, clockwise. */
  rotation: number;
  /** Longest allowed width in pixels; 0 keeps the cropped size. */
  maxWidth: number;
  format: OutputFormat;
  /** 0–1, ignored for PNG. */
  quality: number;
};

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذّر تحميل الصورة."));
    image.src = src;
  });
}

function context(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("المتصفح لا يدعم تعديل الصور.");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

/** Size of the bounding box of a width×height rectangle rotated by `rotation` degrees. */
function rotatedSize(width: number, height: number, rotation: number) {
  const rad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rad) * width) + Math.abs(Math.sin(rad) * height),
    height: Math.abs(Math.sin(rad) * width) + Math.abs(Math.cos(rad) * height),
  };
}

/** Rotates the whole image, then cuts out the crop rectangle (coordinates are in rotated space). */
function cropRotated(image: HTMLImageElement, crop: PixelCrop, rotation: number): HTMLCanvasElement {
  const rotated = document.createElement("canvas");
  const box = rotatedSize(image.naturalWidth, image.naturalHeight, rotation);
  rotated.width = Math.round(box.width);
  rotated.height = Math.round(box.height);
  const rctx = context(rotated);
  rctx.translate(rotated.width / 2, rotated.height / 2);
  rctx.rotate((rotation * Math.PI) / 180);
  rctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);
  rctx.drawImage(image, 0, 0);

  const out = document.createElement("canvas");
  out.width = Math.max(1, Math.round(crop.width));
  out.height = Math.max(1, Math.round(crop.height));
  context(out).drawImage(rotated, crop.x, crop.y, crop.width, crop.height, 0, 0, out.width, out.height);
  return out;
}

/** Downscales in halving steps for noticeably sharper results than one big resize. */
function resize(source: HTMLCanvasElement, maxWidth: number): HTMLCanvasElement {
  if (!maxWidth || source.width <= maxWidth) return source;
  let current = source;
  while (current.width / 2 > maxWidth) {
    const step = document.createElement("canvas");
    step.width = Math.round(current.width / 2);
    step.height = Math.round(current.height / 2);
    context(step).drawImage(current, 0, 0, step.width, step.height);
    current = step;
  }
  const out = document.createElement("canvas");
  out.width = maxWidth;
  out.height = Math.round((current.height * maxWidth) / current.width);
  context(out).drawImage(current, 0, 0, out.width, out.height);
  return out;
}

function encode(canvas: HTMLCanvasElement, format: OutputFormat, quality: number): Promise<Blob> {
  // JPEG has no transparency: paint a white background so transparent areas are not black.
  let source = canvas;
  if (format === "image/jpeg") {
    source = document.createElement("canvas");
    source.width = canvas.width;
    source.height = canvas.height;
    const ctx = context(source);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, source.width, source.height);
    ctx.drawImage(canvas, 0, 0);
  }
  return new Promise((resolve, reject) =>
    source.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("تعذّر حفظ الصورة بهذه الصيغة."))),
      format,
      format === "image/png" ? undefined : quality
    )
  );
}

export async function processImage(
  image: HTMLImageElement,
  options: ProcessOptions
): Promise<{ blob: Blob; width: number; height: number }> {
  const cropped = cropRotated(image, options.crop, options.rotation);
  const sized = resize(cropped, options.maxWidth);
  const blob = await encode(sized, options.format, options.quality);
  return { blob, width: sized.width, height: sized.height };
}

/** "photo.png" + "image/webp" → "photo.webp" */
export function renameForFormat(fileName: string, format: OutputFormat): string {
  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return `${base}.${OUTPUT_EXTENSION[format]}`;
}
