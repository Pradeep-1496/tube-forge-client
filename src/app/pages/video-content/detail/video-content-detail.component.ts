import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, VideoContent, GenerateFromVideoResponse } from '../../../services/api.service';
import { ContentEditorComponent } from '../../../components/core/content-editor/content-editor.component';
import { GenerationWizardComponent } from '../../../components/core/generation-wizard/generation-wizard.component';
import { GenerationProgressComponent } from '../../../components/core/generation-progress/generation-progress.component';
import { VideoResultComponent } from '../../../components/core/video-result/video-result.component';

type ViewState = 'view' | 'edit' | 'wizard' | 'generating' | 'result';

@Component({
  selector: 'app-video-content-detail',
  standalone: true,
  imports: [CommonModule, ContentEditorComponent, GenerationWizardComponent, GenerationProgressComponent, VideoResultComponent],
  template: `
    <div class="page">
      @if (loading()) {
        <div class="loading">Loading content...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (content(); as c) {
        <header class="page-header">
          <div>
            <h1>{{ c.title }}</h1>
            <p>{{ c.visibility === 'public' ? 'Public' : 'Private' }} content</p>
          </div>
          <div class="header-actions">
            @if (view() === 'view') {
              <button class="btn ghost" (click)="view.set('edit')">Edit</button>
              <button class="btn primary" (click)="view.set('wizard')">Generate Video</button>
            }
            @if (view() === 'wizard' || view() === 'generating' || view() === 'result') {
              <button class="btn ghost" (click)="view.set('view')">Back</button>
            }
          </div>
        </header>

        @if (view() === 'view') {
          <section class="content-display">
            <div class="body">{{ c.content }}</div>
            <div class="meta">
              <span>Created: {{ c.createdAt | date:'medium' }}</span>
              <span>Visibility: <strong>{{ c.visibility }}</strong></span>
            </div>
          </section>
        }

        @if (view() === 'edit') {
          <app-content-editor [initial]="c" (saved)="onUpdate($event)" (cancel)="view.set('view')" />
        }

        @if (view() === 'wizard') {
          <app-generation-wizard (generate)="onGenerate($event)" (cancel)="view.set('view')" />
        }

        @if (view() === 'generating') {
          <app-generation-progress
            [progress]="genProgress()"
            [statusText]="genStatus()"
            [error]="genError()"
            [done]="genDone()"
            (retry)="retryGenerate()"
            (viewResult)="view.set('result')"
          />
        }

        @if (view() === 'result') {
          <app-video-result [videoUrl]="videoUrl()" [metadata]="videoMetadata()" />
        }
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .header-actions { display: flex; gap: 0.5rem; }
    .content-display { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; }
    .body { color: var(--text); font-size: 0.92rem; line-height: 1.6; white-space: pre-wrap; }
    .meta { display: flex; gap: 1rem; font-size: 0.8rem; color: var(--muted); }
    .loading { color: var(--muted); font-style: italic; padding: 2rem; }
    .error { color: var(--danger); padding: 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
  `]
})
export class VideoContentDetailComponent implements OnInit {
  view = signal<ViewState>('view');
  loading = signal(true);
  error = signal<string | null>(null);
  content = signal<VideoContent | null>(null);
  genProgress = signal(0);
  genStatus = signal('Preparing...');
  genError = signal<string | null>(null);
  genDone = signal(false);
  videoUrl = signal('');
  videoMetadata = signal<Record<string, string> | null>(null);

  private contentId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
  ) {}

  ngOnInit() {
    this.contentId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.contentId) {
      this.error.set('No content ID provided');
      this.loading.set(false);
      return;
    }
    this.loadContent();
  }

  private loadContent() {
    this.loading.set(true);
    this.api.getContentItem(this.contentId).subscribe({
      next: (item) => {
        this.content.set(item as VideoContent);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || 'Failed to load content');
        this.loading.set(false);
      },
    });
  }

  onUpdate(payload: Partial<VideoContent>) {
    this.api.updateContentItem(this.contentId, payload as any).subscribe({
      next: () => {
        this.view.set('view');
        this.loadContent();
      },
      error: (err) => alert(err?.error?.message || 'Update failed'),
    });
  }

  onGenerate(req: {
    videoContentId: string;
    backgroundId?: string;
    backgroundVideoId?: string;
    audioId?: string;
    theme?: string;
    subscribeImageId?: string;
    channelId: string;
    publishedDate: string;
  }) {
    this.view.set('generating');
    this.genProgress.set(0);
    this.genStatus.set('Starting generation...');
    this.genError.set(null);
    this.genDone.set(false);

    const handleError = (err: any) => {
      const body = err.error;
      let msg = 'Generation failed';
      if (typeof body === 'string') msg = body;
      else if (body?.message) msg = body.message;
      else if (body?.error) msg = typeof body.error === 'string' ? body.error : body.message || msg;
      else if (err.message) msg = err.message;
      if (err.status) msg = `[${err.status}] ${msg}`;
      this.genError.set(msg);
      this.genStatus.set('Failed');
    };

    if (req.backgroundVideoId) {
      this.api.generateFromVideo(req.videoContentId, req.backgroundVideoId, {
        audioId: req.audioId || undefined,
        theme: req.theme || undefined,
        youtube_channel_id: req.channelId || undefined,
        publishedDate: req.publishedDate || undefined,
        subscribeImageId: req.subscribeImageId || undefined,
      }).subscribe({
        next: (res: GenerateFromVideoResponse) => {
          this.genProgress.set(100);
          this.genStatus.set('Generation complete!');
          this.genDone.set(true);
          this.videoUrl.set(res.outputPath);
          this.videoMetadata.set({
            title: res.metadata.title,
            createdAt: res.metadata.createdAt,
            status: res.metadata.status,
          });
          setTimeout(() => this.view.set('result'), 800);
        },
        error: handleError,
      });
    } else {
      this.api.generateVideo(this.contentId).subscribe({
        next: (res) => {
          this.genProgress.set(100);
          this.genStatus.set('Generation complete!');
          this.genDone.set(true);
          if (res.videoPath) {
            this.videoUrl.set(res.videoPath);
            this.videoMetadata.set({
              title: this.content()?.title || '',
              createdAt: new Date().toISOString(),
            });
          }
          setTimeout(() => this.view.set('result'), 800);
        },
        error: handleError,
      });
    }
  }

  retryGenerate() {
    this.genError.set(null);
    this.genDone.set(false);
    this.genProgress.set(0);
    this.view.set('wizard');
  }
}
