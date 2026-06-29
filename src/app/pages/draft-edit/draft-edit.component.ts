import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService, DraftVideo } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';
import {
  AppSelectComponent,
  SelectOption,
} from '../../components/shared/app-select/app-select.component';

@Component({
  selector: 'app-draft-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, AppSelectComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Edit Draft</h1>
        <p>{{ draft()?.content?.title || 'Untitled' }}</p>
      </header>

      @if (loading()) {
        <div class="loading">Loading draft...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else {
        <div class="form-card">
          <div class="form-grid">
            <div class="field">
              <label class="field-label">Content</label>
              <span class="field-value">{{ draft()?.content?.title || draft()?.contentId }}</span>
            </div>

            <app-select
              label="Background Video"
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
              <label class="field-label">Published Date</label>
              <input type="datetime-local" class="field-input" [(ngModel)]="publishDate" />
            </div>
          </div>

          <div class="form-actions">
            <button class="btn ghost" (click)="cancel()">Cancel</button>
            <button class="btn primary" (click)="onSave()" [disabled]="saving()">
              {{ saving() ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }

    .loading { color: var(--muted); font-style: italic; padding: 2rem; font-size: 0.9rem; }
    .error { color: var(--danger); padding: 0.8rem 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; font-size: 0.85rem; }

    .form-card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.4rem; display: flex; flex-direction: column; gap: 1.4rem; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    @media (max-width: 700px) { .form-grid { grid-template-columns: 1fr; } }

    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field-label { font-size: 0.82rem; color: var(--muted); font-weight: 500; }
    .field-value { font-size: 0.9rem; color: var(--text); padding: 0.6rem 0; }
    .field-input { background: var(--border-subtle); border: 1px solid var(--border); color: var(--text); padding: 0.6rem 0.85rem; border-radius: 0.55rem; font-size: 0.9rem; font-family: inherit; transition: border-color 0.15s, box-shadow 0.15s; }
    .field-input:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--ring); }

    .form-actions { display: flex; justify-content: flex-end; gap: 0.6rem; }

    .btn { padding: 0.55rem 1.2rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.88rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
  `]
})
export class DraftEditComponent implements OnInit {
  draft = signal<DraftVideo | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  selectedBgVideoId = '';
  selectedAudioId = '';
  selectedSubscribeId = '';
  selectedTheme = '';
  selectedChannelId = '';
  publishDate = '';

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

  private draftId = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly api: ApiService,
    private readonly toast: ToastService,
  ) {}

  ngOnInit() {
    this.draftId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.draftId) {
      this.error.set('No draft ID provided');
      this.loading.set(false);
      return;
    }
    this.loadDraft();
    this.loadReferenceData();
  }

  private loadDraft() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDraftVideos().subscribe({
      next: (items) => {
        const draft = items.find((d) => d.id === this.draftId);
        if (!draft) {
          this.error.set('Draft not found (already deleted?)');
          this.loading.set(false);
          return;
        }
        this.draft.set(draft);
        this.selectedBgVideoId = draft.backgroundVideoId || '';
        this.selectedTheme = draft.theme || '';
        this.selectedAudioId = draft.audioId || '';
        this.selectedSubscribeId = draft.subscribeImageId || '';
        this.selectedChannelId = draft.channelId || '';
        this.publishDate = draft.publishedAt ? draft.publishedAt.slice(0, 16) : '';
        this.loading.set(false);
      },
      error: (err) => {
        const status = err.status;
        if (status === 403) this.error.set("You don't have permission to view this draft");
        else if (status === 404) this.error.set('Draft not found (already deleted?)');
        else this.error.set(err?.error?.message || err?.message || 'Failed to load draft');
        this.loading.set(false);
      },
    });
  }

  private loadReferenceData() {
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

  onSave() {
    this.saving.set(true);
    const payload: {
      theme?: string;
      backgroundId?: string;
      audioId?: string;
      subscribeImageId?: string;
      channelId?: string;
      publishedDate?: string;
    } = {};

    if (this.selectedTheme) payload.theme = this.selectedTheme;
    if (this.selectedBgVideoId) payload.backgroundId = this.selectedBgVideoId;
    if (this.selectedAudioId) payload.audioId = this.selectedAudioId;
    if (this.selectedSubscribeId) payload.subscribeImageId = this.selectedSubscribeId;
    if (this.selectedChannelId) payload.channelId = this.selectedChannelId;
    if (this.publishDate) payload.publishedDate = new Date(this.publishDate).toISOString();

    this.api.updateDraftVideo(this.draftId, payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Draft updated', 'success');
        this.router.navigate(['/drafts']);
      },
      error: (err) => {
        this.saving.set(false);
        const status = err.status;
        const body = err.error;
        let msg = 'Failed to update draft';
        if (status === 403) msg = "You don't have permission to update this draft";
        else if (status === 404) msg = 'Draft not found (already deleted?)';
        else if (status === 400) msg = body?.message || body?.error || 'Invalid data';
        else if (typeof body === 'string') msg = body;
        else if (body?.message) msg = body.message;
        else if (err.message) msg = err.message;
        if (status) msg = `[${status}] ${msg}`;
        this.toast.show(msg, 'error');
      },
    });
  }

  cancel() {
    this.router.navigate(['/drafts']);
  }
}
