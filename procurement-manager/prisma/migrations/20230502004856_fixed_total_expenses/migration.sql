/*
  Warnings:

  - You are about to alter the column `totalExpenses` on the `project` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE `project` MODIFY `totalExpenses` DECIMAL(65, 30) NOT NULL DEFAULT 0;
