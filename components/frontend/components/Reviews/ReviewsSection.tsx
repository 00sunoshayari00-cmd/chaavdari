import SectionHeader from "@/components/frontend/common/SectionHeader";
import { NEXT_ICON_URL, PREV_ICON_URL } from "@/data/Instagram";
import { getT } from "@/i18n.server";
import { fill } from "@/lib/format";
import { pick } from "@/lib/localized";
import { getReviewsContent } from "@/lib/reviews";
import TestimonialsCarousel from "./TestimonialsCarousel";
import VideoReviews from "./VideoReviews";

async function ReviewsSection({ lng }: { lng: string }) {
  const [{ t }, content] = await Promise.all([getT(), getReviewsContent()]);

  // Nothing added or shown yet: leave the whole section out
  if (content.videos.length === 0 && content.testimonials.length === 0)
    return null;

  const videos = content.videos.map((v) => ({
    id: v.id,
    videoId: v.videoId,
    thumbnailUrl: v.thumbnailUrl,
    title: pick(lng, v.titleEn, v.titleMr),
  }));

  const testimonials = content.testimonials.map((item) => ({
    id: item.id,
    name: pick(lng, item.nameEn, item.nameMr),
    text: pick(lng, item.textEn, item.textMr),
    rating: item.rating,
    avatarUrl: item.avatarUrl,
    ratingLabel: fill(t("testimonials.rated"), { rating: item.rating }),
  }));

  return (
    <section
      id="reviews"
      className="scroll-mt-20 bg-[#FFF8F4] px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto max-w-[1200px]">
        <SectionHeader
          title={t("reviews.title")}
          className="text-center text-[#0FA61F]"
        />

        {videos.length > 0 && (
          <div className="mt-10">
            <VideoReviews
              videos={videos}
              listLabel={t("reviews.videosLabel")}
              playLabel={t("reviews.play")}
              closeLabel={t("reviews.close")}
            />

            {content.youtubeUrl && (
              <div className="mt-8 flex justify-center">
                <a
                  href={content.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-b from-[#F5841F] to-[#E8700A] px-8 py-3 text-sm font-semibold text-white transition hover:brightness-110"
                >
                  {t("reviews.viewAll")}
                  <span aria-hidden="true">→</span>
                  <span className="sr-only">{t("reviews.opensNewTab")}</span>
                </a>
              </div>
            )}
          </div>
        )}

        {testimonials.length > 0 && (
          <div className="mt-14 sm:mt-16">
            <TestimonialsCarousel
              items={testimonials}
              label={t("testimonials.label")}
              slideTemplate={t("testimonials.slide")}
              prevLabel={t("testimonials.prev")}
              nextLabel={t("testimonials.next")}
              prevIconUrl={PREV_ICON_URL}
              nextIconUrl={NEXT_ICON_URL}
            />
          </div>
        )}
      </div>
    </section>
  );
}

export default ReviewsSection;
