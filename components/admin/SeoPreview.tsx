// components/admin/SeoPreview.tsx
"use client";

import { Check, CircleAlert } from "lucide-react";
import {
  LIMITS,
  defaultMetaDescription,
  defaultMetaTitle,
  htmlToText,
  lengthState,
  wordCount,
} from "@/lib/productRules";
import { slugify } from "@/lib/slug";

const SITE_HOST = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://chaavdari.com")
  .replace(/^https?:\/\//, "")
  .replace(/\/$/, "");

interface SeoPreviewProps {
  nameEn: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  descriptionHtml: string;
  keywords: string[];
  images: { altEn: string; isBanner: boolean }[];
  noindex: boolean;
  isActive: boolean;
}

/** Google search result preview plus a checklist, all based on the English fields. */
export default function SeoPreview(p: SeoPreviewProps) {
  const title = p.metaTitle.trim() || defaultMetaTitle(p.nameEn || "Product name");
  const description =
    p.metaDescription.trim() || defaultMetaDescription(p.descriptionHtml);
  const bodyText = htmlToText(p.descriptionHtml);
  const words = wordCount(bodyText);
  const main = p.keywords[0];
  const has = (text: string) => Boolean(main) && text.toLowerCase().includes(main);

  const titleState = lengthState(title.length, LIMITS.metaTitle.min, LIMITS.metaTitle.max);
  const descState = lengthState(
    description.length,
    LIMITS.metaDescription.min,
    LIMITS.metaDescription.max,
  );

  const checks: { ok: boolean; label: string }[] = [
    {
      ok: titleState === "ok",
      label: `Title is ${LIMITS.metaTitle.min}–${LIMITS.metaTitle.max} characters (now ${title.length})`,
    },
    {
      ok: descState === "ok",
      label: `Meta description is ${LIMITS.metaDescription.min}–${LIMITS.metaDescription.max} characters (now ${description.length})`,
    },
    {
      ok: words >= LIMITS.description.suggestedWords,
      label: `Description has ${LIMITS.description.suggestedWords}+ words (now ${words})`,
    },
    { ok: Boolean(main), label: "A main keyword is set" },
    ...(main
      ? [
          { ok: has(title), label: `Main keyword “${main}” is in the title` },
          { ok: has(description), label: "Main keyword is in the meta description" },
          { ok: has(bodyText), label: "Main keyword is in the description" },
          {
            ok: p.slug.includes(slugify(main)),
            label: "Main keyword is in the slug",
          },
        ]
      : []),
    {
      ok: p.images.length > 0 && p.images.every((i) => i.altEn.trim().length >= LIMITS.alt.min),
      label: "Every image has English alt text",
    },
    { ok: p.images.some((i) => i.isBanner), label: "A banner image is chosen" },
    { ok: !p.noindex, label: "Google is allowed to show this page" },
    { ok: p.isActive, label: "Product is shown on the website" },
  ];
  const passed = checks.filter((c) => c.ok).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Google preview
        </p>
        <div className="rounded-lg border border-neutral-200 p-4 font-[arial,sans-serif]">
          <p className="truncate text-xs text-[#202124]">
            {SITE_HOST}
            <span className="text-[#4d5156]"> › products › {p.slug || "slug"}</span>
          </p>
          <p
            className={`mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab] ${
              titleState === "long" ? "decoration-red-400 underline decoration-wavy" : ""
            }`}
          >
            {title}
          </p>
          <p className="mt-1 line-clamp-2 text-sm text-[#4d5156]">
            {description || "Write a description and it will appear here."}
          </p>
        </div>
        {p.noindex && (
          <p className="mt-2 text-xs text-amber-700">
            “Hide from Google” is on, so this page will not appear in search.
          </p>
        )}
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-neutral-500">
          Checklist ({passed}/{checks.length})
        </p>
        <ul className="space-y-1 text-sm">
          {checks.map((c) => (
            <li key={c.label} className="flex items-start gap-2">
              {c.ok ? (
                <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-500" />
              )}
              <span className={c.ok ? "text-neutral-700" : "text-neutral-900"}>
                {c.label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
