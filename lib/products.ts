// lib/products.ts  (server only)
import { cache } from "react";
import { db } from "@/lib/db";

const withImages = { images: { orderBy: { position: "asc" as const } } };

// cache() lets generateMetadata and the page share one query
export const getProduct = cache(async (slug: string) =>
  db.product.findFirst({
    where: { slug, isActive: true },
    include: { category: true, ...withImages },
  }),
);

// Categories that have at least one visible product, with those products
export const getCatalog = cache(async () =>
  db.category.findMany({
    where: { products: { some: { isActive: true } } },
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: {
      products: {
        where: { isActive: true },
        orderBy: [
          { isFeatured: "desc" },
          { sortOrder: "asc" },
          { createdAt: "desc" },
        ],
        include: withImages,
      },
    },
  }),
);

export const getSettings = cache(async () => {
  const row = await db.settings.findUnique({ where: { id: 1 } });
  return {
    discountPercent: row?.discountPercent ?? 0,
    discountMinAmount: row?.discountMinAmount ?? 0,
  };
});

// Same category first, then fill up with other products
export async function getRelatedProducts(
  categoryId: string,
  excludeId: string,
  take = 3,
) {
  const order = [
    { isFeatured: "desc" as const },
    { sortOrder: "asc" as const },
  ];

  const same = await db.product.findMany({
    where: { isActive: true, categoryId, id: { not: excludeId } },
    orderBy: order,
    take,
    include: withImages,
  });
  if (same.length >= take) return same;

  const more = await db.product.findMany({
    where: {
      isActive: true,
      id: { notIn: [excludeId, ...same.map((p) => p.id)] },
    },
    orderBy: order,
    take: take - same.length,
    include: withImages,
  });
  return [...same, ...more];
}
