// app/api/admin/categories/route.ts
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

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  try {
    const category = await db.category.create({ data: parsed.data });
    revalidatePath("/", "layout");
    return NextResponse.json(category, { status: 201 });
  } catch (e) {
    if (prismaCode(e) === "P2002")
      return badRequest("That slug is already used");
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
