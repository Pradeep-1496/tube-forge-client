import { Component, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-video-result',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="result">
      @if (videoUrl()) {
        <div class="player">
          <video controls autoplay class="video-player" #videoPlayer>
            <source [src]="videoUrl()" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      } @else {
        <div class="no-video">
          <span class="icon">🎬</span>
          <p>No video available yet.</p>
        </div>
      }

      <div class="metadata" *ngIf="metadata() as meta">
        <h3>Details</h3>
        <div class="meta-grid">
          @if (meta['title']) {
            <div class="meta-item"><span class="label">Title</span><span class="value">{{ meta['title'] }}</span></div>
          }
          @if (meta['duration']) {
            <div class="meta-item"><span class="label">Duration</span><span class="value">{{ meta['duration'] }}</span></div>
          }
          @if (meta['size']) {
            <div class="meta-item"><span class="label">Size</span><span class="value">{{ meta['size'] }}</span></div>
          }
          @if (meta['createdAt']) {
            <div class="meta-item"><span class="label">Created</span><span class="value">{{ meta['createdAt'] | date:'medium' }}</span></div>
          }
        </div>
      </div>

      @if (videoUrl()) {
        <div class="actions">
          <a class="btn primary" [href]="videoUrl()" download="generated-video.mp4">Download Video</a>
        </div>
      }
    </div>
  `,
  styles: [`
    .result { display: flex; flex-direction: column; gap: 1.2rem; }
    .player { background: #000; border-radius: 0.9rem; overflow: hidden; }
    .video-player { width: 100%; display: block; max-height: 500px; }
    .no-video { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 3rem; color: var(--muted); text-align: center; }
    .no-video .icon { font-size: 2.5rem; }
    .no-video p { margin: 0; font-style: italic; }
    .metadata { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.2rem 1.4rem; }
    .metadata h3 { margin: 0 0 0.8rem; color: var(--text); font-size: 0.95rem; }
    .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; }
    .meta-item { display: flex; flex-direction: column; gap: 0.15rem; }
    .label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; font-weight: 600; }
    .value { font-size: 0.88rem; color: var(--text); }
    .actions { display: flex; gap: 0.6rem; }
    .btn { display: inline-flex; align-items: center; padding: 0.55rem 1.2rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.88rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:hover { filter: brightness(1.1); }
  `]
})
export class VideoResultComponent {
  videoUrl = input<string>('');
  metadata = input<Record<string, string> | null>(null);
}
