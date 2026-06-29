import { Component, input, output } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeService } from '../../../services/theme.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar" [class.collapsed]="collapsed()">
      <div class="brand">
        <button class="burger" (click)="toggle.emit()" [attr.aria-label]="collapsed() ? 'Open sidebar' : 'Close sidebar'">
          {{ collapsed() ? '☰' : '✕' }}
        </button>
        @if (!collapsed()) {
          <div class="logo">▶</div>
          <div class="name">TubeForge</div>
        }
      </div>
      <nav class="nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="nav-item">
          <span class="icon">◫</span>
          @if (!collapsed()) { <span>Dashboard</span> }
        </a>
        <a routerLink="/video-metadata" routerLinkActive="active" class="nav-item">
          <span class="icon">🎞</span>
          @if (!collapsed()) { <span>Video Metadata</span> }
        </a>
        <a routerLink="/create" routerLinkActive="active" class="nav-item">
          <span class="icon">+</span>
          @if (!collapsed()) { <span>Create</span> }
        </a>
        <a routerLink="/generate-from-video" routerLinkActive="active" class="nav-item">
          <span class="icon">▶</span>
          @if (!collapsed()) { <span>Create from Video</span> }
        </a>
        <a routerLink="/drafts" routerLinkActive="active" class="nav-item">
          <span class="icon">📝</span>
          @if (!collapsed()) { <span>Drafts</span> }
        </a>
        <a routerLink="/content" routerLinkActive="active" class="nav-item">
          <span class="icon">📄</span>
          @if (!collapsed()) { <span>Content</span> }
        </a>
        <a routerLink="/backgrounds" routerLinkActive="active" class="nav-item">
          <span class="icon">🖼</span>
          @if (!collapsed()) { <span>Backgrounds</span> }
        </a>
        <a routerLink="/audios" routerLinkActive="active" class="nav-item">
          <span class="icon">♪</span>
          @if (!collapsed()) { <span>Audios</span> }
        </a>
        <a routerLink="/subscribe-images" routerLinkActive="active" class="nav-item">
          <span class="icon">⊞</span>
          @if (!collapsed()) { <span>Subscribe Imgs</span> }
        </a>
        <a routerLink="/channels" routerLinkActive="active" class="nav-item">
          <span class="icon">◎</span>
          @if (!collapsed()) { <span>Channels</span> }
        </a>
        <a routerLink="/settings" routerLinkActive="active" class="nav-item">
          <span class="icon">⚙</span>
          @if (!collapsed()) { <span>Settings</span> }
        </a>
      </nav>
      @if (!collapsed()) {
        <div class="footer">
          <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-pressed]="theme.dark()">
            <span class="icon">{{ theme.dark() ? '☀' : '☾' }}</span>
            <span>{{ theme.dark() ? 'Light mode' : 'Dark mode' }}</span>
          </button>
          <button class="auth-toggle" (click)="auth.logout()">
            <span class="icon">⎋</span>
            <span>Logout</span>
          </button>
          <div class="build">v0.1.0 · Angular 21</div>
        </div>
      }
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
      transition: transform 0.25s ease;
    }
    .sidebar.collapsed {
      transform: translateX(-100%);
    }
    .brand {
      height: 4.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0 1rem;
      border-bottom: 1px solid var(--border-subtle);
    }
    .burger {
      width: 2.2rem;
      height: 2.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      color: var(--text);
      font-size: 1rem;
      cursor: pointer;
      flex-shrink: 0;
      transition: background 0.15s ease;
    }
    .burger:hover { background: var(--border-subtle); }
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
      white-space: nowrap;
    }
    .nav-item:hover { background: var(--border-subtle); color: var(--text); }
    .nav-item.active {
      background: var(--accent-weak);
      color: var(--text);
      border: 1px solid var(--accent);
    }
    .icon { width: 1.2rem; text-align: center; font-family: monospace; font-size: 0.9rem; flex-shrink: 0; }
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
  collapsed = input(false);
  toggle = output<void>();

  theme: ThemeService;
  auth: AuthService;

  constructor(theme: ThemeService, private readonly router: Router, auth: AuthService) {
    this.theme = theme;
    this.auth = auth;
  }
}
