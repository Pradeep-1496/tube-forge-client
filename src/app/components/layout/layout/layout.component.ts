import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="layout">
      <app-sidebar [collapsed]="sidebarCollapsed()" (toggle)="toggleSidebar()" />
      @if (sidebarCollapsed()) {
        <button class="floating-burger" (click)="toggleSidebar()" aria-label="Open sidebar">☰</button>
      }
      <main class="main" [class.expanded]="sidebarCollapsed()">
        <div class="container">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--bg); color: var(--text); }
    .main { flex: 1; margin-left: 232px; min-height: 100vh; transition: margin-left 0.25s ease; }
    .main.expanded { margin-left: 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 1.8rem 2rem; }
    .floating-burger {
      position: fixed;
      top: 0.75rem;
      left: 0.75rem;
      z-index: 60;
      width: 2.4rem;
      height: 2.4rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.55rem;
      color: var(--text);
      font-size: 1.1rem;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      transition: background 0.15s ease;
    }
    .floating-burger:hover { background: var(--border-subtle); }
    @media (max-width: 860px) {
      .container { padding: 1.2rem 1rem; }
    }
  `]
})
export class LayoutComponent {
  sidebarCollapsed = signal(false);

  toggleSidebar(): void {
    this.sidebarCollapsed.update((v) => !v);
  }
}
