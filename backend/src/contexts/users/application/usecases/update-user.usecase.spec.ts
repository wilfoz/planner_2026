import { UpdateUserUseCase } from '@/contexts/users/application/usecases/update-user.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;
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
    useCase = new UpdateUserUseCase(mockRepository);
  });

  it('should update user with provided fields', async () => {
    const input = {
      id: 'user-id-123',
      name: 'John Updated',
      email: 'john.updated@example.com',
    };

    const updatedUser = new User({
      id: 'user-id-123',
      name: 'John Updated',
      email: 'john.updated@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('user-id-123', {
      name: 'John Updated',
      email: 'john.updated@example.com',
    });

    expect(result.name).toBe('John Updated');
    expect(result.email).toBe('john.updated@example.com');
  });

  it('should only update fields that are provided', async () => {
    const input = {
      id: 'user-id-123',
      name: 'New Name',
    };

    const updatedUser = new User({
      id: 'user-id-123',
      name: 'New Name',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.update.mockResolvedValue(updatedUser);

    const result = await useCase.execute(input);

    expect(mockRepository.update).toHaveBeenCalledWith('user-id-123', {
      name: 'New Name',
    });

    expect(result.name).toBe('New Name');
  });
});
