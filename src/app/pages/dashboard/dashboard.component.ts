import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, ActivityLog } from '../../services/api.service';
import { StatsCardComponent } from '../../components/shared/stats-card/stats-card.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Platform status at a glance</p>
        </div>
        <div class="header-right">
          <span
            class="backend-pill"
            [class.online]="backendOnline()"
            [class.offline]="!backendOnline()"
          >
            <span class="dot"></span>
            {{ backendOnline() ? 'Backend Online' : 'Backend Offline' }}
          </span>
        </div>
      </header>

      @if (loaded()) {
        <section class="stats">
          <app-stats-card
            [kpi]="kpi('Channels', data().channels)"
            [max]="data().channels || 10"
            [gradient]="'linear-gradient(90deg, #e8b84b, #d4a030)'"
          />
          <app-stats-card
            [kpi]="kpi('Content Items', data().content)"
            [max]="data().content || 50"
            [gradient]="'linear-gradient(90deg, #e8b84b, #c99a2e)'"
          />
          <app-stats-card
            [kpi]="kpi('Metadata Records', data().metadata)"
            [max]="data().metadata || 50"
            [gradient]="'linear-gradient(90deg, #d4a030, #e8b84b)'"
          />
          <app-stats-card
            [kpi]="
              kpi(
                'Backgrounds',
                data().backgrounds + data().backgroundVideos,
                data().backgroundVideos + ' video'
              )
            "
            [max]="data().backgrounds + data().backgroundVideos || 20"
            [gradient]="'linear-gradient(90deg, #e8b84b, #c4942b)'"
          />
          <app-stats-card
            [kpi]="kpi('Audios', data().audios)"
            [max]="data().audios || 20"
            [gradient]="'linear-gradient(90deg, #d4a030, #e8b84b)'"
          />
          <app-stats-card
            [kpi]="kpi('Subscribe Images', data().subscribeImages)"
            [max]="data().subscribeImages || 10"
            [gradient]="'linear-gradient(90deg, #c4942b, #e8b84b)'"
          />
        </section>

        @if (activityLog().length) {
          <section class="activity-log">
            <h2>Activity Log</h2>
            <div class="activity-list">
              @for (entry of activityLog(); track entry.id) {
                <div class="activity-item">
                  <div class="activity-icon">{{ entry.method }}</div>
                  <div class="activity-info">
                    <span class="activity-title">{{ formatAction(entry.action) }}</span>
                    <span class="activity-meta"
                      >{{ entry.route }} &middot; {{ formatDate(entry.createdAt) }}</span
                    >
                  </div>
                </div>
              }
            </div>
          </section>
        }
      } @else {
        <div class="loading">Loading dashboard…</div>
      }
    </div>
  `,
  styles: [
    `
      .dashboard {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        flex-wrap: wrap;
      }
      .page-header h1 {
        font-size: 1.6rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        letter-spacing: -0.02em;
      }
      .page-header p {
        color: var(--muted);
        margin: 0.3rem 0 0;
        font-size: 0.92rem;
      }
      .header-right {
        display: flex;
        align-items: center;
      }
      .backend-pill {
        display: inline-flex;
        align-items: center;
        gap: 0.45rem;
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        font-size: 0.78rem;
        font-weight: 600;
        border: 1px solid var(--border);
      }
      .backend-pill.online {
        background: rgba(58, 170, 136, 0.12);
        color: var(--success);
        border-color: rgba(58, 170, 136, 0.25);
      }
      .backend-pill.offline {
        background: rgba(224, 72, 58, 0.12);
        color: var(--danger);
        border-color: rgba(224, 72, 58, 0.25);
      }
      .dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: currentColor;
      }
      .backend-pill.online .dot {
        background: var(--success);
      }
      .backend-pill.offline .dot {
        background: var(--danger);
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }
      .loading {
        color: var(--muted);
        font-style: italic;
        padding: 2rem;
      }
      .activity-log {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }
      .activity-log h2 {
        font-size: 1rem;
        font-weight: 600;
        color: var(--text);
        margin: 0;
      }
      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .activity-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.7rem 1rem;
        border-radius: 0.6rem;
        background: var(--surface);
        border: 1px solid var(--border);
      }
      .activity-icon {
        font-size: 0.7rem;
        font-weight: 700;
        letter-spacing: 0.05em;
        padding: 0.25rem 0.5rem;
        border-radius: 0.35rem;
        background: var(--accent-weak);
        color: var(--accent);
        font-family: 'JetBrains Mono', monospace;
        white-space: nowrap;
      }
      .activity-info {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
        min-width: 0;
      }
      .activity-title {
        font-size: 0.88rem;
        color: var(--text);
        font-weight: 500;
      }
      .activity-meta {
        font-size: 0.75rem;
        color: var(--muted);
        font-family: 'JetBrains Mono', monospace;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  backendOnline = signal(false);
  loaded = signal(false);
  data = signal({
    channels: 0,
    content: 0,
    metadata: 0,
    backgrounds: 0,
    backgroundVideos: 0,
    audios: 0,
    subscribeImages: 0,
  });
  activityLog = signal<ActivityLog[]>([]);

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    forkJoin({
      running: this.api.getRunning().pipe(catchError(() => of(false))),
      channels: this.api.getChannels().pipe(catchError(() => of([]))),
      content: this.api.getContentItems().pipe(catchError(() => of([]))),
      metadata: this.api.getMetadata().pipe(catchError(() => of([]))),
      backgrounds: this.api.getBackgrounds().pipe(catchError(() => of([]))),
      backgroundVideos: this.api.getBackgroundVideos().pipe(catchError(() => of([]))),
      audios: this.api.getAudios().pipe(catchError(() => of([]))),
      subscribeImages: this.api.getSubscribeImages().pipe(catchError(() => of([]))),
      activityLog: this.api.getActivityLogTimeline(10).pipe(catchError(() => of([]))),
    }).subscribe({
      next: (res) => {
        this.backendOnline.set(!!res.running);
        this.data.set({
          channels: res.channels.length,
          content: res.content.length,
          metadata: res.metadata.length,
          backgrounds: res.backgrounds.length,
          backgroundVideos: res.backgroundVideos.length,
          audios: res.audios.length,
          subscribeImages: res.subscribeImages.length,
        });
        this.activityLog.set(res.activityLog);
        this.loaded.set(true);
      },
      error: () => {
        this.loaded.set(true);
      },
    });
  }

  kpi(label: string, value: number, hint?: string) {
    return { label, value, hint };
  }

  formatAction(action: string): string {
    return action
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString();
  }
}
