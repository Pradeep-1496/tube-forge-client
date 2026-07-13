import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, YouTubeChannel } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';
import { ConnectYoutubeButtonComponent } from '../../../components/youtube/connect-youtube-button/connect-youtube-button.component';
import { YoutubeChannelCardComponent } from '../../../components/youtube/youtube-channel-card/youtube-channel-card.component';

@Component({
  selector: 'app-youtube-connect',
  standalone: true,
  imports: [CommonModule, ConnectYoutubeButtonComponent, YoutubeChannelCardComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>YouTube Connect</h1>
          <p>Link your YouTube channel to publish videos directly.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading">Loading channels…</div>
      } @else {
        @if (channels().length === 0) {
          <section class="connect-card">
            <div class="connect-icon">▶</div>
            <h3>No YouTube channel connected</h3>
            <p>Connect your YouTube channel to upload and publish videos directly from TubeForge.</p>
            <app-connect-youtube-button />
          </section>
        } @else {
          <section>
            <div class="section-header">
              <h3>Connected Channels</h3>
              <app-connect-youtube-button />
            </div>
            <div class="channel-grid">
              @for (ch of channels(); track ch.id) {
                <app-youtube-channel-card
                  [channel]="ch"
                  (disconnect)="disconnect($event)"
                />
              }
            </div>
          </section>
        }
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .loading { color: var(--muted); padding: 2rem 0; text-align: center; }
    .connect-card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .connect-icon {
      width: 3.5rem; height: 3.5rem;
      background: rgba(199,54,42,0.12);
      border-radius: 9999px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem; color: #d94a3a;
    }
    .connect-card h3 { margin: 0; color: var(--text); font-size: 1.1rem; }
    .connect-card p { margin: 0; color: var(--muted); font-size: 0.88rem; max-width: 36rem; }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }
    .section-header h3 { margin: 0; color: var(--text); font-size: 1.1rem; }
    .channel-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 0.75rem;
    }
  `],
})
export class YoutubeConnectPage implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  protected channels = signal<YouTubeChannel[]>([]);
  protected loading = signal(true);

  ngOnInit(): void {
    this.loadChannels();
  }

  private loadChannels(): void {
    this.loading.set(true);
    this.api.getYouTubeChannels().subscribe({
      next: (chs) => {
        this.channels.set(chs);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  protected disconnect(id: string): void {
    this.api.deleteChannel(id).subscribe({
      next: () => {
        this.toast.show('Channel disconnected', 'info');
        this.loadChannels();
      },
      error: () => {
        this.toast.show('Failed to disconnect channel', 'error');
      },
    });
  }
}
