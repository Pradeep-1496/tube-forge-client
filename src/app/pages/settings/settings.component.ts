import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="settings">
      <header class="page-header">
        <div>
          <h1>Settings</h1>
          <p>API health, YouTube connection, and system info.</p>
        </div>
      </header>

      <div class="sections">
        <section class="card">
          <h3>API Health</h3>
          <div class="row">
            <div class="muted">Backend URL</div>
            <code>http://localhost:3000/api</code>
          </div>
          <div class="row">
            <div class="muted">Status</div>
            <span class="pill ok" *ngIf="healthOk()">Connected</span>
            <span class="pill err" *ngIf="!healthOk()">Offline</span>
          </div>
        </section>

        <section class="card">
          <h3>YouTube Integration</h3>
          <div class="row">
            <div class="muted">Connection</div>
            <span class="pill ok" *ngIf="ytOk()">Connected</span>
            <span class="pill err" *ngIf="!ytOk() && ytChecked()">Disconnected</span>
            <span class="pill" *ngIf="!ytChecked()">Checking…</span>
          </div>
          @if (!ytOk() && ytChecked()) {
            <a class="btn primary" href="#" (click)="auth()">Re-authorize YouTube</a>
          }
          @if (channelInfo()) {
            <div class="channel-info">
              <strong>{{ channelInfo()?.channelTitle }}</strong>
              <p>{{ channelInfo()?.description }}</p>
              <small>ID: {{ channelInfo()?.channelId }}</small>
            </div>
          }
        </section>

        <section class="card">
          <h3>System</h3>
          <div class="row">
            <div class="muted">Frontend</div>
            Angular 21 · SSR
          </div>
          <div class="row">
            <div class="muted">Backend</div>
            NestJS · PostgreSQL
          </div>
          <div class="row">
            <div class="muted">Recording</div>
            Puppeteer + FFmpeg
          </div>
          <div class="row">
            <div class="muted">Uploads</div>
            Max ~10–15 per channel / 24h
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .settings {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
      }
      .page-header h1 {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .page-header p {
        color: var(--muted);
        margin: 0.25rem 0 0;
        font-size: 0.92rem;
      }
      .sections {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      @media (max-width: 760px) {
        .sections {
          grid-template-columns: 1fr;
        }
      }
      .card {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
      }
      .card h3 {
        margin: 0;
        color: var(--text);
        font-size: 1rem;
      }
      .row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1rem;
        flex-wrap: wrap;
        font-size: 0.88rem;
        color: var(--text);
      }
      .muted {
        color: var(--muted);
      }
      .pill {
        padding: 0.25rem 0.7rem;
        border-radius: 9999px;
        font-size: 0.75rem;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.05em;
      }
      .pill.ok {
        background: rgba(16, 185, 129, 0.15);
        color: var(--success);
      }
      .pill.err {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger);
      }
      .btn {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 0.55rem;
        background: var(--accent);
        color: #fff;
        border: none;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        text-decoration: none;
      }
      code {
        font-family: monospace;
        font-size: 0.85rem;
        color: var(--accent);
        background: var(--border-subtle);
        padding: 0.2rem 0.5rem;
        border-radius: 0.3rem;
      }
      .channel-info {
        padding: 1rem;
        background: var(--border-subtle);
        border-radius: 0.55rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .channel-info p {
        color: var(--muted);
        font-size: 0.85rem;
        margin: 0;
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  healthOk = signal(false);
  ytOk = signal(false);
  ytChecked = signal(false);
  channelInfo: any = signal(null);

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.checkHealth();
  }

  checkHealth() {
    this.api.getRunning().subscribe({
      next: (ok) => this.healthOk.set(ok),
      error: () => this.healthOk.set(false),
    });
    this.api.getYouTubeChannelInfo().subscribe({
      next: (c) => {
        this.ytOk.set(true);
        this.ytChecked.set(true);
        this.channelInfo.set(c);
      },
      error: () => {
        this.ytOk.set(false);
        this.ytChecked.set(true);
      },
    });
  }

  auth() {
    this.api
      .getYouTubeAuthUrl()
      .subscribe({ next: (r) => window.open(r.url, '_blank', 'width=500,height=600') });
  }
}
