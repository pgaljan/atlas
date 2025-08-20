/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `StructureShare` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StructureShare_userId_key" ON "StructureShare"("userId");
