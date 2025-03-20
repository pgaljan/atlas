-- DropForeignKey
ALTER TABLE "Element" DROP CONSTRAINT "Element_structureId_fkey";

-- AddForeignKey
ALTER TABLE "Element" ADD CONSTRAINT "Element_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
