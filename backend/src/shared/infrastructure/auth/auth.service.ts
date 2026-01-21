import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { EnvConfigService } from '@/shared/infrastructure/env-config/env-config.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly env: EnvConfigService,
  ) {}

  async generateJwt(userId: string): Promise<{ accessToken: string }> {
    const accessToken = await this.jwt.signAsync({ id: userId });
    return { accessToken };
  }

  async verifyJwt(token: string) {
    return await this.jwt.verifyAsync(token, { secret: this.env.getJwtSecret() });
  }
}

