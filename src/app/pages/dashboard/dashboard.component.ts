import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Stats } from '../../services/api.service';
import { StatsCardComponent } from '../../components/shared/stats-card/stats-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardComponent],
  template: `
    <div class="dashboard">
      <header class="page-header">
        <h1>Dashboard</h1>
        <p>Platform status at a glance.</p>
      </header>

      <section class="stats" *ngIf="stats() as s; else loading">
        <app-stats-card
          [kpi]="kpi('Channels', s.totalChannels)"
          [max]="s.totalChannels || 20"
          [gradient]="'linear-gradient(90deg, #6366f1, #818cf8)'"
        />
        <app-stats-card
          [kpi]="kpi('Videos', s.totalVideos, s.published + ' published')"
          [max]="s.totalChannels * 20 || 100"
          [gradient]="'linear-gradient(90deg, #8b5cf6, #a78bfa)'"
        />
        <app-stats-card
          [kpi]="kpi('Pending', s.pending, s.failed + ' failed')"
          [max]="s.totalVideos || 100"
          [gradient]="'linear-gradient(90deg, #ec4899, #f472b6)'"
        />
        <app-stats-card
          [kpi]="kpi('Assets', s.totalAssets)"
          [max]="100"
          [gradient]="'linear-gradient(90deg, #14b8a6, #2dd4bf)'"
        />
      </section>

      <ng-template #loading>
        <div class="loading">Loading stats…</div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; }
    .loading { color: var(--muted); font-style: italic; padding: 2rem; }
  `]
})
export class DashboardComponent implements OnInit {
  stats = signal<Stats | null>(null);

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.api.getStats().subscribe({ next: (s) => this.stats.set(s) });
  }

  kpi(label: string, value: number, hint?: string) {
    return { label, value, hint };
  }
}
