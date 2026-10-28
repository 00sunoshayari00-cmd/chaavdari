// app/api/admin/products/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  badRequest,
  prismaCode,
  requireAdmin,
  unauthorized,
} from "@/lib/admin";
import { productSchema } from "@/lib/validators";
import { findUniqueConflict, toProductData } from "@/lib/productData";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const conflict = await findUniqueConflict(parsed.data);
  if (conflict) return badRequest(conflict);

  const { data, images } = toProductData(parsed.data);

  try {
    const product = await db.product.create({
      data: { ...data, images: { create: images } },
    });
    revalidatePath("/", "layout");
    return NextResponse.json(product, { status: 201 });
  } catch (e) {
    if (prismaCode(e) === "P2002")
      return badRequest("That slug or SKU is already used");
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
