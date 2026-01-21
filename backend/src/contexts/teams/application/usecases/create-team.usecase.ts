import { TeamOutput } from '@/contexts/teams/application/dto/team.output';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';

export class CreateTeamUseCase {
  constructor(private readonly teams: TeamsRepository) {}

  async execute(input: { name: string; employees?: string[]; equipments?: string[] }): Promise<TeamOutput> {
    const created = await this.teams.create(input);
    return {
      id: created.props.id,
      name: created.props.name,
      employees: created.props.employees,
      equipments: created.props.equipments,
      created_at: created.props.createdAt,
    };
  }
}

