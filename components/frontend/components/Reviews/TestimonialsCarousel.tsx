"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { fill } from "@/lib/format";

export interface TestimonialItem {
  id: string;
  name: string;
  text: string;
  rating: number;
  avatarUrl: string | null;
  ratingLabel: string; // "Rated 5 out of 5"
}

interface TestimonialsCarouselProps {
  items: TestimonialItem[];
  label: string;
  slideTemplate: string; // "{n} of {total}"
  prevLabel: string;
  nextLabel: string;
  prevIconUrl: string;
  nextIconUrl: string;
}

function Star({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`size-6 ${filled ? "fill-[#FF9F1C]" : "fill-neutral-300"}`}
    >
      <path d="M12 2.5l2.94 5.96 6.58.96-4.76 4.64 1.12 6.55L12 17.52l-5.88 3.09 1.12-6.55L2.48 9.42l6.58-.96L12 2.5z" />
    </svg>
  );
}

function TestimonialsCarousel({
  items,
  label,
  slideTemplate,
  prevLabel,
  nextLabel,
  prevIconUrl,
  nextIconUrl,
}: TestimonialsCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = useCallback((api: EmblaCarouselType) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    // first read after Embla has measured the slides
    const frame = requestAnimationFrame(() => updateButtons(emblaApi));
    emblaApi.on("select", updateButtons).on("reInit", updateButtons);
    return () => {
      cancelAnimationFrame(frame);
      emblaApi.off("select", updateButtons).off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const buttonClass =
    "flex h-10 w-[78px] items-center justify-center rounded-full border border-[#F26A0F]/25 bg-white shadow-sm transition hover:border-[#F26A0F] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F26A0F]/25";

  return (
    <section aria-roledescription="carousel" aria-label={label} className="min-w-0">
      <div ref={emblaRef} className="overflow-hidden">
        <ul className="-ml-5 flex">
          {items.map((item, index) => (
            <li
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(slideTemplate, {
                n: index + 1,
                total: items.length,
              })}
              className="min-w-0 shrink-0 grow-0 basis-[88%] pl-5 sm:basis-1/2 lg:basis-1/3"
            >
              <figure className="flex h-full gap-4 rounded-xl border border-[#F5C9A8] bg-[#FFEFE6] p-5">
                {item.avatarUrl ? (
                  <Image
                    src={item.avatarUrl}
                    alt=""
                    width={64}
                    height={64}
                    className="size-16 shrink-0 rounded-full border-2 border-[#F5B700] object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[#F5B700] bg-white text-2xl font-semibold text-[#E0700F]"
                  >
                    {Array.from(item.name)[0]}
                  </span>
                )}

                <div className="flex min-w-0 flex-1 flex-col">
                  <blockquote className="text-[15px] leading-relaxed text-neutral-800">
                    <p>{item.text}</p>
                  </blockquote>
                  <figcaption className="mt-4 font-semibold italic text-black">
                    — {item.name}
                  </figcaption>
                  <div
                    role="img"
                    aria-label={item.ratingLabel}
                    className="mt-auto flex gap-2 pt-6"
                  >
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} filled={n <= item.rating} />
                    ))}
                  </div>
                </div>
              </figure>
            </li>
          ))}
        </ul>
      </div>

      {(canPrev || canNext) && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            aria-label={prevLabel}
            className={buttonClass}
          >
            <Image
              src={prevIconUrl}
              alt=""
              width={20}
              height={20}
              className="size-5 -scale-x-100 rotate-180 object-contain"
            />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            aria-label={nextLabel}
            className={buttonClass}
          >
            <Image
              src={nextIconUrl}
              alt=""
              width={20}
              height={20}
              className="size-5 object-contain"
            />
          </button>
        </div>
      )}
    </section>
  );
}

export default TestimonialsCarousel;
