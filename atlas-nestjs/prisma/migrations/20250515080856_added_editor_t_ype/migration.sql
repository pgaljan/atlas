-- CreateEnum
CREATE TYPE "EditorType" AS ENUM ('vscode', 'quilleditor');

-- AlterTable
ALTER TABLE "Record" ADD COLUMN     "editorType" "EditorType" NOT NULL DEFAULT 'vscode';
