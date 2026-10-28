// components/admin/CategoryManager.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { slugify } from "@/lib/slug";
import { inputClass, labelClass, primaryBtn, secondaryBtn } from "./styles";

interface CategoryRow {
  id: string;
  slug: string;
  nameEn: string;
  nameMr: string | null;
  sortOrder: number;
  _count: { products: number };
}

const emptyForm = { slug: "", nameEn: "", nameMr: "", sortOrder: "0" };

export default function CategoryManager({
  categories,
}: {
  categories: CategoryRow[];
}) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function reset() {
    setForm(emptyForm);
    setEditingId(null);
    setSlugTouched(false);
    setError("");
  }

  function startEdit(c: CategoryRow) {
    setEditingId(c.id);
    setSlugTouched(true);
    setError("");
    setForm({
      slug: c.slug,
      nameEn: c.nameEn,
      nameMr: c.nameMr ?? "",
      sortOrder: String(c.sortOrder),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const payload = { ...form, sortOrder: Number(form.sortOrder) };
    try {
      if (editingId) await adminApi.patch(`/categories/${editingId}`, payload);
      else await adminApi.post("/categories", payload);
      reset();
      router.refresh();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: CategoryRow) {
    if (!confirm(`Delete "${c.nameEn}"?`)) return;
    try {
      await adminApi.delete(`/categories/${c.id}`);
      router.refresh();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  return (
    <div className="mt-6 grid gap-8 lg:grid-cols-[360px_1fr]">
      <form
        onSubmit={submit}
        className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-sm"
      >
        <h2 className="font-semibold">
          {editingId ? "Edit category" : "Add category"}
        </h2>

        <label className={labelClass}>
          Name (English)
          <input
            className={inputClass}
            value={form.nameEn}
            onChange={(e) => {
              const nameEn = e.target.value;
              setForm((f) => ({
                ...f,
                nameEn,
                slug: slugTouched ? f.slug : slugify(nameEn),
              }));
            }}
            required
          />
        </label>

        <label className={labelClass}>
          Name (Marathi, optional)
          <input
            className={inputClass}
            value={form.nameMr}
            onChange={(e) => setForm((f) => ({ ...f, nameMr: e.target.value }))}
          />
        </label>

        <label className={labelClass}>
          Slug
          <input
            className={inputClass}
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setForm((f) => ({ ...f, slug: e.target.value }));
            }}
            required
          />
        </label>

        <label className={labelClass}>
          Sort order
          <input
            type="number"
            min={0}
            className={inputClass}
            value={form.sortOrder}
            onChange={(e) =>
              setForm((f) => ({ ...f, sortOrder: e.target.value }))
            }
          />
        </label>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className={primaryBtn}>
            {saving ? "Saving..." : editingId ? "Update" : "Add"}
          </button>
          {editingId && (
            <button type="button" onClick={reset} className={secondaryBtn}>
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b text-neutral-500">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Slug</th>
              <th className="p-3 font-medium">Products</th>
              <th className="p-3 font-medium">Order</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-b last:border-0">
                <td className="p-3">
                  {c.nameEn}
                  {c.nameMr && (
                    <span className="ml-2 text-neutral-400">{c.nameMr}</span>
                  )}
                </td>
                <td className="p-3 text-neutral-500">{c.slug}</td>
                <td className="p-3">{c._count.products}</td>
                <td className="p-3">{c.sortOrder}</td>
                <td className="space-x-3 p-3 text-right">
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    className="hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(c)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {categories.length === 0 && (
              <tr>
                <td colSpan={5} className="p-6 text-center text-neutral-500">
                  No categories yet. Add your first one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
