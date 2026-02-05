import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, LogIn, HardHat } from 'lucide-angular';

@Component({
  selector: 'app-login',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {
  private authService = inject(AuthService);
  private keycloak = inject(KeycloakService);
  private router = inject(Router);

  readonly LogInIcon = LogIn;
  readonly HardHatIcon = HardHat;

  async ngOnInit() {
    // If user is already authenticated (e.g., after Keycloak callback), redirect to dashboard
    if (await this.keycloak.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  login() {
    this.authService.login();
  }
}
