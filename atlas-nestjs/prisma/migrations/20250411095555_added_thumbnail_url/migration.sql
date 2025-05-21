/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `StructureCatalog` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "StructureCatalog" DROP COLUMN "thumbnail",
ADD COLUMN     "thumbnailUrl" TEXT;
