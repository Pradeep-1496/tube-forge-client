import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, AudioAsset } from '../../services/api.service';

@Component({
  selector: 'app-audios',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Audio Library</h1>
        <p>Manage audio tracks used in video generation.</p>
      </header>

      <section class="list">
        <div class="uploader">
          <input type="file" accept="audio/*" #fileInput />
          <button class="btn primary" (click)="upload(fileInput)" [disabled]="uploading()">
            {{ uploading() ? 'Uploading…' : 'Upload Audio' }}
          </button>
        </div>

        <div class="grid">
          @for (audio of audios(); track audio.id) {
            <article class="audio-card">
              <div class="icon">🎵</div>
              <div class="info">
                <div class="name">{{ audio.name }}</div>
                <small>{{ audio.category }} · {{ audio.mimeType }}</small>
                @if (audio.sizeBytes) {
                  <small class="size">{{ (audio.sizeBytes / 1024).toFixed(1) }} KB</small>
                }
              </div>
              <div class="actions">
                <button class="btn sm danger ghost" (click)="remove(audio)">Delete</button>
              </div>
            </article>
          }
          @if (!audios().length) {
            <div class="notice">No audio files yet.</div>
          }
        </div>
      </section>
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.4rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }
    .audio-card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem; display: flex; align-items: center; gap: 0.75rem; }
    .icon { font-size: 1.5rem; flex-shrink: 0; }
    .info { flex: 1; display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .size { font-family: monospace; }
    .actions { flex-shrink: 0; }
    .uploader { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }
    .uploader input[type="file"] { color: var(--muted); font-size: 0.85rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; grid-column: 1 / -1; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class AudiosComponent implements OnInit {
  audios = signal<AudioAsset[]>([]);
  uploading = signal(false);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadAudios();
  }

  private loadAudios() {
    this.api.getAudios().subscribe({ next: (items) => this.audios.set(items) });
  }

  upload(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadAudio(file).subscribe({
      next: () => { this.uploading.set(false); this.loadAudios(); input.value = ''; },
      error: () => { this.uploading.set(false); alert('Upload failed.'); },
    });
  }

  remove(audio: AudioAsset) {
    if (!confirm(`Delete "${audio.name}"?`)) return;
    this.api.deleteAudio(audio.id).subscribe({ next: () => this.loadAudios() });
  }
}
