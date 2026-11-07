// app/api/admin/hero/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { heroSlideSchema } from "@/lib/validators";

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = heroSlideSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  try {
    const slide = await db.heroSlide.create({ data: parsed.data });
    revalidatePath("/", "layout");
    return NextResponse.json(slide, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
