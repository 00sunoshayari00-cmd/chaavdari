// lib/hero.ts  (server only)
import { cache } from "react";
import { db } from "@/lib/db";

export const getHeroSlides = cache(async () =>
  db.heroSlide.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  }),
);
