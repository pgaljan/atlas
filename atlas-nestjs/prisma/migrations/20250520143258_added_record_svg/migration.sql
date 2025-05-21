/*
  Warnings:

  - You are about to drop the column `recrodSvg` on the `Record` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Record" DROP COLUMN "recrodSvg",
ADD COLUMN     "recordSvg" JSONB;
