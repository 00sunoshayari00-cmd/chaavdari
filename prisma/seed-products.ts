import { config } from "dotenv";
config({ path: ".env.local" });

import { categories, products, type SeedProduct } from "./seed-data";

const stripTags = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

function problems(p: SeedProduct) {
  const out: string[] = [];
  const range = (label: string, value: string, min: number, max: number) => {
    if (value.length < min || value.length > max) {
      out.push(
        `${p.slug}: ${label} is ${value.length} characters (needs ${min}-${max})`,
      );
    }
  };

  range("name (EN)", p.nameEn, 3, 80);
  range("name (MR)", p.nameMr, 3, 80);
  range("slug", p.slug, 3, 60);
  range("summary (EN)", p.summaryEn, 10, 140);
  range("summary (MR)", p.summaryMr, 10, 140);
  range("description (EN)", stripTags(p.descriptionEn), 50, 5000);
  range("description (MR)", stripTags(p.descriptionMr), 50, 5000);
  range("meta title (EN)", p.metaTitleEn, 10, 60);
  range("meta title (MR)", p.metaTitleMr, 10, 60);
  range("meta description (EN)", p.metaDescriptionEn, 70, 160);
  range("meta description (MR)", p.metaDescriptionMr, 70, 160);

  if (p.keywords.length > 10) out.push(`${p.slug}: more than 10 keywords`);
  for (const k of p.keywords) {
    if (k !== k.toLowerCase() || k.length < 2 || k.length > 40) {
      out.push(`${p.slug}: keyword "${k}" must be lowercase, 2-40 characters`);
    }
  }
  if (p.mrp !== null && p.mrp <= p.price)
    out.push(`${p.slug}: mrp must be higher than price`);

  return out;
}

async function main() {
  const all = products.flatMap(problems);
  if (all.length) {
    console.error("Fix these first:\n" + all.join("\n"));
    process.exit(1);
  }

  // Import after dotenv has loaded, because lib/db reads DATABASE_URL when it loads
  const { db } = await import("../lib/db");
  const demoOn = process.env.SEED_DEMO_NUMBERS === "true";

  for (const c of categories) {
    const existing = await db.category.findUnique({ where: { slug: c.slug } });
    if (existing) {
      console.log(`category exists, skipped: ${c.slug}`);
    } else {
      await db.category.create({ data: c });
      console.log(`category created: ${c.slug}`);
    }
  }

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) {
      console.log(`product exists, skipped: ${p.slug}`);
      continue;
    }

    const category = await db.category.findUnique({
      where: { slug: p.categorySlug },
    });
    if (!category) throw new Error(`Missing category: ${p.categorySlug}`);

    const { categorySlug, demo, ...fields } = p;
    void categorySlug;

    await db.product.create({
      data: {
        ...fields,
        categoryId: category.id,
        inStock: true,
        isActive: true,
        noindex: false,
        ...(demoOn ? demo : {}),
      },
    });
    console.log(`product created: ${p.slug}`);
  }

  await db.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
