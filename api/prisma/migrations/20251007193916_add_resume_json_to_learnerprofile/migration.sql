-- AlterTable
ALTER TABLE "public"."LearnerProfile" ADD COLUMN     "resumeAt" TIMESTAMP(3),
ADD COLUMN     "resumeJson" JSONB;
