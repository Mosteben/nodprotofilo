"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import * as Dialog from "@radix-ui/react-dialog";
import { RotateCcw, RotateCw, Eye, Check, X, AlertTriangle } from "lucide-react";
import {
  loadImage,
  processImage,
  renameForFormat,
  type OutputFormat,
} from "@/lib/image-processing";
import { MAX_UPLOAD_BYTES } from "@/lib/media";
import { cn, formatFileSize } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/form";

export type EditorSource = { src: string; name: string; type: string; size?: number };

const ASPECTS = [
  { key: "original", label: "الأصلية", value: null },
  { key: "16:9", label: "16:9", value: 16 / 9 },
  { key: "4:3", label: "4:3", value: 4 / 3 },
  { key: "1:1", label: "مربع", value: 1 },
  { key: "3:4", label: "3:4", value: 3 / 4 },
  { key: "9:16", label: "9:16", value: 9 / 16 },
] as const;

const WIDTHS = [0, 2400, 1920, 1600, 1200, 800, 400];

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "image/webp", label: "WebP (موصى به)" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG (بدون فقد)" },
];

type Preview = { url: string; blob: Blob; width: number; height: number };

function RangeControl({
  id,
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex justify-between font-ui text-sm text-navy mb-2">
        <label htmlFor={id}>{label}</label>
        <span className="text-navy/50 tabular-nums">{display}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[rgb(var(--color-gold-dark))]"
      />
    </div>
  );
}

/**
 * Crop / rotate / resize / compress an image in the browser. Resolves with a new File, or
 * with the untouched original when the user chooses "upload without changes".
 */
