// components/admin/HeroSlideForm.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { heroSlideSchema } from "@/lib/validators";
import { LIMITS } from "@/lib/productRules";
import {
  HERO_LIMITS,
  toHeroSlideData,
  type HeroSlideFields,
} from "@/lib/heroRules";
import HeroSlideView from "@/components/frontend/components/Hero/HeroSlideView";
import HeroImageField, { type HeroImage } from "./HeroImageField";
import CharCounter from "./CharCounter";
import { inputClass, labelClass, primaryBtn, secondaryBtn } from "./styles";

export type HeroSlideFormSlide = HeroSlideFields & {
  imagePublicId: string;
  mobileImagePublicId: string | null;
  isActive: boolean;
  sortOrder: number;
};

interface FormState {
  image: HeroImage | null;
  mobileImage: HeroImage | null;
  altEn: string;
  altMr: string;
  showLogo: boolean;
  titleEn: string;
  titleMr: string;
  descriptionEn: string;
  descriptionMr: string;
  textTone: "dark" | "light";
  primaryLabelEn: string;
  primaryLabelMr: string;
  primaryHref: string;
  secondaryLabelEn: string;
  secondaryLabelMr: string;
  secondaryHref: string;
  linkHref: string;
  isActive: boolean;
  sortOrder: string;
}

type TextKey = {
  [K in keyof FormState]: FormState[K] extends string ? K : never;
}[keyof FormState];

function toState(s?: HeroSlideFormSlide): FormState {
  return {
    image: s ? { url: s.imageUrl, publicId: s.imagePublicId } : null,
    mobileImage:
      s?.mobileImageUrl && s.mobileImagePublicId
        ? { url: s.mobileImageUrl, publicId: s.mobileImagePublicId }
        : null,
    altEn: s?.altEn ?? "",
    altMr: s?.altMr ?? "",
    showLogo: s?.showLogo ?? false,
    titleEn: s?.titleEn ?? "",
    titleMr: s?.titleMr ?? "",
    descriptionEn: s?.descriptionEn ?? "",
    descriptionMr: s?.descriptionMr ?? "",
    textTone: s?.textTone === "light" ? "light" : "dark",
    primaryLabelEn: s?.primaryLabelEn ?? "",
    primaryLabelMr: s?.primaryLabelMr ?? "",
    primaryHref: s?.primaryHref ?? "",
    secondaryLabelEn: s?.secondaryLabelEn ?? "",
    secondaryLabelMr: s?.secondaryLabelMr ?? "",
    secondaryHref: s?.secondaryHref ?? "",
    linkHref: s?.linkHref ?? "",
    isActive: s?.isActive ?? true,
    sortOrder: s ? String(s.sortOrder) : "0",
  };
}

function toPayload({ image, mobileImage, sortOrder, ...rest }: FormState) {
  return {
    ...rest,
    imageUrl: image?.url ?? "",
    imagePublicId: image?.publicId ?? "",
    mobileImageUrl: mobileImage?.url ?? null,
    mobileImagePublicId: mobileImage?.publicId ?? null,
    sortOrder: sortOrder.trim() === "" ? NaN : Number(sortOrder),
  };
}

/** Zod issues keyed by field (first message wins). */
function validate(f: FormState) {
  const result = heroSlideSchema.safeParse(toPayload(f));
  const errors: Record<string, string> = {};
  if (!result.success)
    for (const issue of result.error.issues) {
      const key = issue.path.join(".") || "form";
      errors[key] ??= issue.message;
    }
  return errors;
}

function Field({
  label,
  hint,
  error,
  counter,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  /** [length, min, max] shows a character counter */
  counter?: [number, number, number];
  children: React.ReactNode;
}) {
  return (
    <label className={labelClass}>
      {label}
      {children}
      {counter ? (
        <CharCounter
          length={counter[0]}
          min={counter[1]}
          max={counter[2]}
          error={error}
          hint={hint}
        />
      ) : (
        (error || hint) && (
          <span
            className={`mt-1 block text-xs font-normal ${
              error ? "text-red-600" : "text-neutral-500"
            }`}
          >
            {error ?? hint}
          </span>
        )
      )}
    </label>
  );
}

function Section({
  title,
  intro,
  children,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-xl bg-white p-5 shadow-sm">
      <div>
        <h2 className="font-semibold">{title}</h2>
        {intro && <p className="mt-0.5 text-xs text-neutral-500">{intro}</p>}
      </div>
      {children}
    </section>
  );
}

