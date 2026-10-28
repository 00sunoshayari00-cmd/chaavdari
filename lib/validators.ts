// lib/validators.ts
import { z } from "zod";
import {
  LIMITS,
  SKU_PATTERN,
  htmlToText,
  normalizeKeywords,
} from "./productRules";

// "" / undefined / null all become null
const optionalText = z
  .string()
  .trim()
  .nullish()
  .transform((v) => v || null);

const slug = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug: lowercase letters, numbers and dashes only",
  );

export const categorySchema = z.object({
  slug,
  nameEn: z.string().trim().min(1, "English name is required"),
  nameMr: optionalText,
  sortOrder: z.number().int().min(0),
});

// Optional text: "" / null become null, otherwise it must fit min..max
const optionalLen = (label: string, min: number, max: number) =>
  optionalText.pipe(
    z
      .string()
      .min(min, `${label}: at least ${min} characters`)
      .max(max, `${label}: at most ${max} characters`)
      .nullable(),
  );

const requiredLen = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .min(min, `${label}: at least ${min} characters`)
    .max(max, `${label}: at most ${max} characters`);

// Rich text from the editor. Length rules count the visible text, not the tags.
const richText = (label: string, required: boolean) =>
  z
    .string()
    .nullish()
    .transform((v) => (v && htmlToText(v) ? v.trim() : null))
    .superRefine((html, ctx) => {
      const len = html ? htmlToText(html).length : 0;
      const { min, max } = LIMITS.description;
      if (!html) {
        if (required) ctx.addIssue({ code: "custom", message: `${label} is required` });
      } else if (len < min) {
        ctx.addIssue({ code: "custom", message: `${label}: at least ${min} characters of text` });
      } else if (len > max) {
        ctx.addIssue({ code: "custom", message: `${label}: at most ${max} characters of text` });
      }
    });

const imageSchema = z.object({
  // only accept images that were uploaded to our own Cloudinary
  url: z.url().startsWith("https://res.cloudinary.com/"),
  publicId: z.string().min(1),
  // the 600×600 minimum is enforced at upload; 0 = uploaded before sizes were stored
  width: z.number().int().min(0),
  height: z.number().int().min(0),
  altEn: requiredLen("Image alt text (English)", LIMITS.alt.min, LIMITS.alt.max),
  altMr: optionalLen("Image alt text (Marathi)", LIMITS.alt.min, LIMITS.alt.max),
  isBanner: z.boolean(),
});

const { name, sku, summary, metaTitle, metaDescription, keywords } = LIMITS;

export const productSchema = z
  .object({
    slug: slug
      .min(LIMITS.slug.min, `Slug: at least ${LIMITS.slug.min} characters`)
      .max(LIMITS.slug.max, `Slug: at most ${LIMITS.slug.max} characters`),
    sku: optionalLen("SKU", sku.min, sku.max).refine(
      (v) => v === null || SKU_PATTERN.test(v),
      "SKU: letters, numbers, - and _ only",
    ),
    categoryId: z.string().min(1, "Choose a category"),
    weight: requiredLen("Weight", 1, LIMITS.weight.max),

    nameEn: requiredLen("Name (English)", name.min, name.max),
    nameMr: optionalLen("Name (Marathi)", name.min, name.max),
    summaryEn: requiredLen("Short summary (English)", summary.min, summary.max),
    summaryMr: optionalLen("Short summary (Marathi)", summary.min, summary.max),
    descriptionEn: richText("Description (English)", true),
    descriptionMr: richText("Description (Marathi)", false),
    ingredientsEn: optionalLen("Ingredients (English)", 1, LIMITS.ingredients.max),
    ingredientsMr: optionalLen("Ingredients (Marathi)", 1, LIMITS.ingredients.max),
    shelfLife: optionalLen("Shelf life", 1, LIMITS.shelfLife.max),

    price: z
      .number("Price is required")
      .int("Price must be a whole number")
      .min(LIMITS.price.min, `Price must be at least ₹${LIMITS.price.min}`)
      .max(LIMITS.price.max, `Price must be at most ₹${LIMITS.price.max}`),
    mrp: z.number().int("MRP must be a whole number").nullable(),
    inStock: z.boolean(),

    rating: z.number().min(0, "Rating: 0 to 5").max(5, "Rating: 0 to 5"),
    reviewCount: z.number().int().min(0),
    ordersCount: z.number().int().min(0),

    metaTitleEn: optionalLen("Meta title (English)", metaTitle.min, metaTitle.max),
    metaTitleMr: optionalLen("Meta title (Marathi)", metaTitle.min, metaTitle.max),
    metaDescriptionEn: optionalLen(
      "Meta description (English)",
      metaDescription.min,
      metaDescription.max,
    ),
    metaDescriptionMr: optionalLen(
      "Meta description (Marathi)",
      metaDescription.min,
      metaDescription.max,
    ),
    keywords: z
      .array(z.string())
      .transform(normalizeKeywords)
      .pipe(
        z
          .array(
            z
              .string()
              .min(keywords.min, `Each keyword: at least ${keywords.min} characters`)
              .max(keywords.maxLength, `Each keyword: at most ${keywords.maxLength} characters`),
          )
          .max(keywords.max, `At most ${keywords.max} keywords`),
      ),
    noindex: z.boolean(),

    isActive: z.boolean(),
    isFeatured: z.boolean(),
    sortOrder: z.number().int().min(0),

    images: z
      .array(imageSchema)
      .min(LIMITS.images.min, "Add at least one image")
      .max(LIMITS.images.max, `At most ${LIMITS.images.max} images`),
  })
  .superRefine((p, ctx) => {
    if (p.mrp !== null && p.mrp <= p.price)
      ctx.addIssue({
        code: "custom",
        path: ["mrp"],
        message: "MRP must be higher than the price (or leave it empty)",
      });
    if (p.reviewCount === 0 && p.rating !== 0)
      ctx.addIssue({
        code: "custom",
        path: ["rating"],
        message: "Rating must be 0 until there is at least one review",
      });
    if (p.images.length && p.images.filter((i) => i.isBanner).length !== 1)
      ctx.addIssue({
        code: "custom",
        path: ["images"],
        message: "Choose exactly one banner image",
      });
  });

export type ProductInput = z.infer<typeof productSchema>;

export const settingsSchema = z.object({
  discountPercent: z.number().int().min(0).max(90),
  discountMinAmount: z.number().int().min(0),
});
