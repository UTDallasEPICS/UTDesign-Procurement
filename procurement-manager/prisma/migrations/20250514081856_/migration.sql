/*
  Warnings:

  - You are about to alter the column `expense` on the `reimbursement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `reimbursement` MODIFY `expense` INTEGER NOT NULL DEFAULT 0;
