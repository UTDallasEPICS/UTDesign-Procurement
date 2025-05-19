/*
  Warnings:

  - A unique constraint covering the columns `[processID]` on the table `Reimbursement` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[processID]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `processID` to the `Reimbursement` table without a default value. This is not possible if the table is not empty.
  - Added the required column `processID` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Process` DROP FOREIGN KEY `Process_reimbursementID_fkey`;

-- DropForeignKey
ALTER TABLE `Process` DROP FOREIGN KEY `Process_requestID_fkey`;

-- AlterTable
ALTER TABLE `Reimbursement` ADD COLUMN `processID` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Request` ADD COLUMN `processID` INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Reimbursement_processID_key` ON `Reimbursement`(`processID`);

-- CreateIndex
CREATE UNIQUE INDEX `Request_processID_key` ON `Request`(`processID`);

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_processID_fkey` FOREIGN KEY (`processID`) REFERENCES `Process`(`processID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reimbursement` ADD CONSTRAINT `Reimbursement_processID_fkey` FOREIGN KEY (`processID`) REFERENCES `Process`(`processID`) ON DELETE RESTRICT ON UPDATE CASCADE;
