/*
  Warnings:

  - Made the column `unitPrice` on table `requestitem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `requestitem` MODIFY `unitPrice` DECIMAL(65, 30) NOT NULL;

-- AlterTable
ALTER TABLE `vendor` ADD COLUMN `vendorCategory` VARCHAR(191) NULL;
