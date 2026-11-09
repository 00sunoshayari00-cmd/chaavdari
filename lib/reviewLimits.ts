// lib/reviewLimits.ts
export const REVIEW_LIMITS = {
  videos: { max: 10, maxVisible: 4, title: { min: 3, max: 100 } },
  testimonials: {
    max: 10,
    name: { min: 2, max: 60 },
    text: { min: 20, max: 300 },
  },
} as const;

// Upload rules for the review images (used by app/api/admin/upload/route.ts)
export const REVIEW_IMAGES = {
  thumbnail: { folder: "chaavdari/reviews", minWidth: 400, minHeight: 400 },
  avatar: { folder: "chaavdari/avatars", minWidth: 100, minHeight: 100 },
} as const;
