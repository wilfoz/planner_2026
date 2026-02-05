import { CanActivate, ExecutionContext, Inject, Injectable, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import {
  KEYCLOAK_INSTANCE,
  RoleGuard,
  KEYCLOAK_CONNECT_OPTIONS,
  KEYCLOAK_LOGGER,
  KEYCLOAK_MULTITENANT_SERVICE,
  KeycloakConnectConfig,
  KeycloakMultiTenantService
} from 'nest-keycloak-connect';
import KeycloakConnect from 'keycloak-connect';
import { Observable } from 'rxjs';

@Injectable()
export class DebugRoleGuard extends RoleGuard {
  private readonly debugLogger = new Logger(DebugRoleGuard.name);

  constructor(
    @Inject(KEYCLOAK_INSTANCE)
    keycloak: KeycloakConnect.Keycloak,
    @Inject(KEYCLOAK_CONNECT_OPTIONS)
    keycloakOpts: KeycloakConnectConfig,
    @Inject(KEYCLOAK_LOGGER)
    logger: Logger,
    @Inject(KEYCLOAK_MULTITENANT_SERVICE)
    multiTenant: KeycloakMultiTenantService,
    reflector: Reflector,
  ) {
    super(keycloak, keycloakOpts, logger, multiTenant, reflector);
  }

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    console.log('--- DEBUG ROLE GUARD ---');
    console.log('Request Keys:', Object.keys(request));
    console.log('Request User:', request.user);
    console.log('Request Kauth:', JSON.stringify(request.kauth || {}, null, 2)); // Careful with circular refs if any, but kauth usually safe

    if (user) {
      console.log(`User found in request: ${user.preferred_username || 'unknown'}`);
      console.log(`Roles in token: ${JSON.stringify(user.realm_access?.roles || [])}`);
    } else {
      console.warn('No user attached to request. Checking kauth...');
      if (request.kauth && request.kauth.grant && request.kauth.grant.access_token) {
        console.log('Found access_token in kauth.grant');
        const content = request.kauth.grant.access_token.content;
        console.log('Token Content:', JSON.stringify(content, null, 2));
        // Attempt to polyfill request.user for subsequent guards if missing
        request.user = content;
        console.log('POLYFILLED request.user from kauth.');
      }
    }

    try {
      const can = await super.canActivate(context);
      this.debugLogger.log(`Super RoleGuard result: ${can}`);
      return can;
    } catch (error) {
      this.debugLogger.error(`RoleGuard errored: ${error}`);
      throw error;
    }
  }
}
