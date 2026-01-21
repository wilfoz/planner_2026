import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';

export class DeleteTeamUseCase {
  constructor(private readonly teams: TeamsRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.teams.delete(input.id);
  }
}

