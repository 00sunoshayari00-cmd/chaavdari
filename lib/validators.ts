// lib/validators.ts
import { z } from "zod";
import {
  LIMITS,
  SKU_PATTERN,
  htmlToText,
  normalizeKeywords,
} from "./productRules";
import { HERO_LIMITS, HREF_PATTERN } from "./heroRules";
import { extractYoutubeId, isYoutubeUrl } from "./youtube";
import { REVIEW_LIMITS as R } from "./reviewLimits";

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
        if (required)
          ctx.addIssue({ code: "custom", message: `${label} is required` });
      } else if (len < min) {
        ctx.addIssue({
          code: "custom",
          message: `${label}: at least ${min} characters of text`,
        });
      } else if (len > max) {
        ctx.addIssue({
          code: "custom",
          message: `${label}: at most ${max} characters of text`,
        });
      }
    });

const imageSchema = z.object({
  // only accept images that were uploaded to our own Cloudinary
  url: z.url().startsWith("https://res.cloudinary.com/"),
  publicId: z.string().min(1),
  // the 600×600 minimum is enforced at upload; 0 = uploaded before sizes were stored
  width: z.number().int().min(0),
  height: z.number().int().min(0),
  altEn: requiredLen(
    "Image alt text (English)",
    LIMITS.alt.min,
    LIMITS.alt.max,
  ),
  altMr: optionalLen(
    "Image alt text (Marathi)",
    LIMITS.alt.min,
    LIMITS.alt.max,
  ),
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
    ingredientsEn: optionalLen(
      "Ingredients (English)",
      1,
      LIMITS.ingredients.max,
    ),
    ingredientsMr: optionalLen(
      "Ingredients (Marathi)",
      1,
      LIMITS.ingredients.max,
    ),
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

    metaTitleEn: optionalLen(
      "Meta title (English)",
      metaTitle.min,
      metaTitle.max,
    ),
    metaTitleMr: optionalLen(
      "Meta title (Marathi)",
      metaTitle.min,
      metaTitle.max,
    ),
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
              .min(
                keywords.min,
                `Each keyword: at least ${keywords.min} characters`,
              )
              .max(
                keywords.maxLength,
                `Each keyword: at most ${keywords.maxLength} characters`,
              ),
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

// ----- Home page hero slides -----

const heroText = (label: string, max: number) =>
  optionalText.pipe(
    z.string().max(max, `${label}: at most ${max} characters`).nullable(),
  );

const heroHref = (label: string) =>
  optionalText.pipe(
    z
      .string()
      .max(
        HERO_LIMITS.href.max,
        `${label}: at most ${HERO_LIMITS.href.max} characters`,
      )
      .regex(
        HREF_PATTERN,
        `${label}: start with /, #, https://, tel: or mailto:`,
      )
      .nullable(),
  );

const cloudinaryUrl = z
  .string()
  .startsWith("https://res.cloudinary.com/", "Upload the image here");

const { title, description, buttonLabel } = HERO_LIMITS;

export const heroSlideSchema = z
  .object({
    imageUrl: z.string().min(1, "Upload the desktop image").pipe(cloudinaryUrl),
    imagePublicId: z.string().min(1, "Upload the desktop image"),
    mobileImageUrl: optionalText.pipe(cloudinaryUrl.nullable()),
    mobileImagePublicId: optionalText,
    altEn: requiredLen(
      "Image description (English)",
      LIMITS.alt.min,
      LIMITS.alt.max,
    ),
    altMr: optionalLen(
      "Image description (Marathi)",
      LIMITS.alt.min,
      LIMITS.alt.max,
    ),

    showLogo: z.boolean(),
    titleEn: heroText("Title (English)", title.max),
    titleMr: heroText("Title (Marathi)", title.max),
    descriptionEn: heroText("Description (English)", description.max),
    descriptionMr: heroText("Description (Marathi)", description.max),
    textTone: z.enum(["dark", "light"]),

    primaryLabelEn: heroText("Button 1 text (English)", buttonLabel.max),
    primaryLabelMr: heroText("Button 1 text (Marathi)", buttonLabel.max),
    primaryHref: heroHref("Button 1 link"),
    secondaryLabelEn: heroText("Button 2 text (English)", buttonLabel.max),
    secondaryLabelMr: heroText("Button 2 text (Marathi)", buttonLabel.max),
    secondaryHref: heroHref("Button 2 link"),
    linkHref: heroHref("Slide link"),

    isActive: z.boolean(),
    sortOrder: z.number().int().min(0),
  })
  .superRefine((s, ctx) => {
    const need = (ok: unknown, path: string, message: string) => {
      if (!ok) ctx.addIssue({ code: "custom", path: [path], message });
    };

    // The English text is the fallback, so Marathi alone would show nothing on /en
    if (s.titleMr)
      need(
        s.titleEn,
        "titleEn",
        "Title (English) is required when the Marathi title is filled in",
      );
    if (s.descriptionMr)
      need(
        s.descriptionEn,
        "descriptionEn",
        "Description (English) is required when the Marathi description is filled in",
      );

    // A button shows only with English text and a link; half-filled is a mistake
    for (const [key, name] of [
      ["primary", "Button 1"],
      ["secondary", "Button 2"],
    ] as const) {
      const labelEn = s[`${key}LabelEn`];
      const href = s[`${key}Href`];
      if (labelEn || s[`${key}LabelMr`] || href) {
        need(
          labelEn,
          `${key}LabelEn`,
          `${name} text (English) is required, or clear the button`,
        );
        need(
          href,
          `${key}Href`,
          `${name} link is required, or clear the button`,
        );
      }
    }

    if (Boolean(s.mobileImageUrl) !== Boolean(s.mobileImagePublicId))
      ctx.addIssue({
        code: "custom",
        path: ["mobileImageUrl"],
        message: "Upload the mobile image again",
      });
  });

export type HeroSlideInput = z.infer<typeof heroSlideSchema>;

/* ---------- Video reviews and testimonials ---------- */

const thumbMsg = "Thumbnail: please upload an image";

export const videoReviewSchema = z.object({
  // the owner can paste a full link, we store only the 11-character id
  videoId: z
    .string()
    .trim()
    .refine(
      (v) => extractYoutubeId(v) !== null,
      "Enter a valid YouTube link or 11-character video ID",
    )
    .transform((v) => extractYoutubeId(v) as string),
  titleEn: requiredLen(
    "Title (English)",
    R.videos.title.min,
    R.videos.title.max,
  ),
  titleMr: optionalLen(
    "Title (Marathi)",
    R.videos.title.min,
    R.videos.title.max,
  ),
  thumbnailUrl: z
    .string()
    .refine((v) => v.startsWith("https://res.cloudinary.com/"), thumbMsg),
  thumbnailPublicId: z.string().min(1, thumbMsg),
  isVisible: z.boolean(),
  sortOrder: z.number("Sort order must be a number").int().min(0),
});

export const testimonialSchema = z
  .object({
    nameEn: requiredLen(
      "Name (English)",
      R.testimonials.name.min,
      R.testimonials.name.max,
    ),
    nameMr: optionalLen(
      "Name (Marathi)",
      R.testimonials.name.min,
      R.testimonials.name.max,
    ),
    textEn: requiredLen(
      "Review text (English)",
      R.testimonials.text.min,
      R.testimonials.text.max,
    ),
    textMr: optionalLen(
      "Review text (Marathi)",
      R.testimonials.text.min,
      R.testimonials.text.max,
    ),
    rating: z
      .number("Rating must be a number")
      .int()
      .min(1, "Rating must be 1 to 5")
      .max(5, "Rating must be 1 to 5"),
    avatarUrl: z
      .string()
      .nullable()
      .refine(
        (v) => v === null || v.startsWith("https://res.cloudinary.com/"),
        "Photo: please upload an image",
      ),
    avatarPublicId: z.string().nullable(),
    isVisible: z.boolean(),
    sortOrder: z.number("Sort order must be a number").int().min(0),
  })
  .refine((d) => (d.avatarUrl === null) === (d.avatarPublicId === null), {
    message: "Photo: please upload an image",
    path: ["avatarUrl"],
  });

// Used by the quick show/hide button in the lists
export const visibilitySchema = z.object({ isVisible: z.boolean() }).strict();

export const youtubeLinkSchema = z.object({
  youtubeUrl: z
    .string()
    .trim()
    .nullish()
    .transform((v) => v || null)
    .refine(
      (v) => v === null || isYoutubeUrl(v),
      "Enter a link like https://www.youtube.com/@yourchannel",
    ),
});
