/*
  Warnings:

  - The values [hugeRTEeditor] on the enum `EditorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EditorType_new" AS ENUM ('vscode', 'quilleditor', 'markeddown', 'plantuml');
ALTER TABLE "Record" ALTER COLUMN "editorType" DROP DEFAULT;
ALTER TABLE "Record" ALTER COLUMN "editorType" TYPE "EditorType_new" USING ("editorType"::text::"EditorType_new");
ALTER TYPE "EditorType" RENAME TO "EditorType_old";
ALTER TYPE "EditorType_new" RENAME TO "EditorType";
DROP TYPE "EditorType_old";
ALTER TABLE "Record" ALTER COLUMN "editorType" SET DEFAULT 'vscode';
COMMIT;
