// app/api/admin/hero/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { heroSlideSchema } from "@/lib/validators";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

const imageIds = (s: {
  imagePublicId: string;
  mobileImagePublicId: string | null;
}) => [s.imagePublicId, s.mobileImagePublicId].filter(Boolean) as string[];

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const parsed = heroSlideSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const existing = await db.heroSlide.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    await db.heroSlide.update({ where: { id }, data: parsed.data });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }

  // Remove replaced or removed images from Cloudinary (best effort)
  const keep = new Set(imageIds(parsed.data));
  await Promise.allSettled(
    imageIds(existing)
      .filter((publicId) => !keep.has(publicId))
      .map((publicId) => cloudinary.uploader.destroy(publicId)),
  );

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const existing = await db.heroSlide.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.heroSlide.delete({ where: { id } });
  await Promise.allSettled(
    imageIds(existing).map((publicId) => cloudinary.uploader.destroy(publicId)),
  );

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
