-- CreateTable
CREATE TABLE "HeroSlide" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imagePublicId" TEXT NOT NULL,
    "mobileImageUrl" TEXT,
    "mobileImagePublicId" TEXT,
    "altEn" TEXT NOT NULL,
    "altMr" TEXT,
    "showLogo" BOOLEAN NOT NULL DEFAULT false,
    "titleEn" TEXT,
    "titleMr" TEXT,
    "descriptionEn" TEXT,
    "descriptionMr" TEXT,
    "primaryLabelEn" TEXT,
    "primaryLabelMr" TEXT,
    "primaryHref" TEXT,
    "secondaryLabelEn" TEXT,
    "secondaryLabelMr" TEXT,
    "secondaryHref" TEXT,
    "linkHref" TEXT,
    "textTone" TEXT NOT NULL DEFAULT 'dark',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSlide_pkey" PRIMARY KEY ("id")
);
