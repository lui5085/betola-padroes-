/*
  Warnings:

  - You are about to drop the column `createdById` on the `League` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `LeagueMember` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `League` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `LeagueMember` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "LeagueMember" DROP CONSTRAINT "LeagueMember_leagueId_fkey";

-- AlterTable
ALTER TABLE "League" DROP COLUMN "createdById",
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "maxMembers" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "settings" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "LeagueMember" DROP COLUMN "score",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lostBets" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "position" INTEGER,
ADD COLUMN     "totalPoints" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "wonBets" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "favoriteTeam" TEXT;

-- CreateTable
CREATE TABLE "LeagueMessage" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEXT',
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeagueMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueMessage_leagueId_createdAt_idx" ON "LeagueMessage"("leagueId", "createdAt");

-- AddForeignKey
ALTER TABLE "League" ADD CONSTRAINT "League_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMessage" ADD CONSTRAINT "LeagueMessage_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMessage" ADD CONSTRAINT "LeagueMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMessage" ADD CONSTRAINT "LeagueMessage_leagueId_userId_fkey" FOREIGN KEY ("leagueId", "userId") REFERENCES "LeagueMember"("leagueId", "userId") ON DELETE RESTRICT ON UPDATE CASCADE;
