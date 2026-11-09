// app/api/admin/testimonials/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { testimonialSchema, visibilitySchema } from "@/lib/validators";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const existing = await db.testimonial.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  let data: z.infer<typeof testimonialSchema> | { isVisible: boolean };
  const toggle = visibilitySchema.safeParse(body);
  if (toggle.success) {
    data = toggle.data;
  } else {
    const parsed = testimonialSchema.safeParse(body);
    if (!parsed.success)
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");
    data = parsed.data;
  }

  await db.testimonial.update({ where: { id }, data });

  // Photo replaced or removed: delete the old file
  if (
    "avatarPublicId" in data &&
    existing.avatarPublicId &&
    data.avatarPublicId !== existing.avatarPublicId
  ) {
    await cloudinary.uploader
      .destroy(existing.avatarPublicId)
      .catch(() => undefined);
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const existing = await db.testimonial.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.testimonial.delete({ where: { id } });
  if (existing.avatarPublicId) {
    await cloudinary.uploader
      .destroy(existing.avatarPublicId)
      .catch(() => undefined);
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
