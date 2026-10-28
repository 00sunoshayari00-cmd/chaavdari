import React from "react";
import Image from "next/image";
import SectionHeader from "../../common/SectionHeader";
import { JourneysData } from "@/data/Journey";
import { getT } from "@/i18n.server";

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

async function Journey() {
  const { t } = await getT();

  return (
    <section className="max-w-340 mx-auto bg-[#F5FAFF] py-19">
      <SectionHeader
        title={t("homePageJourneySectionTitle.title")}
        className="text-center text-[#E0700F]"
      />

      <ul className="mt-14.25 grid grid-cols-2 gap-x-6 gap-y-12 md:flex md:items-start md:justify-between">
        {JourneysData.map((step, index) => (
          <li
            key={step.id}
            className="relative flex flex-col items-center gap-6 text-center md:flex-1"
          >
            <figure>
              <Image
                src={step.imageUrl}
                alt={t(`journey.${step.key}.title`)}
                width={1000}
                height={1000}
                className="w-43.5 h-41.5 object-contain"
              />
            </figure>

            <h3 className="text-base font-semibold text-black">
              {t(`journey.${step.key}.title`)}
            </h3>

            {/* Arrow between steps, desktop only */}
            {index < JourneysData.length - 1 && (
              <div className="absolute right-0 top-[56px] hidden translate-x-1/2 text-red-500 md:block">
                <Image
                  src={
                    "https://res.cloudinary.com/mer50qza/image/upload/v1792755729/arrow.svg"
                  }
                  alt={t(`journey.${step.key}.title`)}
                  width={1000}
                  height={1000}
                  className="size-13 object-contain"
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Journey;
