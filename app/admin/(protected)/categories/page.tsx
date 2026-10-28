// app/admin/(protected)/categories/page.tsx
import { db } from "@/lib/db";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold">Categories</h1>
      <p className="mt-1 text-sm text-neutral-500">
        These become the tabs in Our Products (Chivda, Chakli, Bakery...). Sort
        order 0 shows first.
      </p>
      <CategoryManager categories={categories} />
    </div>
  );
}
