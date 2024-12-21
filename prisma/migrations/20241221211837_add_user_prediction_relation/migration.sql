-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_predictions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "participantIdGifter" TEXT NOT NULL,
    "participantIdGiftee" TEXT NOT NULL,
    CONSTRAINT "predictions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_predictions" ("id", "participantIdGiftee", "participantIdGifter", "userId") SELECT "id", "participantIdGiftee", "participantIdGifter", "userId" FROM "predictions";
DROP TABLE "predictions";
ALTER TABLE "new_predictions" RENAME TO "predictions";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
