"use client";
import { useTransition } from "react";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useT } from "next-i18next/client";

const languages = [
  { code: "en", label: "English", lang: "en" },
  { code: "mr", label: "मराठी", lang: "mr" },
];

export default function LanguageSwitcher({
  className = "inline-flex",
}: {
  className?: string;
}) {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();
  const [isPending, startTransition] = useTransition();

  const isMr = lng === "mr";

  const switchLocale = (newLng: string) => {
    if (newLng === lng) return;

    const segments = pathname.split("/"); // ['', 'en', 'about']
    segments[1] = newLng; // ['', 'mr', 'about']

    // Read query + hash at click time; useSearchParams() would force a
    // client-side rendering bailout for every page that renders the navbar.
    const { search, hash } = window.location;

    startTransition(() => {
      router.push(segments.join("/") + search + hash);
    });
  };

  return (
    <div className={`shrink-0 flex-col gap-1 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isMr}
        aria-label={t("switcher.label")}
        disabled={isPending}
        onClick={() => switchLocale(isMr ? "en" : "mr")}
        className={`relative flex h-9 w-40 items-center rounded-full bg-gray-100 p-1 ring-1 ring-gray-200 transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
          isPending ? "opacity-70" : ""
        }`}
      >
        {/* Sliding knob */}
        <span
          aria-hidden="true"
          className={`absolute top-1 h-7 w-[4.5rem] rounded-full bg-white shadow transition-transform duration-200 ease-out ${
            isMr ? "translate-x-[4.5rem]" : "translate-x-0"
          }`}
        />
        {/* EN label */}
        <span
          lang="en"
          aria-hidden="true"
          className={`relative z-10 flex h-7 w-[4.5rem] items-center justify-center text-xs font-semibold transition-colors ${
            isMr ? "text-gray-400" : "text-gray-900"
          }`}
        >
          English
        </span>
        {/* MR label */}
        <span
          lang="mr"
          aria-hidden="true"
          className={`relative z-10 flex h-7 w-[4.5rem] items-center justify-center text-xs font-semibold transition-colors ${
            isMr ? "text-gray-900" : "text-gray-400"
          }`}
        >
          मराठी
        </span>
      </button>
      {/* Screen-reader-visible current language for context */}
      <span className="sr-only" aria-live="polite">
        {t("switcher.label")}: {isMr ? "मराठी" : "English"}
      </span>
    </div>
  );
}
