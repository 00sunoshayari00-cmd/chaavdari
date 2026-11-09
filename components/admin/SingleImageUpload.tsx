// components/admin/SingleImageUpload.tsx
"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { secondaryBtn } from "./styles";

export interface UploadedImage {
  url: string;
  publicId: string;
}

interface SingleImageUploadProps {
  value: UploadedImage | null;
  onChange: (value: UploadedImage | null) => void;
  kind: "thumbnail" | "avatar";
  hint: string;
  optional?: boolean;
}

export default function SingleImageUpload({
  value,
  onChange,
  kind,
  hint,
  optional,
}: SingleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const round = kind === "avatar";

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", kind);
      const { data } = await adminApi.post<UploadedImage>("/upload", fd);
      onChange({ url: data.url, publicId: data.publicId });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <div className="flex items-end gap-4">
        {value ? (
          <Image
            src={value.url}
            alt=""
            width={round ? 80 : 96}
            height={round ? 80 : 144}
            className={`border object-cover ${round ? "size-20 rounded-full" : "h-36 w-24 rounded-lg"}`}
          />
        ) : (
          <div
            aria-hidden="true"
            className={`border border-dashed bg-neutral-50 ${round ? "size-20 rounded-full" : "h-36 w-24 rounded-lg"}`}
          />
        )}

        <div className="space-y-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className={secondaryBtn}
          >
            {uploading
              ? "Uploading..."
              : value
                ? "Replace image"
                : "Choose image"}
          </button>
          {value && optional && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="block text-xs text-red-600 hover:underline"
            >
              Remove image
            </button>
          )}
        </div>
      </div>

      <p className="mt-2 text-xs text-neutral-500">{hint}</p>
      {error && (
        <p role="alert" className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
