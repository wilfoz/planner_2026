import * as bcrypt from 'bcryptjs';

import { UserOutput } from '@/contexts/users/application/dto/user.output';
import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { InvalidPasswordError } from '@/shared/errors/invalid-password.error';
import { NotFoundError } from '@/shared/errors/not-found.error';

export class UpdateUserPasswordUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: { id: string; old_password: string; password: string }): Promise<UserOutput> {
    const current = await this.users.findById(input.id);
    if (!current) throw new NotFoundError('User not found');

    const ok = await bcrypt.compare(input.old_password, current.props.password);
    if (!ok) throw new InvalidPasswordError();

    const hashed = await bcrypt.hash(input.password, 10);
    const user = await this.users.updatePassword(input.id, { password: hashed });

    return {
      id: user.props.id,
      name: user.props.name ?? null,
      email: user.props.email,
      created_at: user.props.createdAt,
    };
  }
}

