-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ingredientsEn" TEXT,
ADD COLUMN     "ingredientsMr" TEXT,
ADD COLUMN     "isFeatured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "metaDescriptionEn" TEXT,
ADD COLUMN     "metaDescriptionMr" TEXT,
ADD COLUMN     "metaTitleEn" TEXT,
ADD COLUMN     "metaTitleMr" TEXT,
ADD COLUMN     "mrp" INTEGER,
ADD COLUMN     "noindex" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "shelfLife" TEXT,
ADD COLUMN     "sku" TEXT;

-- AlterTable
ALTER TABLE "ProductImage" ADD COLUMN     "altEn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "altMr" TEXT,
ADD COLUMN     "height" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isBanner" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "width" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");


-- Existing products: the old "main" image (position 0) becomes the banner,
-- and the product name is the starting alt text until the owner edits it
UPDATE "ProductImage" SET "isBanner" = true WHERE "position" = 0;
UPDATE "ProductImage" i SET "altEn" = p."nameEn"
FROM "Product" p WHERE i."productId" = p."id" AND i."altEn" = '';
