import { TeamOutput } from '@/contexts/teams/application/dto/team.output';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetTeamUseCase {
  constructor(private readonly teams: TeamsRepository) {}

  async execute(input: { id: string }): Promise<TeamOutput> {
    const team = await this.teams.findById(input.id);
    if (!team) throw new NotFoundError('Team not found');

    return {
      id: team.props.id,
      name: team.props.name,
      employees: team.props.employees,
      equipments: team.props.equipments,
      created_at: team.props.createdAt,
    };
  }
}

