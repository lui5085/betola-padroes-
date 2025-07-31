/*
  Warnings:

  - A unique constraint covering the columns `[matchId,type]` on the table `Market` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Market_matchId_type_key" ON "Market"("matchId", "type");
