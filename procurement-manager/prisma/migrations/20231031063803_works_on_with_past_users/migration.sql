/*
  Warnings:

  - The primary key for the `workson` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `startDate` to the `WorksOn` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `workson` DROP PRIMARY KEY,
    ADD COLUMN `comments` VARCHAR(191) NULL,
    ADD COLUMN `endDate` DATETIME(3) NULL,
    ADD COLUMN `startDate` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`userID`, `projectID`, `startDate`);
