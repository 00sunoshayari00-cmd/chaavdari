// app/api/admin/video-reviews/[id]/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { z } from "zod";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { videoReviewSchema, visibilitySchema } from "@/lib/validators";
import { REVIEW_LIMITS } from "@/lib/reviewLimits";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const body = await req.json().catch(() => null);
  const existing = await db.videoReview.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Either the quick show/hide button ({ isVisible }) or the full edit form
  let data: z.infer<typeof videoReviewSchema> | { isVisible: boolean };
  const toggle = visibilitySchema.safeParse(body);
  if (toggle.success) {
    data = toggle.data;
  } else {
    const parsed = videoReviewSchema.safeParse(body);
    if (!parsed.success)
      return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");
    data = parsed.data;
  }

  const { maxVisible } = REVIEW_LIMITS.videos;
  if (data.isVisible && !existing.isVisible) {
    const visible = await db.videoReview.count({
      where: { isVisible: true, id: { not: id } },
    });
    if (visible >= maxVisible) {
      return badRequest(
        `Only ${maxVisible} video reviews can be shown on the home page. Hide another one first.`,
      );
    }
  }

  await db.videoReview.update({ where: { id }, data });

  // A new thumbnail replaces the old one, so remove the old file from Cloudinary
  if (
    "thumbnailPublicId" in data &&
    data.thumbnailPublicId !== existing.thumbnailPublicId
  ) {
    await cloudinary.uploader
      .destroy(existing.thumbnailPublicId)
      .catch(() => undefined);
  }

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  if (!(await requireAdmin())) return unauthorized();
  const { id } = await params;

  const existing = await db.videoReview.findUnique({ where: { id } });
  if (!existing)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.videoReview.delete({ where: { id } });
  await cloudinary.uploader
    .destroy(existing.thumbnailPublicId)
    .catch(() => undefined);

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
