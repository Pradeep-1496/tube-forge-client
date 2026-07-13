import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ApiService, MetadataItem, YouTubeChannel } from '../../../services/api.service';
import { StatusBadgeComponent } from '../../../components/shared/status-badge/status-badge.component';
import { UploadToYoutubeButtonComponent } from '../../../components/youtube/upload-to-youtube-button/upload-to-youtube-button.component';

@Component({
  selector: 'app-metadata-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, UploadToYoutubeButtonComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <a routerLink="/video-metadata" class="back">← Back to Metadata</a>
          <h1>{{ metadata()?.title || 'Loading…' }}</h1>
        </div>
      </header>

      @if (loading()) {
        <div class="loading">Loading metadata…</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (metadata(); as m) {
        <div class="detail-grid">
          <section class="card info">
            <h3>Details</h3>
            <div class="row">
              <span class="label">Status</span>
              <app-status-badge [status]="m.status" />
            </div>
            <div class="row">
              <span class="label">Title</span>
              <span>{{ m.title }}</span>
            </div>
            <div class="row">
              <span class="label">Description</span>
              <span class="desc">{{ m.description || '—' }}</span>
            </div>
            <div class="row">
              <span class="label">File</span>
              <span>{{ m.file_name || '—' }}</span>
            </div>
            <div class="row">
              <span class="label">Privacy</span>
              <span>{{ m.privacy_status }}</span>
            </div>
            <div class="row">
              <span class="label">Language</span>
              <span>{{ m.default_language }}</span>
            </div>
            @if (m.tags.length) {
              <div class="row">
                <span class="label">Tags</span>
                <div class="tags">
                  @for (tag of m.tags; track tag) {
                    <span class="tag">{{ tag }}</span>
                  }
                </div>
              </div>
            }
          </section>

          <section class="card upload">
            <h3>Publish</h3>
            <app-upload-to-youtube-button
              [metadataId]="m.id"
              [status]="m.status"
              [outputVideoPath]="m.output_video_path"
              [hasChannel]="hasChannel()"
              [youtubeUrl]="m.youtubeUrl"
              (uploaded)="onUploaded($event, m)"
            />
          </section>
        </div>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header h1 { font-size: 1.5rem; font-weight: 700; color: var(--text); margin: 0.5rem 0 0; }
    .back {
      font-size: 0.85rem; color: var(--muted); text-decoration: none;
      display: inline-flex; align-items: center; gap: 0.3rem;
    }
    .back:hover { color: var(--accent); }
    .loading { color: var(--muted); padding: 2rem 0; text-align: center; }
    .error { color: #e8836a; padding: 1rem; background: rgba(224,72,58,0.1); border-radius: 0.55rem; }
    .detail-grid {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 1rem;
      align-items: start;
    }
    @media (max-width: 760px) {
      .detail-grid { grid-template-columns: 1fr; }
    }
    .card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1.4rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .card h3 { margin: 0; color: var(--text); font-size: 1rem; }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      font-size: 0.88rem;
      color: var(--text);
    }
    .label { color: var(--muted); flex-shrink: 0; min-width: 7rem; }
    .desc { word-break: break-word; color: var(--muted); font-size: 0.85rem; }
    .tags { display: flex; flex-wrap: wrap; gap: 0.3rem; }
    .tag {
      padding: 0.15rem 0.5rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 0.3rem;
      font-size: 0.75rem;
      color: var(--muted);
    }
  `],
})
export class MetadataDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private api = inject(ApiService);
  protected metadata = signal<MetadataItem | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected hasChannel = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('No metadata ID provided');
      this.loading.set(false);
      return;
    }
    this.loadMetadata(id);
    this.checkChannel();
  }

  private loadMetadata(id: string): void {
    this.api.getMetadataItem(id).subscribe({
      next: (m) => {
        this.metadata.set(m);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Failed to load metadata');
        this.loading.set(false);
      },
    });
  }

  private checkChannel(): void {
    this.api.getYouTubeChannels().subscribe({
      next: (chs) => this.hasChannel.set(chs.length > 0),
      error: () => this.hasChannel.set(false),
    });
  }

  protected onUploaded(result: { videoId: string; youtubeUrl: string }, m: MetadataItem): void {
    this.metadata.set({
      ...m,
      status: 'uploaded',
      youtubeVideoId: result.videoId,
      youtubeUrl: result.youtubeUrl,
    });
  }
}
