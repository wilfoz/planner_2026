import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { LoginRequest, AuthResponse, User } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}`;

  currentUser = signal<User | null>(null);

  constructor() {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/users/login`, credentials).pipe(
      tap(response => this.handleAuthSuccess(response))
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  private handleAuthSuccess(response: AuthResponse) {
    localStorage.setItem('token', response.accessToken);
    localStorage.setItem('user', JSON.stringify(response.user));
    this.currentUser.set(response.user);
    this.router.navigate(['/']);
  }

  private loadUserFromStorage() {
    const user = localStorage.getItem('user');
    if (user && user !== 'undefined') {
      try {
        this.currentUser.set(JSON.parse(user));
      } catch {
        // Invalid JSON, clear corrupted data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }
}
