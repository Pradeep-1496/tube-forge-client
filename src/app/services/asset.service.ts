import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { ApiService, BackgroundAsset, BackgroundVideo, AudioAsset, SubscribeImage, Visibility } from './api.service';

function resolveUrl(path: string): string {
  if (!path) return '';
  const normalized = path.replace(/\\/g, '/');
  if (normalized.startsWith('http://') || normalized.startsWith('https://')) return normalized;
  return `${environment.apiBaseUrl}${normalized.startsWith('/') ? '' : '/'}${normalized}`;
}

@Injectable({ providedIn: 'root' })
export class BackgroundService {
  private readonly items = signal<BackgroundAsset[]>([]);
  private readonly loading = signal(false);
  readonly items$ = this.items.asReadonly();
  readonly loading$ = this.loading.asReadonly();

  constructor(private readonly api: ApiService) {}

  getSrc(asset: BackgroundAsset): string {
    return resolveUrl(asset.path);
  }

  getUploadUrl(): string {
    return `${environment.apiBaseUrl}${environment.apiEndpoints.backgrounds.upload}`;
  }

  load(): void {
    this.loading.set(true);
    this.api.getBackgroundAssets().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  upload(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }): Promise<BackgroundAsset> {
    return new Promise((resolve, reject) => {
      this.api.uploadBackgroundAsset(file, fields).subscribe({ next: (r) => { this.load(); resolve(r); }, error: reject });
    });
  }

  remove(id: string): void {
    this.api.deleteBackgroundAsset(id).subscribe({ next: () => this.load() });
  }
}

@Injectable({ providedIn: 'root' })
export class BackgroundVideoService {
  private readonly items = signal<BackgroundVideo[]>([]);
  private readonly loading = signal(false);
  readonly items$ = this.items.asReadonly();
  readonly loading$ = this.loading.asReadonly();

  constructor(private readonly api: ApiService) {}

  getSrc(asset: BackgroundVideo): string {
    return resolveUrl(asset.path);
  }

  load(): void {
    this.loading.set(true);
    this.api.getBackgroundVideos().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  upload(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }): Promise<BackgroundVideo> {
    return new Promise((resolve, reject) => {
      this.api.uploadBackgroundVideo(file, fields).subscribe({ next: (r) => { this.load(); resolve(r); }, error: reject });
    });
  }

  remove(id: string): void {
    this.api.deleteBackgroundVideo(id).subscribe({ next: () => this.load() });
  }
}

@Injectable({ providedIn: 'root' })
export class AudioService {
  private readonly items = signal<AudioAsset[]>([]);
  private readonly loading = signal(false);
  readonly items$ = this.items.asReadonly();
  readonly loading$ = this.loading.asReadonly();

  constructor(private readonly api: ApiService) {}

  getSrc(asset: AudioAsset): string {
    return resolveUrl(asset.path);
  }

  load(): void {
    this.loading.set(true);
    this.api.getAudios().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  upload(file: File, fields?: { name?: string; visibility?: Visibility }): Promise<AudioAsset> {
    return new Promise((resolve, reject) => {
      this.api.uploadAudio(file, fields).subscribe({ next: (r) => { this.load(); resolve(r); }, error: reject });
    });
  }

  remove(id: string): void {
    this.api.deleteAudio(id).subscribe({ next: () => this.load() });
  }
}

@Injectable({ providedIn: 'root' })
export class SubscribeImageService {
  private readonly items = signal<SubscribeImage[]>([]);
  private readonly loading = signal(false);
  readonly items$ = this.items.asReadonly();
  readonly loading$ = this.loading.asReadonly();

  constructor(private readonly api: ApiService) {}

  getSrc(asset: SubscribeImage): string {
    return resolveUrl(asset.path);
  }

  load(): void {
    this.loading.set(true);
    this.api.getSubscribeImages().subscribe({
      next: (items) => { this.items.set(items); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  upload(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }): Promise<SubscribeImage> {
    return new Promise((resolve, reject) => {
      this.api.uploadSubscribeImage(file, fields).subscribe({ next: (r) => { this.load(); resolve(r); }, error: reject });
    });
  }

  remove(id: string): void {
    this.api.deleteSubscribeImage(id).subscribe({ next: () => this.load() });
  }

  toggle(item: SubscribeImage): void {
    this.api.updateSubscribeImage(item.id, { visibility: item.visibility === 'public' ? 'private' : 'public' } as any).subscribe({
      next: () => this.load(),
    });
  }
}
