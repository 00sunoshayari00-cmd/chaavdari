// app/sitemap.ts -> /sitemap.xml
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { SITE_URL } from "@/lib/site";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/seo";

// Rebuilt at most once an hour, so new products show up without a deploy
export const revalidate = 3600;

// One entry per language, each listing all its translations (hreflang)
function localized(
  path: string,
  extra: Omit<MetadataRoute.Sitemap[number], "url" | "alternates">,
): MetadataRoute.Sitemap {
  const languages: Record<string, string> = {};
  for (const l of LOCALES) languages[l] = `${SITE_URL}/${l}${path}`;
  languages["x-default"] = `${SITE_URL}/${DEFAULT_LOCALE}${path}`;

  return LOCALES.map((l) => ({
    url: `${SITE_URL}/${l}${path}`,
    alternates: { languages },
    ...extra,
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await db.product.findMany({
    where: { isActive: true, noindex: false },
    orderBy: { updatedAt: "desc" },
    select: {
      slug: true,
      updatedAt: true,
      images: { orderBy: { position: "asc" }, select: { url: true } },
    },
  });

  return [
    ...localized("", {
      lastModified: products[0]?.updatedAt ?? new Date(),
      changeFrequency: "weekly",
      priority: 1,
    }),
    ...products.flatMap((p) =>
      localized(`/products/${p.slug}`, {
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        images: p.images.map((img) => img.url),
      }),
    ),
  ];
}
