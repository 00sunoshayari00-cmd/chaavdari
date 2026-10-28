// app/admin/(protected)/products/page.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export default async function ProductsPage() {
  const products = await db.product.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      category: true,
      images: { where: { isBanner: true }, take: 1 },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-full bg-[#F26A0F] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Add product
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-neutral-500">
            <tr>
              <th className="p-3" />
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Category</th>
              <th className="p-3 font-medium">Price</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0">
                <td className="p-3">
                  {p.images[0] && (
                    <Image
                      src={p.images[0].url}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 rounded object-cover"
                    />
                  )}
                </td>
                <td className="p-3 font-medium">{p.nameEn}</td>
                <td className="p-3 text-neutral-500">{p.category.nameEn}</td>
                <td className="p-3">
                  ₹{p.price} ({p.weight})
                  {!p.inStock && (
                    <span className="ml-2 text-xs text-red-600">
                      Out of stock
                    </span>
                  )}
                </td>
                <td className="p-3">
                  <span
                    className={
                      p.isActive ? "text-green-700" : "text-neutral-400"
                    }
                  >
                    {p.isActive ? "Visible" : "Hidden"}
                  </span>
                  {p.isFeatured && (
                    <span className="ml-2 text-xs text-[#F26A0F]">
                      Featured
                    </span>
                  )}
                  {p.noindex && (
                    <span className="ml-2 text-xs text-neutral-400">
                      noindex
                    </span>
                  )}
                </td>
                <td className="space-x-4 p-3 text-right">
                  <Link
                    href={`/admin/products/${p.id}`}
                    className="hover:underline"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton id={p.id} name={p.nameEn} />
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
