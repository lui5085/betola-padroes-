import { Team } from '../entities/team';
import { TeamId } from '../value-objects/team-id';

export interface TeamsRepository {
  save(team: Team): Promise<void>;
  findById(id: TeamId): Promise<Team | null>;
  findByExternalId(externalId: string): Promise<Team | null>;
  findByName(name: string): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  delete(id: TeamId): Promise<void>;
}