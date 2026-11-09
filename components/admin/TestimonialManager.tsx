// components/admin/TestimonialManager.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { REVIEW_LIMITS as R } from "@/lib/reviewLimits";
import { testimonialSchema } from "@/lib/validators";
import SingleImageUpload, { type UploadedImage } from "./SingleImageUpload";
import { CharCounter, Field } from "./formParts";
import { inputClass, primaryBtn, secondaryBtn } from "./styles";

export interface TestimonialRow {
  id: string;
  nameEn: string;
  nameMr: string | null;
  textEn: string;
  textMr: string | null;
  rating: number;
  avatarUrl: string | null;
  avatarPublicId: string | null;
  isVisible: boolean;
  sortOrder: number;
}

interface FormState {
  nameEn: string;
  nameMr: string;
  textEn: string;
  textMr: string;
  rating: string;
  avatar: UploadedImage | null;
  isVisible: boolean;
  sortOrder: string;
}

const blank = (): FormState => ({
  nameEn: "",
  nameMr: "",
  textEn: "",
  textMr: "",
  rating: "5",
  avatar: null,
  isVisible: true,
  sortOrder: "0",
});

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function TestimonialManager({
  items,
}: {
  items: TestimonialRow[];
}) {
  const router = useRouter();
  const shown = items.filter((i) => i.isVisible).length;
  const atLimit = items.length >= R.testimonials.max;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function reset() {
    setEditingId(null);
    setForm(blank());
    setErrors([]);
  }

  function startEdit(t: TestimonialRow) {
    setEditingId(t.id);
    setErrors([]);
    setForm({
      nameEn: t.nameEn,
      nameMr: t.nameMr ?? "",
      textEn: t.textEn,
      textMr: t.textMr ?? "",
      rating: String(t.rating),
      avatar:
        t.avatarUrl && t.avatarPublicId
          ? { url: t.avatarUrl, publicId: t.avatarPublicId }
          : null,
      isVisible: t.isVisible,
      sortOrder: String(t.sortOrder),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      nameEn: form.nameEn,
      nameMr: form.nameMr,
      textEn: form.textEn,
      textMr: form.textMr,
      rating: Number(form.rating),
      avatarUrl: form.avatar?.url ?? null,
      avatarPublicId: form.avatar?.publicId ?? null,
      isVisible: form.isVisible,
      sortOrder: Number(form.sortOrder),
    };

    const check = testimonialSchema.safeParse(payload);
    if (!check.success) {
      setErrors(Array.from(new Set(check.error.issues.map((i) => i.message))));
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      if (editingId)
        await adminApi.patch(`/testimonials/${editingId}`, payload);
      else await adminApi.post("/testimonials", payload);
      reset();
      router.refresh();
    } catch (err) {
      setErrors([getErrorMessage(err)]);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(t: TestimonialRow) {
    setBusyId(t.id);
    setListError("");
    try {
      await adminApi.patch(`/testimonials/${t.id}`, {
        isVisible: !t.isVisible,
      });
      router.refresh();
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(t: TestimonialRow) {
    if (!confirm(`Delete the testimonial from ${t.nameEn}?`)) return;
    setListError("");
    try {
      await adminApi.delete(`/testimonials/${t.id}`);
      if (editingId === t.id) reset();
      router.refresh();
    } catch (err) {
      setListError(getErrorMessage(err));
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium">
        {items.length}/{R.testimonials.max} added · {shown} shown on the home
        page
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={submit}
          noValidate
          className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold">
            {editingId ? "Edit testimonial" : "Add testimonial"}
          </h2>

          {!editingId && atLimit ? (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              You have reached the limit of {R.testimonials.max} testimonials.
              Delete one to add another.
            </p>
          ) : (
            <>
              <Field
                label="Customer name (English)"
                counter={
                  <CharCounter
                    value={form.nameEn}
                    min={R.testimonials.name.min}
                    max={R.testimonials.name.max}
                  />
                }
                hint="A first name and initial is enough, e.g. Sneha P."
              >
                <input
                  className={inputClass}
                  value={form.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                />
              </Field>

              <Field label="Customer name (Marathi, optional)">
                <input
                  className={inputClass}
                  value={form.nameMr}
                  onChange={(e) => set("nameMr", e.target.value)}
                />
              </Field>

              <Field
                label="What they said (English)"
                counter={
                  <CharCounter
                    value={form.textEn}
                    min={R.testimonials.text.min}
                    max={R.testimonials.text.max}
                  />
                }
              >
                <textarea
                  rows={4}
                  className={inputClass}
                  value={form.textEn}
                  onChange={(e) => set("textEn", e.target.value)}
                />
              </Field>

              <Field
                label="What they said (Marathi, optional)"
                counter={
                  <CharCounter
                    value={form.textMr}
                    min={R.testimonials.text.min}
                    max={R.testimonials.text.max}
                  />
                }
              >
                <textarea
                  rows={4}
                  className={inputClass}
                  value={form.textMr}
                  onChange={(e) => set("textMr", e.target.value)}
                />
              </Field>

              <Field label="Rating">
                <select
                  className={inputClass}
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                >
                  {[5, 4, 3, 2, 1].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? "star" : "stars"}
                    </option>
                  ))}
                </select>
              </Field>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Photo (optional)
                </p>
                <SingleImageUpload
                  kind="avatar"
                  optional
                  value={form.avatar}
                  onChange={(avatar) => set("avatar", avatar)}
                  hint="Square photo, at least 100 px. Only use a photo the customer has agreed to share. Without one, a letter circle is shown."
                />
              </div>

              <Field label="Sort order" hint="0 shows first">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={(e) => set("sortOrder", e.target.value)}
                />
              </Field>

              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-4 accent-[#F26A0F]"
                  checked={form.isVisible}
                  onChange={(e) => set("isVisible", e.target.checked)}
                />
                Show on the home page
              </label>
            </>
          )}

          {errors.length > 0 && (
            <ul
              role="alert"
              className="list-disc space-y-1 rounded-md bg-red-50 p-3 pl-7 text-sm text-red-700"
            >
              {errors.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}

          <div className="flex gap-3">
            {(editingId || !atLimit) && (
              <button type="submit" disabled={saving} className={primaryBtn}>
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            )}
            {editingId && (
              <button type="button" onClick={reset} className={secondaryBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div>
          {listError && (
            <p
              role="alert"
              className="mb-3 rounded-md bg-red-50 p-3 text-sm text-red-700"
            >
              {listError}
            </p>
          )}

          <ul className="space-y-3">
            {items.map((t) => (
              <li
                key={t.id}
                className="flex gap-4 rounded-xl bg-white p-3 shadow-sm"
              >
                {t.avatarUrl ? (
                  <Image
                    src={t.avatarUrl}
                    alt=""
                    width={48}
                    height={48}
                    className="size-12 shrink-0 rounded-full border object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center rounded-full border bg-neutral-50 font-semibold text-[#E0700F]"
                  >
                    {Array.from(t.nameEn)[0]}
                  </span>
                )}

                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {t.nameEn}{" "}
                    <span
                      className="text-[#FF9F1C]"
                      aria-label={`${t.rating} stars`}
                    >
                      {stars(t.rating)}
                    </span>
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-neutral-600">
                    {t.textEn}
                  </p>
                  <span
                    className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      t.isVisible
                        ? "bg-green-100 text-green-800"
                        : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {t.isVisible ? "Shown on home page" : "Hidden"}
                  </span>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                  <button
                    type="button"
                    disabled={busyId === t.id}
                    onClick={() => toggle(t)}
                    className="font-medium text-[#E0700F] hover:underline disabled:opacity-40"
                  >
                    {t.isVisible ? "Hide" : "Show"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(t)}
                    className="hover:underline"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(t)}
                    className="text-red-600 hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
            {items.length === 0 && (
              <li className="rounded-xl bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
                No testimonials yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
