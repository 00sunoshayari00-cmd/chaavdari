// app/api/admin/products/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import {
  badRequest,
  prismaCode,
  requireAdmin,
  unauthorized,
} from "@/lib/admin";
import { productSchema } from "@/lib/validators";
import { findUniqueConflict, toProductData } from "@/lib/productData";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await db.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conflict = await findUniqueConflict(parsed.data, id);
  if (conflict) return badRequest(conflict);

  const { data, images } = toProductData(parsed.data);

  try {
    // Replace the image rows with the submitted list (order = position)
    await db.$transaction([
      db.productImage.deleteMany({ where: { productId: id } }),
      db.product.update({
        where: { id },
        data: { ...data, images: { create: images } },
      }),
    ]);
  } catch (e) {
    if (prismaCode(e) === "P2002")
      return badRequest("That slug or SKU is already used");
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  // Remove images the owner took out of the product from Cloudinary (best effort)
  const keep = new Set(images.map((i) => i.publicId));
  await Promise.allSettled(
    existing.images
      .filter((i) => !keep.has(i.publicId))
      .map((i) => cloudinary.uploader.destroy(i.publicId)),
  );

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const existing = await db.product.findUnique({
    where: { id },
    include: { images: true },
  });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.product.delete({ where: { id } }); // image rows cascade
  await Promise.allSettled(
    existing.images.map((i) => cloudinary.uploader.destroy(i.publicId)),
  );

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
