-- AlterTable
ALTER TABLE "UserGame" ADD COLUMN     "achievementTotal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "achievementUnlocked" INTEGER NOT NULL DEFAULT 0;
