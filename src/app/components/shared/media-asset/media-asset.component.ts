import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-media-asset',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="media-wrap" [class.has-label]="!!label()" [class.aspect-9-16]="aspect() === '9/16'" [class.aspect-16-9]="aspect() === '16/9'" [class.aspect-4-3]="aspect() === '4/3'">
      @if (loading()) {
        <div class="skeleton-overlay" [class.skeleton-round]="type() === 'audio'">
          <span class="skeleton-pulse"></span>
        </div>
      }

      @if (type() === 'image') {
        <img
          [src]="src()"
          [alt]="alt()"
          loading="lazy"
          (load)="loading.set(false)"
          (error)="onError()"
        />
      }

      @if (type() === 'video') {
        <video
          [src]="src()"
          [attr.aria-label]="alt()"
          muted
          preload="metadata"
          controls
          (loadedmetadata)="loading.set(false)"
          (error)="onError()"
        ></video>
      }

      @if (type() === 'audio') {
        <audio
          [src]="src()"
          [attr.aria-label]="label() || alt()"
          preload="metadata"
          controls
          [class.hidden]="loading() || errored()"
          (loadedmetadata)="loading.set(false)"
          (error)="onError()"
        ></audio>
      }

      @if (errored()) {
        <div class="fallback">
          <span class="fallback-icon">
            {{ type() === 'audio' ? '🎵' : type() === 'video' ? '🎬' : '🖼' }}
          </span>
          <span class="fallback-text">{{ label() || 'Failed to load' }}</span>
        </div>
      }

      @if (label() && !errored() && !loading()) {
        <span class="media-label">{{ label() }}</span>
      }
    </div>
  `,
  styles: [`
    .media-wrap { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.35rem; }
    .media-wrap.has-label { gap: 0.5rem; }
    .media-wrap.aspect-9-16 { aspect-ratio: 9/16; }
    .media-wrap.aspect-16-9 { aspect-ratio: 16/9; }
    .media-wrap.aspect-4-3 { aspect-ratio: 4/3; }
    img, video { width: 100%; height: 100%; object-fit: cover; display: block; border-radius: inherit; transition: opacity 0.25s; }
    .media-wrap.aspect-9-16 video { object-fit: contain; }
    audio { width: 100%; }
    audio.hidden { display: none; }
    audio::-webkit-media-controls-panel { background: var(--border-subtle); }
    .skeleton-overlay { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; pointer-events: none; }
    .skeleton-round { border-radius: 50%; }
    .skeleton-pulse { width: 100%; height: 100%; background: var(--border); border-radius: inherit; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
    .fallback { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.3rem; padding: 1rem; color: var(--muted); z-index: 3; background: var(--bg); }
    .fallback-icon { font-size: 1.5rem; }
    .fallback-text { font-size: 0.78rem; text-align: center; }
    .media-label { font-size: 0.78rem; color: var(--muted); text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; position: relative; z-index: 4; }
  `]
})
export class MediaAssetComponent {
  type = input.required<'image' | 'video' | 'audio'>();
  src = input.required<string>();
  alt = input('');
  label = input('');
  aspect = input<string | null>(null);

  loading = signal(true);
  errored = signal(false);

  onError() {
    this.loading.set(false);
    this.errored.set(true);
  }
}
