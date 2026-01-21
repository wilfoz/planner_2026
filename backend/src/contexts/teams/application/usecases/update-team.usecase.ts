import { TeamOutput } from '@/contexts/teams/application/dto/team.output';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';

export class UpdateTeamUseCase {
  constructor(private readonly teams: TeamsRepository) {}

  async execute(input: {
    id: string;
    name?: string;
    employees?: string[];
    equipments?: string[];
  }): Promise<TeamOutput> {
    const updated = await this.teams.update(input.id, input);
    return {
      id: updated.props.id,
      name: updated.props.name,
      employees: updated.props.employees,
      equipments: updated.props.equipments,
      created_at: updated.props.createdAt,
    };
  }
}

