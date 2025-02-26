/*
  Warnings:

  - You are about to drop the column `status` on the `Reimbursement` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Process_reimbursementID_fkey` ON `Process`;

-- DropIndex
DROP INDEX `Process_requestID_fkey` ON `Process`;

-- AlterTable
ALTER TABLE `Reimbursement` DROP COLUMN `status`;
