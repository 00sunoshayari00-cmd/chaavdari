// components/admin/HeroImageField.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Trash2 } from "lucide-react";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { cloudinaryLoader } from "@/lib/cloudinaryImage";
import { LIMITS } from "@/lib/productRules";
import { HERO_IMAGES, type HeroImageKind } from "@/lib/heroRules";
import { secondaryBtn } from "./styles";

export interface HeroImage {
  url: string;
  publicId: string;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** Pixel size read in the browser; null if it can't decode it (the server checks again). */
async function readSize(file: File) {
  try {
    const bmp = await createImageBitmap(file);
    const size = { width: bmp.width, height: bmp.height };
    bmp.close();
    return size;
  } catch {
    return null;
  }
}

export default function HeroImageField({
  label,
  kind,
  value,
  onChange,
  hint,
  error,
}: {
  label: string;
  kind: HeroImageKind;
  value: HeroImage | null;
  onChange: (image: HeroImage | null) => void;
  hint?: string;
  error?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problem, setProblem] = useState("");
  const { minWidth, minHeight, recommended } = HERO_IMAGES[kind];

  async function handleFile(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    setProblem("");

    if (!ALLOWED.includes(file.type))
      return setProblem("Only JPG, PNG, WebP or AVIF images");
    if (file.size > LIMITS.images.maxBytes)
      return setProblem("Image must be under 4 MB");
    const size = await readSize(file);
    if (size && (size.width < minWidth || size.height < minHeight))
      return setProblem(
        `Image is ${size.width}×${size.height} px. It must be at least ${minWidth}×${minHeight} px.`,
      );

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const { data } = await adminApi.post<HeroImage>("/upload", fd);
      onChange({ url: data.url, publicId: data.publicId });
    } catch (err) {
      setProblem(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  const message = problem || error;

  return (
    <div>
      <p className="text-sm font-medium text-neutral-700">{label}</p>
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}

      <div className="mt-2 flex flex-wrap items-end gap-3">
        {value && (
          <Image
            src={value.url}
            alt=""
            loader={cloudinaryLoader}
            width={kind === "hero" ? 240 : 96}
            height={kind === "hero" ? 100 : 120}
            className={`rounded-md border object-cover ${
              kind === "hero" ? "h-25 w-60" : "h-30 w-24"
            }`}
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED.join(",")}
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <button
          type="button"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
          className={secondaryBtn}
        >
          {uploading ? "Uploading..." : value ? "Replace" : "Upload image"}
        </button>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2.5 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Remove
          </button>
        )}
      </div>

      <p className="mt-1 text-xs text-neutral-500">
        Best {recommended}. At least {minWidth}×{minHeight} px, under 4 MB.
      </p>
      {message && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {message}
        </p>
      )}
    </div>
  );
}
