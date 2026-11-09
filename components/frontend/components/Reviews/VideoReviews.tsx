"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { fill } from "@/lib/format";

export interface VideoReviewItem {
  id: string;
  videoId: string;
  thumbnailUrl: string;
  title: string;
}

interface VideoReviewsProps {
  videos: VideoReviewItem[];
  listLabel: string;
  playLabel: string; // "Play video review: {title}"
  closeLabel: string;
}

// 2 on mobile, 3 on tablet, 4 on large screens
function visibilityClass(index: number) {
  if (index >= 3) return "hidden lg:block";
  if (index >= 2) return "hidden md:block";
  return "";
}

function VideoReviews({
  videos,
  listLabel,
  playLabel,
  closeLabel,
}: VideoReviewsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<VideoReviewItem | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) dialog.showModal();
    if (!active && dialog.open) dialog.close();
  }, [active]);

  return (
    <>
      <ul
        aria-label={listLabel}
        className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5"
      >
        {videos.map((video, index) => (
          <li key={video.id} className={visibilityClass(index)}>
            <button
              type="button"
              onClick={() => setActive(video)}
              aria-label={fill(playLabel, { title: video.title })}
              className="group relative block w-full overflow-hidden rounded-2xl border border-neutral-200 shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F26A0F]"
            >
              <Image
                src={video.thumbnailUrl}
                alt=""
                width={600}
                height={900}
                sizes="(min-width: 1024px) 285px, (min-width: 768px) 33vw, 50vw"
                className="aspect-[2/3] w-full object-cover transition duration-300 group-hover:scale-[1.03]"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="size-12 fill-white/90 drop-shadow-lg transition group-hover:scale-110 sm:size-14"
                >
                  <path d="M8 5.14v13.72a1 1 0 0 0 1.52.85l10.6-6.86a1 1 0 0 0 0-1.7L9.52 4.29A1 1 0 0 0 8 5.14Z" />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setActive(null)}
        onClick={(e) => {
          // a click on the dark backdrop closes it
          if (e.target === e.currentTarget) setActive(null);
        }}
        aria-label={active?.title}
        className="m-auto w-[min(90vw,420px)] overflow-visible bg-transparent p-0 backdrop:bg-black/80"
      >
        {active && (
          <div className="relative">
            <button
              type="button"
              onClick={() => setActive(null)}
              aria-label={closeLabel}
              className="absolute -top-11 right-0 flex size-9 items-center justify-center rounded-full bg-white/15 text-2xl leading-none text-white hover:bg-white/25"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="aspect-[9/16] max-h-[80vh] w-full overflow-hidden rounded-2xl bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${active.videoId}?autoplay=1&rel=0`}
                title={active.title}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>
        )}
      </dialog>
    </>
  );
}

export default VideoReviews;
