/*
  Warnings:

  - The values [DELIVERED,RECALLED] on the enum `Process_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Process` MODIFY `status` ENUM('UNDER_REVIEW', 'DRAFT', 'CANCELLED', 'APPROVED', 'REJECTED', 'ORDERED', 'RECEIVED', 'PROCESSED') NOT NULL DEFAULT 'UNDER_REVIEW';
