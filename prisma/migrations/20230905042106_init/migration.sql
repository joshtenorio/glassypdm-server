-- CreateTable
CREATE TABLE "File" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "path" TEXT NOT NULL,
    "revision" INTEGER NOT NULL,
    "s3Link" TEXT NOT NULL
);
