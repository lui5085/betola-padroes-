import { PrismaClient } from '@prisma/client';
import { LeaguesRepository, LeagueFilters, LeagueMemberDetails, UserInfo } from '@betola/core';
import { League, LeagueId, LeagueCode, UserId } from '@betola/core';

export class SimpleLeaguesRepository implements LeaguesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(league: League): Promise<void> {
    // TODO: Implement proper save logic
    console.log('Save league:', league.name);
  }

  async findById(id: LeagueId): Promise<League | null> {
    // TODO: Implement proper findById logic
    return null;
  }

  async findByCode(code: LeagueCode): Promise<League | null> {
    // TODO: Implement proper findByCode logic  
    return null;
  }

  async findByUserId(userId: UserId): Promise<League[]> {
    // Return empty array for now - this is what the mock was doing
    return [];
  }

  async findByFilters(filters: LeagueFilters): Promise<League[]> {
    // Return empty array for now
    return [];
  }

  async findMembersWithUserDetails(leagueId: LeagueId): Promise<LeagueMemberDetails[]> {
    // Return empty array for now
    return [];
  }

  async delete(id: LeagueId): Promise<void> {
    // TODO: Implement proper delete logic
    console.log('Delete league:', id.value);
  }

  async update(league: League): Promise<void> {
    await this.save(league);
  }

  async findUserByUsername(username: string): Promise<UserInfo | null> {
    // TODO: Implement proper findUserByUsername logic
    return null;
  }
}