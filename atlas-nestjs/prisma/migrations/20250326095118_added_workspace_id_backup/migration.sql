-- AlterTable
ALTER TABLE "Backup" ADD COLUMN     "workspaceId" TEXT NOT NULL DEFAULT 'default_workspace_id';

-- AddForeignKey
ALTER TABLE "Backup" ADD CONSTRAINT "Backup_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
