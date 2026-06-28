import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { StatsCardComponent } from '../../components/shared/stats-card/stats-card.component';
import { StatusBadgeComponent } from '../../components/shared/status-badge/status-badge.component';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, StatsCardComponent, StatusBadgeComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Platform status at a glance.</p>
        </div>
        <div class="header-right">
          <span class="backend-pill" [class.online]="backendOnline()" [class.offline]="!backendOnline()">
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
            [gradient]="'linear-gradient(90deg, #6366f1, #818cf8)'"
          />
          <app-stats-card
            [kpi]="kpi('Content Items', data().content)"
            [max]="data().content || 50"
            [gradient]="'linear-gradient(90deg, #ec4899, #f472b6)'"
          />
          <app-stats-card
            [kpi]="kpi('Metadata Records', data().metadata)"
            [max]="data().metadata || 50"
            [gradient]="'linear-gradient(90deg, #f59e0b, #fbbf24)'"
          />
          <app-stats-card
            [kpi]="kpi('Backgrounds', data().backgrounds + data().backgroundVideos, data().backgroundVideos + ' video')"
            [max]="(data().backgrounds + data().backgroundVideos) || 20"
            [gradient]="'linear-gradient(90deg, #14b8a6, #2dd4bf)'"
          />
          <app-stats-card
            [kpi]="kpi('Audios', data().audios)"
            [max]="data().audios || 20"
            [gradient]="'linear-gradient(90deg, #3b82f6, #60a5fa)'"
          />
          <app-stats-card
            [kpi]="kpi('Subscribe Images', data().subscribeImages)"
            [max]="data().subscribeImages || 10"
            [gradient]="'linear-gradient(90deg, #a855f7, #c084fc)'"
          />
        </section>

        @if (recentRecords().length) {
          <section class="recent">
            <h2>Recent Metadata</h2>
            <div class="recent-list">
              @for (r of recentRecords(); track r.id) {
                <a class="recent-item" [routerLink]="['/video-metadata']">
                  <div class="recent-info">
                    <span class="recent-title">{{ r.title }}</span>
                    <span class="recent-meta">{{ r.createdAt | date:'medium' }}</span>
                  </div>
                  <app-status-badge [status]="r.status" />
                </a>
              }
            </div>
          </section>
        }
      } @else {
        <div class="loading">Loading dashboard…</div>
      }
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .header-right { display: flex; align-items: center; }
    .backend-pill {
      display: inline-flex; align-items: center; gap: 0.45rem;
      padding: 0.35rem 0.85rem; border-radius: 9999px;
      font-size: 0.78rem; font-weight: 600;
      border: 1px solid var(--border);
    }
    .backend-pill.online { background: rgba(16,185,129,0.12); color: var(--success); border-color: rgba(16,185,129,0.25); }
    .backend-pill.offline { background: rgba(239,68,68,0.12); color: var(--danger); border-color: rgba(239,68,68,0.25); }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .backend-pill.online .dot { background: var(--success); }
    .backend-pill.offline .dot { background: var(--danger); }
    .stats { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
    .loading { color: var(--muted); font-style: italic; padding: 2rem; }
    .recent { display: flex; flex-direction: column; gap: 0.75rem; }
    .recent h2 { font-size: 1rem; font-weight: 600; color: var(--text); margin: 0; }
    .recent-list { display: flex; flex-direction: column; gap: 0.4rem; }
    .recent-item {
      display: flex; justify-content: space-between; align-items: center; gap: 1rem;
      padding: 0.7rem 1rem; border-radius: 0.6rem;
      background: var(--surface); border: 1px solid var(--border-subtle);
      text-decoration: none; transition: border-color 0.15s ease;
    }
    .recent-item:hover { border-color: var(--accent); }
    .recent-info { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
    .recent-title { font-size: 0.88rem; color: var(--text); font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .recent-meta { font-size: 0.75rem; color: var(--muted); }
  `]
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
  recentRecords = signal<any[]>([]);

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
        const sorted = [...res.metadata].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        this.recentRecords.set(sorted.slice(0, 10));
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
}
