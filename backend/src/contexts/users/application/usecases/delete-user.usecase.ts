import { UsersRepository } from '@/contexts/users/domain/users.repository';

export class DeleteUserUseCase {
  constructor(private readonly users: UsersRepository) {}

  async execute(input: { id: string }): Promise<void> {
    await this.users.delete(input.id);
  }
}

