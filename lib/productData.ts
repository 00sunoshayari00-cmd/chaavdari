// lib/productData.ts
// Server only. Turns a validated product into Prisma data and checks the
// unique fields up front, so the owner gets a clear message.
import { db } from "@/lib/db";
import type { ProductInput } from "@/lib/validators";
import { sanitizeDescription } from "@/lib/sanitizeDescription";

export function toProductData({ images, ...data }: ProductInput) {
  return {
    data: {
      ...data,
      descriptionEn: sanitizeDescription(data.descriptionEn) ?? "",
      descriptionMr: sanitizeDescription(data.descriptionMr),
    },
    images: images.map((img, i) => ({ ...img, position: i })),
  };
}

/** Returns an error message if the slug or SKU belongs to another product. */
export async function findUniqueConflict(
  input: Pick<ProductInput, "slug" | "sku">,
  excludeId?: string,
) {
  const notSelf = excludeId ? { id: { not: excludeId } } : {};
  const [slugTaken, skuTaken] = await Promise.all([
    db.product.findFirst({ where: { slug: input.slug, ...notSelf }, select: { id: true } }),
    input.sku
      ? db.product.findFirst({
          where: { sku: { equals: input.sku, mode: "insensitive" }, ...notSelf },
          select: { id: true },
        })
      : null,
  ]);
  if (slugTaken) return "That slug is already used by another product";
  if (skuTaken) return "That SKU is already used by another product";
  return null;
}
