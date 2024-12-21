/*
  Warnings:

  - You are about to drop the `cutoff_times` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "cutoff_times";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "cutoff_time" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "datetime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
