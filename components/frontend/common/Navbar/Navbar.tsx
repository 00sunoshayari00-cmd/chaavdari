import React from "react";
import Image from "next/image";
import { getT } from "@/i18n.server";
import MobileMenu from "./MobileMenu";

// Upload your logo to Cloudinary and paste the URL here
const LOGO_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792846461/chaavdari-logo.png";

function PhoneIcon() {
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
    </svg>
  );
}

async function Navbar() {
  const { t } = await getT();

  const links = [
    { href: "#products", label: t("nav.products") },
    { href: "#story", label: t("nav.story") },
    { href: "#categories", label: t("nav.categories") },
    { href: "#contact", label: t("nav.contact") },
  ];

  const phones = [
    process.env.CONTACT_PHONE_1,
    process.env.CONTACT_PHONE_2,
  ].filter(Boolean) as string[];
  const phoneText = phones.join(" / ");
  const telHref = phones[0] ? `tel:+91${phones[0]}` : "#contact";

  const orderHref = `https://wa.me/${process.env.WHATSAPP_NUMBER ?? ""}?text=${encodeURIComponent(
    t("order.message"),
  )}`;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="mx-auto flex h-[60px] max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-[70px] lg:px-8">
        {/* Logo */}
        <a href="#" className="shrink-0">
          <Image
            src={LOGO_URL}
            alt="Chaavdari"
            width={1000}
            height={1000}
            priority
            className="h-9 w-[167.18px] lg:h-12.25"
          />
        </a>

        {/* Desktop links */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-9">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-base font-medium text-black/50 transition hover:text-[#F26A0F]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop call block (xl and up) */}
        <div className="hidden xl:block">
          <span className="inline-block rounded-full bg-red-600 px-[9.26px] py-1 text-[8px] font-semibold leading-tight text-white">
            {t("nav.callNow")}
          </span>
          <a
            href={telHref}
            className="mt-0.5 flex items-center gap-1.5 text-base font-bold text-[#0E7000]"
          >
            <PhoneIcon />
            {phoneText}
          </a>
        </div>

        {/* Right side: Order Now (sm and up) + hamburger (below lg) */}
        <div className="flex items-center gap-3">
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden rounded-full bg-linear-to-b from-[#ed8926] to-[#ed6d11] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#D95B08] sm:inline-flex"
          >
            {t("nav.orderNow")}
          </a>

          <MobileMenu
            links={links}
            phoneText={phoneText}
            telHref={telHref}
            callNowLabel={t("nav.callNow")}
            orderLabel={t("nav.orderNow")}
            orderHref={orderHref}
            openLabel={t("nav.openMenu")}
            closeLabel={t("nav.closeMenu")}
          />
        </div>
      </div>
    </header>
  );
}

export default Navbar;
