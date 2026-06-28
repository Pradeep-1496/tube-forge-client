import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, BackgroundAsset, BackgroundVideo } from '../../services/api.service';

@Component({
  selector: 'app-backgrounds',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Backgrounds</h1>
        <p>Manage background images and videos for video generation.</p>
      </header>

      <div class="tabs">
        <button class="tab" [class.active]="tab() === 'images'" (click)="tab.set('images')">Images</button>
        <button class="tab" [class.active]="tab() === 'videos'" (click)="tab.set('videos')">Videos</button>
      </div>

      @if (tab() === 'images') {
        <section class="list">
          <div class="uploader">
            <input type="file" accept="image/*" #imgInput />
            <button class="btn primary" (click)="uploadImage(imgInput)" [disabled]="uploading()">
              {{ uploading() ? 'Uploading…' : 'Upload Image' }}
            </button>
          </div>
          <div class="grid">
            @for (bg of backgrounds(); track bg.id) {
              <article class="card" [class.inactive]="!bg.isActive">
                <div class="thumb"><img [src]="bg.filePath" [alt]="bg.name" /></div>
                <div class="info">
                  <div class="name">{{ bg.name }}</div>
                  <small>{{ bg.category }} · {{ bg.mimeType }}</small>
                </div>
                <div class="actions">
                  <button class="btn sm danger ghost" (click)="removeBg(bg)">Delete</button>
                </div>
              </article>
            }
            @if (!backgrounds().length) {
              <div class="notice">No background images yet.</div>
            }
          </div>
        </section>
      }

      @if (tab() === 'videos') {
        <section class="list">
          <div class="uploader">
            <input type="file" accept="video/*" #vidInput />
            <button class="btn primary" (click)="uploadVideo(vidInput)" [disabled]="uploading()">
              {{ uploading() ? 'Uploading…' : 'Upload Video' }}
            </button>
          </div>
          <div class="grid">
            @for (bv of bgVideos(); track bv.id) {
              <article class="card">
                <div class="vid-preview">
                  <video [src]="bv.filePath" muted preload="metadata"></video>
                </div>
                <div class="info">
                  <div class="name">{{ bv.name }}</div>
                  <small>{{ bv.category }} · {{ bv.mimeType }}</small>
                </div>
                <div class="actions">
                  <button class="btn sm danger ghost" (click)="removeVideo(bv)">Delete</button>
                </div>
              </article>
            }
            @if (!bgVideos().length) {
              <div class="notice">No background videos yet.</div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.4rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .tabs { display: flex; gap: 0.3rem; background: var(--border-subtle); border-radius: 0.55rem; padding: 0.25rem; width: fit-content; }
    .tab { background: transparent; border: none; color: var(--muted); padding: 0.5rem 1.2rem; border-radius: 0.45rem; font-weight: 500; font-size: 0.85rem; cursor: pointer; }
    .tab.active { background: var(--accent-weak); color: var(--text); }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .card.inactive { opacity: 0.5; }
    .thumb { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .vid-preview { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .vid-preview video { width: 100%; height: 100%; object-fit: cover; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .uploader { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }
    .uploader input[type="file"] { color: var(--muted); font-size: 0.85rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class BackgroundsComponent implements OnInit {
  tab = signal<'images' | 'videos'>('images');
  backgrounds = signal<BackgroundAsset[]>([]);
  bgVideos = signal<BackgroundVideo[]>([]);
  uploading = signal(false);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadBackgrounds();
    this.loadVideos();
  }

  private loadBackgrounds() {
    this.api.getBackgroundAssets().subscribe({ next: (items) => this.backgrounds.set(items) });
  }

  private loadVideos() {
    this.api.getBackgroundVideos().subscribe({ next: (items) => this.bgVideos.set(items) });
  }

  uploadImage(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadBackgroundAsset(file).subscribe({
      next: () => { this.uploading.set(false); this.loadBackgrounds(); input.value = ''; },
      error: () => { this.uploading.set(false); alert('Upload failed.'); },
    });
  }

  uploadVideo(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadBackgroundVideo(file).subscribe({
      next: () => { this.uploading.set(false); this.loadVideos(); input.value = ''; },
      error: () => { this.uploading.set(false); alert('Upload failed.'); },
    });
  }

  removeBg(bg: BackgroundAsset) {
    if (!confirm('Delete this background?')) return;
    this.api.deleteBackgroundAsset(bg.id).subscribe({ next: () => this.loadBackgrounds() });
  }

  removeVideo(bv: BackgroundVideo) {
    if (!confirm('Delete this background video?')) return;
    this.api.deleteBackgroundVideo(bv.id).subscribe({ next: () => this.loadVideos() });
  }
}
