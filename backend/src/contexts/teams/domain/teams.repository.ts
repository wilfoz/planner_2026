import { Team } from '@/contexts/teams/domain/team.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type TeamsListResult = { total: number; items: Team[] };

export interface TeamsRepository {
  create(input: { name: string; employees?: string[]; equipments?: string[] }): Promise<Team>;
  findById(id: string): Promise<Team | null>;
  list(input: PageInput): Promise<TeamsListResult>;
  update(id: string, input: { name?: string; employees?: string[]; equipments?: string[] }): Promise<Team>;
  delete(id: string): Promise<void>;
}

export const TEAMS_REPOSITORY = Symbol('TEAMS_REPOSITORY');

