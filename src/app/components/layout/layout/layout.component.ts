import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main">
        <div class="container">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; background: var(--bg); color: var(--text); }
    .main { flex: 1; margin-left: 232px; min-height: 100vh; }
    .container { max-width: 1200px; margin: 0 auto; padding: 1.8rem 2rem; }
    @media (max-width: 860px) {
      .container { padding: 1.2rem 1rem; }
    }
  `]
})
export class LayoutComponent {}
