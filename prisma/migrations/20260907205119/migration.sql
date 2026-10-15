/*
  Warnings:

  - The primary key for the `DepartmentUser` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `userID` on the `DepartmentUser` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `adminID` on the `Order` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `userID` on the `PreviousRecord` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `adminID` on the `Process` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `mentorID` on the `Process` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `studentID` on the `Reimbursement` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `studentID` on the `Request` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `WorksOn` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `userID` on the `WorksOn` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- CreateTable
CREATE TABLE "AuthUser" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AuthAccount" (
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
    CONSTRAINT "AuthAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AuthAccount" ("accessToken", "accessTokenExpiresAt", "accountId", "createdAt", "id", "idToken", "password", "providerId", "refreshToken", "refreshTokenExpiresAt", "scope", "updatedAt", "userId") SELECT "accessToken", "accessTokenExpiresAt", "accountId", "createdAt", "id", "idToken", "password", "providerId", "refreshToken", "refreshTokenExpiresAt", "scope", "updatedAt", "userId" FROM "AuthAccount";
DROP TABLE "AuthAccount";
ALTER TABLE "new_AuthAccount" RENAME TO "AuthAccount";
CREATE UNIQUE INDEX "AuthAccount_providerId_accountId_key" ON "AuthAccount"("providerId", "accountId");
CREATE TABLE "new_AuthSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "userId" TEXT NOT NULL,
    CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AuthUser" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_AuthSession" ("createdAt", "expiresAt", "id", "ipAddress", "token", "updatedAt", "userAgent", "userId") SELECT "createdAt", "expiresAt", "id", "ipAddress", "token", "updatedAt", "userAgent", "userId" FROM "AuthSession";
DROP TABLE "AuthSession";
ALTER TABLE "new_AuthSession" RENAME TO "AuthSession";
CREATE UNIQUE INDEX "AuthSession_token_key" ON "AuthSession"("token");
CREATE TABLE "new_DepartmentUser" (
    "departmentID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,

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
    "adminID" INTEGER NOT NULL,
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
    "userID" INTEGER NOT NULL,
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
    "mentorID" INTEGER,
    "adminID" INTEGER,
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
    "studentID" INTEGER NOT NULL,
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
    "studentID" INTEGER NOT NULL,
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
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "netID" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "responsibilities" TEXT,
    "deactivationDate" DATETIME,
    "role" TEXT NOT NULL DEFAULT 'STUDENT'
);
INSERT INTO "new_User" ("active", "deactivationDate", "email", "firstName", "id", "lastName", "netID", "responsibilities", "role") SELECT "active", "deactivationDate", "email", "firstName", "id", "lastName", "netID", "responsibilities", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_WorksOn" (
    "userID" INTEGER NOT NULL,
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
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");
