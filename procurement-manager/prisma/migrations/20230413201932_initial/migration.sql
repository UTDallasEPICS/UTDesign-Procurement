-- CreateTable
CREATE TABLE `User` (
    `userID` INTEGER NOT NULL AUTO_INCREMENT,
    `netID` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `active` BOOLEAN NOT NULL,
    `responsibilities` VARCHAR(191) NULL,
    `deactivationDate` DATETIME(3) NULL,
    `roleID` INTEGER NOT NULL,

    UNIQUE INDEX `User_userID_key`(`userID`),
    UNIQUE INDEX `User_netID_key`(`netID`),
    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Role` (
    `roleID` INTEGER NOT NULL AUTO_INCREMENT,
    `role` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Role_role_key`(`role`),
    PRIMARY KEY (`roleID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Project` (
    `projectID` INTEGER NOT NULL AUTO_INCREMENT,
    `projectType` VARCHAR(191) NOT NULL,
    `projectNum` INTEGER NOT NULL,
    `projectTitle` VARCHAR(191) NOT NULL,
    `startingBudget` DECIMAL(65, 30) NOT NULL,
    `sponsorCompany` VARCHAR(191) NOT NULL,
    `activationDate` DATETIME(3) NOT NULL,
    `deactivationDate` DATETIME(3) NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `costCenter` INTEGER NULL,

    UNIQUE INDEX `Project_projectNum_key`(`projectNum`),
    PRIMARY KEY (`projectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PreviousRecord` (
    `recordID` INTEGER NOT NULL AUTO_INCREMENT,
    `projectID` INTEGER NOT NULL,
    `roleID` INTEGER NOT NULL,
    `userID` INTEGER NOT NULL,

    PRIMARY KEY (`recordID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Request` (
    `requestID` INTEGER NOT NULL AUTO_INCREMENT,
    `dateNeeded` DATETIME(3) NOT NULL,
    `dateSubmitted` DATETIME(3) NOT NULL,
    `dateOrdered` DATETIME(3) NULL,
    `dateReceived` DATETIME(3) NULL,
    `dateApproved` DATETIME(3) NULL,
    `justification` VARCHAR(191) NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `projectID` INTEGER NOT NULL,
    `studentID` INTEGER NOT NULL,

    PRIMARY KEY (`requestID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestItem` (
    `itemID` INTEGER NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `partNumber` VARCHAR(191) NOT NULL,
    `quantity` INTEGER NOT NULL,
    `unitPrice` DECIMAL(65, 30) NULL,
    `requestID` INTEGER NOT NULL,
    `vendorID` INTEGER NOT NULL,
    `uploadID` INTEGER NULL,

    PRIMARY KEY (`itemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `orderID` INTEGER NOT NULL AUTO_INCREMENT,
    `dateOrdered` DATETIME(3) NOT NULL,
    `orderNumber` VARCHAR(191) NOT NULL,
    `orderDetails` VARCHAR(191) NOT NULL,
    `trackingInfo` VARCHAR(191) NOT NULL,
    `shippingCost` DECIMAL(65, 30) NOT NULL,
    `requestID` INTEGER NOT NULL,
    `adminID` INTEGER NOT NULL,

    PRIMARY KEY (`orderID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OtherExpense` (
    `expenseID` INTEGER NOT NULL AUTO_INCREMENT,
    `expenseType` VARCHAR(191) NOT NULL,
    `expenseAmount` DECIMAL(65, 30) NOT NULL,
    `expenseDate` DATETIME(3) NOT NULL,
    `expenseComments` VARCHAR(191) NULL,
    `projectID` INTEGER NOT NULL,
    `requestID` INTEGER NOT NULL,

    PRIMARY KEY (`expenseID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RequestUpload` (
    `uploadID` INTEGER NOT NULL AUTO_INCREMENT,
    `attachmentPath` VARCHAR(191) NULL,
    `attachmentName` VARCHAR(191) NULL,

    PRIMARY KEY (`uploadID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reimbursement` (
    `reimbursementID` INTEGER NOT NULL AUTO_INCREMENT,
    `dateSubmitted` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `justification` VARCHAR(191) NULL,
    `additionalInfo` VARCHAR(191) NULL,
    `projectID` INTEGER NOT NULL,
    `studentID` INTEGER NOT NULL,

    PRIMARY KEY (`reimbursementID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReimbursementItem` (
    `itemID` INTEGER NOT NULL AUTO_INCREMENT,
    `receiptDate` DATETIME(3) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `receiptTotal` DECIMAL(65, 30) NOT NULL,
    `reimbursementID` INTEGER NOT NULL,
    `vendorID` INTEGER NOT NULL,
    `uploadID` INTEGER NULL,

    PRIMARY KEY (`itemID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReimbursementUpload` (
    `uploadID` INTEGER NOT NULL AUTO_INCREMENT,
    `attachmentPath` VARCHAR(191) NOT NULL,
    `attachmentName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`uploadID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Process` (
    `processID` INTEGER NOT NULL AUTO_INCREMENT,
    `status` ENUM('UNDER_REVIEW', 'APPROVED', 'REJECTED', 'ORDERED', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'UNDER_REVIEW',
    `mentorProcessed` DATETIME(3) NULL,
    `mentorProcessedComments` VARCHAR(191) NULL,
    `adminProcessed` DATETIME(3) NULL,
    `adminProcessedComments` VARCHAR(191) NULL,
    `mentorID` INTEGER NULL,
    `adminID` INTEGER NULL,
    `requestID` INTEGER NULL,
    `reimbursementID` INTEGER NULL,

    PRIMARY KEY (`processID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Department` (
    `departmentID` INTEGER NOT NULL AUTO_INCREMENT,
    `department` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Department_department_key`(`department`),
    PRIMARY KEY (`departmentID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Vendor` (
    `vendorID` INTEGER NOT NULL AUTO_INCREMENT,
    `vendorName` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`vendorID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DepartmentUser` (
    `departmentID` INTEGER NOT NULL,
    `userID` INTEGER NOT NULL,

    PRIMARY KEY (`departmentID`, `userID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `WorksOn` (
    `userID` INTEGER NOT NULL,
    `projectID` INTEGER NOT NULL,

    UNIQUE INDEX `WorksOn_userID_key`(`userID`),
    PRIMARY KEY (`userID`, `projectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProjectDepartment` (
    `departmentID` INTEGER NOT NULL,
    `projectID` INTEGER NOT NULL,

    UNIQUE INDEX `ProjectDepartment_departmentID_key`(`departmentID`),
    PRIMARY KEY (`departmentID`, `projectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_roleID_fkey` FOREIGN KEY (`roleID`) REFERENCES `Role`(`roleID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreviousRecord` ADD CONSTRAINT `PreviousRecord_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreviousRecord` ADD CONSTRAINT `PreviousRecord_roleID_fkey` FOREIGN KEY (`roleID`) REFERENCES `Role`(`roleID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PreviousRecord` ADD CONSTRAINT `PreviousRecord_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Request` ADD CONSTRAINT `Request_studentID_fkey` FOREIGN KEY (`studentID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestItem` ADD CONSTRAINT `RequestItem_requestID_fkey` FOREIGN KEY (`requestID`) REFERENCES `Request`(`requestID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestItem` ADD CONSTRAINT `RequestItem_vendorID_fkey` FOREIGN KEY (`vendorID`) REFERENCES `Vendor`(`vendorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RequestItem` ADD CONSTRAINT `RequestItem_uploadID_fkey` FOREIGN KEY (`uploadID`) REFERENCES `RequestUpload`(`uploadID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_requestID_fkey` FOREIGN KEY (`requestID`) REFERENCES `Request`(`requestID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_adminID_fkey` FOREIGN KEY (`adminID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherExpense` ADD CONSTRAINT `OtherExpense_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OtherExpense` ADD CONSTRAINT `OtherExpense_requestID_fkey` FOREIGN KEY (`requestID`) REFERENCES `Request`(`requestID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reimbursement` ADD CONSTRAINT `Reimbursement_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reimbursement` ADD CONSTRAINT `Reimbursement_studentID_fkey` FOREIGN KEY (`studentID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReimbursementItem` ADD CONSTRAINT `ReimbursementItem_reimbursementID_fkey` FOREIGN KEY (`reimbursementID`) REFERENCES `Reimbursement`(`reimbursementID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReimbursementItem` ADD CONSTRAINT `ReimbursementItem_vendorID_fkey` FOREIGN KEY (`vendorID`) REFERENCES `Vendor`(`vendorID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReimbursementItem` ADD CONSTRAINT `ReimbursementItem_uploadID_fkey` FOREIGN KEY (`uploadID`) REFERENCES `ReimbursementUpload`(`uploadID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_mentorID_fkey` FOREIGN KEY (`mentorID`) REFERENCES `User`(`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_adminID_fkey` FOREIGN KEY (`adminID`) REFERENCES `User`(`userID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_requestID_fkey` FOREIGN KEY (`requestID`) REFERENCES `Request`(`requestID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Process` ADD CONSTRAINT `Process_reimbursementID_fkey` FOREIGN KEY (`reimbursementID`) REFERENCES `Reimbursement`(`reimbursementID`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepartmentUser` ADD CONSTRAINT `DepartmentUser_departmentID_fkey` FOREIGN KEY (`departmentID`) REFERENCES `Department`(`departmentID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DepartmentUser` ADD CONSTRAINT `DepartmentUser_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorksOn` ADD CONSTRAINT `WorksOn_userID_fkey` FOREIGN KEY (`userID`) REFERENCES `User`(`userID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorksOn` ADD CONSTRAINT `WorksOn_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectDepartment` ADD CONSTRAINT `ProjectDepartment_departmentID_fkey` FOREIGN KEY (`departmentID`) REFERENCES `Department`(`departmentID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProjectDepartment` ADD CONSTRAINT `ProjectDepartment_projectID_fkey` FOREIGN KEY (`projectID`) REFERENCES `Project`(`projectID`) ON DELETE RESTRICT ON UPDATE CASCADE;
