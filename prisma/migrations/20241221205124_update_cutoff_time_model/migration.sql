/*
  Warnings:

  - The primary key for the `cutoff_time` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `cutoff_time` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_cutoff_time" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "datetime" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_cutoff_time" ("createdAt", "datetime", "id", "updatedAt") SELECT "createdAt", "datetime", "id", "updatedAt" FROM "cutoff_time";
DROP TABLE "cutoff_time";
ALTER TABLE "new_cutoff_time" RENAME TO "cutoff_time";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
