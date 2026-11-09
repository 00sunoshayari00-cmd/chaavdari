-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "youtubeUrl" TEXT;

-- CreateTable
CREATE TABLE "VideoReview" (
    "id" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "titleMr" TEXT,
    "thumbnailUrl" TEXT NOT NULL,
    "thumbnailPublicId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameMr" TEXT,
    "textEn" TEXT NOT NULL,
    "textMr" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatarUrl" TEXT,
    "avatarPublicId" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);
