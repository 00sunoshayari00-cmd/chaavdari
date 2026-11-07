// app/admin/(protected)/hero/new/page.tsx
import HeroSlideForm from "@/components/admin/HeroSlideForm";

export default function NewHeroSlidePage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Add hero slide</h1>
      <HeroSlideForm />
    </div>
  );
}
