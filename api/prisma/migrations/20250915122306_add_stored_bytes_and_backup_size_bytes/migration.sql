-- AlterTable
ALTER TABLE "public"."Backup" ADD COLUMN     "sizeBytes" BIGINT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "storedBytes" BIGINT NOT NULL DEFAULT 0;
