// app/[lng]/products/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/i18n.server";
import SectionHeader from "@/components/frontend/common/SectionHeader";
import ProductGallery from "@/components/frontend/components/ProductPage/ProductGallery";
import ProductActions from "@/components/frontend/components/ProductPage/ProductActions";
import ProductCard from "@/components/frontend/components/Products/ProductCard";
import { getProduct, getRelatedProducts, getSettings } from "@/lib/products";
import { bannerOf, orderedImages } from "@/lib/productImages";
import { pick } from "@/lib/localized";
import { fill, formatPrice } from "@/lib/format";
import { CART_LIMITS } from "@/lib/cartTypes";
import { SITE_URL } from "@/lib/site";
import { SITE_NAME, defaultMetaDescription, defaultMetaTitle } from "@/lib/seo";
import { htmlToText, richTextClass } from "@/lib/text";

type Props = { params: Promise<{ lng: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lng, slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const name = pick(lng, product.nameEn, product.nameMr);
  const title =
    pick(lng, product.metaTitleEn, product.metaTitleMr) ||
    defaultMetaTitle(name);
  const description =
    pick(lng, product.metaDescriptionEn, product.metaDescriptionMr) ||
    defaultMetaDescription(
      pick(lng, product.descriptionEn, product.descriptionMr),
    );
  const banner = bannerOf(product.images);

  return {
    title: { absolute: title },
    description,
    keywords: product.keywords.length ? product.keywords : undefined,
    robots: product.noindex ? { index: false, follow: false } : undefined,
    alternates: {
      canonical: `/${lng}/products/${product.slug}`,
      languages: {
        en: `/en/products/${product.slug}`,
        mr: `/mr/products/${product.slug}`,
        "x-default": `/en/products/${product.slug}`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `/${lng}/products/${product.slug}`,
      siteName: SITE_NAME,
      locale: lng === "mr" ? "mr_IN" : "en_IN",
      images: banner
        ? [
            {
              url: banner.url,
              width: banner.width || undefined,
              height: banner.height || undefined,
              alt: pick(lng, banner.altEn, banner.altMr) || name,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: banner ? [banner.url] : undefined,
    },
  };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span
      className="relative inline-block whitespace-nowrap text-lg leading-none"
      aria-hidden="true"
    >
      <span className="text-[#E4D6BF]">★★★★★</span>
      <span
        className="absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap text-[#F5A623]"
        style={{ width: `${(rating / 5) * 100}%` }}
      >
        ★★★★★
      </span>
    </span>
  );
}

export default async function ProductPage({ params }: Props) {
  const { lng, slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [{ t }, settings, related] = await Promise.all([
    getT(),
    getSettings(),
    getRelatedProducts(product.categoryId, product.id),
  ]);

  /* ----- text for this language ----- */
  const name = pick(lng, product.nameEn, product.nameMr);
  const summary = pick(lng, product.summaryEn, product.summaryMr);
  const descriptionHtml = pick(
    lng,
    product.descriptionEn,
    product.descriptionMr,
  );
  const ingredients = pick(lng, product.ingredientsEn, product.ingredientsMr);
  const categoryName = pick(
    lng,
    product.category.nameEn,
    product.category.nameMr,
  );

  const gallery = orderedImages(product.images).map((img) => ({
    url: img.url,
    alt: pick(lng, img.altEn, img.altMr) || name,
  }));

  /* ----- numbers ----- */
  const savePercent =
    product.mrp && product.mrp > product.price
      ? Math.round((1 - product.price / product.mrp) * 100)
      : 0;
  const showRating = product.reviewCount > 0 && product.rating > 0;
  const reviewsText =
    product.reviewCount > 0
      ? fill(
          t(
            product.reviewCount === 1
              ? "productPage.reviewOne"
              : "productPage.reviewMany",
          ),
          {
            count: product.reviewCount,
          },
        )
      : null;
  const ordersText =
    product.ordersCount > 0
      ? fill(
          t(
            product.ordersCount === 1
              ? "productPage.orderOne"
              : "productPage.orderMany",
          ),
          {
            count: product.ordersCount,
          },
        )
      : null;

  const offer =
    settings.discountPercent > 0
      ? fill(
          t(
            settings.discountMinAmount > 0
              ? "productPage.offerMin"
              : "productPage.offerAll",
          ),
          {
            percent: settings.discountPercent,
            min: settings.discountMinAmount,
          },
        )
      : null;

  const productUrl = `${SITE_URL}/${lng}/products/${product.slug}`;

  /* ----- structured data for Google ----- */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name,
      description: htmlToText(descriptionHtml),
      image: gallery.map((g) => g.url),
      sku: product.sku ?? undefined,
      category: categoryName,
      brand: { "@type": "Brand", name: SITE_NAME },
      offers: {
        "@type": "Offer",
        url: productUrl,
        priceCurrency: "INR",
        price: product.price,
        itemCondition: "https://schema.org/NewCondition",
        availability: product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      },
      // Only real reviews count: no reviews, no rating markup
      ...(showRating
        ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating,
              reviewCount: product.reviewCount,
            },
          }
        : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: t("productPage.home"),
          item: `${SITE_URL}/${lng}`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: t("productPage.products"),
          item: `${SITE_URL}/${lng}#products`,
        },
        { "@type": "ListItem", position: 3, name, item: productUrl },
      ],
    },
  ];

  const details = [
    { label: t("productPage.category"), value: categoryName },
    { label: t("productPage.weight"), value: product.weight },
    { label: t("productPage.shelfLife"), value: product.shelfLife },
    { label: t("productPage.ingredients"), value: ingredients },
  ].filter((d) => d.value);

  return (
    <main className="bg-[#FBF6EA] px-4 pb-20 pt-8 sm:px-6 lg:px-10">
      <script
        type="application/ld+json"
        // "<" is escaped so the text can never close the script tag
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <div className="mx-auto max-w-[1200px]">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm text-[#7A6A55]">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href={`/${lng}`} className="hover:text-[#F26A0F]">
                {t("productPage.home")}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>
              <Link href={`/${lng}#products`} className="hover:text-[#F26A0F]">
                {t("productPage.products")}
              </Link>
            </li>
            <li aria-hidden="true">›</li>
            <li>{categoryName}</li>
            <li aria-hidden="true">›</li>
            <li aria-current="page" className="font-medium text-[#3B2F1E]">
              {name}
            </li>
          </ol>
        </nav>

        {/* Top: gallery + info */}
        <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:gap-14">
          <ProductGallery
            images={gallery}
            thumbLabel={t("productPage.galleryThumb")}
          />

          <div className="space-y-5">
            <span className="inline-block rounded-full border border-[#F26A0F]/60 px-4 py-1 text-xs font-medium text-[#3B2F1E]">
              {categoryName}
            </span>

            <h1 className="font-berkshire text-3xl text-[#E0700F] sm:text-4xl">
              {name}
            </h1>

            {(showRating || ordersText) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#555]">
                {showRating && (
                  <span className="flex items-center gap-2">
                    <Stars rating={product.rating} />
                    <span className="sr-only">
                      {fill(t("productPage.ratingOutOf"), {
                        rating: product.rating,
                      })}
                    </span>
                    <span className="font-semibold text-black">
                      {product.rating.toFixed(1)}
                    </span>
                    {reviewsText && <span>({reviewsText})</span>}
                  </span>
                )}
                {ordersText && <span>{ordersText}</span>}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <p className="text-3xl font-bold text-red-600">
                {formatPrice(product.price)}
              </p>
              {product.mrp && product.mrp > product.price && (
                <p className="text-lg text-[#9A8B76] line-through">
                  {formatPrice(product.mrp)}
                </p>
              )}
              {savePercent > 0 && (
                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-800">
                  {fill(t("productPage.save"), { percent: savePercent })}
                </span>
              )}
              <span className="rounded-full border border-[#F26A0F]/40 bg-white px-3 py-1 text-xs font-medium">
                {product.weight}
              </span>
              <span
                className={`text-sm font-medium ${product.inStock ? "text-green-700" : "text-red-600"}`}
              >
                {product.inStock
                  ? t("productPage.inStock")
                  : t("productPage.outOfStock")}
              </span>
            </div>

            <p className="text-[15px] leading-relaxed text-[#555]">{summary}</p>

            <ProductActions
              slug={product.slug}
              name={name}
              weight={product.weight}
              price={product.price}
              url={productUrl}
              inStock={product.inStock}
              whatsappNumber={process.env.WHATSAPP_NUMBER ?? ""}
              discountPercent={settings.discountPercent}
              discountMinAmount={settings.discountMinAmount}
              offer={offer}
              messageLabels={{
                greeting: t("orderMsg.greeting"),
                total: t("orderMsg.total"),
                discount: t("orderMsg.discount"),
                afterDiscount: t("orderMsg.afterDiscount"),
                links: t("orderMsg.productLinks"),
              }}
              labels={{
                quantity: t("productPage.quantity"),
                decrease: t("productPage.decrease"),
                increase: t("productPage.increase"),
                order: t("productPage.orderOnWhatsapp"),
                outOfStock: t("productPage.outOfStock"),
                total: t("productPage.total"),
                discountLine: t("productPage.discountLine"),
                afterDiscount: t("productPage.afterDiscount"),
                addToCart: t("cart.add"),
                cartFull: t("cart.full"),
              }}
            />

            {/* Trust badges, same wording as the green strip on the home page */}
            <ul className="grid gap-3 sm:grid-cols-3">
              {(["quality", "homemade", "fresh"] as const).map((key) => (
                <li
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-dotted border-[#F26A0F]/50 bg-white/60 px-3 py-2"
                >
                  <span
                    aria-hidden="true"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#006705] text-sm text-[#00E010]"
                  >
                    ✓
                  </span>
                  <span className="text-xs leading-tight">
                    <span className="block text-[#B7791F]">
                      {t(`highlights.${key}.line1`)}
                    </span>
                    <span className="block font-bold text-[#F26A0F]">
                      {t(`highlights.${key}.line2`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Description + details */}
        <div className="mt-14 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <section className="rounded-[20px] border border-[#FBE9D0] bg-white p-6 sm:p-8">
            <h2 className="font-berkshire text-2xl text-[#E0700F]">
              {t("productPage.aboutTitle")}
            </h2>
            <div
              className={`${richTextClass} mt-4 text-[15px] leading-relaxed text-[#555]`}
              // sanitized on save in the admin, only safe tags are stored
              dangerouslySetInnerHTML={{ __html: descriptionHtml }}
            />
          </section>

          <section className="h-fit rounded-[20px] border border-[#FBE9D0] bg-white p-6 sm:p-8">
            <h2 className="font-berkshire text-2xl text-[#E0700F]">
              {t("productPage.detailsTitle")}
            </h2>
            <dl className="mt-4 divide-y divide-[#FBE9D0] text-sm">
              {details.map((d) => (
                <div key={d.label} className="py-3">
                  <dt className="text-xs font-medium uppercase tracking-wide text-[#9A8B76]">
                    {d.label}
                  </dt>
                  <dd className="mt-1 text-[#3B2F1E]">{d.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-20">
            <SectionHeader title={t("productPage.relatedTitle")} />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <li key={p.id}>
                  <ProductCard
                    lng={lng}
                    orderLabel={t("productPage.orderNow")}
                    product={p}
                    cart={{
                      addTemplate: t("productsSection.addToCart"),
                      fullLabel: fill(t("cart.full"), {
                        max: CART_LIMITS.maxProducts,
                      }),
                      outOfStockLabel: t("productsSection.outOfStock"),
                    }}
                  />
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  );
}
