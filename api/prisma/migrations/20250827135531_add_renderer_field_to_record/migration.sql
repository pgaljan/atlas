/*
  Warnings:

  - The values [markeddown,plantuml,latex] on the enum `EditorType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."RendererType" AS ENUM ('none', 'mermaid', 'markeddown', 'plantuml', 'latex');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."EditorType_new" AS ENUM ('vscode', 'quilleditor');
ALTER TABLE "public"."Record" ALTER COLUMN "editorType" DROP DEFAULT;
ALTER TABLE "public"."Record" ALTER COLUMN "editorType" TYPE "public"."EditorType_new" USING ("editorType"::text::"public"."EditorType_new");
ALTER TYPE "public"."EditorType" RENAME TO "EditorType_old";
ALTER TYPE "public"."EditorType_new" RENAME TO "EditorType";
DROP TYPE "public"."EditorType_old";
ALTER TABLE "public"."Record" ALTER COLUMN "editorType" SET DEFAULT 'vscode';
COMMIT;

-- AlterTable
ALTER TABLE "public"."Record" ADD COLUMN     "renderer" "public"."RendererType" DEFAULT 'none';
