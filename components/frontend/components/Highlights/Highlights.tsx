// components/frontend/home/Highlights.tsx
import React from "react";
import Image from "next/image";
import { getT } from "@/i18n.server";

// Upload Frame_2613247.png to Cloudinary and paste the URL here
const BACKGROUND_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792846006/Highlights.png";

const iconProps = {
  width: 28,
  height: 28,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

// Placeholder icons: replace with your Figma SVGs
function BowlIcon() {
  return (
    <Image
      src={
        "https://res.cloudinary.com/mer50qza/image/upload/v1793024138/quality-ingredients.svg"
      }
      alt=""
      width={1000}
      height={1000}
      className="w-[57.69px] h-[57.69px] object-contain object-bottom"
    />
  );
}

function HandHeartIcon() {
  return (
    <Image
      src={
        "https://res.cloudinary.com/mer50qza/image/upload/v1793022317/homemade.svg"
      }
      alt=""
      width={1000}
      height={1000}
      className="w-[40.81px] h-[35.81px] object-contain object-bottom"
    />
  );
}

function LeafIcon() {
  return (
    <Image
      src={
        "https://res.cloudinary.com/mer50qza/image/upload/v1793022317/pure-fresh.svg"
      }
      alt=""
      width={1000}
      height={1000}
      className="w-[34.86px] h-[36.66px] object-contain object-bottom"
    />
  );
}

const highlights = [
  { key: "quality", Icon: BowlIcon },
  { key: "homemade", Icon: HandHeartIcon },
  { key: "fresh", Icon: LeafIcon },
] as const;

async function Highlights() {
  const { t } = await getT();

  return (
    <section className="relative flex min-h-78.25 items-center justify-center bg-white mb-6.75">
      {/* Background: ellipse artwork, cropped so the flat top is hidden */}
      <Image
        src={BACKGROUND_URL}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-bottom"
      />

      <ul className="relative z-10 flex w-full max-w-317 mx-auto flex-col gap-8 md:flex-row md:gap-0">
        {highlights.map(({ key, Icon }, index) => (
          <li
            key={key}
            className={`flex flex-1 items-center justify-start gap-4 md:justify-center ${
              index > 0
                ? "md:border-l-[1.41px] md:border-dashed md:border-[#00E00D]/60"
                : ""
            }`}
          >
            <span className="relative flex size-[75.98px] shrink-0 items-center justify-center rounded-full border-[1.41px] border-dashed border-[#D1652E] text-[#00E010]">
              <Icon />
            </span>

            <div className="leading-tight">
              <p className="text-2xl font-medium text-[#FFB636]">
                {t(`highlights.${key}.line1`)}
              </p>
              <p className="text-[28px] font-bold text-[#FF7800]">
                {t(`highlights.${key}.line2`)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Highlights;
