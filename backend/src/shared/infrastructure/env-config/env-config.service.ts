import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
  constructor(private readonly config: ConfigService) {}

  getAppPort(): number {
    return Number(this.config.get<string>('APP_PORT') ?? 3000);
  }

  getNodeEnv(): string {
    return this.config.get<string>('NODE_ENV') ?? 'development';
  }

  getJwtSecret(): string {
    const value = this.config.get<string>('JWT_SECRET');
    if (!value) throw new Error('Missing env JWT_SECRET');
    return value;
  }

  getJwtExpiresInSeconds(): number {
    const value = this.config.get<string>('JWT_EXPIRES_IN_SECONDS');
    const seconds = Number(value ?? 3600);
    if (!Number.isFinite(seconds) || seconds <= 0) {
      throw new Error('Invalid env JWT_EXPIRES_IN_SECONDS');
    }
    return seconds;
  }
}

