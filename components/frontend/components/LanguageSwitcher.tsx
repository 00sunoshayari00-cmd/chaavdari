"use client";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useT } from "next-i18next/client";

const languages = [
  { code: "en", label: "English" },
  { code: "mr", label: "मराठी" },
];

export default function LanguageSwitcher() {
  const { t } = useT();
  const pathname = usePathname();
  const router = useRouter();
  const { lng } = useParams<{ lng: string }>();

  const switchLocale = (newLng: string) => {
    const segments = pathname.split("/"); // ['', 'en', 'about']
    segments[1] = newLng; // ['', 'mr', 'about']
    router.push(segments.join("/"));
  };

  return (
    <div className="flex items-center gap-2">
      <span>{t("switcher.label")}:</span>
      {languages.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => switchLocale(code)}
          disabled={code === lng}
          className="rounded border px-3 py-1 disabled:bg-black disabled:text-white"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
