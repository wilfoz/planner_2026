import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { LucideAngularModule, Lock, Mail, Loader2, HardHat, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './login.component.html',
  styles: ``
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly LockIcon = Lock;
  readonly MailIcon = Mail;
  readonly LoaderIcon = Loader2;
  readonly HardHatIcon = HardHat;
  readonly AlertCircleIcon = AlertCircle;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    this.authService.login({ email: email!, password: password! }).subscribe({
      next: () => {
        // Redirection handled in service
      },
      error: (err) => {
        console.error('Login failed', err);
        this.errorMessage.set('Invalid email or password');
        this.isLoading.set(false);
      }
    });
  }
}
