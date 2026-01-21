import { User } from '@/contexts/users/domain/user.entity';
import { PageInput } from '@/shared/pagination/pagination';

export type UsersListResult = { total: number; items: User[] };

export interface UsersRepository {
  create(input: { name?: string | null; email: string; password: string }): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  list(input: PageInput): Promise<UsersListResult>;
  update(id: string, input: { name?: string | null; email?: string }): Promise<User>;
  updatePassword(id: string, input: { password: string }): Promise<User>;
  delete(id: string): Promise<void>;
}

export const USERS_REPOSITORY = Symbol('USERS_REPOSITORY');

