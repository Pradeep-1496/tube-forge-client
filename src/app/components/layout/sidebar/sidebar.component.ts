import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="logo">▶</div>
        <div class="name">TubeForge</div>
      </div>
      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <span class="icon">◫</span>
          <span>Dashboard</span>
        </a>
        <a routerLink="/videos" routerLinkActive="active" class="nav-item">
          <span class="icon">▣</span>
          <span>Videos</span>
        </a>
        <a routerLink="/create" routerLinkActive="active" class="nav-item">
          <span class="icon">+</span>
          <span>Create</span>
        </a>
        <a routerLink="/channels" routerLinkActive="active" class="nav-item">
          <span class="icon">◎</span>
          <span>Channels</span>
        </a>
        <a routerLink="/assets" routerLinkActive="active" class="nav-item">
          <span class="icon">▦</span>
          <span>Assets</span>
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="icon">⚙</span>
          <span>Settings</span>
        </a>
      </nav>
      <div class="footer">
        <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-pressed]="theme.dark()">
          <span class="icon">{{ theme.dark() ? '☀' : '☾' }}</span>
          <span>{{ theme.dark() ? 'Light mode' : 'Dark mode' }}</span>
        </button>
        <button class="auth-toggle" (click)="logout()">
          <span class="icon">⎋</span>
          <span>Logout</span>
        </button>
        <div class="build">v0.1.0 · Angular 21</div>
      </div>
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 232px;
      height: 100vh;
      background: var(--surface);
      border-right: 1px solid var(--border-subtle);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      z-index: 50;
    }
    .brand {
      height: 4.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1.4rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .logo {
      width: 2rem; height: 2rem;
      background: linear-gradient(135deg, #6366f1, #a855f7);
      border-radius: 0.6rem;
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 0.75rem;
    }
    .name { color: var(--text); font-weight: 700; font-size: 1.05rem; letter-spacing: -0.01em; }
    .nav { flex: 1; padding: 1rem 0.8rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .nav-item {
      display: flex; align-items: center; gap: 0.7rem;
      padding: 0.6rem 0.8rem;
      border-radius: 0.55rem;
      color: var(--muted);
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: all 0.15s ease;
    }
    .nav-item:hover { background: var(--border-subtle); color: var(--text); }
    .nav-item.active {
      background: var(--accent-weak);
      color: var(--text);
      border: 1px solid var(--accent);
    }
    .icon { width: 1.2rem; text-align: center; font-family: monospace; font-size: 0.9rem; }
    .footer { padding: 1rem 1.4rem; border-top: 1px solid var(--border-subtle); display: flex; flex-direction: column; gap: 0.4rem; }
    .theme-toggle {
      display: flex; align-items: center; gap: 0.6rem;
      background: transparent; border: 1px solid var(--border); color: var(--muted);
      padding: 0.45rem 0.7rem; border-radius: 0.55rem; font-size: 0.8rem; cursor: pointer;
      transition: all 0.15s ease;
    }
    .theme-toggle:hover { background: var(--border-subtle); color: var(--text); }
    .theme-toggle .icon { font-family: system-ui; font-size: 1rem; }
    .auth-toggle {
      display: flex; align-items: center; gap: 0.6rem;
      background: transparent; border: 1px solid var(--border); color: var(--muted);
      padding: 0.45rem 0.7rem; border-radius: 0.55rem; font-size: 0.8rem; cursor: pointer;
      transition: all 0.15s ease;
    }
    .auth-toggle:hover { background: rgba(239,68,68,0.15); color: var(--danger); }
    .auth-toggle .icon { font-family: system-ui; font-size: 1rem; }
    .build { font-size: 0.7rem; color: var(--muted); font-family: monospace; }
  `]
})
export class SidebarComponent {
  theme: ThemeService;
  constructor(theme: ThemeService, private readonly router: Router) {
    this.theme = theme;
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
