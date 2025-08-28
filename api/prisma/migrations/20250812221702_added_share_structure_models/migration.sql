-- CreateEnum
CREATE TYPE "SharePermission" AS ENUM ('owner', 'collaborator', 'commenter', 'viewer');

-- CreateTable
CREATE TABLE "StructureShare" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureShareLink" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StructureShareInvitation" (
    "id" TEXT NOT NULL,
    "structureId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeEmail" TEXT NOT NULL,
    "permission" "SharePermission" NOT NULL,
    "token" TEXT NOT NULL,
    "message" TEXT,
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "StructureShareInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StructureShare_structureId_idx" ON "StructureShare"("structureId");

-- CreateIndex
CREATE INDEX "StructureShare_userId_idx" ON "StructureShare"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "StructureShare_structureId_userId_key" ON "StructureShare"("structureId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "unique_owner_per_structure" ON "StructureShare"("structureId", "permission");

-- CreateIndex
CREATE UNIQUE INDEX "StructureShareLink_token_key" ON "StructureShareLink"("token");

-- CreateIndex
CREATE INDEX "StructureShareLink_structureId_idx" ON "StructureShareLink"("structureId");

-- CreateIndex
CREATE INDEX "StructureShareLink_token_idx" ON "StructureShareLink"("token");

-- CreateIndex
CREATE UNIQUE INDEX "StructureShareInvitation_token_key" ON "StructureShareInvitation"("token");

-- CreateIndex
CREATE INDEX "StructureShareInvitation_structureId_idx" ON "StructureShareInvitation"("structureId");

-- CreateIndex
CREATE INDEX "StructureShareInvitation_inviteeEmail_idx" ON "StructureShareInvitation"("inviteeEmail");

-- CreateIndex
CREATE INDEX "StructureShareInvitation_token_idx" ON "StructureShareInvitation"("token");

-- AddForeignKey
ALTER TABLE "StructureShare" ADD CONSTRAINT "StructureShare_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureShare" ADD CONSTRAINT "StructureShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureShareLink" ADD CONSTRAINT "StructureShareLink_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureShareInvitation" ADD CONSTRAINT "StructureShareInvitation_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureShareInvitation" ADD CONSTRAINT "StructureShareInvitation_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
