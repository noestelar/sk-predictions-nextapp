-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "predictions_userId_participantIdGifter_participantIdGiftee_key" ON "public"."predictions"("userId", "participantIdGifter", "participantIdGiftee");
