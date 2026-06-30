import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private readonly router: Router) {}

  login(
    token: string,
    user: { id: string; name?: string; email: string } = { id: '', email: '' },
  ): void {
    if (!user.id) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        user = {
          id: payload.sub || '',
          name: payload.name || user.name,
          email: payload.email || user.email,
        };
      } catch {
        // keep provided user
      }
    }
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.isAuthenticated.set(true);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    return localStorage.getItem(this.tokenKey);
  }

  getCurrentUser(): { id: string; name?: string; email: string } | null {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(this.userKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as { id: string; name?: string; email: string };
    } catch {
      return null;
    }
  }

  private hasToken(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return false;
    return !!localStorage.getItem(this.tokenKey);
  }
}
