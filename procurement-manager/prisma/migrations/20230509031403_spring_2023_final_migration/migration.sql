/*
  Warnings:

  - You are about to drop the column `justification` on the `request` table. All the data in the column will be lost.
  - You are about to drop the column `uploadID` on the `requestitem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `requestitem` DROP FOREIGN KEY `RequestItem_uploadID_fkey`;

-- AlterTable
ALTER TABLE `request` DROP COLUMN `justification`,
    ADD COLUMN `uploadID` INTEGER NULL;

-- AlterTable
ALTER TABLE `requestitem` DROP COLUMN `uploadID`;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_uploadID_fkey` FOREIGN KEY (`uploadID`) REFERENCES `RequestUpload`(`uploadID`) ON DELETE SET NULL ON UPDATE CASCADE;
