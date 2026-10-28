// app/api/admin/categories/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  badRequest,
  prismaCode,
  requireAdmin,
  unauthorized,
} from "@/lib/admin";
import { categorySchema } from "@/lib/validators";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  try {
    const category = await db.category.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/", "layout");
    return NextResponse.json(category);
  } catch (e) {
    if (prismaCode(e) === "P2002")
      return badRequest("That slug is already used");
    if (prismaCode(e) === "P2025")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return NextResponse.json(
      { error: "This category still has products. Move or delete them first." },
      { status: 409 },
    );
  }

  try {
    await db.category.delete({ where: { id } });
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (prismaCode(e) === "P2025")
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Could not delete" }, { status: 500 });
  }
}
