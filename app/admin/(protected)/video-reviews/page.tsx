// app/admin/(protected)/video-reviews/page.tsx
import { db } from "@/lib/db";
import VideoReviewManager from "@/components/admin/VideoReviewManager";
import YoutubeLinkForm from "@/components/admin/YoutubeLinkForm";

export default async function VideoReviewsPage() {
  const [reviews, settings] = await Promise.all([
    db.videoReview.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        videoId: true,
        titleEn: true,
        titleMr: true,
        thumbnailUrl: true,
        thumbnailPublicId: true,
        isVisible: true,
        sortOrder: true,
      },
    }),
    db.settings.findUnique({ where: { id: 1 }, select: { youtubeUrl: true } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Video reviews</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Add up to 10 videos and choose up to 4 to show on the home page.
      </p>
      <YoutubeLinkForm initial={settings?.youtubeUrl ?? ""} />
      <VideoReviewManager reviews={reviews} />
    </div>
  );
}
