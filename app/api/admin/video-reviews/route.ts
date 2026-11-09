// app/api/admin/video-reviews/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { videoReviewSchema } from "@/lib/validators";
import { REVIEW_LIMITS } from "@/lib/reviewLimits";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = videoReviewSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const { max, maxVisible } = REVIEW_LIMITS.videos;
  const [total, visible] = await Promise.all([
    db.videoReview.count(),
    db.videoReview.count({ where: { isVisible: true } }),
  ]);

  if (total >= max) {
    return badRequest(
      `You can add up to ${max} video reviews. Delete one first.`,
    );
  }
  if (parsed.data.isVisible && visible >= maxVisible) {
    return badRequest(
      `Only ${maxVisible} video reviews can be shown on the home page. Hide another one first, or save this one as hidden.`,
    );
  }

  const review = await db.videoReview.create({ data: parsed.data });
  revalidatePath("/", "layout");
  return NextResponse.json(review, { status: 201 });
}
