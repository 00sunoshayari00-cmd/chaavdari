// app/api/admin/settings/youtube/route.ts
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { badRequest, requireAdmin, unauthorized } from "@/lib/admin";
import { youtubeLinkSchema } from "@/lib/validators";

export async function PUT(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const body = await req.json().catch(() => null);
  const parsed = youtubeLinkSchema.safeParse(body);
  if (!parsed.success)
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  await db.settings.upsert({
    where: { id: 1 },
    update: { youtubeUrl: parsed.data.youtubeUrl },
    create: { id: 1, youtubeUrl: parsed.data.youtubeUrl },
  });

  revalidatePath("/", "layout");
  return NextResponse.json({ ok: true });
}
