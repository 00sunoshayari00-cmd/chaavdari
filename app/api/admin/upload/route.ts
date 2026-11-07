// app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import type { UploadApiResponse } from "cloudinary";
import cloudinary from "@/lib/cloudinary";
import { requireAdmin, unauthorized } from "@/lib/admin";
import { LIMITS } from "@/lib/productRules";
import { HERO_IMAGES, type HeroImageKind } from "@/lib/heroRules";

export const runtime = "nodejs";

const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_BYTES = LIMITS.images.maxBytes; // Vercel rejects request bodies over ~4.5MB
const MIN_SIDE = LIMITS.images.minSide;

// Product images unless the form sends kind=hero or kind=hero-mobile
function rulesFor(kind: FormDataEntryValue | null) {
  if (typeof kind === "string" && kind in HERO_IMAGES) {
    const { folder, minWidth, minHeight } = HERO_IMAGES[kind as HeroImageKind];
    return { folder, minWidth, minHeight };
  }
  return { folder: "chaavdari/products", minWidth: MIN_SIDE, minHeight: MIN_SIDE };
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) return unauthorized();

  const form = await req.formData();
  const file = form.get("file");
  const { folder, minWidth, minHeight } = rulesFor(form.get("kind"));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file received" }, { status: 400 });
  }
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json(
      { error: "Only JPG, PNG, WebP or AVIF images" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Image must be under 4 MB" },
      { status: 400 },
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { folder, resource_type: "image" },
          (err, res) =>
            err || !res
              ? reject(err ?? new Error("Upload failed"))
              : resolve(res),
        )
        .end(buffer);
    });

    // Cloudinary reads the real size; the browser check can be bypassed
    if (result.width < minWidth || result.height < minHeight) {
      await cloudinary.uploader.destroy(result.public_id).catch(() => {});
      return NextResponse.json(
        {
          error: `Image is ${result.width}×${result.height} px. It must be at least ${minWidth}×${minHeight} px.`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (err) {
    console.error("Cloudinary upload failed:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
