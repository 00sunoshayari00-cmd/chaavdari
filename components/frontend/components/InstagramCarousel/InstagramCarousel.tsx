"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaCarouselType } from "embla-carousel";
import type { InstagramPost } from "@/data/Instagram";

interface InstagramCarouselProps {
  posts: InstagramPost[];
  prevIconUrl: string;
  nextIconUrl: string;
  prevLabel: string;
  nextLabel: string;
}

function InstagramCarousel({
  posts,
  prevIconUrl,
  nextIconUrl,
  prevLabel,
  nextLabel,
}: InstagramCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
  });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateButtons = useCallback((api: EmblaCarouselType) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    updateButtons(emblaApi);
    emblaApi.on("select", updateButtons).on("reInit", updateButtons);
    return () => {
      emblaApi.off("select", updateButtons).off("reInit", updateButtons);
    };
  }, [emblaApi, updateButtons]);

  const buttonClass =
    "flex h-10 w-[78px] items-center justify-center rounded-full border border-[#F26A0F]/25 bg-white shadow-sm transition hover:border-[#F26A0F] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-[#F26A0F]/25";

  return (
    <div className="min-w-0">
      {/* Viewport */}
      <div ref={emblaRef} className="overflow-hidden">
        <ul className="-ml-8 flex">
          {posts.map((post) => (
            <li
              key={post.id}
              className="min-w-0 shrink-0 grow-0 basis-[75%] pl-8 sm:basis-[45%] lg:basis-[265px]"
            >
              <a
                href={post.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block overflow-hidden"
              >
                <Image
                  src={post.imageUrl}
                  alt={post.alt}
                  width={233}
                  height={233}
                  className="aspect-square w-full object-cover transition hover:scale-[1.03]"
                />
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Custom buttons, bottom left */}
      <div className="mt-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => emblaApi?.scrollPrev()}
          disabled={!canPrev}
          aria-label={prevLabel}
          className={buttonClass}
        >
          {/* Same image as next, flipped. Remove -scale-x-100 if you have a separate left icon */}
          <Image
            src={prevIconUrl}
            alt=""
            width={20}
            height={20}
            className="size-5 -scale-x-100 object-contain"
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
    </div>
  );
}

export default InstagramCarousel;
