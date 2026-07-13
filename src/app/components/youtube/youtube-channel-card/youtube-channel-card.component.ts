import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YouTubeChannel } from '../../../services/api.service';

@Component({
  selector: 'app-youtube-channel-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="channel-card">
      <div class="card-top">
        <div class="channel-name">{{ channel().name }}</div>
        <span class="status on">Connected</span>
      </div>
      <div class="specs">
        <span>Channel ID: <b>{{ channel().channelId || '—' }}</b></span>
        @if (channel().createdAt) {
          <span>Connected: <b>{{ channel().createdAt | date: 'mediumDate' }}</b></span>
        }
      </div>
      <div class="actions">
        <button class="btn sm ghost danger" (click)="disconnect.emit(channel().id)">Disconnect</button>
      </div>
    </article>
  `,
  styles: [`
    :host { display: contents; }
    .channel-card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1.2rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .channel-name {
      font-weight: 600; color: var(--text); font-size: 1rem;
    }
    .status {
      padding: 0.25rem 0.7rem;
      border-radius: 9999px;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .status.on {
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }
    .specs {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
      font-size: 0.82rem;
      color: var(--muted);
    }
    .actions {
      display: flex;
      gap: 0.5rem;
      padding-top: 0.25rem;
    }
    .btn {
      display: inline-flex; align-items: center; gap: 0.4rem;
      padding: 0.45rem 0.85rem; border-radius: 0.5rem;
      font-size: 0.8rem; font-weight: 600;
      border: 1px solid var(--border);
      background: transparent; color: var(--text);
      cursor: pointer; transition: all 0.15s ease;
    }
    .btn.sm { padding: 0.35rem 0.7rem; font-size: 0.75rem; }
    .btn.ghost { border-color: transparent; }
    .btn.danger { color: #e8836a; }
    .btn.danger:hover { background: rgba(224,72,58,0.12); }
  `],
})
export class YoutubeChannelCardComponent {
  channel = input.required<YouTubeChannel>();
  disconnect = output<string>();
}
