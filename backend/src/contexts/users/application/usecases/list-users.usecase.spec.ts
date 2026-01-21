import { ListUsersUseCase } from '@/contexts/users/application/usecases/list-users.usecase';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { User } from '@/contexts/users/domain/user.entity';

describe('ListUsersUseCase', () => {
  let useCase: ListUsersUseCase;
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
    useCase = new ListUsersUseCase(mockRepository);
  });

  it('should return paginated users with meta', async () => {
    const users = [
      new User({
        id: 'user-1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'hash1',
        createdAt: mockDate,
      }),
      new User({
        id: 'user-2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'hash2',
        createdAt: mockDate,
      }),
    ];

    mockRepository.list.mockResolvedValue({ total: 2, items: users });

    const result = await useCase.execute({ page: 1, per_page: 10 });

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });

    expect(result.meta.page).toBe(1);
    expect(result.meta.total).toBe(2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0]!.email).toBe('john@example.com');
    expect(result.data[1]!.email).toBe('jane@example.com');
  });

  it('should use default pagination values', async () => {
    mockRepository.list.mockResolvedValue({ total: 0, items: [] });

    await useCase.execute({});

    expect(mockRepository.list).toHaveBeenCalledWith({
      page: 1,
      per_page: 10,
      sort: undefined,
      sort_dir: 'desc',
      filter: undefined,
    });
  });
});
