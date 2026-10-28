import React from "react";
import Image from "next/image";
import SectionHeader from "../../common/SectionHeader";
// import { founderImageUrl } from "@/data/Story";
import { getT } from "@/i18n.server";
import { renderRich } from "@/lib/renderRich";

async function Story() {
  const { t } = await getT();
  const founderImageUrl =
    "https://res.cloudinary.com/mer50qza/image/upload/v1792762332/co-founder-mandar-kamble.png";
  const paragraphs = ["p1", "p2", "p3", "p4"] as const;

  return (
    <section className="bg-gradient-to-br from-white via-[#F6FFF6] to-[#E9FAE9] px-10 py-19">
      <div className="mx-auto grid max-w-[1100px] items-center gap-12 md:grid-cols-[1fr_auto] md:gap-16">
        {/* Text */}
        <div className="max-w-[480px]">
          <SectionHeader title={t("story.title")} className="text-[#F26A0F]" />

          <div className="mt-8 space-y-6 text-[15px] leading-relaxed text-[#555]">
            {paragraphs.map((key) => (
              <p key={key}>{renderRich(t(`story.${key}`))}</p>
            ))}
          </div>
        </div>

        {/* Founder */}
        <figure className="mx-auto flex flex-col items-center md:mx-0">
          <Image
            src={founderImageUrl}
            alt={t("story.founder.name")}
            width={300}
            height={340}
            className="h-auto w-[260px] object-contain md:w-[300px]"
          />
          <figcaption className="mt-4 text-center">
            <p className="text-sm font-medium text-[#E8590C]">
              {t("story.founder.role")}
            </p>
            <p className="font-berkshire mt-1 text-2xl text-green-800">
              {t("story.founder.name")}
            </p>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}

export default Story;
