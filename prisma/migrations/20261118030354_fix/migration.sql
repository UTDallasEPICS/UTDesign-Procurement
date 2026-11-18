/*
  Warnings:

  - You are about to drop the `AuthAccount` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuthSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuthUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuthVerification` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `DepartmentUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `User` table. All the data in the column will be lost.
  - The primary key for the `WorksOn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "AuthAccount_providerId_accountId_key";

-- DropIndex
DROP INDEX "AuthSession_token_key";

-- DropIndex
DROP INDEX "AuthUser_email_key";

-- DropIndex
DROP INDEX "AuthVerification_identifier_value_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuthAccount";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuthSession";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuthUser";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AuthVerification";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "accessTokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "scope" TEXT,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DepartmentUser" (
    "departmentID" INTEGER NOT NULL,
    "userID" TEXT NOT NULL,

    PRIMARY KEY ("departmentID", "userID"),
    CONSTRAINT "DepartmentUser_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department" ("departmentID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DepartmentUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_DepartmentUser" ("departmentID", "userID") SELECT "departmentID", "userID" FROM "DepartmentUser";
DROP TABLE "DepartmentUser";
ALTER TABLE "new_DepartmentUser" RENAME TO "DepartmentUser";
CREATE TABLE "new_Order" (
    "orderID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateOrdered" DATETIME NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "orderDetails" TEXT NOT NULL,
    "trackingInfo" TEXT NOT NULL,
    "shippingCost" REAL NOT NULL,
    "requestID" INTEGER NOT NULL,
    "adminID" TEXT NOT NULL,
    CONSTRAINT "Order_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "Request" ("requestID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("adminID", "dateOrdered", "orderDetails", "orderID", "orderNumber", "requestID", "shippingCost", "trackingInfo") SELECT "adminID", "dateOrdered", "orderDetails", "orderID", "orderNumber", "requestID", "shippingCost", "trackingInfo" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_PreviousRecord" (
    "recordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    CONSTRAINT "PreviousRecord_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PreviousRecord_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PreviousRecord" ("projectID", "recordID", "role", "userID") SELECT "projectID", "recordID", "role", "userID" FROM "PreviousRecord";
DROP TABLE "PreviousRecord";
ALTER TABLE "new_PreviousRecord" RENAME TO "PreviousRecord";
CREATE TABLE "new_Process" (
    "processID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
    "mentorProcessed" DATETIME,
    "mentorProcessedComments" TEXT,
    "adminProcessed" DATETIME,
    "adminProcessedComments" TEXT,
    "mentorID" TEXT,
    "adminID" TEXT,
    CONSTRAINT "Process_mentorID_fkey" FOREIGN KEY ("mentorID") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Process_adminID_fkey" FOREIGN KEY ("adminID") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Process" ("adminID", "adminProcessed", "adminProcessedComments", "mentorID", "mentorProcessed", "mentorProcessedComments", "processID", "status") SELECT "adminID", "adminProcessed", "adminProcessedComments", "mentorID", "mentorProcessed", "mentorProcessedComments", "processID", "status" FROM "Process";
DROP TABLE "Process";
ALTER TABLE "new_Process" RENAME TO "Process";
CREATE TABLE "new_Reimbursement" (
    "reimbursementID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateSubmitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "additionalInfo" TEXT,
    "expense" INTEGER NOT NULL DEFAULT 0,
    "projectID" INTEGER NOT NULL,
    "studentID" TEXT NOT NULL,
    "processID" INTEGER NOT NULL,
    CONSTRAINT "Reimbursement_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reimbursement_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Reimbursement_processID_fkey" FOREIGN KEY ("processID") REFERENCES "Process" ("processID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Reimbursement" ("additionalInfo", "dateSubmitted", "expense", "processID", "projectID", "reimbursementID", "studentID") SELECT "additionalInfo", "dateSubmitted", "expense", "processID", "projectID", "reimbursementID", "studentID" FROM "Reimbursement";
DROP TABLE "Reimbursement";
ALTER TABLE "new_Reimbursement" RENAME TO "Reimbursement";
CREATE UNIQUE INDEX "Reimbursement_processID_key" ON "Reimbursement"("processID");
CREATE TABLE "new_Request" (
    "requestID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateNeeded" DATETIME NOT NULL,
    "dateSubmitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOrdered" DATETIME,
    "dateReceived" DATETIME,
    "dateApproved" DATETIME,
    "additionalInfo" TEXT,
    "expense" INTEGER NOT NULL DEFAULT 0,
    "trackingRequested" BOOLEAN NOT NULL DEFAULT false,
    "trackingRequestedAt" DATETIME,
    "projectID" INTEGER NOT NULL,
    "studentID" TEXT NOT NULL,
    "processID" INTEGER NOT NULL,
    "uploadID" INTEGER,
    CONSTRAINT "Request_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_processID_fkey" FOREIGN KEY ("processID") REFERENCES "Process" ("processID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_uploadID_fkey" FOREIGN KEY ("uploadID") REFERENCES "RequestUpload" ("uploadID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Request" ("additionalInfo", "dateApproved", "dateNeeded", "dateOrdered", "dateReceived", "dateSubmitted", "expense", "processID", "projectID", "requestID", "studentID", "trackingRequested", "trackingRequestedAt", "uploadID") SELECT "additionalInfo", "dateApproved", "dateNeeded", "dateOrdered", "dateReceived", "dateSubmitted", "expense", "processID", "projectID", "requestID", "studentID", "trackingRequested", "trackingRequestedAt", "uploadID" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE UNIQUE INDEX "Request_processID_key" ON "Request"("processID");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "netID" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "responsibilities" TEXT,
    "deactivationDate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("active", "deactivationDate", "email", "id", "netID", "responsibilities", "role") SELECT "active", "deactivationDate", "email", "id", "netID", "responsibilities", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_WorksOn" (
    "userID" TEXT NOT NULL,
    "projectID" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "comments" TEXT,

    PRIMARY KEY ("userID", "projectID", "startDate"),
    CONSTRAINT "WorksOn_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorksOn_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_WorksOn" ("comments", "endDate", "projectID", "startDate", "userID") SELECT "comments", "endDate", "projectID", "startDate", "userID" FROM "WorksOn";
DROP TABLE "WorksOn";
ALTER TABLE "new_WorksOn" RENAME TO "WorksOn";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");
