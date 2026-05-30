-- CreateTable: order_item
CREATE TABLE "order_item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productUrl" TEXT NOT NULL,
    "productImage" TEXT,
    "productPrice" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    CONSTRAINT "order_item_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "order_item_orderId_idx" ON "order_item"("orderId");

-- Recreate order table without product columns (SQLite requires table rebuild to drop columns)
CREATE TABLE "order_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "order_new" ("id", "userId", "notes", "status", "createdAt", "updatedAt")
SELECT "id", "userId", "notes", "status", "createdAt", "updatedAt" FROM "order";

DROP TABLE "order";
ALTER TABLE "order_new" RENAME TO "order";
CREATE INDEX "order_userId_idx" ON "order"("userId");
