import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AudioService } from '../../services/asset.service';
import { MediaAssetComponent } from '../../components/shared/media-asset/media-asset.component';
import { AssetUploadFormComponent } from '../../components/shared/asset-upload-form/asset-upload-form.component';

@Component({
  selector: 'app-audios',
  standalone: true,
  imports: [CommonModule, MediaAssetComponent, AssetUploadFormComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Audio Library</h1>
        <p>Manage audio tracks used in video generation.</p>
      </header>

      <app-asset-upload-form
        accept="audio/*"
        [showTypeField]="false"
        [uploadFn]="audioService.upload.bind(audioService)"
        (uploaded)="audioService.load()"
      />

      <section class="list">
        @if (audioService.loading$()) {
          <div class="loading-grid">
            @for (_ of [1,2,3]; track _) {
              <div class="audio-card">
                <div class="skeleton-pulse"></div>
              </div>
            }
          </div>
        } @else {
          <div class="grid">
            @for (audio of audioService.items$(); track audio.audio_id) {
              <article class="audio-card">
                <div class="player-wrap">
                  <app-media-asset
                    type="audio"
                    [src]="audioService.getSrc(audio)"
                    [label]="audio.name"
                  />
                </div>
                <div class="info">
                  <div class="name">{{ audio.name }}</div>
                  <small>{{ audio.length }}s{{ audio.visibility ? ' · ' + audio.visibility : '' }}</small>
                  @if (audio.size) {
                    <small class="size">{{ (audio.size / 1024).toFixed(1) }} KB</small>
                  }
                </div>
                <div class="actions">
                  <button class="btn sm danger ghost" (click)="remove(audio)">Delete</button>
                </div>
              </article>
            }
            @if (!audioService.items$().length) {
              <div class="notice">No audio files yet.</div>
            }
          </div>
        }
      </section>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.4rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }
    .skeleton-pulse { width: 100%; height: 60px; background: var(--border); border-radius: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.85rem; }
    .audio-card {
      background: var(--surface);
      border: 1px solid var(--border-subtle);
      border-radius: 0.75rem;
      overflow: hidden;
      transition: border-color 0.15s ease;
    }
    .audio-card:hover { border-color: var(--border); }
    .player-wrap { background: var(--border-subtle); padding: 0.5rem; }
    .player-wrap audio { width: 100%; height: 40px; }
    .info { padding: 0.6rem 0.75rem; display: flex; flex-direction: column; gap: 0.1rem; }
    .name { font-size: 0.85rem; font-weight: 600; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .info small { font-size: 0.72rem; color: var(--muted); }
    .size { display: block; }
    .actions { padding: 0 0.75rem 0.6rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.sm { padding: 0.25rem 0.6rem; font-size: 0.75rem; border-radius: 0.4rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class AudiosComponent implements OnInit {
  uploading = false;

  constructor(readonly audioService: AudioService) {}

  ngOnInit() {
    this.audioService.load();
  }

  remove(audio: any) {
    if (!confirm(`Delete "${audio.name}"?`)) return;
    this.audioService.remove(audio.audio_id);
  }
}
