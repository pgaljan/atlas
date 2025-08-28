/*
  Warnings:

  - The values [collaborator] on the enum `SharePermission` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SharePermission_new" AS ENUM ('owner', 'editor', 'commenter', 'viewer');
ALTER TABLE "StructureShare" ALTER COLUMN "permission" TYPE "SharePermission_new" USING ("permission"::text::"SharePermission_new");
ALTER TABLE "StructureShareLink" ALTER COLUMN "permission" TYPE "SharePermission_new" USING ("permission"::text::"SharePermission_new");
ALTER TABLE "StructureShareInvitation" ALTER COLUMN "permission" TYPE "SharePermission_new" USING ("permission"::text::"SharePermission_new");
ALTER TYPE "SharePermission" RENAME TO "SharePermission_old";
ALTER TYPE "SharePermission_new" RENAME TO "SharePermission";
DROP TYPE "SharePermission_old";
COMMIT;
