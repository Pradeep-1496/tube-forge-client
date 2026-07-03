import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, MetadataItem } from '../../../services/api.service';
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
        <p>Track your video generation progress and view full metadata details.</p>
      </header>

      @if (loading()) {
        <div class="loading">Loading generation details...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (view() === 'progress') {
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
        <app-video-result [videoUrl]="videoUrl()" [metadata]="summaryMetadata()" />

        <div class="metadata-card">
          <h2 class="meta-title">Metadata Details</h2>
          <div class="meta-grid">
            <div class="meta-item full">
              <span class="label">Title</span>
              <span class="value">{{ metadata()?.title || '—' }}</span>
            </div>
            <div class="meta-item full">
              <span class="label">Description</span>
              <span class="value">{{ metadata()?.description || '—' }}</span>
            </div>
            <div class="meta-item full">
              <span class="label">Tags</span>
              <span class="value">
                @if (metadata()?.tags; as tags) {
                  <span class="tag-list">
                    @for (tag of tags; track tag) {
                      <span class="tag">{{ tag }}</span>
                    }
                  </span>
                } @else {
                  —
                }
              </span>
            </div>
            <div class="meta-item">
              <span class="label">Status</span>
              <span class="value"><span class="status-pill" [class]="metadata()?.status">{{ metadata()?.status }}</span></span>
            </div>
            <div class="meta-item">
              <span class="label">Privacy</span>
              <span class="value">{{ metadata()?.privacy_status || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Language</span>
              <span class="value">{{ metadata()?.default_language || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Category ID</span>
              <span class="value mono">{{ metadata()?.category_id || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Kids Content</span>
              <span class="value">{{ metadata()?.self_declared_made_for_kids ? 'Yes' : 'No' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Publish At</span>
              <span class="value">{{ metadata()?.publish_at || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">File Name</span>
              <span class="value mono">{{ metadata()?.file_name || '—' }}</span>
            </div>
            <div class="meta-item">
              <span class="label">Channel ID</span>
              <span class="value mono">{{ metadata()?.channelId || '—' }}</span>
            </div>
      <div class="meta-item">
        <span class="label">Created At</span>
        <span class="value">{{ metadata()?.createdAt ? (metadata()!.createdAt | date:'medium') : '—' }}</span>
      </div>
      <div class="meta-item">
        <span class="label">Updated At</span>
        <span class="value">{{ metadata()?.updatedAt ? (metadata()!.updatedAt | date:'medium') : '—' }}</span>
      </div>
          </div>
        </div>

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
    .loading { color: var(--muted); font-style: italic; padding: 2rem; font-size: 0.9rem; text-align: center; }
    .error { color: var(--danger); padding: 0.8rem 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; font-size: 0.85rem; }
    .nav-actions { display: flex; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; text-decoration: none; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }

    .metadata-card { background: var(--surface); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.2rem 1.4rem; }
    .meta-title { margin: 0 0 0.8rem; color: var(--text); font-size: 1rem; font-weight: 600; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.7rem 1rem; }
    .meta-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .meta-item.full { grid-column: 1 / -1; }
    .label { font-size: 0.72rem; color: var(--muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.03em; }
    .value { font-size: 0.88rem; color: var(--text); word-break: break-word; }
    .value.mono { font-family: 'JetBrains Mono', 'SF Mono', monospace; font-size: 0.82rem; }
    .value a { color: var(--accent); text-decoration: none; }
    .value a:hover { text-decoration: underline; }
    .tag-list { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .tag { background: var(--accent-weak); color: var(--accent); font-size: 0.72rem; font-weight: 500; padding: 0.15rem 0.5rem; border-radius: 9999px; border: 1px solid var(--ring); }
    .status-pill { display: inline-block; padding: 0.15rem 0.6rem; border-radius: 9999px; font-size: 0.78rem; font-weight: 600; text-transform: capitalize; border: 1px solid var(--border); background: var(--surface-2); color: var(--muted); }
    .status-pill.generating, .status-pill.uploading { background: rgba(74,143,224,0.12); color: #93b8f8; border-color: rgba(74,143,224,0.25); }
    .status-pill.generated { background: rgba(58,170,136,0.12); color: #5dd4ae; border-color: rgba(58,170,136,0.25); }
    .status-pill.scheduled, .status-pill.published { background: rgba(232,184,75,0.12); color: #e8b84b; border-color: rgba(232,184,75,0.25); }
    .status-pill.failed { background: rgba(224,72,58,0.12); color: #e8836a; border-color: rgba(224,72,58,0.25); }
    .status-pill.draft { background: rgba(122,122,140,0.12); color: #9a9aac; border-color: rgba(122,122,140,0.25); }

    @media (max-width: 600px) {
      .meta-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class GenerationDetailComponent implements OnInit {
  generationId = '';
  view = signal<'progress' | 'result'>('progress');
  progress = signal(0);
  statusText = signal('Initializing...');
  error = signal<string | null>(null);
  done = signal(false);
  loading = signal(true);
  videoUrl = signal('');
  metadata = signal<MetadataItem | null>(null);

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
  ) {}

  ngOnInit() {
    this.generationId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.generationId) {
      this.error.set('No generation ID provided');
      this.loading.set(false);
      return;
    }
    this.api.getMetadataItem(this.generationId).subscribe({
      next: (item) => {
        this.loading.set(false);
        if (item.output_video_path) {
          this.progress.set(100);
          this.statusText.set('Generation complete!');
          this.done.set(true);
          this.videoUrl.set(this.api.toVideoUrl(item.output_video_path));
          this.metadata.set(item);
          setTimeout(() => this.view.set('result'), 500);
        } else {
          this.metadata.set(item);
          this.generateVideo({
            channelId: item.channelId || undefined,
            publishedDate: item.publish_at || undefined,
          });
        }
      },
      error: () => {
        this.loading.set(false);
        this.generateVideo();
      },
    });
  }

  private generateVideo(payload?: { channelId?: string; publishedDate?: string }) {
    this.api.generateVideo(this.generationId, payload).subscribe({
      next: (res: any) => {
        this.progress.set(100);
        this.statusText.set('Generation complete!');
        this.done.set(true);
        if (res.videoPath) {
          this.videoUrl.set(this.api.toVideoUrl(res.videoPath));
        }
        this.metadata.update((item) => {
          if (item) {
            return { ...item, status: item.status || 'generated' } as MetadataItem;
          }
          return {
            id: this.generationId,
            title: 'Generated Video',
            description: '',
            tags: [],
            file_name: '',
            category_id: '',
            default_language: '',
            privacy_status: '',
            publish_at: '',
            self_declared_made_for_kids: false,
            output_video_path: res.videoPath || '',
            channelId: payload?.channelId || '',
            status: 'generated',
            youtubeVideoId: null,
            youtubeUrl: null,
            thumbnailPath: '',
            contentId: '',
            userId: '',
            visibility: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as MetadataItem;
        });
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
    this.generateVideo();
  }

  goBack() {
    this.router.navigate(['/content']);
  }

  goDashboard() {
    this.router.navigate(['/dashboard']);
  }

  summaryMetadata() {
    const m = this.metadata();
    if (!m) return null;
    return {
      title: m.title,
      status: m.status,
      createdAt: m.createdAt,
    };
  }
}
