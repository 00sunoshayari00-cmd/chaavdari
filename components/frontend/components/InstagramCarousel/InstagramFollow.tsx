import React from "react";
import InstagramCarousel from "./InstagramCarousel";
import {
  INSTAGRAM_URL,
  InstagramPostsData,
  NEXT_ICON_URL,
  PREV_ICON_URL,
} from "@/data/Instagram";
import { getT } from "@/i18n.server";

async function InstagramFollow() {
  const { t } = await getT();

  return (
    <section className="overflow-hidden bg-white pb-10 pt-16 lg:pt-24">
      <div className="flex flex-col gap-10 pl-6 lg:flex-row lg:items-center lg:gap-16 lg:pl-12">
        {/* Left: heading + handle */}
        <div className="shrink-0 lg:w-[260px]">
          <p className="font-berkshire text-2xl text-[#0A6B1C]">
            {t("social.followLine")}
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-[34px] font-medium leading-tight text-[#E8700A] hover:underline lg:text-[40px]"
          >
            {t("social.handle")}
          </a>
        </div>

        {/* Right: carousel, bleeds off the right edge of the screen */}
        <div className="min-w-0 flex-1">
          <InstagramCarousel
            posts={InstagramPostsData}
            prevIconUrl={PREV_ICON_URL}
            nextIconUrl={NEXT_ICON_URL}
            prevLabel={t("social.prev")}
            nextLabel={t("social.next")}
          />
        </div>
      </div>
    </section>
  );
}

export default InstagramFollow;
