-- CreateTable
CREATE TABLE "Factura" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "client" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "concept" TEXT NOT NULL,
    "cuantity" REAL NOT NULL,
    "price" REAL NOT NULL,
    "total" REAL NOT NULL
);