function Toggle<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-neutral-300 p-0.5 text-xs font-medium">
      {options.map(([v, label]) => (
        <button
          key={v}
          type="button"
          aria-pressed={value === v}
          onClick={() => onChange(v)}
          className={`rounded-full px-3 py-1 ${
            value === v ? "bg-[#F26A0F] text-white" : "hover:bg-neutral-100"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

const LINK_HINT =
  "e.g. #products, /products/kolambi-bhaji or https://... The language is added to site links for you.";

export default function HeroSlideForm({ slide }: { slide?: HeroSlideFormSlide }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toState(slide));
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");
  const [previewLng, setPreviewLng] = useState<"en" | "mr">("en");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">(
    "desktop",
  );

  // Errors show after the first save attempt, then update live
  const errors = useMemo(
    () => (attempted ? validate(form) : {}),
    [attempted, form],
  );
  const errorCount = Object.keys(errors).length;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const bind = (key: TextKey) => ({
    value: form[key],
    "aria-invalid": Boolean(errors[key]),
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      set(key, e.target.value),
  });

  const len = (key: TextKey) => form[key].trim().length;

  const checkbox = (
    key: "showLogo" | "isActive",
    label: string,
    hint?: string,
  ) => (
    <label className="flex items-start gap-2 text-sm font-medium">
      <input
        type="checkbox"
        checked={form[key]}
        onChange={(e) => set(key, e.target.checked)}
        className="mt-0.5 size-4 accent-[#F26A0F]"
      />
      <span>
        {label}
        {hint && (
          <span className="block text-xs font-normal text-neutral-500">
            {hint}
          </span>
        )}
      </span>
    </label>
  );

  const preview = useMemo(() => {
    if (!form.image) return null;
    const p = toPayload(form);
    const text = (v: string | null) => v?.trim() || null;
    return toHeroSlideData(
      {
        id: "preview",
        imageUrl: p.imageUrl,
        mobileImageUrl: p.mobileImageUrl,
        altEn: p.altEn,
        altMr: text(p.altMr),
        showLogo: p.showLogo,
        titleEn: text(p.titleEn),
        titleMr: text(p.titleMr),
        descriptionEn: text(p.descriptionEn),
        descriptionMr: text(p.descriptionMr),
        primaryLabelEn: text(p.primaryLabelEn),
        primaryLabelMr: text(p.primaryLabelMr),
        primaryHref: text(p.primaryHref),
        secondaryLabelEn: text(p.secondaryLabelEn),
        secondaryLabelMr: text(p.secondaryLabelMr),
        secondaryHref: text(p.secondaryHref),
        linkHref: text(p.linkHref),
        textTone: p.textTone,
      },
      previewLng,
    );
  }, [form, previewLng]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setAttempted(true);
    setServerError("");
    if (Object.keys(validate(form)).length) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSaving(true);
    try {
      const payload = toPayload(form);
      if (slide) await adminApi.patch(`/hero/${slide.id}`, payload);
      else await adminApi.post("/hero", payload);
      router.push("/admin/hero");
      router.refresh();
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSaving(false);
    }
  }

  const { title, description, buttonLabel } = HERO_LIMITS;
  const hasButtons = Boolean(
    form.primaryLabelEn.trim() || form.secondaryLabelEn.trim(),
  );

  const buttonFields = (
    key: "primary" | "secondary",
    name: string,
    intro: string,
  ) => (
    <div className="space-y-3 rounded-lg border border-neutral-200 p-4">
      <div>
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-neutral-500">{intro}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Button text (English)"
          error={errors[`${key}LabelEn`]}
          counter={[len(`${key}LabelEn`), 0, buttonLabel.max]}
        >
          <input className={inputClass} {...bind(`${key}LabelEn`)} />
        </Field>
        <Field
          label="Button text (Marathi, optional)"
          error={errors[`${key}LabelMr`]}
          counter={[len(`${key}LabelMr`), 0, buttonLabel.max]}
        >
          <input className={inputClass} {...bind(`${key}LabelMr`)} />
        </Field>
      </div>
      <Field label="Link" hint={LINK_HINT} error={errors[`${key}Href`]}>
        <input
          className={inputClass}
          placeholder="#products"
          {...bind(`${key}Href`)}
        />
      </Field>
      {(form[`${key}LabelEn`] || form[`${key}LabelMr`] || form[`${key}Href`]) && (
        <button
          type="button"
          onClick={() =>
            setForm((f) => ({
              ...f,
              [`${key}LabelEn`]: "",
              [`${key}LabelMr`]: "",
              [`${key}Href`]: "",
            }))
          }
          className="text-xs text-red-600 hover:underline"
        >
          Remove this button
        </button>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="max-w-4xl space-y-8">
      {attempted && errorCount > 0 && (
        <div role="alert" className="rounded-md bg-red-50 p-3 text-sm text-red-700">
          <p className="font-medium">
            Please fix {errorCount} problem{errorCount === 1 ? "" : "s"}:
          </p>
          <ul className="mt-1 list-disc pl-5">
            {Object.values(errors).map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      <Section
        title="Background image"
        intro="Keep the left side calm if you add text, the text sits there. For an image that already has the text and buttons in it, leave the next two sections empty."
      >
        <HeroImageField
          label="Desktop and tablet image"
          kind="hero"
          value={form.image}
          onChange={(img) => set("image", img)}
          error={errors.imageUrl ?? errors.imagePublicId}
        />
        <HeroImageField
          label="Phone image (optional)"
          kind="hero-mobile"
          hint="A taller version for phones. Without it, phones show the desktop image cropped (or whole, for image-only slides)."
          value={form.mobileImage}
          onChange={(img) => set("mobileImage", img)}
          error={errors.mobileImageUrl}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Image description (English)"
            hint="Read aloud by screen readers and used by Google. If the text is in the image, write that text here."
            error={errors.altEn}
            counter={[len("altEn"), LIMITS.alt.min, LIMITS.alt.max]}
          >
            <input
              className={inputClass}
              placeholder="e.g. Kolambi bhaji in a clay bowl on a Konkan beach"
              {...bind("altEn")}
            />
          </Field>
          <Field
            label="Image description (Marathi, optional)"
            error={errors.altMr}
            counter={[len("altMr"), LIMITS.alt.min, LIMITS.alt.max]}
          >
            <input className={inputClass} {...bind("altMr")} />
          </Field>
        </div>
      </Section>

      <Section
        title="Text on the slide"
        intro="All optional. Anything left empty is simply not shown. The Marathi site uses the English text where Marathi is empty."
      >
        {checkbox("showLogo", "Show the Chaavdari logo above the title")}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Title (English)"
            error={errors.titleEn}
            counter={[len("titleEn"), 0, title.max]}
          >
            <input
              className={inputClass}
              placeholder="Konkan's taste, at your door."
              {...bind("titleEn")}
            />
          </Field>
          <Field
            label="Title (Marathi)"
            error={errors.titleMr}
            counter={[len("titleMr"), 0, title.max]}
          >
            <input
              className={inputClass}
              placeholder="कोकणची चव, तुमच्या दारी."
              {...bind("titleMr")}
            />
          </Field>
          <Field
            label="Description (English)"
            error={errors.descriptionEn}
            counter={[len("descriptionEn"), 0, description.max]}
          >
            <textarea rows={3} className={inputClass} {...bind("descriptionEn")} />
          </Field>
          <Field
            label="Description (Marathi)"
            error={errors.descriptionMr}
            counter={[len("descriptionMr"), 0, description.max]}
          >
            <textarea rows={3} className={inputClass} {...bind("descriptionMr")} />
          </Field>
        </div>

        <fieldset>
          <legend className={labelClass}>Text colour</legend>
          <div className="mt-2 flex flex-wrap gap-6 text-sm">
            {(
              [
                ["dark", "Dark text, for light images"],
                ["light", "White text, for dark images"],
              ] as const
            ).map(([value, label]) => (
              <label key={value} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="textTone"
                  checked={form.textTone === value}
                  onChange={() => set("textTone", value)}
                  className="size-4 accent-[#F26A0F]"
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
      </Section>

      <Section
        title="Buttons"
        intro="Use none, one or both. A button shows when it has English text and a link."
      >
        {buttonFields("primary", "Button 1 (orange)", "e.g. Explore Our Snacks → #products")}
        {buttonFields("secondary", "Button 2 (outlined)", "e.g. Our Story → #story")}
      </Section>

      <Section
        title="Slide link"
        intro="Optional. Makes the whole slide clickable. Only used when the slide has no buttons, handy for images with the buttons drawn in."
      >
        <Field label="Link" hint={hasButtons ? "Not used: this slide has buttons." : LINK_HINT} error={errors.linkHref}>
          <input
            className={inputClass}
            placeholder="#products"
            disabled={hasButtons}
            {...bind("linkHref")}
          />
        </Field>
      </Section>

      <Section title="Visibility">
        {checkbox("isActive", "Show on the website")}
        <Field label="Sort order" hint="0 shows first" error={errors.sortOrder}>
          <input
            type="number"
            min={0}
            step={1}
            className={`${inputClass} max-w-40`}
            {...bind("sortOrder")}
          />
        </Field>
      </Section>

      <Section title="Preview">
        <div className="flex flex-wrap gap-3">
          <Toggle
            value={previewLng}
            options={[
              ["en", "English"],
              ["mr", "मराठी"],
            ]}
            onChange={setPreviewLng}
          />
          <Toggle
            value={previewDevice}
            options={[
              ["desktop", "Desktop"],
              ["mobile", "Phone"],
            ]}
            onChange={setPreviewDevice}
          />
        </div>
        {preview ? (
          <div
            className={`overflow-hidden rounded-lg border ${
              previewDevice === "mobile" ? "w-[375px] max-w-full" : "w-full"
            }`}
          >
            <HeroSlideView slide={preview} previewDevice={previewDevice} />
          </div>
        ) : (
          <p className="rounded-md bg-neutral-50 p-6 text-center text-sm text-neutral-500">
            Upload the desktop image to see a preview.
          </p>
        )}
      </Section>

      {serverError && (
        <p role="alert" className="text-sm text-red-600">
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Saving..." : slide ? "Update slide" : "Add slide"}
        </button>
        <Link href="/admin/hero" className={secondaryBtn}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
