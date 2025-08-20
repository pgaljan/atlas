-- AlterTable
ALTER TABLE "StructureShareInvitation" ADD COLUMN     "inviteeId" TEXT;

-- AddForeignKey
ALTER TABLE "StructureShareInvitation" ADD CONSTRAINT "StructureShareInvitation_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
