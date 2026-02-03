import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EnvConfigService {
  constructor(private readonly config: ConfigService) { }

  getAppPort(): number {
    return Number(this.config.get<string>('APP_PORT') ?? 3001);
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

  getKeycloakUrl(): string {
    const value = this.config.get<string>('KEYCLOAK_URL');
    if (!value) throw new Error('Missing env KEYCLOAK_URL');
    return value;
  }

  getKeycloakRealm(): string {
    const value = this.config.get<string>('KEYCLOAK_REALM');
    if (!value) throw new Error('Missing env KEYCLOAK_REALM');
    return value;
  }

  getKeycloakClientId(): string {
    const value = this.config.get<string>('KEYCLOAK_CLIENT_ID');
    if (!value) throw new Error('Missing env KEYCLOAK_CLIENT_ID');
    return value;
  }

  getKeycloakClientSecret(): string {
    const value = this.config.get<string>('KEYCLOAK_CLIENT_SECRET');
    if (!value) throw new Error('Missing env KEYCLOAK_CLIENT_SECRET');
    return value;
  }
}

