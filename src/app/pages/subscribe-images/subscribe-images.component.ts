import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, SubscribeImage } from '../../services/api.service';

@Component({
  selector: 'app-subscribe-images',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Subscribe Images</h1>
        <p>Manage subscribe overlay images for videos.</p>
      </header>

      <section class="list">
        <div class="uploader">
          <input type="file" accept="image/*" #fileInput />
          <button class="btn primary" (click)="upload(fileInput)" [disabled]="uploading()">
            {{ uploading() ? 'Uploading…' : 'Upload Image' }}
          </button>
        </div>

        <div class="grid">
          @for (img of images(); track img.id) {
            <article class="card" [class.inactive]="!img.isActive">
              <div class="thumb"><img [src]="img.filePath" [alt]="img.name" /></div>
              <div class="info">
                <div class="name">{{ img.name }}</div>
                <small>{{ img.category }} · {{ img.mimeType }}</small>
              </div>
              <div class="actions">
                <label class="toggle">
                  <input type="checkbox" [checked]="img.isActive" (change)="toggle(img)" />
                  <span>Active</span>
                </label>
                <button class="btn sm danger ghost" (click)="remove(img)">Delete</button>
              </div>
            </article>
          }
          @if (!images().length) {
            <div class="notice">No subscribe images yet.</div>
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .card.inactive { opacity: 0.5; }
    .thumb { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .thumb img { width: 100%; height: 100%; object-fit: contain; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; }
    .toggle { display: flex; align-items: center; gap: 0.3rem; font-size: 0.78rem; color: var(--muted); cursor: pointer; }
    .toggle input { accent-color: var(--accent); }
    .uploader { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }
    .uploader input[type="file"] { color: var(--muted); font-size: 0.85rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class SubscribeImagesComponent implements OnInit {
  images = signal<SubscribeImage[]>([]);
  uploading = signal(false);

  constructor(private readonly api: ApiService) {}

  ngOnInit() {
    this.loadImages();
  }

  private loadImages() {
    this.api.getSubscribeImages().subscribe({ next: (items) => this.images.set(items) });
  }

  upload(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadSubscribeImage(file).subscribe({
      next: () => { this.uploading.set(false); this.loadImages(); input.value = ''; },
      error: () => { this.uploading.set(false); alert('Upload failed.'); },
    });
  }

  toggle(img: SubscribeImage) {
    this.api.updateSubscribeImage(img.id, { isActive: !img.isActive } as any).subscribe({
      next: () => this.loadImages(),
    });
  }

  remove(img: SubscribeImage) {
    if (!confirm(`Delete "${img.name}"?`)) return;
    this.api.deleteSubscribeImage(img.id).subscribe({ next: () => this.loadImages() });
  }
}
