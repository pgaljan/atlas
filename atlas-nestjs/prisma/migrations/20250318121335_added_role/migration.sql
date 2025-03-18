/*
  Warnings:

  - You are about to drop the `_SuperAdminRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_SuperAdminRoles" DROP CONSTRAINT "_SuperAdminRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "_SuperAdminRoles" DROP CONSTRAINT "_SuperAdminRoles_B_fkey";

-- AlterTable
ALTER TABLE "SuperAdmin" ADD COLUMN     "role" TEXT DEFAULT 'super-admin';

-- DropTable
DROP TABLE "_SuperAdminRoles";
