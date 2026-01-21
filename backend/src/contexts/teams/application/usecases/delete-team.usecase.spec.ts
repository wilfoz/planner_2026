import { DeleteTeamUseCase } from '@/contexts/teams/application/usecases/delete-team.usecase';
import { TeamsRepository } from '@/contexts/teams/domain/teams.repository';

describe('DeleteTeamUseCase', () => {
  let useCase: DeleteTeamUseCase;
  let mockRepository: jest.Mocked<TeamsRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteTeamUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'team-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('team-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'team-id-123' })).rejects.toThrow('Database error');
  });
});
