import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, MetadataItem, UpdateMetadataDto } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { StatusBadgeComponent } from '../../components/shared/status-badge/status-badge.component';

@Component({
  selector: 'app-video-metadata',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Video Metadata</h1>
          <p>Browse all generated video records with preview playback.</p>
        </div>
        <div class="header-count">{{ records().length }} video(s)</div>
      </header>

      @if (loading()) {
        <div class="loading">Loading metadata...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (records().length === 0) {
        <div class="empty">
          <span class="empty-icon">🎬</span>
          <p>No video metadata records found yet.</p>
          <a routerLink="/create" class="btn primary">Create your first video</a>
        </div>
      } @else {
        <div class="card-grid">
          @for (item of records(); track item.id) {
            @if (editing()?.id === item.id) {
              <div class="card editor" [formGroup]="form">
                <h3>Edit Metadata</h3>
                <div class="field">
                  <label>Title</label>
                  <input formControlName="title" />
                </div>
                <div class="field">
                  <label>Description</label>
                  <textarea formControlName="description" rows="3"></textarea>
                </div>
                <div class="row">
                  <div class="field">
                    <label>Tags (comma-separated)</label>
                    <input formControlName="tags" />
                  </div>
                  <div class="field">
                    <label>Category ID</label>
                    <input formControlName="category_id" />
                  </div>
                </div>
                <div class="row">
                  <div class="field">
                    <label>Language</label>
                    <input formControlName="default_language" />
                  </div>
                  <div class="field">
                    <label>Privacy</label>
                    <select formControlName="privacy_status">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="unlisted">Unlisted</option>
                    </select>
                  </div>
                </div>
                <div class="row">
                  <div class="field">
                    <label>Status</label>
                    <select formControlName="status">
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="scheduled">Scheduled</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>Publish At</label>
                    <input type="datetime-local" formControlName="publish_at" />
                  </div>
                </div>
                <div class="field checkbox">
                  <label>
                    <input type="checkbox" formControlName="self_declared_made_for_kids" />
                    Made for kids
                  </label>
                </div>
                <div class="actions">
                  <button type="button" class="btn ghost" (click)="cancelEdit()">Cancel</button>
                  <button type="button" class="btn primary" (click)="save()">Save</button>
                </div>
              </div>
            } @else {
              <div class="card">
                <div class="video-wrap">
                  <video controls preload="metadata" class="video-player">
                    <source [src]="videoUrl(item)" type="video/mp4" />
                  </video>
                </div>
                <div class="card-body">
                  <div class="card-header">
                    <h2 class="title">{{ item.title }}</h2>
                    <app-status-badge [status]="item.status" />
                  </div>
                  <p class="description">{{ item.description }}</p>
                  @if (item.tags.length) {
                    <div class="tags">
                      @for (tag of item.tags; track tag) {
                        <span class="tag">{{ tag }}</span>
                      }
                    </div>
                  }
                  <div class="meta-grid">
                    <div class="meta-item">
                      <span class="label">Language</span>
                      <span class="value">{{ item.default_language | uppercase }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="label">Privacy</span>
                      <span class="value">{{ item.privacy_status }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="label">Category</span>
                      <span class="value">{{ item.category_id }}</span>
                    </div>
                    <div class="meta-item">
                      <span class="label">Kids</span>
                      <span class="value">{{ item.self_declared_made_for_kids ? 'Yes' : 'No' }}</span>
                    </div>
                    @if (item.youtubeVideoId) {
                      <div class="meta-item">
                        <span class="label">YouTube</span>
                        <span class="value">Published</span>
                      </div>
                    }
                    <div class="meta-item">
                      <span class="label">Created</span>
                      <span class="value">{{ item.createdAt | date:'medium' }}</span>
                    </div>
                    @if (item.publish_at) {
                      <div class="meta-item">
                        <span class="label">Publish at</span>
                        <span class="value">{{ item.publish_at | date:'medium' }}</span>
                      </div>
                    }
                  </div>
                </div>
                <div class="card-footer">
                  @if (item.youtubeUrl) {
                    <a class="btn ghost" [href]="item.youtubeUrl" target="_blank" rel="noopener noreferrer">
                      View on YouTube
                    </a>
                  }
                  @if (isOwned(item)) {
                    <button class="btn ghost" (click)="startEdit(item)">Edit</button>
                    <button class="btn ghost danger" (click)="remove(item)">Delete</button>
                  }
                </div>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .header-count { font-size: 0.82rem; color: var(--muted); background: var(--border-subtle); border: 1px solid var(--border); border-radius: 9999px; padding: 0.35rem 0.9rem; white-space: nowrap; }
    .loading { color: var(--muted); font-style: italic; padding: 2rem; }
    .error { color: var(--danger); padding: 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 0.75rem; padding: 4rem 2rem; color: var(--muted); text-align: center; }
    .empty-icon { font-size: 2.5rem; }
    .empty p { margin: 0; font-style: italic; }
    .card-grid { columns: 2; column-gap: 1.2rem; }
    @media (max-width: 860px) { .card-grid { columns: 1; } }
    @media (min-width: 1400px) { .card-grid { columns: 3; } }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 1rem; overflow: hidden; transition: border-color 0.2s ease; break-inside: avoid; margin-bottom: 1.2rem; }
    .card:hover { border-color: var(--accent); }
    .video-wrap { background: #000; position: relative; }
    .video-player { width: 100%; display: block; outline: none; }
    .card-body { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 0.8rem; }
    .card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .title { font-size: 1.1rem; font-weight: 600; color: var(--text); margin: 0; line-height: 1.35; }
    .description { font-size: 0.88rem; color: var(--muted); line-height: 1.55; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag { background: var(--accent-weak); color: var(--accent); font-size: 0.75rem; font-weight: 500; padding: 0.2rem 0.6rem; border-radius: 9999px; border: 1px solid rgba(99,102,241,0.2); }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; padding-top: 0.2rem; border-top: 1px solid var(--border-subtle); }
    .meta-item { display: flex; flex-direction: column; gap: 0.1rem; }
    .label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em; }
    .value { font-size: 0.84rem; color: var(--text); }
    .card-footer { padding: 0.8rem 1.4rem; border-top: 1px solid var(--border-subtle); display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.84rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:hover { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover:not(:disabled) { background: var(--border-subtle); }
    .btn.ghost.danger { color: var(--danger); border-color: var(--danger); }
    .btn.ghost.danger:hover { background: rgba(239,68,68,0.15); }

    .editor { padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; }
    .editor h3 { margin: 0 0 0.25rem; color: var(--text); font-size: 1.1rem; }
    .editor input, .editor textarea, .editor select { width: 100%; background: var(--border-subtle); border: 1px solid var(--border); color: var(--text); padding: 0.55rem 0.85rem; border-radius: 0.55rem; font-size: 0.88rem; box-sizing: border-box; }
    .editor textarea { resize: vertical; font-family: inherit; }
    .field { display: flex; flex-direction: column; gap: 0.3rem; }
    .field label { font-size: 0.78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .checkbox label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; text-transform: none; font-size: 0.85rem; color: var(--text); }
    .checkbox input { width: auto; }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
  `]
})
export class VideoMetadataComponent implements OnInit {
  records = signal<MetadataItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editing = signal<MetadataItem | null>(null);
  saving = signal(false);
  form: ReturnType<typeof this.fb.group>;

  currentUserId = signal<string>('');

  constructor(
    private readonly api: ApiService,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
  ) {
    const user = this.auth.getCurrentUser();
    if (user) this.currentUserId.set(user.id);
    this.form = this.fb.group({
      title: [''],
      description: [''],
      tags: [''],
      category_id: [''],
      default_language: [''],
      privacy_status: ['private'],
      status: ['draft'],
      publish_at: [''],
      self_declared_made_for_kids: [false],
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
  }

  private loadMetadata(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMetadata().subscribe({
      next: (items) => {
        this.records.set(items as MetadataItem[]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to load metadata');
        this.loading.set(false);
      },
    });
  }

  videoUrl(item: MetadataItem): string {
    return this.api.toVideoUrl(item.output_video_path);
  }

  startEdit(item: MetadataItem): void {
    this.editing.set(item);
    this.form.reset({
      title: item.title,
      description: item.description,
      tags: item.tags?.join(', ') ?? '',
      category_id: item.category_id,
      default_language: item.default_language,
      privacy_status: item.privacy_status,
      status: item.status,
      publish_at: item.publish_at ? item.publish_at.slice(0, 16) : '',
      self_declared_made_for_kids: item.self_declared_made_for_kids,
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  isOwned(item: MetadataItem): boolean {
    return item.userId === this.currentUserId();
  }

  remove(item: MetadataItem): void {
    if (!confirm(`Delete metadata for "${item.title}"?`)) return;
    this.api.deleteMetadataItem(item.id).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.id !== item.id));
      },
      error: (err) => console.error('Failed to delete metadata', err),
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const raw = this.form.getRawValue();
    const payload: UpdateMetadataDto = {
      title: raw.title || undefined,
      description: raw.description || undefined,
      tags: raw.tags ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
      category_id: raw.category_id || undefined,
      default_language: raw.default_language || undefined,
      privacy_status: raw.privacy_status || undefined,
      status: raw.status || undefined,
      publish_at: raw.publish_at ? new Date(raw.publish_at).toISOString() : undefined,
      self_declared_made_for_kids: raw.self_declared_made_for_kids,
    };

    const item = this.editing()!;
    this.saving.set(true);
    this.api.updateMetadataItem(item.id, payload).subscribe({
      next: (updated) => {
        this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.editing.set(null);
        this.saving.set(false);
      },
      error: (err) => {
        console.error('Failed to update metadata', err);
        this.saving.set(false);
      },
    });
  }
}
