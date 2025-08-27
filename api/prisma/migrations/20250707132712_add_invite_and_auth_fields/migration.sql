-- AlterTable
ALTER TABLE "AppSettings" ADD COLUMN     "authProviders" JSONB,
ADD COLUMN     "inviteCodeOption" TEXT;
