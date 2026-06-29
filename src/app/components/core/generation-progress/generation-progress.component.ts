import { Component, input, output, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-generation-progress',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-card">
      <div class="spinner">
        <div class="ring"></div>
      </div>
      <h3>Generating Video</h3>
      <p class="status-text">{{ statusText() }}</p>
      <div class="bar-track">
        <div class="bar-fill" [style.width.%]="progress()"></div>
      </div>
      <p class="eta">This may take 30–60 seconds</p>
      @if (error()) {
        <div class="error-msg">{{ error() }}</div>
        <button class="btn danger" (click)="retry.emit()">Retry</button>
      }
      @if (done()) {
        <button class="btn primary" (click)="viewResult.emit()">View Result</button>
      }
    </div>
  `,
  styles: [`
    .progress-card { display: flex; flex-direction: column; align-items: center; gap: 0.8rem; padding: 2.5rem 2rem; }
    .spinner { width: 48px; height: 48px; }
    .ring { width: 48px; height: 48px; border: 3px solid var(--border); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    h3 { margin: 0; color: var(--text); font-size: 1.1rem; }
    .status-text { color: var(--muted); font-size: 0.88rem; margin: 0; text-align: center; }
    .bar-track { width: 100%; max-width: 320px; height: 6px; background: var(--border); border-radius: 9999px; overflow: hidden; }
    .bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent), #d4a030); border-radius: 9999px; transition: width 0.5s ease; }
    .eta { color: var(--muted); font-size: 0.75rem; margin: 0; font-style: italic; }
    .error-msg { color: var(--danger); font-size: 0.85rem; padding: 0.5rem 1rem; background: rgba(224,72,58,0.1); border-radius: 0.5rem; text-align: center; }
    .btn { padding: 0.5rem 1.2rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #09090b; }
    .btn.danger { background: var(--danger); color: #fff; }
  `]
})
export class GenerationProgressComponent implements OnDestroy {
  progress = input(0);
  statusText = input('Initializing...');
  error = input<string | null>(null);
  done = input(false);
  retry = output<void>();
  viewResult = output<void>();

  private interval: ReturnType<typeof setInterval> | null = null;

  ngOnDestroy() {
    this.stopPolling();
  }

  startPolling() {
    this.stopPolling();
    let p = 0;
    this.interval = setInterval(() => {
      p = Math.min(p + Math.random() * 15, 90);
    }, 2000);
  }

  private stopPolling() {
    if (this.interval) { clearInterval(this.interval); this.interval = null; }
  }
}
