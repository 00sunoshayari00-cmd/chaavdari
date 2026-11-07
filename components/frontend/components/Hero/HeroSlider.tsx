"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import HeroSlideView from "./HeroSlideView";
import { hasHeroText, type HeroSlideData } from "@/lib/heroRules";

const AUTOPLAY_MS = 6000;

export interface HeroLabels {
  region: string;
  prev: string;
  next: string;
  /** "Slide {current} of {total}" */
  slide: string;
  /** "Go to slide {current}" */
  goTo: string;
}

const fill = (text: string, current: number, total: number) =>
  text.replace("{current}", String(current)).replace("{total}", String(total));

export default function HeroSlider({
  slides,
  labels,
}: {
  slides: HeroSlideData[];
  labels: HeroLabels;
}) {
  const count = slides.length;
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: count > 1,
    active: count > 1,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);

  const onSelect = useCallback(
    (api: EmblaCarouselType) => setSelected(api.selectedScrollSnap()),
    [],
  );

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect).on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect).off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Autoplay. Restarts after every slide change, so a manual swipe gets the full time.
  useEffect(() => {
    if (!emblaApi || count < 2 || paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, count, paused, selected]);

  const mobileFrame = slides.some((s) => s.mobileImage || hasHeroText(s))
    ? "tall"
    : "wide";

  const arrowClass =
    "absolute top-1/2 z-10 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#1E4D2B] shadow-md backdrop-blur-sm transition hover:bg-white md:flex";

  return (
    <section
      aria-roledescription="carousel"
      aria-label={labels.region}
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setPaused(false);
      }}
    >
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              role="group"
              aria-roledescription="slide"
              aria-label={fill(labels.slide, i + 1, count)}
              aria-hidden={count > 1 && i !== selected ? true : undefined}
              inert={count > 1 && i !== selected}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <HeroSlideView
                slide={slide}
                first={i === 0}
                mobileFrame={mobileFrame}
              />
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label={labels.prev}
            className={`${arrowClass} left-4`}
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label={labels.next}
            className={`${arrowClass} right-4`}
          >
            <ChevronRight aria-hidden="true" className="size-5" />
          </button>

          <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center gap-2">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => emblaApi?.scrollTo(i)}
                aria-label={fill(labels.goTo, i + 1, count)}
                aria-current={i === selected ? "true" : undefined}
                className={`h-2.5 rounded-full shadow-sm transition-all ${
                  i === selected ? "w-7 bg-[#F26A0F]" : "w-2.5 bg-white/80 hover:bg-white"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
