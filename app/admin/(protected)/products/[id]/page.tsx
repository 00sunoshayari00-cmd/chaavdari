// app/admin/(protected)/products/[id]/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: { images: { orderBy: { position: "asc" } } },
    }),
    db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { nameEn: "asc" }],
      select: { id: true, nameEn: true },
    }),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit product</h1>
      <ProductForm
        categories={categories}
        product={{
          ...product,
          images: product.images.map(
            ({ url, publicId, width, height, altEn, altMr, isBanner }) => ({
              url,
              publicId,
              width,
              height,
              altEn,
              altMr: altMr ?? "",
              isBanner,
            }),
          ),
        }}
      />
    </div>
  );
}
