// lib/cloudinaryImage.ts
// Let Cloudinary resize and pick the format (WebP/AVIF) instead of the Next.js
// optimizer, which times out (broken image) on large uploads like hero PNGs.
import type { ImageLoaderProps } from "next/image";

/** Cloudinary URL scaled down to `width` px, in the best format for the browser. */
export function cloudinarySized(src: string, width: number) {
  return src.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

/** next/image `loader` for Cloudinary images. Client components only (it's a function). */
export const cloudinaryLoader = ({ src, width }: ImageLoaderProps) =>
  cloudinarySized(src, width);
