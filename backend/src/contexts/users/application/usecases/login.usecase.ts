import * as bcrypt from 'bcryptjs';

import { UsersRepository } from '@/contexts/users/domain/users.repository';
import { InvalidCredentialsError } from '@/shared/errors/invalid-credentials.error';
import { AuthService } from '@/shared/infrastructure/auth/auth.service';

import { UserPresenter } from '@/contexts/users/infrastructure/presenters/user.presenter';

export class LoginUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly auth: AuthService,
  ) { }

  async execute(input: { email: string; password: string }) {
    const user = await this.users.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const ok = await bcrypt.compare(input.password, user.props.password);
    if (!ok) throw new InvalidCredentialsError();

    const token = await this.auth.generateJwt(user.props.id);

    return {
      accessToken: token.accessToken,
      user: new UserPresenter({
        id: user.props.id,
        name: user.props.name,
        email: user.props.email,
        created_at: user.props.createdAt,
      }),
    };
  }
}

