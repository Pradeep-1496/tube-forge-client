import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubscribeImageService } from '../../services/asset.service';
import { AuthService } from '../../services/auth.service';
import { MediaAssetComponent } from '../../components/shared/media-asset/media-asset.component';
import { AssetUploadFormComponent } from '../../components/shared/asset-upload-form/asset-upload-form.component';

@Component({
  selector: 'app-subscribe-images',
  standalone: true,
  imports: [CommonModule, MediaAssetComponent, AssetUploadFormComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>Subscribe Images</h1>
        <p>Manage subscribe overlay images for videos.</p>
      </header>

      <app-asset-upload-form
        accept="image/*"
        [showTypeField]="true"
        [uploadFn]="subService.upload.bind(subService)"
        (uploaded)="subService.load()"
      />

      <section class="list">
        @if (subService.loading$()) {
          <div class="loading-grid">
            @for (_ of [1,2,3]; track _) {
              <div class="card"><div class="skeleton-pulse"></div></div>
            }
          </div>
        } @else {
          <div class="grid">
            @for (img of subService.items$(); track img.id) {
              <article class="card" [class.inactive]="img.visibility !== 'public'">
                <div class="thumb" [class.portrait]="isPortrait(img)" [class.landscape]="!isPortrait(img)">
                  <app-media-asset
                    type="image"
                    [src]="subService.getSrc(img)"
                    [alt]="img.name"
                  />
                </div>
                <div class="info">
                  <div class="name">{{ img.name }}</div>
                  <small>{{ img.type }} · {{ img.size ? (img.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                  <div class="user-row">
                    <small class="owner">{{ img.user?.name || 'Unknown' }}</small>
                    @if (isOwned(img)) {
                      <span class="owned-badge">Owned</span>
                    }
                  </div>
                </div>
                @if (isOwned(img)) {
                  <div class="actions">
                    <button class="btn sm danger ghost" (click)="remove(img)">Delete</button>
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
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.4rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .loading-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .card { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .card.inactive { opacity: 0.5; }
    .thumb { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .thumb.portrait { aspect-ratio: 9/16; max-height: 320px; }
    .thumb.portrait :deep(img) { object-fit: contain !important; }
    .thumb.landscape { aspect-ratio: 16/9; }
    .info { display: flex; flex-direction: column; gap: 0.15rem; }
    .name { color: var(--text); font-weight: 600; font-size: 0.88rem; }
    small { color: var(--muted); font-size: 0.75rem; }
    .user-row { display: flex; align-items: center; gap: 0.4rem; margin-top: 0.15rem; }
    .owner { font-size: 0.72rem; color: var(--muted); }
    .owned-badge { font-size: 0.65rem; font-weight: 700; color: var(--success); text-transform: uppercase; background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.35); padding: 0.1rem 0.45rem; border-radius: 9999px; }
    .actions { display: flex; justify-content: flex-end; align-items: center; gap: 0.5rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .skeleton-pulse { width: 100%; height: 120px; background: var(--border); border-radius: 0.5rem; animation: pulse 1.5s ease-in-out infinite; }
    @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 0.8; } }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class SubscribeImagesComponent implements OnInit {
  uploading = false;
  currentUserId = signal<string>('');

  constructor(
    readonly subService: SubscribeImageService,
    private readonly auth: AuthService,
  ) {
    const user = this.auth.getCurrentUser();
    if (user) this.currentUserId.set(user.id);
  }

  ngOnInit() {
    this.subService.load();
  }

  isOwned(img: any): boolean {
    return img.userId === this.currentUserId();
  }

  remove(img: any) {
    if (!confirm(`Delete "${img.name}"?`)) return;
    this.subService.remove(img.id);
  }

  isPortrait(img: any): boolean {
    const path = (img.path || '').toLowerCase();
    const type = (img.type || '').toLowerCase();
    return path.includes('portrait') || type.includes('portrait');
  }
}
