import { UpdateUserPasswordUseCase } from '@/contexts/users/application/usecases/update-user-password.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';
import { NotFoundError } from '@/shared/errors/not-found.error';
import { InvalidPasswordError } from '@/shared/errors/invalid-password.error';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('UpdateUserPasswordUseCase', () => {
  let useCase: UpdateUserPasswordUseCase;
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
    useCase = new UpdateUserPasswordUseCase(mockRepository);
    jest.clearAllMocks();
  });

  it('should update password when old password matches', async () => {
    const existingUser = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'old_hashed_password',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(existingUser);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockedBcrypt.hash.mockResolvedValue('new_hashed_password' as never);

    const updatedUser = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'new_hashed_password',
      createdAt: mockDate,
    });

    mockRepository.updatePassword.mockResolvedValue(updatedUser);

    const result = await useCase.execute({
      id: 'user-id-123',
      old_password: 'oldpassword',
      password: 'newpassword',
    });

    expect(mockedBcrypt.compare).toHaveBeenCalledWith('oldpassword', 'old_hashed_password');
    expect(mockedBcrypt.hash).toHaveBeenCalledWith('newpassword', 10);
    expect(mockRepository.updatePassword).toHaveBeenCalledWith('user-id-123', {
      password: 'new_hashed_password',
    });
    expect(result.id).toBe('user-id-123');
  });

  it('should throw InvalidPasswordError when old password does not match', async () => {
    const existingUser = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'old_hashed_password',
      createdAt: mockDate,
    });

    mockRepository.findById.mockResolvedValue(existingUser);
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(useCase.execute({
      id: 'user-id-123',
      old_password: 'wrongpassword',
      password: 'newpassword',
    })).rejects.toThrow(InvalidPasswordError);
  });

  it('should throw NotFoundError when user not found', async () => {
    mockRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      id: 'non-existent-id',
      old_password: 'oldpassword',
      password: 'newpassword',
    })).rejects.toThrow(NotFoundError);
  });
});
