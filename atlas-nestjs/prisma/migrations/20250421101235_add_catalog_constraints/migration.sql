-- DropForeignKey
ALTER TABLE "CatalogTier" DROP CONSTRAINT "CatalogTier_catalogId_fkey";

-- AddForeignKey
ALTER TABLE "CatalogTier" ADD CONSTRAINT "CatalogTier_catalogId_fkey" FOREIGN KEY ("catalogId") REFERENCES "StructureCatalog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
