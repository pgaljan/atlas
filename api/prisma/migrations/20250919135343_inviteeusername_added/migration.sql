/*
  Warnings:

  - You are about to drop the column `inviteeEmail` on the `StructureShareInvitation` table. All the data in the column will be lost.
  - You are about to drop the `StructureShareLink` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `inviteeUsername` to the `StructureShareInvitation` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "public"."StructureShareLink" DROP CONSTRAINT "StructureShareLink_structureId_fkey";

-- DropIndex
DROP INDEX "public"."StructureShareInvitation_inviteeEmail_idx";

-- AlterTable
ALTER TABLE "public"."StructureShareInvitation" DROP COLUMN "inviteeEmail",
ADD COLUMN     "inviteeUsername" TEXT NOT NULL;

-- DropTable
DROP TABLE "public"."StructureShareLink";

-- CreateIndex
CREATE INDEX "StructureShareInvitation_inviteeUsername_idx" ON "public"."StructureShareInvitation"("inviteeUsername");
