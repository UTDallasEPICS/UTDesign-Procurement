/*
  Warnings:

  - You are about to drop the column `vendorCategory` on the `vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `vendor` DROP COLUMN `vendorCategory`,
    ADD COLUMN `isApproved` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `vendorEmail` VARCHAR(191) NULL,
    ADD COLUMN `vendorStatus` ENUM('APPROVED', 'DENIED', 'PENDING') NOT NULL DEFAULT 'DENIED',
    ADD COLUMN `vendorURL` VARCHAR(191) NOT NULL DEFAULT 'https://default.com';
