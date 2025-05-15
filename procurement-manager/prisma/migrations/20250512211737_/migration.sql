/*
  Warnings:

  - You are about to alter the column `totalExpenses` on the `project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `totalExpenses` INTEGER NOT NULL DEFAULT 0;
