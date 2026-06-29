import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Kpi {
  label: string;
  value: number;
  hint?: string;
}

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card">
      <div class="meta">
        <span class="label">{{ kpi().label }}</span>
        <span class="value">{{ kpi().value }}</span>
        <span class="hint" *ngIf="kpi().hint">{{ kpi().hint }}</span>
      </div>
      <div class="track">
        <div
          class="bar"
          [style.width.%]="percent"
          [style.background]="gradient()"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.75rem;
      padding: 1.2rem 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
      transition: border-color 0.2s ease, background 0.2s ease;
      border-top: 2px solid var(--accent-weak);
    }
    .card:hover {
      border-color: var(--accent);
      background: var(--surface-2);
      border-top-color: var(--accent);
    }
    .meta { display: flex; flex-direction: column; gap: 0.2rem; }
    .label { font-size: 0.78rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; }
    .value { font-size: 2rem; font-weight: 600; color: var(--text); line-height: 1; font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.02em; }
    .hint { font-size: 0.78rem; color: var(--muted); }
    .track {
      height: 3px; background: var(--border); border-radius: 9999px; overflow: hidden;
    }
    .bar { height: 100%; border-radius: 9999px; transition: width 0.6s ease; }
  `]
})
export class StatsCardComponent {
  kpi = input.required<Kpi>();
  max = input<number>(100);
  gradient = input<string>('linear-gradient(90deg, #e8b84b, #d4a030)');

  get percent(): number {
    const raw = (this.kpi().value / this.max()) * 100;
    return Math.min(Math.max(raw, 0), 100);
  }
}
