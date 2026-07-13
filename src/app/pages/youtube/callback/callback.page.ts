import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-youtube-callback',
  standalone: true,
  template: `
    <div class="page">
      <div class="card">
        <div class="icon">{{ success() ? '✓' : '✕' }}</div>
        <h2>{{ success() ? 'YouTube Connected!' : 'Connection Failed' }}</h2>
        <p>{{ message() }}</p>
        <p class="muted">Redirecting…</p>
      </div>
    </div>
  `,
  styles: [`
    .page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
    }
    .card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      max-width: 400px;
    }
    .icon {
      width: 3.5rem; height: 3.5rem;
      border-radius: 9999px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; font-weight: 700;
    }
    .icon:first-child { background: rgba(58,170,136,0.12); color: #5dd4ae; }
    .icon + .icon { background: rgba(224,72,58,0.12); color: #e8836a; }
    h2 { margin: 0; color: var(--text); font-size: 1.2rem; }
    p { margin: 0; color: var(--text); font-size: 0.92rem; }
    .muted { color: var(--muted); font-size: 0.82rem; }
  `],
})
export class YoutubeCallbackPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  protected success = () => true;
  protected message = () => '';

  ngOnInit(): void {
    const params = this.route.snapshot.queryParams;
    const channelId = params['channelId'];
    const channelName = params['channelName'];
    const error = params['error'];

    if (error) {
      this.toast.show('YouTube authorization was denied', 'error');
      this.message = () => 'Authorization was denied. Please try again.';
      this.success = () => false;
      setTimeout(() => this.router.navigate(['/youtube/connect']), 3000);
    } else if (channelId && channelName) {
      this.toast.show(`Connected to ${channelName}`, 'success');
      this.message = () => `Successfully connected to ${channelName}`;
      setTimeout(() => this.router.navigate(['/youtube/connect']), 2000);
    } else {
      this.toast.show('Invalid callback response', 'error');
      this.message = () => 'Missing connection information.';
      this.success = () => false;
      setTimeout(() => this.router.navigate(['/youtube/connect']), 3000);
    }
  }
}
