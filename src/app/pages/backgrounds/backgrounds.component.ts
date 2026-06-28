import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService, BackgroundVideoService } from '../../services/asset.service';
import { MediaAssetComponent } from '../../components/shared/media-asset/media-asset.component';
import { AssetPreviewModalComponent } from '../../components/shared/asset-preview-modal/asset-preview-modal.component';
import { AssetUploadFormComponent } from '../../components/shared/asset-upload-form/asset-upload-form.component';

@Component({
  selector: 'app-backgrounds',
  standalone: true,
  imports: [CommonModule, MediaAssetComponent, AssetPreviewModalComponent, AssetUploadFormComponent],
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
          <app-asset-upload-form
            accept="image/*"
            [showTypeField]="true"
            [uploadFn]="bgService.upload.bind(bgService)"
            (uploaded)="bgService.load()"
          />

          @if (bgService.loading$()) {
            <div class="loading-grid">
              @for (_ of [1,2,3,4]; track _) {
                <div class="card"><div class="skeleton-pulse"></div></div>
              }
            </div>
          } @else {
            <div class="grid">
              @for (bg of bgService.items$(); track bg.id) {
                <article class="card" [class.inactive]="bg.visibility !== 'public'" (dblclick)="openPreview(bgService.getSrc(bg), 'image', bg.name)">
                  <div class="thumb">
                    <app-media-asset
                      type="image"
                      [src]="bgService.getSrc(bg)"
                      [alt]="bg.name"
                    />
                  </div>
                  <div class="info">
                    <div class="name">{{ bg.name }}</div>
                    <small>{{ bg.type }}{{ bg.size ? ' · ' + (bg.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                  </div>
                  <div class="actions">
                    <button class="btn sm danger ghost" (click)="removeBg(bg)">Delete</button>
                  </div>
                </article>
              }
              @if (!bgService.items$().length) {
                <div class="notice">No background images yet.</div>
              }
            </div>
          }
        </section>
      }

      @if (tab() === 'videos') {
        <section class="list">
          <app-asset-upload-form
            accept="video/*"
            [showTypeField]="true"
            [uploadFn]="bvService.upload.bind(bvService)"
            (uploaded)="bvService.load()"
          />

          @if (bvService.loading$()) {
            <div class="loading-grid">
              @for (_ of [1,2,3,4]; track _) {
                <div class="card"><div class="skeleton-pulse"></div></div>
              }
            </div>
          } @else {
            <div class="grid">
              @for (bv of bvService.items$(); track bv.id) {
                <article class="card video-card" [class.inactive]="bv.visibility !== 'public'" (dblclick)="openPreview(bvService.getSrc(bv), 'video', bv.name, isPortrait(bv))">
                  <div class="vid-preview" [class.portrait]="isPortrait(bv)" [class.landscape]="!isPortrait(bv)">
                    <app-media-asset
                      type="video"
                      [src]="bvService.getSrc(bv)"
                      [alt]="bv.name"
                      [aspect]="isPortrait(bv) ? '9/16' : '16/9'"
                    />
                  </div>
                  <div class="info">
                    <div class="name">{{ bv.name }}</div>
                    <small>{{ bv.type }}{{ bv.size ? ' · ' + (bv.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                  </div>
                  <div class="actions">
                    <button class="btn sm danger ghost" (click)="removeVideo(bv)">Delete</button>
                  </div>
                </article>
              }
              @if (!bvService.items$().length) {
                <div class="notice">No background videos yet.</div>
              }
            </div>
          }
        </section>
      }
    </div>

    @if (preview()) {
      <app-asset-preview-modal
        [src]="previewSrc()"
        [type]="previewType()"
        [alt]="previewAlt()"
        [isPortrait]="previewPortrait()"
        (close)="closePreview()"
        (prev)="navigate(-1)"
        (next)="navigate(1)"
      />
    }
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
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
    .card.inactive { opacity: 0.5; }
    .video-card { cursor: pointer; }
    .thumb { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .vid-preview { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .vid-preview.portrait { aspect-ratio: 9/16; }
    .vid-preview.landscape { aspect-ratio: 16/9; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .skeleton-pulse { width: 100%; height: 100%; min-height: 120px; background: var(--border); border-radius: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
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
  preview = signal(false);
  previewSrc = signal('');
  previewType = signal<'image' | 'video' | 'audio'>('image');
  previewAlt = signal('');
  previewPortrait = signal(false);
  previewItems = signal<any[]>([]);
  previewIndex = signal(0);

  constructor(
    readonly bgService: BackgroundService,
    readonly bvService: BackgroundVideoService,
  ) {}

  ngOnInit() {
    this.bgService.load();
    this.bvService.load();
  }

  isPortrait(item: any): boolean {
    const path = (item.path || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    return path.includes('portrait') || type.includes('portrait');
  }

  openPreview(src: string, type: 'image' | 'video' | 'audio', alt: string, portrait = false) {
    const currentTab = this.tab();
    const list = currentTab === 'images' ? [...this.bgService.items$()] : [...this.bvService.items$()];
    this.previewItems.set(list);
    const idx = list.findIndex((it: any) => (currentTab === 'images' ? this.bgService.getSrc(it) : this.bvService.getSrc(it)) === src);
    this.previewIndex.set(idx >= 0 ? idx : 0);
    this.previewSrc.set(src);
    this.previewType.set(type);
    this.previewAlt.set(alt);
    this.previewPortrait.set(portrait);
    this.preview.set(true);
  }

  closePreview() {
    this.preview.set(false);
  }

  navigate(dir: number) {
    const items = this.previewItems();
    if (!items.length) return;
    const current = this.previewIndex();
    const next = (current + dir + items.length) % items.length;
    this.previewIndex.set(next);
    const it = items[next];
    const isVideoTab = this.tab() === 'videos';
    const isVideo = isVideoTab;
    const src = isVideoTab ? this.bvService.getSrc(it) : this.bgService.getSrc(it);
    const type = isVideo ? 'video' : 'image';
    const alt = it.name || '';
    const portrait = isVideo ? this.isPortrait(it) : false;
    this.previewSrc.set(src);
    this.previewType.set(type);
    this.previewAlt.set(alt);
    this.previewPortrait.set(portrait);
  }

  removeBg(bg: any) {
    if (!confirm('Delete this background?')) return;
    this.bgService.remove(bg.id);
  }

  removeVideo(bv: any) {
    if (!confirm('Delete this background video?')) return;
    this.bvService.remove(bv.id);
  }
}
