/*
  Warnings:

  - You are about to drop the column `userTier` on the `StructureCatalog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StructureCatalog" DROP COLUMN "userTier";

-- CreateTable
CREATE TABLE "CatalogTier" (
    "id" TEXT NOT NULL,
    "catalogId" TEXT NOT NULL,
    "tier" TEXT NOT NULL,

    CONSTRAINT "CatalogTier_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogTier_catalogId_tier_key" ON "CatalogTier"("catalogId", "tier");

-- AddForeignKey
ALTER TABLE "CatalogTier" ADD CONSTRAINT "CatalogTier_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "StructureCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
