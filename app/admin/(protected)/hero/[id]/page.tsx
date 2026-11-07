// app/admin/(protected)/hero/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default async function EditHeroSlidePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const slide = await db.heroSlide.findUnique({ where: { id } });
  if (!slide) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit hero slide</h1>
      <HeroSlideForm slide={slide} />
    </div>
  );
}
