// lib/productImages.ts  (no database code, safe to import anywhere)
interface HasBanner {
  isBanner: boolean;
}

export function bannerOf<T extends HasBanner>(images: T[]): T | undefined {
  return images.find((i) => i.isBanner) ?? images[0];
}

// Banner first, then the rest in the owner's order
export function orderedImages<T extends HasBanner>(images: T[]): T[] {
  const banner = bannerOf(images);
  return banner ? [banner, ...images.filter((i) => i !== banner)] : images;
}
