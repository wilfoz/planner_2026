import { GetUserUseCase } from '@/contexts/users/application/usecases/get-user.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';

describe('GetUserUseCase', () => {
  let useCase: GetUserUseCase;
  let mockRepository: jest.Mocked<UsersRepository>;

  const mockDate = new Date('2026-01-20T12:00:00Z');

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
    useCase = new GetUserUseCase(mockRepository);
  });

  it('should return user when found', async () => {
    const user = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute({ id: 'user-id-123' });

    expect(mockRepository.findById).toHaveBeenCalledWith('user-id-123');
    expect(result.id).toBe('user-id-123');
    expect(result.email).toBe('john@example.com');
  });

  it('should throw NotFoundError when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow(NotFoundError);
    await expect(useCase.execute({ id: 'non-existent-id' })).rejects.toThrow('User not found');
  });
});
