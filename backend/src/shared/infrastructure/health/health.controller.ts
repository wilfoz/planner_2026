import { Controller, Get } from '@nestjs/common';
import { Public, Unprotected } from 'nest-keycloak-connect';

@Controller('health')
export class HealthController {
  @Get()
  @Public()
  @Unprotected()
  check() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
