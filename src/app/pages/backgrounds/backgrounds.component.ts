import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BackgroundService, BackgroundVideoService, SubscribeImageService } from '../../services/asset.service';
import { AuthService } from '../../services/auth.service';
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
        <button class="tab" [class.active]="tab() === 'subscribe'" (click)="tab.set('subscribe')">Subscribe Imgs</button>
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
                  <div class="thumb" [class.portrait]="isPortrait(bg)" [class.landscape]="!isPortrait(bg)">
                    <app-media-asset
                      type="image"
                      [src]="bgService.getSrc(bg)"
                      [alt]="bg.name"
                      [aspect]="isPortrait(bg) ? '9/16' : '16/9'"
                    />
                  </div>
                  <div class="info">
                    <div class="name">{{ bg.name }}</div>
                    <small>{{ bg.type }}{{ bg.size ? ' · ' + (bg.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                    <div class="user-row">
                      <small class="owner">{{ bg.user?.name || 'Unknown' }}</small>
                      @if (isOwned(bg)) {
                        <span class="owned-badge">Owned</span>
                      }
                    </div>
                  </div>
                  @if (isOwned(bg)) {
                    <div class="actions">
                      <button class="btn sm danger ghost" (click)="removeBg(bg)">Delete</button>
                    </div>
                  }
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
              @for (bv of bvService.items$(); track bv.bg_video_id) {
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
                    <div class="user-row">
                      <small class="owner">{{ bv.user?.name || 'Unknown' }}</small>
                      @if (isOwned(bv)) {
                        <span class="owned-badge">Owned</span>
                      }
                    </div>
                  </div>
                  @if (isOwned(bv)) {
                    <div class="actions">
                      <button class="btn sm danger ghost" (click)="removeVideo(bv)">Delete</button>
                    </div>
                  }
                </article>
              }
              @if (!bvService.items$().length) {
                <div class="notice">No background videos yet.</div>
              }
            </div>
          }
        </section>
      }

      @if (tab() === 'subscribe') {
        <section class="list">
          <app-asset-upload-form
            accept="image/*"
            [showTypeField]="true"
            [uploadFn]="subService.upload.bind(subService)"
            (uploaded)="subService.load()"
          />

          @if (subService.loading$()) {
            <div class="loading-grid">
              @for (_ of [1,2,3,4]; track _) {
                <div class="card"><div class="skeleton-pulse"></div></div>
              }
            </div>
          } @else {
            <div class="grid">
              @for (img of subService.items$(); track img.id) {
                <article class="card" [class.inactive]="img.visibility !== 'public'" (dblclick)="openPreview(subService.getSrc(img), 'image', img.name)">
                  <div class="thumb" [class.portrait]="isPortrait(img)" [class.landscape]="!isPortrait(img)">
                    <app-media-asset
                      type="image"
                      [src]="subService.getSrc(img)"
                      [alt]="img.name"
                      [aspect]="isPortrait(img) ? '9/16' : '16/9'"
                    />
                  </div>
                  <div class="info">
                    <div class="name">{{ img.name }}</div>
                    <small>{{ img.type }}{{ img.size ? ' · ' + (img.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                    <div class="user-row">
                      <small class="owner">{{ img.user?.name || 'Unknown' }}</small>
                      @if (isOwned(img)) {
                        <span class="owned-badge">Owned</span>
                      }
                    </div>
                  </div>
                  @if (isOwned(img)) {
                    <div class="actions">
                      <button class="btn sm danger ghost" (click)="removeSubscribe(img)">Delete</button>
                    </div>
                  }
                </article>
              }
              @if (!subService.items$().length) {
                <div class="notice">No subscribe images yet.</div>
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
    .thumb { background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .thumb.portrait { aspect-ratio: 9/16; max-height: 320px; }
    .thumb.portrait :deep(img) { object-fit: contain !important; }
    .thumb.landscape { aspect-ratio: 16/9; }
    .vid-preview { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .vid-preview.portrait { aspect-ratio: 9/16; }
    .vid-preview.landscape { aspect-ratio: 16/9; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .user-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.15rem; }
    .owner { font-size: 0.72rem; color: var(--muted); }
    .owned-badge { font-size: 0.65rem; font-weight: 700; color: var(--success); text-transform: uppercase; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35); padding: 0.1rem 0.45rem; border-radius: 9999px; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .skeleton-pulse { width: 100%; height: 100%; min-height: 120px; background: var(--border); border-radius: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
  `]
})
export class BackgroundsComponent implements OnInit {
  tab = signal<'images' | 'videos' | 'subscribe'>('images');
  preview = signal(false);
  previewSrc = signal('');
  previewType = signal<'image' | 'video' | 'audio'>('image');
  previewAlt = signal('');
  previewPortrait = signal(false);
  previewItems = signal<any[]>([]);
  previewIndex = signal(0);
  currentUserId = signal<string>('');

  constructor(
    readonly bgService: BackgroundService,
    readonly bvService: BackgroundVideoService,
    readonly subService: SubscribeImageService,
    private readonly auth: AuthService,
  ) {
    const user = this.auth.getCurrentUser();
    if (user) this.currentUserId.set(user.id);
  }

  ngOnInit() {
    this.bgService.load();
    this.bvService.load();
    this.subService.load();
  }

  isOwned(item: any): boolean {
    return item.userId === this.currentUserId();
  }

  isPortrait(item: any): boolean {
    const path = (item.path || '').toLowerCase();
    const type = (item.type || '').toLowerCase();
    return path.includes('portrait') || type.includes('portrait');
  }

  openPreview(src: string, type: 'image' | 'video' | 'audio', alt: string, portrait = false) {
    const currentTab = this.tab();
    const list = currentTab === 'images' ? [...this.bgService.items$()] : currentTab === 'videos' ? [...this.bvService.items$()] : [...this.subService.items$()];
    this.previewItems.set(list);
    const idx = list.findIndex((it: any) => {
      const getSrc = currentTab === 'images' ? this.bgService.getSrc.bind(this.bgService) : currentTab === 'videos' ? this.bvService.getSrc.bind(this.bvService) : this.subService.getSrc.bind(this.subService);
      return getSrc(it) === src;
    });
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
    const currentTab = this.tab();
    const isVideo = currentTab === 'videos';
    const getSrc = currentTab === 'images' ? this.bgService.getSrc.bind(this.bgService) : currentTab === 'videos' ? this.bvService.getSrc.bind(this.bvService) : this.subService.getSrc.bind(this.subService);
    const src = getSrc(it);
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

  removeSubscribe(img: any) {
    if (!confirm(`Delete "${img.name}"?`)) return;
    this.subService.remove(img.id);
  }
}
