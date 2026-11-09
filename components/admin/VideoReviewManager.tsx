// components/admin/VideoReviewManager.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { adminApi, getErrorMessage } from "@/lib/adminApi";
import { REVIEW_LIMITS as R } from "@/lib/reviewLimits";
import { extractYoutubeId } from "@/lib/youtube";
import { videoReviewSchema } from "@/lib/validators";
import SingleImageUpload, { type UploadedImage } from "./SingleImageUpload";
import { CharCounter, Field } from "./formParts";
import { inputClass, primaryBtn, secondaryBtn } from "./styles";

export interface VideoReviewRow {
  id: string;
  videoId: string;
  titleEn: string;
  titleMr: string | null;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  isVisible: boolean;
  sortOrder: number;
}

interface FormState {
  video: string; // a link or an id, whatever the owner pastes
  titleEn: string;
  titleMr: string;
  thumb: UploadedImage | null;
  isVisible: boolean;
  sortOrder: string;
}

const blank = (isVisible: boolean): FormState => ({
  video: "",
  titleEn: "",
  titleMr: "",
  thumb: null,
  isVisible,
  sortOrder: "0",
});

export default function VideoReviewManager({
  reviews,
}: {
  reviews: VideoReviewRow[];
}) {
  const router = useRouter();
  const visibleCount = reviews.filter((r) => r.isVisible).length;
  const atLimit = reviews.length >= R.videos.max;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(() =>
    blank(visibleCount < R.videos.maxVisible),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [listError, setListError] = useState("");

  const editing = reviews.find((r) => r.id === editingId) ?? null;
  // A slot is free if fewer than 4 are shown, or this very video is one of the shown ones
  const slotFree =
    visibleCount < R.videos.maxVisible || Boolean(editing?.isVisible);
  const parsedId = extractYoutubeId(form.video);

  function reset() {
    setEditingId(null);
    setForm(blank(visibleCount < R.videos.maxVisible));
    setErrors([]);
  }

  function startEdit(r: VideoReviewRow) {
    setEditingId(r.id);
    setErrors([]);
    setForm({
      video: r.videoId,
      titleEn: r.titleEn,
      titleMr: r.titleMr ?? "",
      thumb: { url: r.thumbnailUrl, publicId: r.thumbnailPublicId },
      isVisible: r.isVisible,
      sortOrder: String(r.sortOrder),
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    const payload = {
      videoId: form.video,
      titleEn: form.titleEn,
      titleMr: form.titleMr,
      thumbnailUrl: form.thumb?.url ?? "",
      thumbnailPublicId: form.thumb?.publicId ?? "",
      isVisible: slotFree ? form.isVisible : false,
      sortOrder: Number(form.sortOrder),
    };

    const check = videoReviewSchema.safeParse(payload);
    if (!check.success) {
      setErrors(Array.from(new Set(check.error.issues.map((i) => i.message))));
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      if (editingId)
        await adminApi.patch(`/video-reviews/${editingId}`, payload);
      else await adminApi.post("/video-reviews", payload);
      reset();
      router.refresh();
    } catch (err) {
      setErrors([getErrorMessage(err)]);
    } finally {
      setSaving(false);
    }
  }

  async function toggle(r: VideoReviewRow) {
    setBusyId(r.id);
    setListError("");
    try {
      await adminApi.patch(`/video-reviews/${r.id}`, {
        isVisible: !r.isVisible,
      });
      router.refresh();
    } catch (err) {
      setListError(getErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(r: VideoReviewRow) {
    if (!confirm(`Delete "${r.titleEn}"?`)) return;
    setListError("");
    try {
      await adminApi.delete(`/video-reviews/${r.id}`);
      if (editingId === r.id) reset();
      router.refresh();
    } catch (err) {
      setListError(getErrorMessage(err));
    }
  }

  return (
    <div className="mt-6">
      <p className="text-sm font-medium">
        {reviews.length}/{R.videos.max} added · {visibleCount}/
        {R.videos.maxVisible} shown on the home page
      </p>

      <div className="mt-4 grid gap-8 lg:grid-cols-[400px_1fr]">
        <form
          onSubmit={submit}
          noValidate
          className="h-fit space-y-4 rounded-xl bg-white p-5 shadow-sm"
        >
          <h2 className="font-semibold">
            {editingId ? "Edit video review" : "Add video review"}
          </h2>

          {!editingId && atLimit ? (
            <p className="rounded-md bg-amber-50 p-3 text-sm text-amber-800">
              You have reached the limit of {R.videos.max} videos. Delete one to
              add another.
            </p>
          ) : (
            <>
              <Field
                label="YouTube link"
                hint="Paste the link of the video or Short. We find the video id for you."
              >
                <input
                  className={inputClass}
                  value={form.video}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, video: e.target.value }))
                  }
                  placeholder="https://www.youtube.com/shorts/..."
                />
                {form.video.trim() !== "" && (
                  <span
                    className={`mt-1 block text-xs ${parsedId ? "text-green-700" : "text-red-600"}`}
                  >
                    {parsedId
                      ? `Video id: ${parsedId}`
                      : "This does not look like a YouTube link"}
                  </span>
                )}
              </Field>

              <Field
                label="Title (English)"
                counter={
                  <CharCounter
                    value={form.titleEn}
                    min={R.videos.title.min}
                    max={R.videos.title.max}
                  />
                }
                hint="Short and descriptive, e.g. Priya's review of our Jaggery Ladoo"
              >
                <input
                  className={inputClass}
                  value={form.titleEn}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titleEn: e.target.value }))
                  }
                />
              </Field>

              <Field label="Title (Marathi, optional)">
                <input
                  className={inputClass}
                  value={form.titleMr}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, titleMr: e.target.value }))
                  }
                />
              </Field>

              <div>
                <p className="mb-2 text-sm font-medium text-neutral-700">
                  Thumbnail
                </p>
                <SingleImageUpload
                  kind="thumbnail"
                  value={form.thumb}
                  onChange={(thumb) => setForm((f) => ({ ...f, thumb }))}
                  hint="Tall image, about 2:3 (for example 800×1200 px), at least 400 px wide. Under 4 MB."
                />
              </div>

              <Field label="Sort order" hint="0 shows first">
                <input
                  type="number"
                  min={0}
                  className={inputClass}
                  value={form.sortOrder}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, sortOrder: e.target.value }))
                  }
                />
              </Field>

              <label className="flex items-start gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-[#F26A0F]"
                  checked={slotFree && form.isVisible}
                  disabled={!slotFree}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, isVisible: e.target.checked }))
                  }
                />
                <span>
                  Show on the home page
                  {!slotFree && (
                    <span className="block text-xs font-normal text-amber-700">
                      {R.videos.maxVisible} videos are already shown. Hide one
                      first.
                    </span>
                  )}
                </span>
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
            {reviews.map((r) => {
              const cannotShow =
                !r.isVisible && visibleCount >= R.videos.maxVisible;
              return (
                <li
                  key={r.id}
                  className="flex gap-4 rounded-xl bg-white p-3 shadow-sm"
                >
                  <Image
                    src={r.thumbnailUrl}
                    alt=""
                    width={48}
                    height={72}
                    className="h-[72px] w-12 shrink-0 rounded-md border object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{r.titleEn}</p>
                    {r.titleMr && (
                      <p className="truncate text-sm text-neutral-500">
                        {r.titleMr}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-neutral-400">
                      Video id: {r.videoId}
                    </p>
                    <span
                      className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        r.isVisible
                          ? "bg-green-100 text-green-800"
                          : "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {r.isVisible ? "Shown on home page" : "Hidden"}
                    </span>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                    <button
                      type="button"
                      disabled={busyId === r.id || cannotShow}
                      title={
                        cannotShow
                          ? `${R.videos.maxVisible} videos are already shown. Hide one first.`
                          : undefined
                      }
                      onClick={() => toggle(r)}
                      className="font-medium text-[#E0700F] hover:underline disabled:cursor-not-allowed disabled:opacity-40 disabled:no-underline"
                    >
                      {r.isVisible ? "Hide" : "Show"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(r)}
                      className="hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(r)}
                      className="text-red-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              );
            })}
            {reviews.length === 0 && (
              <li className="rounded-xl bg-white p-6 text-center text-sm text-neutral-500 shadow-sm">
                No video reviews yet.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