export function ImageEditorDialog({
  source,
  original,
  onCancel,
  onDone,
}: {
  source: EditorSource;
  original?: File;
  onCancel: () => void;
  onDone: (file: File) => void;
}) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectKey, setAspectKey] = useState<(typeof ASPECTS)[number]["key"]>("original");
  const [pixels, setPixels] = useState<Area | null>(null);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.82);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadImage(source.src).then(setImage, () => setLoadError(true));
  }, [source.src]);

  // Any change to the settings invalidates the preview.
  useEffect(() => setPreview(null), [pixels, rotation, maxWidth, format, quality]);

  // Free each preview's blob URL once it is replaced or the dialog closes.
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview.url)), [preview]);

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => setPixels(areaPixels), []);

  const naturalAspect = image ? image.naturalWidth / image.naturalHeight : 4 / 3;
  const aspect = ASPECTS.find((a) => a.key === aspectKey)?.value ?? naturalAspect;

  async function render(): Promise<Preview | null> {
    if (!image || !pixels) return null;
    if (preview) return preview;
    setBusy(true);
    setError("");
    try {
      const result = await processImage(image, { crop: pixels, rotation, maxWidth, format, quality });
      const next = { ...result, url: URL.createObjectURL(result.blob) };
      setPreview(next);
      return next;
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذّر معالجة الصورة.");
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function apply() {
    const result = await render();
    if (!result) return;
    if (result.blob.size > MAX_UPLOAD_BYTES) {
      setError("الصورة الناتجة أكبر من 5 ميجابايت — قلّلي العرض أو الجودة.");
      return;
    }
    onDone(new File([result.blob], renameForFormat(source.name, format), { type: format }));
  }

  const rotate = (delta: number) => setRotation((r) => (((r + delta) % 360) + 360) % 360);

  return (
    <Dialog.Root open onOpenChange={(open) => !open && !busy && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[95] bg-navy-900/70" />
        <Dialog.Content
          dir="rtl"
          aria-describedby={undefined}
          className="fixed z-[96] inset-2 sm:inset-6 lg:inset-x-[8vw] lg:inset-y-8 flex flex-col rounded-2xl bg-paper shadow-soft overflow-hidden"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-navy/10">
            <Dialog.Title className="font-display text-2xl text-navy">تعديل الصورة</Dialog.Title>
            <Dialog.Close className="h-9 w-9 rounded-full flex items-center justify-center text-navy/60 hover:bg-section" aria-label="إغلاق">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto grid lg:grid-cols-[1fr_320px]">
            <div className="relative min-h-[45vh] bg-navy-900">
              {loadError ? (
                <p role="alert" className="absolute inset-0 flex items-center justify-center font-ui text-white/80 p-6 text-center">
                  تعذّر تحميل الصورة للتعديل.
                </p>
              ) : image ? (
                preview ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local blob preview
                  <img src={preview.url} alt="معاينة الصورة بعد التعديل" className="absolute inset-0 h-full w-full object-contain p-4" />
                ) : (
                  <Cropper
                    image={source.src}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={aspect}
                    minZoom={1}
                    maxZoom={4}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    onCropComplete={onCropComplete}
                  />
                )
              ) : (
                <p className="absolute inset-0 flex items-center justify-center font-ui text-white/60">جارٍ التحميل...</p>
              )}
            </div>

            <div className="p-5 space-y-5 border-t lg:border-t-0 lg:border-s border-navy/10">
              {source.type === "image/gif" && (
                <p className="flex gap-2 rounded-xl bg-amber-50 p-3 font-ui text-xs text-amber-800">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  تعديل صورة GIF يحوّلها إلى صورة ثابتة.
                </p>
              )}

              <fieldset>
                <legend className="font-ui text-sm text-navy mb-2">نسبة القص</legend>
                <div className="flex flex-wrap gap-2">
                  {ASPECTS.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      aria-pressed={aspectKey === a.key}
                      onClick={() => setAspectKey(a.key)}
                      className={cn(
                        "h-9 px-3 rounded-full font-ui text-xs border transition-colors",
                        aspectKey === a.key ? "bg-navy text-white border-navy" : "border-navy/15 text-navy/70 hover:border-gold"
                      )}
                    >
                      {a.label}
                    </button>
                  ))}
                </div>
              </fieldset>

              <RangeControl id="editor-zoom" label="التكبير" value={zoom} min={1} max={4} step={0.05} display={`${zoom.toFixed(1)}×`} onChange={setZoom} />

              <div>
                <RangeControl id="editor-rotation" label="التدوير" value={rotation} min={0} max={359} step={1} display={`${rotation}°`} onChange={setRotation} />
                <div className="flex gap-2 mt-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => rotate(-90)} aria-label="تدوير 90 درجة عكس عقارب الساعة">
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => rotate(90)} aria-label="تدوير 90 درجة مع عقارب الساعة">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="editor-width" className="block font-ui text-sm text-navy mb-2">
                    أقصى عرض
                  </label>
                  <Select id="editor-width" value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="h-10 text-sm">
                    {WIDTHS.map((w) => (
                      <option key={w} value={w}>
                        {w ? `${w}px` : "بدون تغيير"}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label htmlFor="editor-format" className="block font-ui text-sm text-navy mb-2">
                    الصيغة
                  </label>
                  <Select id="editor-format" value={format} onChange={(e) => setFormat(e.target.value as OutputFormat)} className="h-10 text-sm">
                    {FORMATS.map((f) => (
                      <option key={f.value} value={f.value}>
                        {f.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {format !== "image/png" && (
                <RangeControl
                  id="editor-quality"
                  label="الجودة (الضغط)"
                  value={quality}
                  min={0.4}
                  max={1}
                  step={0.02}
                  display={`${Math.round(quality * 100)}٪`}
                  onChange={setQuality}
                />
              )}

              {preview && (
                <p className="rounded-xl bg-section p-3 font-ui text-xs text-navy/70" role="status">
                  الناتج: {preview.width}×{preview.height} · {formatFileSize(preview.blob.size)}
                  {source.size ? ` (الأصل ${formatFileSize(source.size)})` : ""}
                </p>
              )}
              {error && (
                <p role="alert" className="font-ui text-sm text-red-600">
                  {error}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-navy/10">
            {original ? (
              <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => onDone(original)}>
                رفع بدون تعديل
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-3">
              {preview ? (
                <Button type="button" size="sm" variant="outline" disabled={busy} onClick={() => setPreview(null)}>
                  رجوع للقص
                </Button>
              ) : (
                <Button type="button" size="sm" variant="outline" loading={busy} disabled={!image} onClick={() => void render()}>
                  <Eye className="h-4 w-4" />
                  معاينة
                </Button>
              )}
              <Button type="button" size="sm" loading={busy} disabled={!image} onClick={() => void apply()}>
                <Check className="h-4 w-4" />
                استخدام الصورة
              </Button>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
