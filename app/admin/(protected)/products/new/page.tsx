// app/admin/(protected)/products/new/page.tsx
import Link from "next/link";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    select: { id: true, nameEn: true },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Add product</h1>
      {categories.length ? (
        <ProductForm categories={categories} />
      ) : (
        <p className="text-sm text-neutral-600">
          Add a category first on the{" "}
          <Link href="/admin/categories" className="underline">
            Categories
          </Link>{" "}
          page.
        </p>
      )}
    </div>
  );
}
