// components/admin/ProductForm.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { slugify } from "@/lib/slug";
import { productSchema } from "@/lib/validators";
import {
  LIMITS,
  defaultMetaDescription,
  defaultMetaTitle,
} from "@/lib/productRules";
import ImageUploader, { type UploadedImage } from "./ImageUploader";
import RichTextEditor from "./RichTextEditor";
import KeywordInput from "./KeywordInput";
import SeoPreview from "./SeoPreview";
import CharCounter from "./CharCounter";
import { inputClass, labelClass, primaryBtn, secondaryBtn } from "./styles";

export interface ProductFormProduct {
  id: string;
  slug: string;
  sku: string | null;
  nameEn: string;
  nameMr: string | null;
  summaryEn: string;
  summaryMr: string | null;
  descriptionEn: string;
  descriptionMr: string | null;
  ingredientsEn: string | null;
  ingredientsMr: string | null;
  shelfLife: string | null;
  price: number;
  mrp: number | null;
  inStock: boolean;
  weight: string;
  rating: number;
  reviewCount: number;
  ordersCount: number;
  metaTitleEn: string | null;
  metaTitleMr: string | null;
  metaDescriptionEn: string | null;
  metaDescriptionMr: string | null;
  keywords: string[];
  noindex: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  categoryId: string;
  images: UploadedImage[];
}

interface FormState {
  slug: string;
  sku: string;
  nameEn: string;
  nameMr: string;
  summaryEn: string;
  summaryMr: string;
  descriptionEn: string;
  descriptionMr: string;
  ingredientsEn: string;
  ingredientsMr: string;
  shelfLife: string;
  price: string;
  mrp: string;
  inStock: boolean;
  weight: string;
  rating: string;
  reviewCount: string;
  ordersCount: string;
  metaTitleEn: string;
  metaTitleMr: string;
  metaDescriptionEn: string;
  metaDescriptionMr: string;
  keywords: string[];
  noindex: boolean;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  categoryId: string;
  images: UploadedImage[];
}

type TextKey = {
  [K in keyof FormState]: FormState[K] extends string ? K : never;
}[keyof FormState];
type BoolKey = {
  [K in keyof FormState]: FormState[K] extends boolean ? K : never;
}[keyof FormState];

function toState(
  p: ProductFormProduct | undefined,
  firstCategoryId: string,
): FormState {
  return {
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    nameEn: p?.nameEn ?? "",
    nameMr: p?.nameMr ?? "",
    summaryEn: p?.summaryEn ?? "",
    summaryMr: p?.summaryMr ?? "",
    descriptionEn: p?.descriptionEn ?? "",
    descriptionMr: p?.descriptionMr ?? "",
    ingredientsEn: p?.ingredientsEn ?? "",
    ingredientsMr: p?.ingredientsMr ?? "",
    shelfLife: p?.shelfLife ?? "",
    price: p ? String(p.price) : "",
    mrp: p?.mrp != null ? String(p.mrp) : "",
    inStock: p?.inStock ?? true,
    weight: p?.weight ?? "250gm",
    rating: p ? String(p.rating) : "0",
    reviewCount: p ? String(p.reviewCount) : "0",
    ordersCount: p ? String(p.ordersCount) : "0",
    metaTitleEn: p?.metaTitleEn ?? "",
    metaTitleMr: p?.metaTitleMr ?? "",
    metaDescriptionEn: p?.metaDescriptionEn ?? "",
    metaDescriptionMr: p?.metaDescriptionMr ?? "",
    keywords: p?.keywords ?? [],
    noindex: p?.noindex ?? false,
    isActive: p?.isActive ?? true,
    isFeatured: p?.isFeatured ?? false,
    sortOrder: p ? String(p.sortOrder) : "0",
    categoryId: p?.categoryId ?? firstCategoryId,
    images: p?.images ?? [],
  };
}

/** Empty number inputs become NaN so zod reports "required" instead of saving 0. */
const num = (v: string) => (v.trim() === "" ? NaN : Number(v));

