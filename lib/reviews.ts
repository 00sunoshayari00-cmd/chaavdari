// lib/reviews.ts  (server only)
import { cache } from "react";
import { db } from "@/lib/db";
import { REVIEW_LIMITS } from "@/lib/reviewLimits";

const order = [{ sortOrder: "asc" as const }, { createdAt: "desc" as const }];

export const getReviewsContent = cache(async () => {
  const [videos, testimonials, settings] = await Promise.all([
    // take: 4 keeps the home page at 4 even if the database was edited by hand
    db.videoReview.findMany({
      where: { isVisible: true },
      orderBy: order,
      take: REVIEW_LIMITS.videos.maxVisible,
    }),
    db.testimonial.findMany({
      where: { isVisible: true },
      orderBy: order,
      take: REVIEW_LIMITS.testimonials.max,
    }),
    db.settings.findUnique({ where: { id: 1 }, select: { youtubeUrl: true } }),
  ]);

  return { videos, testimonials, youtubeUrl: settings?.youtubeUrl ?? null };
});
