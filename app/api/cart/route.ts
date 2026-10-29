// app/api/cart/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { CART_LIMITS, type CartApiResponse } from "@/lib/cartTypes";

export const dynamic = "force-dynamic";

const slugsSchema = z
  .array(
    z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(60),
  )
  .min(1)
  .max(CART_LIMITS.maxProducts);

export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("slugs") ?? "";
  const parsed = slugsSchema.safeParse(
    Array.from(new Set(raw.split(",").filter(Boolean))),
  );
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid cart" }, { status: 400 });
  }

  const [products, settings] = await Promise.all([
    db.product.findMany({
      where: { slug: { in: parsed.data }, isActive: true },
      select: {
        slug: true,
        nameEn: true,
        nameMr: true,
        price: true,
        mrp: true,
        weight: true,
        inStock: true,
        images: {
          orderBy: { position: "asc" },
          select: { url: true, altEn: true, altMr: true, isBanner: true },
        },
      },
    }),
    db.settings.findUnique({ where: { id: 1 } }),
  ]);

  const body: CartApiResponse = {
    products: products.map(({ images, ...p }) => {
      const banner = images.find((i) => i.isBanner) ?? images[0];
      return {
        ...p,
        image: banner
          ? { url: banner.url, altEn: banner.altEn, altMr: banner.altMr }
          : null,
      };
    }),
    discountPercent: settings?.discountPercent ?? 0,
    discountMinAmount: settings?.discountMinAmount ?? 0,
  };

  return NextResponse.json(body, { headers: { "Cache-Control": "no-store" } });
}
