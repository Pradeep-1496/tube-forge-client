import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, LoginRequest, LoginResponse } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <header class="auth-header">
          <div class="logo">▶</div>
          <h1>Welcome back</h1>
          <p>Sign in to TubeForge</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              placeholder="••••••••"
              required
            />
          </div>
          <div class="error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" class="btn primary full" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="alt">Don't have an account? <a routerLink="/register">Create one</a></p>
      </div>
    </div>
  `,
  styles: [
    `
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--bg);
        padding: 2rem;
      }
      .auth-card {
        width: 100%;
        max-width: 420px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 1rem;
        padding: 2.2rem 2rem;
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
      }
      .auth-header {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        text-align: center;
      }
      .logo {
        width: 2.5rem;
        height: 2.5rem;
        background: linear-gradient(135deg, #6366f1, #a855f7);
        border-radius: 0.65rem;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-weight: 700;
        font-size: 0.85rem;
      }
      .auth-header h1 {
        margin: 0;
        font-size: 1.4rem;
        font-weight: 700;
        color: var(--text);
      }
      .auth-header p {
        margin: 0;
        font-size: 0.88rem;
        color: var(--muted);
      }
      .auth-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      label {
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 500;
      }
      input {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.65rem 0.9rem;
        border-radius: 0.55rem;
        font-size: 0.92rem;
        width: 100%;
        font-family: inherit;
      }
      input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-weak);
      }
      .error {
        color: var(--danger);
        font-size: 0.82rem;
        text-align: center;
      }
      .btn {
        padding: 0.65rem 1.2rem;
        border-radius: 0.55rem;
        font-weight: 600;
        font-size: 0.92rem;
        border: 1px solid transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 0.4rem;
        transition: all 0.15s ease;
      }
      .btn.primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
      .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .full {
        width: 100%;
      }
      .alt {
        text-align: center;
        font-size: 0.85rem;
        color: var(--muted);
        margin: 0;
      }
      .alt a {
        color: var(--accent);
        font-weight: 600;
        text-decoration: none;
      }
      .alt a:hover {
        text-decoration: underline;
      }
    `,
  ],
})
export class LoginComponent {
  form: ReturnType<typeof this.fb.group>;
  submitting = signal(false);
  error = signal<string | null>(null);

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: ApiService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.api.login({ email, password }).subscribe({
      next: (res: LoginResponse) => {
        this.auth.login(res.access_token);

        if (res.access_token) this.router.navigate(['/dashboard']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Login failed. Please try again.');
        this.submitting.set(false);
      },
    });
  }
}
