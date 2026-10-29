// components/frontend/home/OurOfferings.tsx
import React from "react";
import Image from "next/image";
import SectionHeader from "../../common/SectionHeader";
import { OurOfferingsData } from "@/data/OurOffering";
import { getT } from "@/i18n.server";

async function OurOfferings() {
  const { t } = await getT();

  return (
    <section className="max-w-340 mx-auto py-19">
      <SectionHeader title={t("homePageOfferingSectionTitle.title")} />

      <div className="mt-14.25">
        <ul className="grid gap-24.5 md:grid-cols-3">
          {OurOfferingsData.map((offering) => (
            <li
              key={offering.id}
              className="h-108.5 relative flex flex-col justify-end items-center gap-y-9.75"
            >
              <figure className="">
                <Image
                  src={offering.bannerImageUrl}
                  alt={t(`offerings.${offering.key}.title`)}
                  width={400}
                  height={300}
                  className="max-w-[388.05px] w-full h-[253.11px] object-contain"
                />
                <div className="absolute top-14.25 left-1/2 -translate-x-1/2 w-[288px] h-[274px] -z-10">
                  <Image
                    src={offering.rectangleImageUrl}
                    alt={t(`offerings.${offering.key}.title`)}
                    width={400}
                    height={300}
                    className="w-full h-full object-contain"
                  />
                </div>
              </figure>
              <h3 className="text-2xl font-semibold bg-gradient-to-b from-[#02811E] to-[#0E6501] bg-clip-text text-transparent">
                {t(`offerings.${offering.key}.title`)}
              </h3>
              {/* <p>{t(`offerings.${offering.key}.description`)}</p> */}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default OurOfferings;
