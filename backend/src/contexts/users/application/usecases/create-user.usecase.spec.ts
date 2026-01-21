import { CreateUserUseCase } from '@/contexts/users/application/usecases/create-user.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
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
    useCase = new CreateUserUseCase(mockRepository);
    jest.clearAllMocks();
  });

  it('should create a user with hashed password', async () => {
    const input = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

    const createdUser = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdUser);

    const result = await useCase.execute(input);

    expect(mockedBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(mockRepository.create).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
    });

    expect(result.id).toBe('user-id-123');
    expect(result.email).toBe('john@example.com');
  });

  it('should create user with null name', async () => {
    const input = {
      email: 'john@example.com',
      password: 'password123',
    };

    mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

    const createdUser = new User({
      id: 'user-id-456',
      name: null,
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.create.mockResolvedValue(createdUser);

    const result = await useCase.execute(input);

    expect(result.name).toBeNull();
  });
});
