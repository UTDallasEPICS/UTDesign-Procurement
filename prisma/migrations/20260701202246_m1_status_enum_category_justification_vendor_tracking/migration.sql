/*
  Warnings:

  - You are about to drop the column `receiptTotal` on the `ReimbursementItem` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `RequestItem` table. All the data in the column will be lost.
  - Added the required column `category` to the `ReimbursementItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unitPrice` to the `ReimbursementItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `RequestItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `justification` to the `RequestItem` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ReimbursementItem" (
    "itemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "unitPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "category" TEXT NOT NULL,
    "otherCategoryDescription" TEXT,
    "justification" TEXT,
    "url" TEXT,
    "reimbursementID" INTEGER NOT NULL,
    "vendorID" INTEGER NOT NULL,
    "uploadID" INTEGER,
    CONSTRAINT "ReimbursementItem_reimbursementID_fkey" FOREIGN KEY ("reimbursementID") REFERENCES "Reimbursement" ("reimbursementID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReimbursementItem_vendorID_fkey" FOREIGN KEY ("vendorID") REFERENCES "Vendor" ("vendorID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReimbursementItem_uploadID_fkey" FOREIGN KEY ("uploadID") REFERENCES "ReimbursementUpload" ("uploadID") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ReimbursementItem" ("description", "itemID", "receiptDate", "reimbursementID", "uploadID", "vendorID") SELECT "description", "itemID", "receiptDate", "reimbursementID", "uploadID", "vendorID" FROM "ReimbursementItem";
DROP TABLE "ReimbursementItem";
ALTER TABLE "new_ReimbursementItem" RENAME TO "ReimbursementItem";
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
INSERT INTO "new_Request" ("additionalInfo", "dateApproved", "dateNeeded", "dateOrdered", "dateReceived", "dateSubmitted", "expense", "processID", "projectID", "requestID", "studentID", "uploadID") SELECT "additionalInfo", "dateApproved", "dateNeeded", "dateOrdered", "dateReceived", "dateSubmitted", "expense", "processID", "projectID", "requestID", "studentID", "uploadID" FROM "Request";
DROP TABLE "Request";
ALTER TABLE "new_Request" RENAME TO "Request";
CREATE UNIQUE INDEX "Request_processID_key" ON "Request"("processID");
CREATE TABLE "new_RequestItem" (
    "itemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "justification" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "otherCategoryDescription" TEXT,
    "requestID" INTEGER NOT NULL,
    "vendorID" INTEGER NOT NULL,
    CONSTRAINT "RequestItem_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "Request" ("requestID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RequestItem_vendorID_fkey" FOREIGN KEY ("vendorID") REFERENCES "Vendor" ("vendorID") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RequestItem" ("description", "itemID", "partNumber", "quantity", "requestID", "unitPrice", "url", "vendorID") SELECT "description", "itemID", "partNumber", "quantity", "requestID", "unitPrice", "url", "vendorID" FROM "RequestItem";
DROP TABLE "RequestItem";
ALTER TABLE "new_RequestItem" RENAME TO "RequestItem";
CREATE TABLE "new_Vendor" (
    "vendorID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorName" TEXT NOT NULL,
    "vendorStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "vendorEmail" TEXT,
    "vendorURL" TEXT NOT NULL DEFAULT 'https://default.com',
    "isPreferred" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_Vendor" ("vendorEmail", "vendorID", "vendorName", "vendorStatus", "vendorURL") SELECT "vendorEmail", "vendorID", "vendorName", "vendorStatus", "vendorURL" FROM "Vendor";
DROP TABLE "Vendor";
ALTER TABLE "new_Vendor" RENAME TO "Vendor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
