-- CreateTable
CREATE TABLE "StructureTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "structureJson" JSONB NOT NULL,
    "structureType" "StructureType" NOT NULL DEFAULT 'default',
    "tags" TEXT[],
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "structureId" TEXT,
    "ownerId" TEXT NOT NULL,
    "workspaceId" TEXT,
    "thumbnailUrl" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StructureTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StructureTemplate_structureId_idx" ON "StructureTemplate"("structureId");

-- CreateIndex
CREATE INDEX "StructureTemplate_workspaceId_idx" ON "StructureTemplate"("workspaceId");

-- CreateIndex
CREATE INDEX "StructureTemplate_ownerId_idx" ON "StructureTemplate"("ownerId");

-- AddForeignKey
ALTER TABLE "StructureTemplate" ADD CONSTRAINT "StructureTemplate_structureId_fkey" FOREIGN KEY ("structureId") REFERENCES "Structure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTemplate" ADD CONSTRAINT "StructureTemplate_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StructureTemplate" ADD CONSTRAINT "StructureTemplate_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
