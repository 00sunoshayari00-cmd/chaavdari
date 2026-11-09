// app/admin/(protected)/testimonials/page.tsx
import { db } from "@/lib/db";
import TestimonialManager from "@/components/admin/TestimonialManager";

export default async function TestimonialsPage() {
  const items = await db.testimonial.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    select: {
      id: true,
      nameEn: true,
      nameMr: true,
      textEn: true,
      textMr: true,
      rating: true,
      avatarUrl: true,
      avatarPublicId: true,
      isVisible: true,
      sortOrder: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Testimonials</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Add up to 10 testimonials and choose which ones are shown on the home
        page. You can show all of them. Only add words your customers have
        agreed to share.
      </p>
      <TestimonialManager items={items} />
    </div>
  );
}
