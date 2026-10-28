// app/admin/(protected)/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboard() {
  const [products, active, categories] = await Promise.all([
    db.product.count(),
    db.product.count({ where: { isActive: true } }),
    db.category.count(),
  ]);

  const cards = [
    { label: "Products", value: products },
    { label: "Visible on site", value: active },
    { label: "Categories", value: categories },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <li key={c.label} className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-neutral-500">{c.label}</p>
            <p className="mt-1 text-3xl font-semibold">{c.value}</p>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/products/new"
          className="rounded-full bg-[#F26A0F] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Add product
        </Link>
        <Link
          href="/admin/categories"
          className="rounded-full border px-6 py-2.5 text-sm font-medium"
        >
          Manage categories
        </Link>
      </div>
    </div>
  );
}
