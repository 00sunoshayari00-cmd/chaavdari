// components/admin/ImageUploader.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { LIMITS } from "@/lib/productRules";
import CharCounter from "./CharCounter";
import { inputClass, secondaryBtn } from "./styles";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  altEn: string;
  altMr: string;
  isBanner: boolean;
}

interface ImageUploaderProps {
  images: UploadedImage[];
  onChange: (images: UploadedImage[]) => void;
  /** Field errors keyed like "images.2.altEn" */
  errors?: Record<string, string>;
  /** Pre-fills alt text for new uploads */
  defaultAlt?: string;
}

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const { max, maxBytes, minSide } = LIMITS.images;

/** Reads the pixel size in the browser; null if the browser can't decode it (the server checks again). */
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

async function checkFile(file: File) {
  if (!ALLOWED.includes(file.type))
    return `${file.name}: only JPG, PNG, WebP or AVIF`;
  if (file.size > maxBytes) return `${file.name}: must be under 4 MB`;
  const size = await readSize(file);
  if (size && (size.width < minSide || size.height < minSide))
    return `${file.name}: ${size.width}×${size.height} px, needs at least ${minSide}×${minSide} px`;
  return null;
}

/** Keeps exactly one banner: the first image if none is chosen. */
function withBanner(list: UploadedImage[]) {
  if (!list.length || list.some((i) => i.isBanner)) return list;
  return list.map((img, i) => ({ ...img, isBanner: i === 0 }));
}

export default function ImageUploader({
  images,
  onChange,
  errors = {},
  defaultAlt = "",
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setProblems([]);
    setUploading(true);

    const issues: string[] = [];
    const uploaded: UploadedImage[] = [];
    const room = max - images.length;
    const picked = Array.from(files);
    if (picked.length > room)
      issues.push(`Only ${room} more image${room === 1 ? "" : "s"} allowed, the rest were skipped`);

    for (const file of picked.slice(0, room)) {
      const problem = await checkFile(file);
      if (problem) {
        issues.push(problem);
        continue;
      }
      try {
        const fd = new FormData();
        fd.append("file", file);
        const { data } = await adminApi.post<
          Pick<UploadedImage, "url" | "publicId" | "width" | "height">
        >("/upload", fd);
        uploaded.push({
          ...data,
          altEn: defaultAlt.slice(0, LIMITS.alt.max),
          altMr: "",
          isBanner: false,
        });
      } catch (err) {
        issues.push(`${file.name}: ${getErrorMessage(err)}`);
      }
    }

    if (uploaded.length) onChange(withBanner([...images, ...uploaded]));
    setProblems(issues);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  const update = (index: number, patch: Partial<UploadedImage>) =>
    onChange(images.map((img, i) => (i === index ? { ...img, ...patch } : img)));

  const setBanner = (index: number) =>
    onChange(images.map((img, i) => ({ ...img, isBanner: i === index })));

  const remove = (index: number) =>
    onChange(withBanner(images.filter((_, i) => i !== index)));

  const move = (index: number, by: -1 | 1) => {
    const next = [...images];
    const [img] = next.splice(index, 1);
    next.splice(index + by, 0, img);
    onChange(next);
  };

  return (
    <div>
      {images.length > 0 && (
        <ol className="mb-4 space-y-3">
          {images.map((img, index) => {
            const err = (k: string) => errors[`images.${index}.${k}`];
            return (
              <li
                key={img.publicId}
                className={`flex flex-col gap-3 rounded-lg border p-3 sm:flex-row ${
                  img.isBanner ? "border-[#F26A0F] bg-orange-50/40" : "border-neutral-200"
                }`}
              >
                <div className="shrink-0">
                  <Image
                    src={img.url}
                    alt={img.altEn}
                    width={112}
                    height={112}
                    className="size-28 rounded-md border object-cover"
                  />
                  <p className="mt-1 text-center text-[11px] text-neutral-500">
                    {img.width ? `${img.width}×${img.height}` : "size unknown"}
                  </p>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <input
                        type="radio"
                        name="banner-image"
                        checked={img.isBanner}
                        onChange={() => setBanner(index)}
                        className="size-4 accent-[#F26A0F]"
                      />
                      Banner image
                    </label>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        title="Move up"
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => move(index, -1)}
                        className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                      >
                        <ArrowUp className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Move down"
                        aria-label="Move down"
                        disabled={index === images.length - 1}
                        onClick={() => move(index, 1)}
                        className="rounded p-1.5 hover:bg-neutral-100 disabled:opacity-30"
                      >
                        <ArrowDown className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Remove"
                        aria-label="Remove image"
                        onClick={() => remove(index)}
                        className="rounded p-1.5 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  </div>

                  <label className="block text-xs font-medium text-neutral-700">
                    Alt text (English)
                    <input
                      className={inputClass}
                      value={img.altEn}
                      placeholder="e.g. Jaggery ladoos in a clay bowl"
                      aria-invalid={Boolean(err("altEn"))}
                      onChange={(e) => update(index, { altEn: e.target.value })}
                    />
                    <CharCounter
                      length={img.altEn.trim().length}
                      min={LIMITS.alt.min}
                      max={LIMITS.alt.max}
                      error={err("altEn")}
                    />
                  </label>
                  <label className="block text-xs font-medium text-neutral-700">
                    Alt text (Marathi, optional)
                    <input
                      className={inputClass}
                      value={img.altMr}
                      aria-invalid={Boolean(err("altMr"))}
                      onChange={(e) => update(index, { altMr: e.target.value })}
                    />
                    <CharCounter
                      length={img.altMr.trim().length}
                      min={LIMITS.alt.min}
                      max={LIMITS.alt.max}
                      error={err("altMr")}
                    />
                  </label>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={uploading || images.length >= max}
        onClick={() => inputRef.current?.click()}
        className={secondaryBtn}
      >
        {uploading ? "Uploading..." : "Add images"}
      </button>
      <span className="ml-3 text-xs text-neutral-500">
        {images.length}/{max}. JPG, PNG, WebP or AVIF, under 4 MB, at least{" "}
        {minSide}×{minSide} px. The banner is used on the card, at the top of
        the product page and in link previews. The rest show in this order.
      </span>

      {(problems.length > 0 || errors.images) && (
        <ul role="alert" className="mt-2 space-y-0.5 text-sm text-red-600">
          {errors.images && <li>{errors.images}</li>}
          {problems.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
