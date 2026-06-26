import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private readonly router: Router) {}

  login(token: string): void {
    localStorage.setItem(this.tokenKey, token);

    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  private hasToken(): boolean {
    return typeof localStorage !== 'undefined' ? !!localStorage.getItem(this.tokenKey) : false;
  }
}
