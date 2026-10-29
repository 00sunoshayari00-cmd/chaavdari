import React from "react";
import Image from "next/image";
import { getT } from "@/i18n.server";
import MobileMenu from "./MobileMenu";
import CartButton from "@/components/frontend/components/Cart/CartButton";
import LanguageSwitcher from "../../components/LanguageSwitcher";

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
      <div className="mx-auto flex h-[60px] max-w-[1360px] items-center gap-6 px-4 sm:px-6 lg:h-[76px] lg:px-10 xl:gap-10">
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
          <ul className="flex items-center gap-6 xl:gap-8">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="whitespace-nowrap text-[15px] font-medium text-black/60 transition hover:text-[#F26A0F]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right side: pushed to the far end, split into two groups */}
        <div className="ml-auto flex items-center gap-6">
          {/* Call block: one line, with a divider after it */}
          <div className="hidden items-center gap-2 border-r border-black/10 pr-6 xl:flex xl:flex-col xl:items-start">
            <div className="hidden rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-semibold leading-tight text-white 2xl:inline-block">
              {t("nav.callNow")}
            </div>
            <a
              href={telHref}
              className="flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-[#0E7000]"
            >
              <PhoneIcon />
              {phoneText}
            </a>
          </div>

          {/* Actions: language, cart, Order Now, hamburger */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden sm:inline-flex" />
            <CartButton label={t("cart.open")} />
            <a
              href={orderHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden whitespace-nowrap rounded-full bg-linear-to-b from-[#ed8926] to-[#ed6d11] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 sm:inline-flex"
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
      </div>
    </header>
  );
}

export default Navbar;
