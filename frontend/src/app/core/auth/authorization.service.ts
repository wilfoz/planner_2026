import { Injectable, computed, signal } from '@angular/core';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  private _userProfile = signal<any>(null);

  constructor(private readonly keycloak: KeycloakService) {
    this.loadUserProfile();
  }

  private async loadUserProfile() {
    if (await this.keycloak.isLoggedIn()) {
      const profile = await this.keycloak.loadUserProfile();
      this._userProfile.set(profile);
    }
  }

  get userProfile() {
    return this._userProfile.asReadonly();
  }

  get username(): string {
    return this.keycloak.getUsername();
  }

  logout() {
    this.keycloak.logout();
  }

  hasRole(role: string): boolean {
    return this.keycloak.isUserInRole(role);
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.keycloak.isUserInRole(role));
  }

  get assignedWorks(): string[] {
    // Improve type safety if possible
    const tokenParsed = this.keycloak.getKeycloakInstance().tokenParsed as any;
    const works = tokenParsed?.assigned_works;

    if (Array.isArray(works)) {
      return works;
    } else if (typeof works === 'string') {
      return [works];
    }
    return [];
  }
}
