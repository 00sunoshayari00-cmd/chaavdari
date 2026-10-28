// lib/productLimits.ts
export const LIMITS = {
  name: { min: 3, max: 80 },
  slug: { min: 3, max: 60 },
  sku: { min: 2, max: 40 },
  weight: { min: 1, max: 30 },
  summary: { min: 10, max: 140 },
  descriptionText: { min: 50, max: 5000, recommendedWords: 150 },
  ingredients: { max: 500 },
  shelfLife: { max: 60 },
  price: { min: 1, max: 100000 },
  metaTitle: { min: 10, ideal: 30, max: 60 },
  metaDescription: { min: 70, ideal: 120, max: 160 },
  keywords: { maxCount: 10, min: 2, max: 40 },
  imageAlt: { min: 5, max: 125 },
  images: { min: 1, max: 8, minSide: 600 },
} as const;
