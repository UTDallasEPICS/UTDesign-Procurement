-- CreateTable
CREATE TABLE "User" (
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

-- CreateTable
CREATE TABLE "AuthSession" (
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

-- CreateTable
CREATE TABLE "AuthAccount" (
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

-- CreateTable
CREATE TABLE "AuthVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME,
    "updatedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Project" (
    "projectID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectNum" TEXT NOT NULL,
    "projectTitle" TEXT NOT NULL,
    "projectType" TEXT NOT NULL,
    "startingBudget" INTEGER NOT NULL,
    "sponsorCompany" TEXT NOT NULL,
    "totalExpenses" INTEGER NOT NULL DEFAULT 0,
    "activationDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deactivationDate" DATETIME,
    "additionalInfo" TEXT,
    "costCenter" TEXT
);

-- CreateTable
CREATE TABLE "Request" (
    "requestID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dateNeeded" DATETIME NOT NULL,
    "dateSubmitted" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateOrdered" DATETIME,
    "dateReceived" DATETIME,
    "dateApproved" DATETIME,
    "additionalInfo" TEXT,
    "expense" INTEGER NOT NULL DEFAULT 0,
    "projectID" INTEGER NOT NULL,
    "studentID" INTEGER NOT NULL,
    "processID" INTEGER NOT NULL,
    "uploadID" INTEGER,
    CONSTRAINT "Request_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_studentID_fkey" FOREIGN KEY ("studentID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_processID_fkey" FOREIGN KEY ("processID") REFERENCES "Process" ("processID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_uploadID_fkey" FOREIGN KEY ("uploadID") REFERENCES "RequestUpload" ("uploadID") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestItem" (
    "itemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "partNumber" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNDER_REVIEW',
    "requestID" INTEGER NOT NULL,
    "vendorID" INTEGER NOT NULL,
    CONSTRAINT "RequestItem_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "Request" ("requestID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RequestItem_vendorID_fkey" FOREIGN KEY ("vendorID") REFERENCES "Vendor" ("vendorID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RequestUpload" (
    "uploadID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attachmentPath" TEXT,
    "attachmentName" TEXT
);

-- CreateTable
CREATE TABLE "Reimbursement" (
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

-- CreateTable
CREATE TABLE "ReimbursementItem" (
    "itemID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "receiptDate" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "receiptTotal" REAL NOT NULL,
    "reimbursementID" INTEGER NOT NULL,
    "vendorID" INTEGER NOT NULL,
    "uploadID" INTEGER,
    CONSTRAINT "ReimbursementItem_reimbursementID_fkey" FOREIGN KEY ("reimbursementID") REFERENCES "Reimbursement" ("reimbursementID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReimbursementItem_vendorID_fkey" FOREIGN KEY ("vendorID") REFERENCES "Vendor" ("vendorID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ReimbursementItem_uploadID_fkey" FOREIGN KEY ("uploadID") REFERENCES "ReimbursementUpload" ("uploadID") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReimbursementUpload" (
    "uploadID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "attachmentPath" TEXT NOT NULL,
    "attachmentName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Process" (
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

-- CreateTable
CREATE TABLE "Order" (
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

-- CreateTable
CREATE TABLE "OtherExpense" (
    "expenseID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "expenseType" TEXT NOT NULL,
    "expenseAmount" REAL NOT NULL,
    "expenseDate" DATETIME NOT NULL,
    "expenseComments" TEXT,
    "projectID" INTEGER NOT NULL,
    "requestID" INTEGER NOT NULL,
    CONSTRAINT "OtherExpense_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "OtherExpense_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "Request" ("requestID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vendor" (
    "vendorID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "vendorName" TEXT NOT NULL,
    "vendorStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "vendorEmail" TEXT,
    "vendorURL" TEXT NOT NULL DEFAULT 'https://default.com'
);

-- CreateTable
CREATE TABLE "Department" (
    "departmentID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "department" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "WorksOn" (
    "userID" INTEGER NOT NULL,
    "projectID" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "comments" TEXT,

    PRIMARY KEY ("userID", "projectID", "startDate"),
    CONSTRAINT "WorksOn_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WorksOn_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DepartmentUser" (
    "departmentID" INTEGER NOT NULL,
    "userID" INTEGER NOT NULL,

    PRIMARY KEY ("departmentID", "userID"),
    CONSTRAINT "DepartmentUser_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department" ("departmentID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "DepartmentUser_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProjectDepartment" (
    "departmentID" INTEGER NOT NULL,
    "projectID" INTEGER NOT NULL,

    PRIMARY KEY ("departmentID", "projectID"),
    CONSTRAINT "ProjectDepartment_departmentID_fkey" FOREIGN KEY ("departmentID") REFERENCES "Department" ("departmentID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProjectDepartment_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PreviousRecord" (
    "recordID" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "projectID" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "userID" INTEGER NOT NULL,
    CONSTRAINT "PreviousRecord_projectID_fkey" FOREIGN KEY ("projectID") REFERENCES "Project" ("projectID") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PreviousRecord_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthUser_email_key" ON "AuthUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_token_key" ON "AuthSession"("token");

-- CreateIndex
CREATE UNIQUE INDEX "AuthAccount_providerId_accountId_key" ON "AuthAccount"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthVerification_identifier_value_key" ON "AuthVerification"("identifier", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Project_projectNum_key" ON "Project"("projectNum");

-- CreateIndex
CREATE UNIQUE INDEX "Request_processID_key" ON "Request"("processID");

-- CreateIndex
CREATE UNIQUE INDEX "Reimbursement_processID_key" ON "Reimbursement"("processID");

-- CreateIndex
CREATE UNIQUE INDEX "Department_department_key" ON "Department"("department");
