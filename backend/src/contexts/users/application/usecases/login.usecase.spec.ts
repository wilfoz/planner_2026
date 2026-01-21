import { LoginUseCase } from '@/contexts/users/application/usecases/login.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';
import { AuthService } from '@/shared/infrastructure/auth/auth.service';
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials.error';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let mockRepository: jest.Mocked<UsersRepository>;
  let mockAuthService: jest.Mocked<AuthService>;

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
    mockAuthService = {
      generateJwt: jest.fn(),
    } as any;
    useCase = new LoginUseCase(mockRepository, mockAuthService);
    jest.clearAllMocks();
  });

  it('should return access token when credentials are valid', async () => {
    const user = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.findByEmail.mockResolvedValue(user);
    mockedBcrypt.compare.mockResolvedValue(true as never);
    mockAuthService.generateJwt.mockResolvedValue({ accessToken: 'jwt_token_here' });

    const result = await useCase.execute({
      email: 'john@example.com',
      password: 'password123',
    });

    expect(mockRepository.findByEmail).toHaveBeenCalledWith('john@example.com');
    expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashed_password');
    expect(mockAuthService.generateJwt).toHaveBeenCalledWith('user-id-123');
    expect(result.accessToken).toBe('jwt_token_here');
  });

  it('should throw InvalidCredentialsError when email not found', async () => {
    mockRepository.findByEmail.mockResolvedValue(null);

    await expect(useCase.execute({
      email: 'unknown@example.com',
      password: 'password123',
    })).rejects.toThrow(InvalidCredentialsError);
  });

  it('should throw InvalidCredentialsError when password does not match', async () => {
    const user = new User({
      id: 'user-id-123',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed_password',
      createdAt: mockDate,
    });

    mockRepository.findByEmail.mockResolvedValue(user);
    mockedBcrypt.compare.mockResolvedValue(false as never);

    await expect(useCase.execute({
      email: 'john@example.com',
      password: 'wrongpassword',
    })).rejects.toThrow(InvalidCredentialsError);
  });
});
