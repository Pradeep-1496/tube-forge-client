import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService, RegisterRequest, RegisterResponse } from '../../../services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="calibration-bar"></div>
      <div class="auth-card">
        <header class="auth-header">
          <div class="logo">TF</div>
          <h1>Create account</h1>
          <p>Start building with TubeForge</p>
        </header>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" type="text" formControlName="name" placeholder="Your name" />
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input id="email" type="email" formControlName="email" placeholder="you@example.com" required />
          </div>
          <div class="field">
            <label for="password">Password</label>
            <input id="password" type="password" formControlName="password" placeholder="••••••••" required />
          </div>
          <div class="error" *ngIf="error()">{{ error() }}</div>
          <button type="submit" class="btn primary full" [disabled]="form.invalid || submitting()">
            {{ submitting() ? 'Creating…' : 'Create account' }}
          </button>
        </form>

        <p class="alt">
          Already have an account? <a routerLink="/login">Sign in</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: var(--bg);
      padding: 2rem;
    }
    .calibration-bar {
      position: fixed;
      top: 0;
      left: 0;
      height: 3px;
      width: 100%;
      background: linear-gradient(90deg, var(--accent), #d4a030, var(--accent), #d4a030, var(--accent));
      background-size: 200% 100%;
      opacity: 0.9;
      z-index: 10;
    }
    .auth-card {
      width: 100%;
      max-width: 420px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      padding: 2.5rem 2rem;
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      position: relative;
    }
    .auth-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      text-align: center;
    }
    .logo {
      width: 2.8rem;
      height: 2.8rem;
      background: linear-gradient(135deg, #e8b84b, #d4a030);
      border-radius: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #09090b;
      font-weight: 700;
      font-size: 0.8rem;
      font-family: 'JetBrains Mono', monospace;
      letter-spacing: 0.02em;
    }
    .auth-header h1 {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text);
      font-family: 'Space Grotesk', system-ui, sans-serif;
      letter-spacing: -0.02em;
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
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.65rem 0.9rem;
      border-radius: 0.55rem;
      font-size: 0.92rem;
      width: 100%;
      font-family: inherit;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
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
      font-family: 'Inter', system-ui, sans-serif;
    }
    .btn.primary {
      background: var(--accent);
      color: #09090b;
      border-color: var(--accent);
      font-weight: 600;
    }
    .btn.primary:hover:not(:disabled) {
      background: #f0c55a;
      border-color: #f0c55a;
    }
    .btn:disabled {
      opacity: 0.5;
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
  `]
})
export class RegisterComponent {
  form: ReturnType<typeof this.fb.group>;
  submitting = signal(false);
  error = signal<string | null>(null);

  constructor(private readonly fb: FormBuilder, private readonly api: ApiService, private readonly router: Router) {
    this.form = this.fb.group({
      name: [''],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    this.error.set(null);
    const { name, email, password } = this.form.getRawValue();
    const payload: RegisterRequest = { email, password };
    if (name) payload.name = name;
    this.api.register(payload).subscribe({
      next: (res: RegisterResponse) => {
        this.router.navigate(['/login']);
      },
      error: (err: { error?: { message?: string } }) => {
        this.error.set(err?.error?.message ?? 'Registration failed. Please try again.');
        this.submitting.set(false);
      }
    });
  }
}