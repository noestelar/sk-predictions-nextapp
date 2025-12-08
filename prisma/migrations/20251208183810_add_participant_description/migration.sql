-- AlterTable
ALTER TABLE "public"."Participant" ADD COLUMN     "description" TEXT;

-- AlterTable
ALTER TABLE "public"."cutoff_time" ADD COLUMN     "showWinners" BOOLEAN NOT NULL DEFAULT false;
