-- AlterTable
ALTER TABLE `requestitem` ADD COLUMN `status` ENUM('UNDER_REVIEW', 'DRAFT', 'CANCELLED', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'PROCESSED') NOT NULL DEFAULT 'UNDER_REVIEW';
