"use client";

import React, { useEffect, useState } from "react";

interface MobileMenuProps {
  links: { href: string; label: string }[];
  phoneText: string;
  telHref: string;
  callNowLabel: string;
  orderLabel: string;
  orderHref: string;
  openLabel: string;
  closeLabel: string;
}

function MobileMenu({
  links,
  phoneText,
  telHref,
  callNowLabel,
  orderLabel,
  orderHref,
  openLabel,
  closeLabel,
}: MobileMenuProps) {
  const [open, setOpen] = useState(false);

  // Close with the Escape key
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? closeLabel : openLabel}
        className="flex size-10 items-center justify-center rounded-md text-[#333] hover:bg-black/5"
      >
        <svg
          aria-hidden="true"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {open ? (
            <path d="M6 6l12 12M18 6L6 18" />
          ) : (
            <path d="M4 7h16M4 12h16M4 17h16" />
          )}
        </svg>
      </button>

      {open && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-t border-black/5 bg-white px-4 pb-6 pt-2 shadow-lg sm:px-6"
        >
          <ul>
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="block border-b border-black/5 py-3 text-base font-medium text-[#444] hover:text-[#F26A0F]"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          {phoneText && (
            <a
              href={telHref}
              className="mt-4 flex items-center gap-2 text-sm font-bold text-[#0A7A12]"
            >
              <span className="rounded-sm bg-red-600 px-1.5 py-px text-[9px] font-semibold text-white">
                {callNowLabel}
              </span>
              {phoneText}
            </a>
          )}

          {/* Order Now lives here on phones, where it's hidden from the header */}
          <a
            href={orderHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 flex w-full items-center justify-center rounded-full bg-[#F26A0F] py-3 text-sm font-semibold text-white sm:hidden"
          >
            {orderLabel}
          </a>
        </div>
      )}
    </div>
  );
}

export default MobileMenu;
