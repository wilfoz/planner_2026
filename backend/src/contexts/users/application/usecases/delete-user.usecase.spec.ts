import { DeleteUserUseCase } from '@/contexts/users/application/usecases/delete-user.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';

describe('DeleteUserUseCase', () => {
  let useCase: DeleteUserUseCase;
  let mockRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      list: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      delete: jest.fn(),
    };
    useCase = new DeleteUserUseCase(mockRepository);
  });

  it('should call delete on repository', async () => {
    mockRepository.delete.mockResolvedValue(undefined);

    await useCase.execute({ id: 'user-id-123' });

    expect(mockRepository.delete).toHaveBeenCalledWith('user-id-123');
    expect(mockRepository.delete).toHaveBeenCalledTimes(1);
  });

  it('should propagate repository errors', async () => {
    const error = new Error('Database error');
    mockRepository.delete.mockRejectedValue(error);

    await expect(useCase.execute({ id: 'user-id-123' })).rejects.toThrow('Database error');
  });
});
