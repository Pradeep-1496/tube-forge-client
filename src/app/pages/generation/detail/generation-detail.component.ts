import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { GenerationProgressComponent } from '../../../components/core/generation-progress/generation-progress.component';
import { VideoResultComponent } from '../../../components/core/video-result/video-result.component';

@Component({
  selector: 'app-generation-detail',
  standalone: true,
  imports: [CommonModule, GenerationProgressComponent, VideoResultComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Generation #{{ generationId }}</h1>
        <p>Track your video generation progress and view results.</p>
      </header>

      @if (view() === 'progress') {
        <app-generation-progress
          [progress]="progress()"
          [statusText]="statusText()"
          [error]="error()"
          [done]="done()"
          (viewResult)="view.set('result')"
          (retry)="retry()"
        />
      }

      @if (view() === 'result') {
        <app-video-result [videoUrl]="videoUrl()" [metadata]="metadata()" />

        <div class="nav-actions">
          <button class="btn ghost" (click)="goBack()">Back to Content</button>
          <button class="btn ghost" (click)="goDashboard()">Dashboard</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .nav-actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
  `]
})
export class GenerationDetailComponent implements OnInit {
  generationId = '';
  view = signal<'progress' | 'result'>('progress');
  progress = signal(0);
  statusText = signal('Initializing...');
  error = signal<string | null>(null);
  done = signal(false);
  videoUrl = signal('');
  metadata = signal<Record<string, string> | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
  ) {}

  ngOnInit() {
    this.generationId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.generationId) {
      this.error.set('No generation ID provided');
      return;
    }
    this.startGeneration();
  }

  private startGeneration() {
    this.api.generateVideo(this.generationId).subscribe({
      next: (res: any) => {
        this.progress.set(100);
        this.statusText.set('Generation complete!');
        this.done.set(true);
        if (res.videoPath) {
          this.videoUrl.set(res.videoPath);
          this.metadata.set({
            title: 'Generated Video',
            createdAt: new Date().toISOString(),
          });
        }
        setTimeout(() => this.view.set('result'), 1000);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Generation failed');
        this.statusText.set('Failed');
      },
    });
  }

  retry() {
    this.error.set(null);
    this.done.set(false);
    this.progress.set(0);
    this.statusText.set('Restarting...');
    this.startGeneration();
  }

  goBack() {
    this.router.navigate(['/content']);
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }
}
