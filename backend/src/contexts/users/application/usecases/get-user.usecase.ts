import { UserOutput } from '@/contexts/users/application/dto/user.output';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class GetUserUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: { id: string }): Promise<UserOutput> {
    const user = await this.users.findById(input.id);
    if (!user) throw new NotFoundError('User not found');
    return {
      id: user.props.id,
      name: user.props.name ?? null,
      email: user.props.email,
      created_at: user.props.createdAt,
    };
  }
}

