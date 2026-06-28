import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, MetadataItem } from '../../services/api.service';
import { StatusBadgeComponent } from '../../components/shared/status-badge/status-badge.component';

@Component({
  selector: 'app-video-metadata',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent],
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
            <div class="card">
              <div class="video-wrap">
                <video
                  controls
                  preload="metadata"
                  class="video-player"
                >
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
                    <span class="label">Visibility</span>
                    <span class="value">{{ item.visibility }}</span>
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
                <a
                  *ngIf="item.youtubeUrl"
                  class="btn ghost"
                  [href]="item.youtubeUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View on YouTube
                </a>
                <a class="btn ghost" [href]="videoUrl(item)" download="{{ item.file_name }}">
                  Download
                </a>
                <button class="btn ghost" disabled title="Edit coming soon">
                  Edit
                </button>
              </div>
            </div>
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

    .card-grid { display: flex; flex-direction: column; gap: 1.5rem; }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 1rem;
      overflow: hidden;
      transition: border-color 0.2s ease;
    }
    .card:hover { border-color: var(--accent); }

    .video-wrap {
      background: #000;
      position: relative;
    }
    .video-player {
      width: 100%;
      display: block;
      max-height: 560px;
      outline: none;
    }

    .card-body { padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 0.8rem; }

    .card-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .title { font-size: 1.1rem; font-weight: 600; color: var(--text); margin: 0; line-height: 1.35; }

    .description { font-size: 0.88rem; color: var(--muted); line-height: 1.55; margin: 0; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

    .tags { display: flex; flex-wrap: wrap; gap: 0.4rem; }
    .tag {
      background: var(--accent-weak);
      color: var(--accent);
      font-size: 0.75rem;
      font-weight: 500;
      padding: 0.2rem 0.6rem;
      border-radius: 9999px;
      border: 1px solid rgba(99,102,241,0.2);
    }

    .meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.5rem; padding-top: 0.2rem; border-top: 1px solid var(--border-subtle); }
    .meta-item { display: flex; flex-direction: column; gap: 0.1rem; }
    .label { font-size: 0.7rem; color: var(--muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.04em; }
    .value { font-size: 0.84rem; color: var(--text); }

    .card-footer {
      padding: 0.8rem 1.4rem;
      border-top: 1px solid var(--border-subtle);
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn { display: inline-flex; align-items: center; padding: 0.5rem 1rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.84rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:hover { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover:not(:disabled) { background: var(--border-subtle); }
    .btn.ghost:disabled { opacity: 0.4; cursor: not-allowed; }
  `]
})
export class VideoMetadataComponent implements OnInit {
  records = signal<MetadataItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(private readonly api: ApiService) {}

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
}
