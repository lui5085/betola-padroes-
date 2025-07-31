-- CreateTable
CREATE TABLE "LeagueInvite" (
    "id" TEXT NOT NULL,
    "leagueId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "invitedUserId" TEXT,
    "invitedEmail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "respondedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeagueInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeagueInvite_leagueId_status_idx" ON "LeagueInvite"("leagueId", "status");

-- CreateIndex
CREATE INDEX "LeagueInvite_invitedUserId_status_idx" ON "LeagueInvite"("invitedUserId", "status");

-- CreateIndex
CREATE INDEX "LeagueInvite_invitedEmail_status_idx" ON "LeagueInvite"("invitedEmail", "status");

-- AddForeignKey
ALTER TABLE "LeagueInvite" ADD CONSTRAINT "LeagueInvite_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueInvite" ADD CONSTRAINT "LeagueInvite_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueInvite" ADD CONSTRAINT "LeagueInvite_invitedUserId_fkey" FOREIGN KEY ("invitedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
