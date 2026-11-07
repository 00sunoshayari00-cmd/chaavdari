// app/admin/(protected)/hero/page.tsx
import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { cloudinarySized } from "@/lib/cloudinaryImage";
import DeleteHeroSlideButton from "@/components/admin/DeleteHeroSlideButton";

export default async function HeroSlidesPage() {
  const slides = await db.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Hero slides</h1>
        <Link
          href="/admin/hero/new"
          className="rounded-full bg-[#F26A0F] px-6 py-2.5 text-sm font-semibold text-white"
        >
          Add slide
        </Link>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        The slideshow at the top of the home page. Sort order 0 shows first.
        With more than one visible slide it changes every few seconds.
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-neutral-500">
            <tr>
              <th className="p-3" />
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Buttons</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {slides.map((s) => {
              const buttons = [s.primaryLabelEn, s.secondaryLabelEn].filter(
                Boolean,
              );
              return (
                <tr key={s.id} className="border-b last:border-0">
                  <td className="p-3">
                    <Image
                      src={cloudinarySized(s.imageUrl, 240)}
                      alt=""
                      unoptimized
                      width={120}
                      height={50}
                      className="h-12.5 w-30 rounded object-cover"
                    />
                  </td>
                  <td className="p-3">
                    {s.titleEn ? (
                      <span className="font-medium">{s.titleEn}</span>
                    ) : (
                      <span className="text-neutral-400">Image only</span>
                    )}
                    {s.titleMr && (
                      <span className="block text-neutral-400">{s.titleMr}</span>
                    )}
                  </td>
                  <td className="p-3 text-neutral-500">
                    {buttons.length ? buttons.join(", ") : "None"}
                  </td>
                  <td className="p-3">
                    <span
                      className={
                        s.isActive ? "text-green-700" : "text-neutral-400"
                      }
                    >
                      {s.isActive ? "Visible" : "Hidden"}
                    </span>
                    {!s.mobileImageUrl && (
                      <span className="ml-2 text-xs text-neutral-400">
                        no mobile image
                      </span>
                    )}
                  </td>
                  <td className="p-3">{s.sortOrder}</td>
                  <td className="space-x-4 p-3 text-right">
                    <Link
                      href={`/admin/hero/${s.id}`}
                      className="hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteHeroSlideButton id={s.id} />
                  </td>
                </tr>
              );
            })}
            {slides.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center text-neutral-500">
                  No slides yet. The home page starts with the next section
                  until you add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
