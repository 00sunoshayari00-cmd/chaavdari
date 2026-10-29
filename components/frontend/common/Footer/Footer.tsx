import React from "react";
import Image from "next/image";
import {
  FaEnvelope,
  FaFacebookF,
  FaInstagram,
  FaPhoneVolume,
  FaPinterestP,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa6";
import { getT } from "@/i18n.server";

// Upload footer-bg.png and your logo to Cloudinary and paste the URLs here
const BACKGROUND_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/footer-bg.png";
const LOGO_URL =
  "https://res.cloudinary.com/mer50qza/image/upload/v1792846461/chaavdari-logo.png";

// Replace with your real profile links
const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com/", Icon: FaInstagram },
  { label: "Facebook", href: "https://facebook.com/", Icon: FaFacebookF },
  { label: "YouTube", href: "https://youtube.com/", Icon: FaYoutube },
  { label: "Pinterest", href: "https://pinterest.com/", Icon: FaPinterestP },
];

async function Footer() {
  const { t } = await getT();

  const phone = process.env.CONTACT_PHONE_1 ?? "";
  const whatsapp = process.env.WHATSAPP_NUMBER ?? "";
  const email = process.env.CONTACT_EMAIL ?? "";

  const phoneText = phone ? `+91 ${phone.slice(0, 5)} ${phone.slice(5)}` : "";
  const whatsappText = whatsapp
    ? `+${whatsapp.slice(0, 2)} ${whatsapp.slice(2, 7)} ${whatsapp.slice(7)}`
    : "";

  const orderHref = `https://wa.me/${whatsapp}?text=${encodeURIComponent(
    t("order.message"),
  )}`;

  const links = [
    { href: "#story", label: t("footer.links.story") },
    { href: "#categories", label: t("footer.links.categories") },
    { href: "#products", label: t("footer.links.products") },
    { href: "#contact", label: t("footer.links.contact") },
    { href: orderHref, label: t("footer.links.order"), external: true },
  ];

  const contacts = [
    {
      key: "call",
      label: t("footer.callLabel"),
      text: phoneText,
      href: phone ? `tel:+91${phone}` : undefined,
      icon: <FaPhoneVolume className="text-[#FFA726]" />,
    },
    {
      key: "whatsapp",
      label: t("footer.whatsappLabel"),
      text: whatsappText,
      href: orderHref,
      icon: <FaWhatsapp className="text-[#25D366]" />,
    },
    {
      key: "email",
      label: t("footer.emailLabel"),
      text: email,
      href: email ? `mailto:${email}` : undefined,
      icon: <FaEnvelope className="text-[#FFA726]" />,
    },
  ];

  return (
    <footer
      id="contact"
      className="relative isolate overflow-hidden text-white"
    >
      {/* Background artwork */}
      <Image
        src={BACKGROUND_URL}
        alt=""
        fill
        sizes="100vw"
        className="-z-10 object-cover object-bottom"
      />

      <div className="relative z-10 flex flex-col items-center pt-40 lg:pt-75">
        {/* Logo */}
        <a href="#" aria-label="Chaavdari">
          <Image
            src={LOGO_URL}
            alt="Chaavdari"
            width={1000}
            height={1000}
            className="h-auto w-[200px] sm:w-[260px] lg:w-[300px]"
          />
        </a>

        {/* Links */}
        <nav aria-label="Footer" className="mt-10 px-6 lg:mt-14">
          <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 lg:gap-x-12">
            {links.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  {...(link.external
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="text-sm text-[#2ECC40] transition hover:text-white"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Dashed divider */}
        <div className="mt-10 w-full border-t border-dashed border-[#2ECC40]/30 lg:mt-14" />

        {/* Contact details */}
        <ul className="mt-10 grid w-full max-w-[1000px] gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3 lg:mt-12">
          {contacts.map((item) => (
            <li key={item.key} className="min-w-0">
              <p className="text-xs text-[#FFC107]">{item.label}</p>
              <a
                href={item.href}
                {...(item.key === "whatsapp"
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="mt-1 flex items-center gap-2 text-xl font-bold text-[#00FF1A] lg:text-[22px]"
              >
                <span className="shrink-0 text-lg">{item.icon}</span>
                <span className="break-all">{item.text}</span>
              </a>
            </li>
          ))}
        </ul>

        {/* Social */}
        <ul className="mt-14 flex items-center gap-3 lg:mt-16">
          {SOCIALS.map(({ label, href, Icon }) => (
            <li key={label}>
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex h-10 w-[78px] items-center justify-center rounded-full border border-[#FFA726]/50 text-[#FFA726] transition hover:bg-[#FFA726] hover:text-[#003D00]"
              >
                <Icon />
              </a>
            </li>
          ))}
        </ul>

        {/* Tagline */}
        <p className="mt-10 text-center text-sm font-semibold text-[#F26A0F] lg:mt-12">
          {t("footer.tagline")}
        </p>

        {/* Copyright + credit (credit sits bottom right from sm up) */}
        <div className="mt-10 flex w-full flex-col items-center gap-2 px-6 pb-6 text-[11px] text-white/90 sm:flex-row sm:justify-between lg:mt-12 lg:px-10">
          <p className="text-center">
            © {new Date().getFullYear()} {t("footer.rights")}
          </p>
          <p className="text-center sm:text-right">
            {t("footer.credit")}{" "}
            <a
              href="https://codekk.dev"
              target="_blank"
              rel="noopener"
              className="font-semibold text-[#FFA726] transition hover:text-white"
            >
              codekk.dev
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
