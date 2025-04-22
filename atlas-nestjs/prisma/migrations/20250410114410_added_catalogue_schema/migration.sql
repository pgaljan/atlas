-- CreateTable
CREATE TABLE "StructureCatalog" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fileUrl" TEXT,
    "userTier" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workspaceId" TEXT,

    CONSTRAINT "StructureCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StructureCatalog_workspaceId_idx" ON "StructureCatalog"("workspaceId");

-- AddForeignKey
ALTER TABLE "StructureCatalog" ADD CONSTRAINT "StructureCatalog_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE SET NULL ON UPDATE CASCADE;
