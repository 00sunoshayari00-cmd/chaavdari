// components/frontend/home/OurOrigin.tsx
import React from "react";
import Image from "next/image";
import SectionHeader from "../../common/SectionHeader";
import { renderRich } from "@/lib/renderRich";
import { getT } from "@/i18n.server";

// Upload Frame_12.png to Cloudinary and paste the URL here
const ORIGIN_IMAGE_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792841357/OurOriginBg.png";

async function OurOrigin() {
  const { t } = await getT();

  return (
    <section className="bg-[#F4FBFF]">
      <div className="relative mx-auto max-w-full">
        {/* Text: stacked above the image on mobile, overlaid on the sky on desktop */}
        <div className="px-6 pt-12 pb-6 lg:absolute lg:left-[59%] lg:right-[3%] lg:top-[10%] lg:z-10 lg:p-0">
          <SectionHeader title={t("origin.title")} className="text-[#E0700F]" />
          <p className="mt-3 max-w-[460px] text-[15px] leading-relaxed text-[#555]">
            {renderRich(t("origin.description"))}
          </p>
        </div>

        <Image
          src={ORIGIN_IMAGE_URL}
          alt={t("origin.imageAlt")}
          width={2576}
          height={1245}
          sizes="(min-width: 1440px) 1440px, 100vw"
          className="h-[320px] w-full object-cover object-[15%_bottom] sm:h-[420px] lg:h-auto"
        />
      </div>
    </section>
  );
}

export default OurOrigin;