function toPayload(f: FormState) {
  return {
    ...f,
    price: num(f.price),
    mrp: f.mrp.trim() === "" ? null : num(f.mrp),
    rating: num(f.rating),
    reviewCount: num(f.reviewCount),
    ordersCount: num(f.ordersCount),
    sortOrder: num(f.sortOrder),
  };
}

/** Zod issues keyed by path, e.g. "nameEn" or "images.2.altEn" (first message wins). */
function validate(f: FormState) {
  const result = productSchema.safeParse(toPayload(f));
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
  /** Pass [length, min, max] to show a character counter */
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

interface ProductFormProps {
  categories: { id: string; nameEn: string }[];
  product?: ProductFormProduct;
}

export default function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = Boolean(product);
  const [form, setForm] = useState<FormState>(() =>
    toState(product, categories[0]?.id ?? ""),
  );
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [attempted, setAttempted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // Errors show after the first save attempt, then update live as the owner fixes them
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
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) => set(key, e.target.value),
  });

  const len = (key: TextKey) => form[key].trim().length;

  const checkbox = (key: BoolKey, label: string, hint?: string) => (
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
      if (product) await adminApi.patch(`/products/${product.id}`, payload);
      else await adminApi.post("/products", payload);
      router.push("/admin/products");
      router.refresh();
    } catch (err) {
      setServerError(getErrorMessage(err));
      setSaving(false);
    }
  }

  const slugChanged = isEdit && form.slug !== product?.slug;
  const discount =
    num(form.mrp) > num(form.price)
      ? Math.round((1 - num(form.price) / num(form.mrp)) * 100)
      : 0;

  return (
    <form onSubmit={submit} noValidate className="max-w-4xl space-y-8">
      {attempted && errorCount > 0 && (
        <div
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
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

      <Section title="Basics">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Name (English)"
            hint="Page heading and the start of the default page title"
            error={errors.nameEn}
            counter={[len("nameEn"), LIMITS.name.min, LIMITS.name.max]}
          >
            <input
              className={inputClass}
              value={form.nameEn}
              aria-invalid={Boolean(errors.nameEn)}
              onChange={(e) => {
                const nameEn = e.target.value;
                setForm((f) => ({
                  ...f,
                  nameEn,
                  slug: slugTouched
                    ? f.slug
                    : slugify(nameEn).slice(0, LIMITS.slug.max),
                }));
              }}
            />
          </Field>
          <Field
            label="Name (Marathi, optional)"
            error={errors.nameMr}
            counter={[len("nameMr"), LIMITS.name.min, LIMITS.name.max]}
          >
            <input className={inputClass} lang="mr" {...bind("nameMr")} />
          </Field>
          <Field
            label="Slug"
            hint={`The link: /products/${form.slug || "your-slug"}. Lowercase letters, numbers and dashes.`}
            error={errors.slug}
            counter={[len("slug"), LIMITS.slug.min, LIMITS.slug.max]}
          >
            <input
              className={inputClass}
              value={form.slug}
              aria-invalid={Boolean(errors.slug)}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase());
              }}
              onBlur={() => set("slug", slugify(form.slug))}
            />
            {slugChanged && (
              <span className="mt-1 block rounded bg-amber-50 px-2 py-1 text-xs font-normal text-amber-800">
                Changing the slug breaks old links and shared WhatsApp links,
                and Google has to find the page again. The current slug is “
                {product?.slug}”.{" "}
                <button
                  type="button"
                  className="underline"
                  onClick={() => set("slug", product!.slug)}
                >
                  Undo
                </button>
              </span>
            )}
          </Field>
          <Field
            label="SKU (optional)"
            hint="Your stock code. Letters, numbers, - and _"
            error={errors.sku}
            counter={[len("sku"), LIMITS.sku.min, LIMITS.sku.max]}
          >
            <input className={inputClass} {...bind("sku")} />
          </Field>
          <Field label="Category" error={errors.categoryId}>
            <select className={inputClass} {...bind("categoryId")}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameEn}
                </option>
              ))}
            </select>
          </Field>
          <Field
            label="Weight"
            hint="Shown on the card, e.g. 250gm"
            error={errors.weight}
            counter={[len("weight"), 1, LIMITS.weight.max]}
          >
            <input className={inputClass} {...bind("weight")} />
          </Field>
        </div>
      </Section>

      <Section title="Price and stock">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Price (₹)" error={errors.price}>
            <input
              type="number"
              inputMode="numeric"
              min={LIMITS.price.min}
              max={LIMITS.price.max}
              step={1}
              className={inputClass}
              {...bind("price")}
            />
          </Field>
          <Field
            label="MRP / compare-at price (₹, optional)"
            hint={
              discount
                ? `Shown struck through. ${discount}% off`
                : "Shown struck through. Must be higher than the price"
            }
            error={errors.mrp}
          >
            <input
              type="number"
              inputMode="numeric"
              min={1}
              step={1}
              className={inputClass}
              {...bind("mrp")}
            />
          </Field>
          <Field
            label="Stock status"
            hint="Out of stock disables “Add to cart” and tells Google"
          >
            <select
              className={inputClass}
              value={form.inStock ? "in" : "out"}
              onChange={(e) => set("inStock", e.target.value === "in")}
            >
              <option value="in">In stock</option>
              <option value="out">Out of stock</option>
            </select>
          </Field>
        </div>
      </Section>

      <Section
        title="Content"
        intro="The description is the main text Google reads. Write for people first."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Short summary (English)"
            hint="The line on the product card"
            error={errors.summaryEn}
            counter={[len("summaryEn"), LIMITS.summary.min, LIMITS.summary.max]}
          >
            <input className={inputClass} {...bind("summaryEn")} />
          </Field>
          <Field
            label="Short summary (Marathi, optional)"
            error={errors.summaryMr}
            counter={[len("summaryMr"), LIMITS.summary.min, LIMITS.summary.max]}
          >
            <input className={inputClass} lang="mr" {...bind("summaryMr")} />
          </Field>
        </div>

        <div className={labelClass}>
          Description (English)
          <RichTextEditor
            label="Description (English)"
            value={form.descriptionEn}
            onChange={(html) => set("descriptionEn", html)}
            required
            invalid={Boolean(errors.descriptionEn)}
          />
          {errors.descriptionEn && (
            <p className="mt-1 text-xs font-normal text-red-600">
              {errors.descriptionEn}
            </p>
          )}
        </div>
        <div className={labelClass}>
          Description (Marathi, optional)
          <RichTextEditor
            label="Description (Marathi)"
            value={form.descriptionMr}
            onChange={(html) => set("descriptionMr", html)}
            invalid={Boolean(errors.descriptionMr)}
          />
          {errors.descriptionMr && (
            <p className="mt-1 text-xs font-normal text-red-600">
              {errors.descriptionMr}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Ingredients (English, optional)"
            hint="Comma separated, in order of quantity"
            error={errors.ingredientsEn}
            counter={[len("ingredientsEn"), 0, LIMITS.ingredients.max]}
          >
            <textarea rows={3} className={inputClass} {...bind("ingredientsEn")} />
          </Field>
          <Field
            label="Ingredients (Marathi, optional)"
            error={errors.ingredientsMr}
            counter={[len("ingredientsMr"), 0, LIMITS.ingredients.max]}
          >
            <textarea
              rows={3}
              lang="mr"
              className={inputClass}
              {...bind("ingredientsMr")}
            />
          </Field>
          <Field
            label="Shelf life (optional)"
            hint="e.g. 30 days from packing, store in a cool dry place"
            error={errors.shelfLife}
            counter={[len("shelfLife"), 0, LIMITS.shelfLife.max]}
          >
            <input className={inputClass} {...bind("shelfLife")} />
          </Field>
        </div>
      </Section>

      <Section
        title="Images"
        intro="Alt text describes the photo for Google Images and screen readers. Say what is in it, don't list keywords."
      >
        <ImageUploader
          images={form.images}
          onChange={(images) => set("images", images)}
          errors={errors}
          defaultAlt={form.nameEn.trim()}
        />
      </Section>

      <Section
        title="Customer numbers"
        intro="Shown to customers and sent to Google. Enter real figures only: Google penalises made-up ratings."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Rating (0 to 5)"
            hint="Must stay 0 until there is at least one review"
            error={errors.rating}
          >
            <input
              type="number"
              min={0}
              max={5}
              step={0.1}
              className={inputClass}
              {...bind("rating")}
            />
          </Field>
          <Field label="Number of reviews" error={errors.reviewCount}>
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              {...bind("reviewCount")}
            />
          </Field>
          <Field label="Number of orders" error={errors.ordersCount}>
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              {...bind("ordersCount")}
            />
          </Field>
        </div>
      </Section>

      <Section
        title="SEO"
        intro="Leave the meta fields empty to generate them from the name and description."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Meta title (English)"
            hint="Empty = name | Chaavdari"
            error={errors.metaTitleEn}
            counter={[len("metaTitleEn"), LIMITS.metaTitle.min, LIMITS.metaTitle.max]}
          >
            <input
              className={inputClass}
              placeholder={defaultMetaTitle(form.nameEn || "Product name")}
              {...bind("metaTitleEn")}
            />
          </Field>
          <Field
            label="Meta title (Marathi)"
            hint="Empty = Marathi name | Chaavdari"
            error={errors.metaTitleMr}
            counter={[len("metaTitleMr"), LIMITS.metaTitle.min, LIMITS.metaTitle.max]}
          >
            <input
              className={inputClass}
              lang="mr"
              placeholder={
                form.nameMr ? defaultMetaTitle(form.nameMr) : undefined
              }
              {...bind("metaTitleMr")}
            />
          </Field>
          <Field
            label="Meta description (English)"
            hint="Empty = the start of the description"
            error={errors.metaDescriptionEn}
            counter={[
              len("metaDescriptionEn"),
              LIMITS.metaDescription.min,
              LIMITS.metaDescription.max,
            ]}
          >
            <textarea
              rows={3}
              className={inputClass}
              placeholder={defaultMetaDescription(form.descriptionEn)}
              {...bind("metaDescriptionEn")}
            />
          </Field>
          <Field
            label="Meta description (Marathi)"
            hint="Empty = the start of the Marathi description"
            error={errors.metaDescriptionMr}
            counter={[
              len("metaDescriptionMr"),
              LIMITS.metaDescription.min,
              LIMITS.metaDescription.max,
            ]}
          >
            <textarea
              rows={3}
              lang="mr"
              className={inputClass}
              placeholder={defaultMetaDescription(form.descriptionMr)}
              {...bind("metaDescriptionMr")}
            />
          </Field>
        </div>

        <div className={labelClass}>
          Keywords
          <KeywordInput
            value={form.keywords}
            onChange={(keywords) => set("keywords", keywords)}
            error={
              errors.keywords ??
              Object.entries(errors).find(([k]) => k.startsWith("keywords."))?.[1]
            }
          />
        </div>

        {checkbox(
          "noindex",
          "Hide from Google (noindex)",
          "For drafts or near-duplicate products. The page still works for people with the link.",
        )}

        <div className="border-t border-neutral-100 pt-4">
          <SeoPreview
            nameEn={form.nameEn}
            slug={form.slug}
            metaTitle={form.metaTitleEn}
            metaDescription={form.metaDescriptionEn}
            descriptionHtml={form.descriptionEn}
            keywords={form.keywords}
            images={form.images}
            noindex={form.noindex}
            isActive={form.isActive}
          />
        </div>
      </Section>

      <Section title="Visibility">
        <div className="grid gap-4 sm:grid-cols-3">
          {checkbox("isActive", "Show on the website")}
          {checkbox("isFeatured", "Featured", "Shown on the home page")}
          <Field label="Sort order" hint="0 shows first" error={errors.sortOrder}>
            <input
              type="number"
              min={0}
              step={1}
              className={inputClass}
              {...bind("sortOrder")}
            />
          </Field>
        </div>
      </Section>

      {serverError && (
        <p
          role="alert"
          className="rounded-md bg-red-50 p-3 text-sm text-red-700"
        >
          {serverError}
        </p>
      )}

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "Saving..." : isEdit ? "Save changes" : "Create product"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className={secondaryBtn}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
