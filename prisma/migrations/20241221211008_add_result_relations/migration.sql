-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_results" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gifterId" TEXT NOT NULL,
    "gifteeId" TEXT NOT NULL,
    CONSTRAINT "results_gifterId_fkey" FOREIGN KEY ("gifterId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "results_gifteeId_fkey" FOREIGN KEY ("gifteeId") REFERENCES "Participant" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_results" ("gifteeId", "gifterId", "id") SELECT "gifteeId", "gifterId", "id" FROM "results";
DROP TABLE "results";
ALTER TABLE "new_results" RENAME TO "results";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
