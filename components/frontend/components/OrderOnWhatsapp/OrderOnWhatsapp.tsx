// components/frontend/home/OrderOnWhatsapp.tsx
import React from "react";
import Image from "next/image";
import { getT } from "@/i18n.server";

// Upload Group_20.png and your WhatsApp icon to Cloudinary (or /public) and update these
const BACKGROUND_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792840497/OrderOnWhatsappBg.png";
const WHATSAPP_ICON_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792840691/whatsapp.svg";

function ArrowRight() {
  return (
    <svg
      aria-hidden="true"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12h16M14 6l6 6-6 6" />
    </svg>
  );
}

async function OrderOnWhatsapp() {
  const { t } = await getT();

  const number = process.env.WHATSAPP_NUMBER ?? "";
  const displayNumber = number
    ? `+${number.slice(0, 2)} ${number.slice(2)}`
    : "";
  const href = `https://wa.me/${number}?text=${encodeURIComponent(t("order.message"))}`;

  return (
    <section className="relative h-[360px] w-full overflow-hidden sm:h-[420px] lg:h-[475px]">
      {/* Background: ellipse artwork, bottom cropped by the section */}
      <Image
        src={BACKGROUND_URL}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-top"
      />

      {/* Content */}
      <div className="relative flex h-full flex-col items-center justify-center px-6 pt-16 text-center text-white">
        <Image
          src={WHATSAPP_ICON_URL}
          alt="WhatsApp"
          width={84}
          height={84}
          className="size-16 sm:size-[84px]"
        />

        <p className="mt-5 text-base font-semibold sm:text-lg">
          {t("order.text")}
          <br />
          <span className="text-[#00E010]">
            {t("order.whatsapp")} {displayNumber}
          </span>
        </p>

        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-lg font-semibold text-[#006705] transition hover:scale-105 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          {t("order.button")}
          <ArrowRight />
        </a>
      </div>
    </section>
  );
}

export default OrderOnWhatsapp;
