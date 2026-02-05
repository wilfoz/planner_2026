import { Injectable, signal, inject } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';
import { User } from '../models/auth.models';
// import { from } from 'rxjs'; // If needed for observables

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private keycloak = inject(KeycloakService);

  // Signal to hold current user profile, matching original API structure where possible
  currentUser = signal<User | null>(null);

  constructor() {
    this.initUser();
  }

  private async initUser() {
    try {
      if (await this.keycloak.isLoggedIn()) {
        // Get user info from token instead of calling /account endpoint (avoids CORS issues)
        const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed as Record<string, any>;
        if (tokenParsed) {
          const user: User = {
            id: tokenParsed['sub'] || '',
            email: tokenParsed['email'] || '',
            name: tokenParsed['name'] || tokenParsed['preferred_username'] || '',
            role: this.getHighestRole(),
          };
          this.currentUser.set(user);
        }
      }
    } catch (error) {
      console.error('Failed to load user from token', error);
    }
  }

  login() {
    return this.keycloak.login({
      redirectUri: window.location.origin
    });
  }

  logout() {
    return this.keycloak.logout();
  }

  async getToken(): Promise<string> {
    return this.keycloak.getToken();
  }

  isAuthenticated(): boolean {
    return this.keycloak.isLoggedIn();
  }

  // --- RBAC Helpers ---

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.keycloak.isUserInRole(role));
  }

  get assignedWorks(): string[] {
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed as any;
    const works = tokenParsed?.assigned_works;

    if (Array.isArray(works)) {
      return works;
    } else if (typeof works === 'string') {
      return [works];
    }
    return [];
  }

  private getHighestRole(): 'ADMIN' | 'MANAGER' | 'USER' {
    if (this.hasRole('ADMIN')) return 'ADMIN';
    if (this.hasRole('MANAGER')) return 'MANAGER';
    return 'USER';
  }
}
