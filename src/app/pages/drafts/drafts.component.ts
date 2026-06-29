import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, DraftVideo } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-drafts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Draft Videos</h1>
          <p>Saved drafts created from video content. Generate a video from any draft.</p>
        </div>
      </header>

      @if (loading()) {
        <div class="loading">Loading drafts...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (drafts().length === 0) {
        <div class="empty">
          <span class="empty-icon">📝</span>
          <p>No draft videos found.</p>
          <a routerLink="/generate-from-video" class="btn primary">Create from Video</a>
        </div>
      } @else {
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="col-title">Title</th>
                <th class="col-theme">Theme</th>
                <th class="col-audio">Audio</th>
                <th class="col-status">Status</th>
                <th class="col-date">Created</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (draft of drafts(); track draft.id) {
                <tr>
                  <td class="col-title">
                    <span class="cell-title">{{ draft.title || 'Untitled' }}</span>
                  </td>
                  <td class="col-theme">
                    <span class="theme-tag">{{ draft.theme || '—' }}</span>
                  </td>
                  <td class="col-audio">
                    <span class="cell-audio">{{ draft.audio?.name || '—' }}</span>
                  </td>
                  <td class="col-status">{{ draft.status }}</td>
                  <td class="col-date">{{ draft.createdAt | date:'short' }}</td>
                  <td class="col-actions">
                    <div class="row-actions">
                      <button class="btn row-btn" (click)="viewDraft(draft)" title="View">👁</button>
                      <button class="btn row-btn generate" (click)="generateFromDraft(draft)" [disabled]="generatingId() === draft.id" title="Generate video">
                        {{ generatingId() === draft.id ? '...' : '▶' }}
                      </button>
                      <button class="btn row-btn danger" (click)="deleteDraft(draft)" title="Delete">✕</button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>

    @if (viewingDraft(); as draft) {
      <div class="modal-overlay" (click)="closeView()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ draft.title || 'Untitled' }}</h2>
            <button class="modal-close" (click)="closeView()">&times;</button>
          </div>
          <div class="modal-body">
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Content ID</span>
                <span class="detail-value mono">{{ draft.contentId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Background Video ID</span>
                <span class="detail-value mono">{{ draft.backgroundVideoId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Channel ID</span>
                <span class="detail-value mono">{{ draft.channelId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Theme</span>
                <span class="detail-value">{{ draft.theme || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Audio</span>
                <span class="detail-value">{{ draft.audio?.name || draft.audioId || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Subscribe Image</span>
                <span class="detail-value">{{ draft.subscribeImage?.name || draft.subscribeImageId || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Published Date</span>
                <span class="detail-value">{{ (draft.publishedAt | date:'medium') || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status</span>
                <span class="detail-value">{{ draft.status }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Visibility</span>
                <span class="detail-value">{{ draft.visibility || '—' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Created</span>
                <span class="detail-value">{{ draft.createdAt | date:'medium' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Updated</span>
                <span class="detail-value">{{ draft.updatedAt | date:'medium' }}</span>
              </div>
            </div>
            @if (draft.content) {
              <div class="detail-section">
                <span class="detail-label">Content</span>
                <div class="content-preview" [innerHTML]="draft.content"></div>
              </div>
            }
          </div>
          <div class="modal-actions">
            <button class="btn ghost" (click)="closeView()">Close</button>
            <button class="btn primary" (click)="closeView(); generateFromDraft(draft)" [disabled]="generatingId() === draft.id">
              {{ generatingId() === draft.id ? 'Generating...' : 'Generate Video' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.2rem 0 0; font-size: 0.85rem; }

    .loading { color: var(--muted); font-style: italic; padding: 2rem; font-size: 0.9rem; }
    .error { color: var(--danger); padding: 0.8rem 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; font-size: 0.85rem; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding: 3rem 2rem; color: var(--muted); text-align: center; }
    .empty-icon { font-size: 2rem; }
    .empty p { margin: 0; font-style: italic; font-size: 0.88rem; }

    .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .table thead { background: var(--border-subtle); }
    .table th { text-align: left; padding: 0.55rem 0.7rem; font-size: 0.72rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); white-space: nowrap; }
    .table td { padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
    .table tbody tr:hover { background: var(--accent-weak); }
    .table tbody tr:last-child td { border-bottom: none; }

    .col-title { min-width: 160px; }
    .col-theme { width: 100px; }
    .col-audio { width: 100px; }
    .col-status { width: 80px; }
    .col-date { width: 130px; white-space: nowrap; }
    .col-actions { width: 120px; }

    .cell-title { color: var(--text); font-weight: 600; }
    .cell-audio { color: var(--muted); font-size: 0.8rem; }
    .theme-tag { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 9999px; background: var(--border-subtle); border: 1px solid var(--border); text-transform: capitalize; }

    .row-actions { display: flex; gap: 0.15rem; }
    .row-btn { display: inline-flex; align-items: center; justify-content: center; width: 1.8rem; height: 1.8rem; border-radius: 0.35rem; background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; cursor: pointer; text-decoration: none; transition: all 0.12s ease; }
    .row-btn:hover { background: var(--border-subtle); color: var(--text); }
    .row-btn.danger:hover { background: rgba(239,68,68,0.12); color: var(--danger); border-color: var(--danger); }
    .row-btn.generate { color: var(--accent); }
    .row-btn.generate:hover { background: var(--accent-weak); border-color: var(--accent); }

    .btn.primary { display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; border-radius: 0.45rem; font-weight: 600; font-size: 0.8rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.12s ease; background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn.ghost { display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; border-radius: 0.45rem; font-weight: 600; font-size: 0.8rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.12s ease; background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }

    .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.15s ease; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 0.9rem; max-width: 640px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; animation: scaleIn 0.15s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid var(--border-subtle); }
    .modal-header h2 { margin: 0; font-size: 1.05rem; color: var(--text); }
    .modal-close { background: none; border: none; color: var(--muted); font-size: 1.4rem; cursor: pointer; line-height: 1; padding: 0; }
    .modal-close:hover { color: var(--text); }
    .modal-body { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 1rem; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 0.8rem 1.2rem; border-top: 1px solid var(--border-subtle); }

    .detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 1.2rem; }
    .detail-item { display: flex; flex-direction: column; gap: 0.1rem; }
    .detail-label { font-size: 0.7rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .detail-value { font-size: 0.85rem; color: var(--text); }
    .detail-value.mono { font-family: monospace; font-size: 0.78rem; word-break: break-all; }

    .detail-section { display: flex; flex-direction: column; gap: 0.3rem; }
    .content-preview { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0.8rem 1rem; font-size: 0.82rem; color: var(--text); line-height: 1.5; }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    @media (max-width: 600px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DraftsComponent implements OnInit {
  drafts = signal<DraftVideo[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  generatingId = signal<string | null>(null);
  viewingDraft = signal<DraftVideo | null>(null);

  constructor(
    private readonly api: ApiService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {}

  ngOnInit() {
    this.loadDrafts();
  }

  private loadDrafts() {
    this.loading.set(true);
    this.error.set(null);
    this.api.getDraftVideos().subscribe({
      next: (items) => {
        this.drafts.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to load drafts');
        this.loading.set(false);
      },
    });
  }

  generateFromDraft(draft: DraftVideo) {
    this.generatingId.set(draft.id);
    this.api
      .generateFromVideo(draft.contentId, draft.backgroundVideoId, {
        audioId: draft.audioId || undefined,
        theme: draft.theme || undefined,
        channelId: draft.channelId,
        publishedDate: draft.publishedAt || undefined,
        subscribeImageId: draft.subscribeImageId || undefined,
      })
      .subscribe({
        next: (res) => {
          this.generatingId.set(null);
          this.toast.show('Video generation started', 'success');
          this.router.navigate(['/generation', res.metadata.id]);
        },
        error: (err) => {
          this.generatingId.set(null);
          const body = err.error;
          let msg = 'Failed to generate video';
          if (typeof body === 'string') msg = body;
          else if (body?.message) msg = body.message;
          else if (err.message) msg = err.message;
          if (err.status) msg = `[${err.status}] ${msg}`;
          this.toast.show(msg, 'error');
        },
      });
  }

  viewDraft(draft: DraftVideo) {
    this.viewingDraft.set(draft);
  }

  closeView() {
    this.viewingDraft.set(null);
  }

  deleteDraft(draft: DraftVideo) {
    if (!confirm(`Delete this draft?`)) return;
    this.api.deleteDraftVideo(draft.id).subscribe({
      next: () => {
        this.drafts.update((list) => list.filter((d) => d.id !== draft.id));
        this.toast.show('Draft deleted', 'success');
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to delete draft', 'error');
      },
    });
  }
}
