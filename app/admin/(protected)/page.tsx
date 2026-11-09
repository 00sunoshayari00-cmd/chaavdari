// app/admin/(protected)/page.tsx
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FolderTree,
  Package,
  PackageX,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { db } from "@/lib/db";
import { REVIEW_LIMITS } from "@/lib/reviewLimits";
import { formatPrice } from "@/lib/format";
import BarList from "@/components/admin/dashboard/BarList";

const card = "rounded-xl border border-neutral-200 bg-white p-5 shadow-sm";

export default async function AdminDashboard() {
  const [products, categories, heroActive, videos, testimonials, settings] =
    await Promise.all([
      db.product.findMany({
        select: {
          id: true,
          nameEn: true,
          nameMr: true,
          descriptionMr: true,
          metaDescriptionEn: true,
          price: true,
          inStock: true,
          isActive: true,
          ordersCount: true,
          categoryId: true,
          updatedAt: true,
          _count: { select: { images: true } },
        },
        orderBy: { updatedAt: "desc" },
      }),
      db.category.findMany({
        select: { id: true, nameEn: true },
        orderBy: { sortOrder: "asc" },
      }),
      db.heroSlide.count({ where: { isActive: true } }),
      db.videoReview.findMany({ select: { isVisible: true } }),
      db.testimonial.findMany({ select: { isVisible: true } }),
      db.settings.findUnique({ where: { id: 1 } }),
    ]);

  /* ---------- numbers ---------- */
  const live = products.filter((p) => p.isActive);
  const outOfStock = live.filter((p) => !p.inStock);
  const totalOrders = products.reduce((sum, p) => sum + p.ordersCount, 0);

  const perCategory = categories.map((c) => {
    const inCat = products.filter((p) => p.categoryId === c.id);
    const hidden = inCat.filter((p) => !p.isActive).length;
    return {
      id: c.id,
      label: c.nameEn,
      value: inCat.length,
      note: hidden ? `${hidden} hidden` : undefined,
    };
  });

  const topByOrders = [...products]
    .filter((p) => p.ordersCount > 0)
    .sort((a, b) => b.ordersCount - a.ordersCount)
    .slice(0, 6)
    .map((p) => ({
      id: p.id,
      label: p.nameEn,
      value: p.ordersCount,
      href: `/admin/products/${p.id}`,
    }));

  /* ---------- things to fix ---------- */
  const checks = [
    {
      label: "Out of stock (still visible on site)",
      items: outOfStock,
    },
    {
      label: "Missing Marathi name or description",
      items: live.filter((p) => !p.nameMr || !p.descriptionMr),
    },
    {
      label: "No meta description for Google",
      items: live.filter((p) => !p.metaDescriptionEn),
    },
    {
      label: "No product images",
      items: live.filter((p) => p._count.images === 0),
    },
  ].filter((c) => c.items.length > 0);

  /* ---------- home page content ---------- */
  const videosShown = videos.filter((v) => v.isVisible).length;
  const testimonialsShown = testimonials.filter((t) => t.isVisible).length;
  const homeContent = [
    {
      label: "Hero slides",
      value: `${heroActive} active`,
      ok: heroActive > 0,
      href: "/admin/hero",
    },
    {
      label: "Video reviews",
      value: `${videosShown}/${REVIEW_LIMITS.videos.maxVisible} shown · ${videos.length}/${REVIEW_LIMITS.videos.max} added`,
      ok: videosShown > 0,
      href: "/admin/video-reviews",
    },
    {
      label: "Testimonials",
      value: `${testimonialsShown} shown · ${testimonials.length}/${REVIEW_LIMITS.testimonials.max} added`,
      ok: testimonialsShown > 0,
      href: "/admin/testimonials",
    },
    {
      label: "“View all reviews” YouTube link",
      value: settings?.youtubeUrl ? "Set" : "Not set",
      ok: Boolean(settings?.youtubeUrl),
      href: "/admin/video-reviews",
    },
    {
      label: "Discount",
      value: settings?.discountPercent
        ? `${settings.discountPercent}% over ${formatPrice(settings.discountMinAmount)}`
        : "Off",
      ok: true,
      href: "/admin/settings",
    },
  ];

  const kpis = [
    {
      label: "Products on site",
      value: live.length,
      sub: `of ${products.length} total`,
      icon: Package,
    },
    {
      label: "Out of stock",
      value: outOfStock.length,
      sub: outOfStock.length ? "visible but unavailable" : "all in stock",
      icon: PackageX,
      warn: outOfStock.length > 0,
    },
    {
      label: "Categories",
      value: categories.length,
      sub: `${perCategory.filter((c) => c.value === 0).length} empty`,
      icon: FolderTree,
    },
    {
      label: "Orders recorded",
      value: totalOrders.toLocaleString("en-IN"),
      sub: "from product order counts",
      icon: ShoppingBag,
    },
  ];

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date());

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="mt-1 text-sm text-neutral-500">{today}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-medium hover:bg-neutral-100"
          >
            View site <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#F26A0F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#D95B08]"
          >
            <Plus className="size-4" aria-hidden /> Add product
          </Link>
        </div>
      </div>

      {/* KPI tiles */}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, sub, icon: Icon, warn }) => (
          <li key={label} className={`${card} flex items-start justify-between gap-3`}>
            <div>
              <p className="text-sm text-neutral-500">{label}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums text-neutral-900">
                {value}
              </p>
              <p
                className={`mt-1 flex items-center gap-1 text-xs ${warn ? "text-amber-700" : "text-neutral-500"}`}
              >
                {warn && <AlertTriangle className="size-3.5" aria-hidden />}
                {sub}
              </p>
            </div>
            <span className="rounded-lg bg-[#FFF1E6] p-2.5 text-[#E0700F]">
              <Icon className="size-5" aria-hidden />
            </span>
          </li>
        ))}
      </ul>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <h2 className="font-semibold text-neutral-900">Products per category</h2>
            <Link href="/admin/categories" className="text-sm text-[#E0700F] hover:underline">
              Manage
            </Link>
          </div>
          <BarList items={perCategory} unit="products" empty="No categories yet." />
        </section>

        <section className={card}>
          <div className="mb-5 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="font-semibold text-neutral-900">Top products by orders</h2>
              <p className="text-xs text-neutral-500">
                Uses the order count entered on each product
              </p>
            </div>
            <Link href="/admin/products" className="text-sm text-[#E0700F] hover:underline">
              All products
            </Link>
          </div>
          <BarList
            items={topByOrders}
            unit="orders"
            empty="No order counts entered yet. Add them on each product."
          />
        </section>
      </div>

      {/* Attention + home page */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <h2 className="mb-4 font-semibold text-neutral-900">Needs attention</h2>
          {checks.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle2 className="size-4" aria-hidden /> Everything looks good.
            </p>
          ) : (
            <ul className="space-y-4">
              {checks.map((c) => (
                <li key={c.label}>
                  <p className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
                    {c.label}
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                      {c.items.length}
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2 pl-6">
                    {c.items.slice(0, 6).map((p) => (
                      <Link
                        key={p.id}
                        href={`/admin/products/${p.id}`}
                        className="rounded-md border border-neutral-200 px-2.5 py-1 text-xs hover:border-[#F26A0F] hover:text-[#E0700F]"
                      >
                        {p.nameEn}
                      </Link>
                    ))}
                    {c.items.length > 6 && (
                      <span className="px-1 py-1 text-xs text-neutral-500">
                        +{c.items.length - 6} more
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <h2 className="mb-4 font-semibold text-neutral-900">Home page content</h2>
          <ul className="divide-y divide-neutral-100">
            {homeContent.map((row) => (
              <li key={row.label}>
                <Link
                  href={row.href}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm hover:text-[#E0700F]"
                >
                  <span className="flex items-center gap-2 text-neutral-700">
                    {row.ok ? (
                      <CheckCircle2 className="size-4 text-green-600" aria-label="OK" />
                    ) : (
                      <AlertTriangle className="size-4 text-amber-600" aria-label="Needs attention" />
                    )}
                    {row.label}
                  </span>
                  <span className="text-right font-medium text-neutral-900">{row.value}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Recently updated */}
      <section className={card}>
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="font-semibold text-neutral-900">Recently updated products</h2>
          <Link href="/admin/products" className="text-sm text-[#E0700F] hover:underline">
            View all
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="text-sm text-neutral-500">No products yet.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead>
                <tr className="border-b border-neutral-100 text-left text-xs uppercase tracking-wide text-neutral-500">
                  <th className="px-5 pb-2 font-medium">Product</th>
                  <th className="px-5 pb-2 font-medium">Price</th>
                  <th className="px-5 pb-2 font-medium">Status</th>
                  <th className="px-5 pb-2 text-right font-medium">Updated</th>
                </tr>
              </thead>
              <tbody>
                {products.slice(0, 5).map((p) => (
                  <tr key={p.id} className="border-b border-neutral-50 last:border-0">
                    <td className="px-5 py-2.5">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="font-medium hover:text-[#E0700F] hover:underline"
                      >
                        {p.nameEn}
                      </Link>
                    </td>
                    <td className="px-5 py-2.5 tabular-nums">{formatPrice(p.price)}</td>
                    <td className="px-5 py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          !p.isActive
                            ? "bg-neutral-100 text-neutral-600"
                            : p.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {!p.isActive ? "Hidden" : p.inStock ? "Live" : "Out of stock"}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-right text-neutral-500">
                      {new Intl.DateTimeFormat("en-IN", {
                        day: "numeric",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      }).format(p.updatedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
