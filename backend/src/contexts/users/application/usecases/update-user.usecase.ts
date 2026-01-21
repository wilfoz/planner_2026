import { UserOutput } from '@/contexts/users/application/dto/user.output';
import { UsersRepository } from '@/contexts/users/domain/users.repository';

export class UpdateUserUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: { id: string; name?: string | null; email?: string }): Promise<UserOutput> {
    const user = await this.users.update(input.id, { name: input.name, email: input.email });
    return {
      id: user.props.id,
      name: user.props.name ?? null,
      email: user.props.email,
      created_at: user.props.createdAt,
    };
  }
}

