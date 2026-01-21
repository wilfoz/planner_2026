import * as bcrypt from 'bcryptjs';

import { UserOutput } from '@/contexts/users/application/dto/user.output';
import { UsersRepository } from '@/contexts/users/domain/users.repository';

export class CreateUserUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: { name?: string | null; email: string; password: string }): Promise<UserOutput> {
    const hashed = await bcrypt.hash(input.password, 10);
    const user = await this.users.create({ name: input.name ?? null, email: input.email, password: hashed });
    return {
      id: user.props.id,
      name: user.props.name ?? null,
      email: user.props.email,
      created_at: user.props.createdAt,
    };
  }
}

