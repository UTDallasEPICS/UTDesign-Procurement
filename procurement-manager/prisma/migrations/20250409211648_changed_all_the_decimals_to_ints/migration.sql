/*
  Warnings:

  - You are about to alter the column `shippingCost` on the `order` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `expenseAmount` on the `otherexpense` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `startingBudget` on the `project` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `receiptTotal` on the `reimbursementitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `expense` on the `request` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.
  - You are about to alter the column `unitPrice` on the `requestitem` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Int`.

*/
-- AlterTable
ALTER TABLE `order` MODIFY `shippingCost` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `otherexpense` MODIFY `expenseAmount` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `project` MODIFY `startingBudget` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `reimbursementitem` MODIFY `receiptTotal` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `request` MODIFY `expense` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `requestitem` MODIFY `unitPrice` INTEGER NOT NULL;
