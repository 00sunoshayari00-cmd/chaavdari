// components/frontend/components/ProductPage/ProductGallery.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { fill } from "@/lib/format";

interface ProductGalleryProps {
  images: { url: string; alt: string }[];
  thumbLabel: string; // "Show image {n}"
}

export default function ProductGallery({
  images,
  thumbLabel,
}: ProductGalleryProps) {
  const [active, setActive] = useState(0);

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-[20px] border border-[#FBE9D0] bg-[#FDF1DE]" />
    );
  }

  const current = images[active];

  return (
    <div className="rounded-[20px] border border-[#FBE9D0] bg-white p-3 sm:p-4">
      <div className="relative aspect-square overflow-hidden rounded-xl border border-[#FBE9D0] bg-[#FDF1DE]">
        <Image
          src={current.url}
          alt={current.alt}
          fill
          loading="eager"
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-contain"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={fill(thumbLabel, { n: i + 1 })}
                aria-current={i === active}
                className={`relative block size-16 overflow-hidden rounded-lg border-2 bg-[#FDF1DE] sm:size-20 ${
                  i === active
                    ? "border-[#F26A0F]"
                    : "border-transparent hover:border-[#F26A0F]/40"
                }`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-contain"
                />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
