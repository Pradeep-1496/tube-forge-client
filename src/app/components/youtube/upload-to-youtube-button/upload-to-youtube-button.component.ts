import { Component, input, output, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-upload-to-youtube-button',
  standalone: true,
  imports: [RouterLink],
  template: `
    @if (hasChannel()) {
      @if (status() === 'uploaded') {
        <div class="uploaded-info">
          <span class="badge uploaded">Uploaded</span>
          @if (youtubeUrl()) {
            <a [href]="youtubeUrl()" target="_blank" class="youtube-link" rel="noopener noreferrer">
              View on YouTube ↗
            </a>
          }
        </div>
      } @else if (canUpload()) {
        <button class="btn primary" [disabled]="uploading()" (click)="upload()">
          @if (uploading()) {
            Uploading…
          } @else {
            Upload to YouTube
          }
        </button>
      } @else if (!outputVideoPath()) {
        <div class="warning">
          Generate the video first before uploading
        </div>
      }
    } @else {
      <div class="warning">
        Connect YouTube first —
        <a routerLink="/youtube/connect" class="link">Connect now</a>
      </div>
    }
  `,
  styles: [`
    :host { display: block; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.6rem 1.2rem; border-radius: 0.55rem;
      font-size: 0.88rem; font-weight: 600;
      border: none; cursor: pointer;
      transition: all 0.15s ease;
    }
    .btn.primary {
      background: #c7362a; color: #fff;
    }
    .btn.primary:hover:not(:disabled) {
      background: #d94a3a;
    }
    .btn:disabled {
      opacity: 0.6; cursor: not-allowed;
    }
    .warning {
      padding: 0.75rem 1rem;
      background: rgba(232,184,75,0.12);
      border: 1px solid rgba(232,184,75,0.25);
      border-radius: 0.55rem;
      color: #e8b84b;
      font-size: 0.85rem;
    }
    .link {
      color: inherit;
      text-decoration: underline;
      cursor: pointer;
    }
    .uploaded-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .badge {
      padding: 0.35rem 0.85rem; border-radius: 9999px;
      font-size: 0.78rem; font-weight: 600;
    }
    .badge.uploaded {
      background: rgba(58,170,136,0.12); color: #5dd4ae; border-color: rgba(58,170,136,0.25);
    }
    .youtube-link {
      font-size: 0.88rem;
      color: #93b8f8;
      text-decoration: none;
      font-weight: 500;
    }
    .youtube-link:hover {
      text-decoration: underline;
    }
  `],
})
export class UploadToYoutubeButtonComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private router = inject(Router);

  metadataId = input.required<string>();
  status = input<string>('');
  outputVideoPath = input<string | null>('');
  hasChannel = input<boolean>(false);
  youtubeUrl = input<string | null>('');

  uploaded = output<{ videoId: string; youtubeUrl: string }>();

  protected uploading = signal(false);

  protected canUpload(): boolean {
    const s = this.status();
    return (s === 'draft' || s === 'generated' || s === 'scheduled') && !!this.outputVideoPath();
  }

  upload(): void {
    if (!this.canUpload()) return;
    this.uploading.set(true);
    this.api.uploadToYoutubeByMetadata(this.metadataId()).subscribe({
      next: (r) => {
        this.uploading.set(false);
        this.toast.show('Video uploaded to YouTube!', 'success');
        this.uploaded.emit({ videoId: r.videoId, youtubeUrl: r.youtubeUrl });
      },
      error: (err) => {
        this.uploading.set(false);
        if (err.status === 400) {
          const msg = err.error?.message || '';
          if (msg.includes('channel')) {
            this.toast.show('Connect YouTube channel first', 'error');
            this.router.navigate(['/youtube/connect']);
          } else if (msg.includes('video')) {
            this.toast.show('Generate the video first', 'error');
          } else {
            this.toast.show(msg, 'error');
          }
        } else if (err.status === 404) {
          this.toast.show('Video not found', 'error');
        } else if (err.status === 401) {
          this.toast.show('Reconnect YouTube', 'error');
          this.router.navigate(['/youtube/connect']);
        } else {
          this.toast.show('Upload failed', 'error');
        }
      },
    });
  }
}
