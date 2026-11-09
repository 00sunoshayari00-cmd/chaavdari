// app/api/admin/testimonials/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { testimonialSchema } from "@/lib/validators";
import { REVIEW_LIMITS } from "@/lib/reviewLimits";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = testimonialSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const total = await db.testimonial.count();
  if (total >= REVIEW_LIMITS.testimonials.max) {
    return badRequest(
      `You can add up to ${REVIEW_LIMITS.testimonials.max} testimonials. Delete one first.`,
    );
  }

  const item = await db.testimonial.create({ data: parsed.data });
  revalidatePath("/", "layout");
  return NextResponse.json(item, { status: 201 });
}
