import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { KeycloakBearerInterceptor, KeycloakService } from 'keycloak-angular';

import { routes } from './app.routes';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { environment } from './environments/environment.development';

function initializeKeycloak(keycloak: KeycloakService) {
  return () =>
    keycloak.init({
      config: {
        url: environment.keycloak.url,
        realm: environment.keycloak.realm,
        clientId: environment.keycloak.clientId
      },
      initOptions: {
        onLoad: 'check-sso',
        silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html'
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets']
    });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    // Use withInterceptorsFromDi to support Class-based interceptors like KeycloakBearerInterceptor
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor]), withInterceptorsFromDi()),
    KeycloakService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakService]
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakBearerInterceptor,
      multi: true
    },
    // Register functional interceptors if needed, but KeycloakBearerInterceptor is class-based.
    // If errorInterceptor is functional, we might need to mix them or wrap it.
    // However, withInterceptorsFromDi() is needed for KeycloakBearerInterceptor.
    // We can register functional interceptors separately if we use withInterceptors(), 
    // but mixing them can be tricky in some Angular versions.
    // Best to stick to one style if possible, or assume Class-based for Keycloak is required.
    // We can rewrite errorInterceptor as Class or use a wrapper?
    // Actually, provideHttpClient can take both withInterceptors and withInterceptorsFromDi.
  ]
};
