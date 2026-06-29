import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  ApiService,
  VideoContent,
  BackgroundVideo,
  GenerateFromVideoResponse,
} from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import {
  AppSelectComponent,
  SelectOption,
} from '../../components/shared/app-select/app-select.component';
import { GenerationProgressComponent } from '../../components/core/generation-progress/generation-progress.component';
import { VideoResultComponent } from '../../components/core/video-result/video-result.component';

type ViewState = 'form' | 'generating' | 'result';

@Component({
  selector: 'app-generate-from-video',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AppSelectComponent,
    GenerationProgressComponent,
    VideoResultComponent,
  ],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Create Video from Content</h1>
        <p>Select video content and background video, then configure options and generate.</p>
      </header>

      @if (view() === 'form') {
        <div class="form-card">
          <div class="form-grid">
            <app-select
              label="Video Content *"
              placeholder="— Select content —"
              [options]="contentOptions()"
              [(value)]="selectedContentId"
            />

            <app-select
              label="Background Video *"
              placeholder="— Select background video —"
              [options]="bgVideoOptions()"
              [(value)]="selectedBgVideoId"
            />

            <app-select
              label="Theme"
              placeholder="— Select theme —"
              [options]="themeOptions"
              [(value)]="selectedTheme"
            />

            <app-select
              label="Audio"
              placeholder="— None —"
              [options]="audioOptions()"
              [(value)]="selectedAudioId"
            />

            <app-select
              label="Subscribe Image"
              placeholder="— None —"
              [options]="subscribeOptions()"
              [(value)]="selectedSubscribeId"
            />

            <app-select
              label="Channel *"
              placeholder="— Select channel —"
              [options]="channelOptions()"
              [(value)]="selectedChannelId"
            />

            <div class="field">
              <label class="field-label">Published Date {{ selectedChannelId }}</label>

              <input type="datetime-local" class="field-input" [(ngModel)]="publishDate" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn secondary" (click)="onSaveDraft()" [disabled]="savingDraft() || !canGenerate()">
              {{ savingDraft() ? 'Saving...' : 'Save as Draft' }}
            </button>
            <button class="btn primary" (click)="onGenerate()" [disabled]="!canGenerate()">
              Generate Video
            </button>
          </div>
        </div>
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
        <div class="result-section" *ngIf="responseData() as res">
          <div class="result-meta">
            <h3>Video Metadata</h3>
            <div class="meta-grid">
              <div class="meta-item">
                <span class="label">Title</span><span class="value">{{ res.metadata.title }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Status</span
                ><span class="value">{{ res.metadata.status }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Visibility</span
                ><span class="value">{{ res.metadata.visibility }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Privacy</span
                ><span class="value">{{ res.metadata.privacy_status }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Language</span
                ><span class="value">{{ res.metadata.default_language }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Made for Kids</span
                ><span class="value">{{
                  res.metadata.self_declared_made_for_kids ? 'Yes' : 'No'
                }}</span>
              </div>
              <div class="meta-item">
                <span class="label">Created</span
                ><span class="value">{{ res.metadata.createdAt | date: 'medium' }}</span>
              </div>
              @if (res.metadata.tags.length) {
                <div class="meta-item tags-item">
                  <span class="label">Tags</span>
                  <div class="tags-list">
                    @for (tag of res.metadata.tags; track tag) {
                      <span class="tag">{{ tag }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
          <div class="actions">
            <button class="btn ghost" (click)="resetForm()">Generate Another</button>
            <button class="btn ghost" (click)="router.navigate(['/dashboard'])">Dashboard</button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .page {
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
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .page-header p {
        color: var(--muted);
        margin: 0.25rem 0 0;
        font-size: 0.92rem;
      }

      .form-card {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 1.4rem;
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      @media (max-width: 700px) {
        .form-grid {
          grid-template-columns: 1fr;
        }
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      .field-label {
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 500;
      }
      .field-input {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.6rem 0.85rem;
        border-radius: 0.55rem;
        font-size: 0.9rem;
        font-family: inherit;
        transition:
          border-color 0.15s,
          box-shadow 0.15s;
      }
      .field-input:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--ring);
      }

      .form-actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
      }

      .result-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .result-meta {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.2rem 1.4rem;
      }
      .result-meta h3 {
        margin: 0 0 0.8rem;
        color: var(--text);
        font-size: 0.95rem;
      }
      .meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.6rem;
      }
      .meta-item {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .meta-item.tags-item {
        grid-column: 1 / -1;
      }
      .label {
        font-size: 0.75rem;
        color: var(--muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      .value {
        font-size: 0.88rem;
        color: var(--text);
      }
      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .tag {
        font-size: 0.75rem;
        padding: 0.15rem 0.5rem;
        background: var(--border);
        border-radius: 9999px;
        color: var(--text);
      }
      .actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        padding: 0.55rem 1.2rem;
        border-radius: 0.55rem;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.15s ease;
      }
      .btn.primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
      .btn.primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn.secondary {
        background: transparent;
        color: var(--accent);
        border-color: var(--accent);
      }
      .btn.secondary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn.secondary:hover:not(:disabled) {
        background: var(--accent-weak);
      }
      .btn.ghost {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .btn.ghost:hover {
        background: var(--border-subtle);
      }
    `,
  ],
})
export class GenerateFromVideoComponent implements OnInit {
  router: Router;
  view = signal<ViewState>('form');

  contentOptions = signal<SelectOption[]>([]);
  bgVideoOptions = signal<SelectOption[]>([]);
  audioOptions = signal<SelectOption[]>([]);
  subscribeOptions = signal<SelectOption[]>([]);
  channelOptions = signal<SelectOption[]>([]);

  readonly themeOptions: SelectOption[] = [
    { value: 'glassmorphism', label: 'Glassmorphism' },
    { value: 'neon', label: 'Neon' },
    { value: 'viral', label: 'Viral' },
    { value: 'apple', label: 'Apple' },
    { value: 'gold', label: 'Gold' },
    { value: 'none', label: 'None' },
    { value: 'custom', label: 'Custom' },
    { value: 'news', label: 'News' },
  ];

  selectedContentId = '';
  selectedBgVideoId = '';
  selectedAudioId = '';
  selectedSubscribeId = '';
  selectedTheme = '';
  selectedChannelId = '';
  publishDate = '';

  savingDraft = signal(false);
  genProgress = signal(0);
  genStatus = signal('Preparing...');
  genError = signal<string | null>(null);
  genDone = signal(false);
  videoUrl = signal('');
  videoMetadata = signal<Record<string, string> | null>(null);
  responseData = signal<GenerateFromVideoResponse | null>(null);

  contentItems: VideoContent[] = [];

  private readonly api: ApiService;
  private readonly toast: ToastService;

  constructor(api: ApiService, router: Router, toast: ToastService) {
    this.api = api;
    this.router = router;
    this.toast = toast;
  }

  ngOnInit() {
    this.loadData();
  }

  canGenerate(): boolean {
    return !!this.selectedContentId && !!this.selectedBgVideoId && !!this.selectedChannelId;
  }

  private loadData() {
    this.api.getContentItems().subscribe({
      next: (items) => {
        this.contentItems = items as VideoContent[];
        this.contentOptions.set(items.map((i) => ({ value: i.id, label: i.title })));
      },
    });
    this.api.getBackgroundVideos().subscribe({
      next: (items) => {
        this.bgVideoOptions.set(
          items.map((i) => ({ value: i.bg_video_id, label: `${i.name} (${i.type})` })),
        );
      },
    });
    this.api.getAudios().subscribe({
      next: (items) => {
        this.audioOptions.set(items.map((i) => ({ value: i.audio_id, label: i.name })));
      },
    });
    this.api.getSubscribeImages().subscribe({
      next: (items) => {
        this.subscribeOptions.set(items.map((i) => ({ value: i.id, label: i.name })));
      },
    });
    this.api.getChannels().subscribe({
      next: (items) => {
        this.channelOptions.set(items.map((i) => ({ value: i.channelId, label: i.name })));
      },
    });
  }

  onGenerate() {

    if (!this.canGenerate()) return;

    console.debug('[GenerateFromVideo] Starting generation', {
      contentId: this.selectedContentId,
      bgVideoId: this.selectedBgVideoId,
      channelId: this.selectedChannelId,
    });

    this.view.set('generating');
    this.genProgress.set(0);
    this.genStatus.set('Generating video...');

    this.api
      .generateFromVideo(this.selectedContentId, this.selectedBgVideoId, {
        audioId: this.selectedAudioId || undefined,
        theme: this.selectedTheme || undefined,
        channelId: this.selectedChannelId,
        publishedDate: this.publishDate || undefined,
        subscribeImageId: this.selectedSubscribeId || undefined,
      })
      .subscribe({
        next: (res) => {
          this.responseData.set(res);
          this.genProgress.set(100);
          this.genStatus.set('Generation complete!');
          this.genDone.set(true);
          this.videoUrl.set(this.api.toVideoUrl(res.outputPath));
          this.videoMetadata.set({
            title: res.metadata.title,
            createdAt: res.metadata.createdAt,
            status: res.metadata.status,
          });
          setTimeout(() => this.view.set('result'), 800);
        },
        error: (err) => {
          console.error('[GenerateFromVideo] Generation failed', err);
          const body = err.error;
          let msg = 'Generation failed';
          if (typeof body === 'string') msg = body;
          else if (body?.message) msg = body.message;
          else if (body?.error)
            msg = typeof body.error === 'string' ? body.error : body.message || msg;
          else if (err.message) msg = err.message;
          if (err.status) msg = `[${err.status}] ${msg}`;
          this.genError.set(msg);
          this.genStatus.set('Failed');
        },
      });
  }

  onSaveDraft() {
    if (!this.canGenerate()) return;

    this.savingDraft.set(true);
    this.api
      .createDraftFromVideo(this.selectedContentId, this.selectedBgVideoId, {
        audioId: this.selectedAudioId || undefined,
        theme: this.selectedTheme || undefined,
        channelId: this.selectedChannelId,
        publishedDate: this.publishDate || undefined,
        subscribeImageId: this.selectedSubscribeId || undefined,
      })
      .subscribe({
        next: () => {
          this.savingDraft.set(false);
          this.toast.show('Draft saved successfully', 'success');
        },
        error: (err) => {
          this.savingDraft.set(false);
          const body = err.error;
          let msg = 'Failed to save draft';
          if (typeof body === 'string') msg = body;
          else if (body?.message) msg = body.message;
          else if (err.message) msg = err.message;
          if (err.status) msg = `[${err.status}] ${msg}`;
          this.toast.show(msg, 'error');
        },
      });
  }

  retryGenerate() {
    this.genError.set(null);
    this.genDone.set(false);
    this.genProgress.set(0);
    this.view.set('form');
  }

  resetForm() {
    this.selectedContentId = '';
    this.selectedBgVideoId = '';
    this.selectedAudioId = '';
    this.selectedSubscribeId = '';
    this.selectedTheme = '';
    this.selectedChannelId = '';
    this.publishDate = '';
    this.responseData.set(null);
    this.genError.set(null);
    this.genDone.set(false);
    this.view.set('form');
  }
}
