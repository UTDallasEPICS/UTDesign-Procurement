/*
  Warnings:

  - You are about to drop the column `justification` on the `reimbursement` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `process` MODIFY `status` ENUM('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ORDERED', 'DELIVERED', 'CANCELLED', 'RECALLED') NOT NULL DEFAULT 'UNDER_REVIEW';

-- AlterTable
ALTER TABLE `project` MODIFY `activationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `reimbursement` DROP COLUMN `justification`;

-- AlterTable
ALTER TABLE `request` ADD COLUMN `expense` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    MODIFY `dateSubmitted` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
