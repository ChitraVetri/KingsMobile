-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'SALES_STAFF',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RetailProduct" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "variants" JSONB NOT NULL,
    "imei" TEXT,
    "purchasePrice" REAL NOT NULL,
    "sellingPrice" REAL NOT NULL,
    "gstRate" REAL NOT NULL DEFAULT 18,
    "quantity" INTEGER NOT NULL,
    "barcode" TEXT,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RepairPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "partNumber" TEXT,
    "compatibleModels" TEXT NOT NULL,
    "costPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "lowStockThreshold" INTEGER NOT NULL DEFAULT 5,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "RepairJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "deviceInfo" TEXT NOT NULL,
    "reportedIssue" TEXT NOT NULL,
    "technicianId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'RECEIVED',
    "laborCost" REAL NOT NULL DEFAULT 0,
    "totalCost" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RepairJob_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RepairJob_technicianId_fkey" FOREIGN KEY ("technicianId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RepairPartUsage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "repairJobId" TEXT NOT NULL,
    "repairPartId" TEXT NOT NULL,
    "quantityUsed" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RepairPartUsage_repairJobId_fkey" FOREIGN KEY ("repairJobId") REFERENCES "RepairJob" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RepairPartUsage_repairPartId_fkey" FOREIGN KEY ("repairPartId") REFERENCES "RepairPart" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Sale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalAmount" REAL NOT NULL,
    "gstAmount" REAL NOT NULL,
    "paymentMode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SaleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceAtSale" REAL NOT NULL,
    "gstAtSale" REAL NOT NULL,
    CONSTRAINT "SaleItem_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "Sale" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SaleItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "RetailProduct" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RetailProduct_imei_key" ON "RetailProduct"("imei");

-- CreateIndex
CREATE UNIQUE INDEX "RetailProduct_barcode_key" ON "RetailProduct"("barcode");

-- CreateIndex
CREATE UNIQUE INDEX "RepairPart_partNumber_key" ON "RepairPart"("partNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");
