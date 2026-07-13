import { Component, inject } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-connect-youtube-button',
  standalone: true,
  template: `
    <button class="btn primary" [disabled]="loading()" (click)="connect()">
      @if (loading()) {
        Connecting…
      } @else {
        Connect YouTube Channel
      }
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.2rem; border-radius: 0.55rem;
      font-size: 0.88rem; font-weight: 600;
      border: none; cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn.primary {
      background: #c7362a; color: #fff;
    }
    .btn.primary:hover:not(:disabled) {
      background: #d94a3a;
    }
    .btn:disabled {
      opacity: 0.6; cursor: not-allowed;
    }
  `],
})
export class ConnectYoutubeButtonComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);
  protected loading = this.api.loading;

  connect(): void {
    this.loading.set(true);
    this.api.getYouTubeAuthUrl().subscribe({
      next: (r) => {
        window.location.href = r.url;
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 401) {
          this.toast.show('Please login first', 'error');
          this.router.navigate(['/login']);
        } else {
          this.toast.show('Failed to connect YouTube', 'error');
        }
      },
    });
  }
}
