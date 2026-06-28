import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, BackgroundAsset, BackgroundVideo, AudioAsset, SubscribeImage, Channel, Theme } from '../../../services/api.service';

type AssetType = 'backgrounds' | 'background-videos' | 'audios' | 'subscribe-images' | 'channels' | 'themes';

export interface PickerOption {
  id: string;
  name: string;
  subtitle?: string;
  preview?: string;
}

@Component({
  selector: 'app-asset-picker',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <header class="modal-header">
          <h3>Select {{ title() }}</h3>
          <button class="close-btn" (click)="close.emit()">✕</button>
        </header>

        <div class="search-bar" *ngIf="showSearch">
          <input type="text" [placeholder]="'Search ' + title() + '...'" (input)="onSearch($event)" />
        </div>

        <div class="options">
          @for (opt of filteredOptions(); track opt.id) {
            <div class="option" [class.selected]="selectedId() === opt.id" (click)="select(opt.id)">
              @if (opt.preview) {
                <div class="preview-img">
                  <img [src]="opt.preview" [alt]="opt.name" />
                </div>
              }
              <div class="option-info">
                <div class="option-name">{{ opt.name }}</div>
                @if (opt.subtitle) {
                  <div class="option-subtitle">{{ opt.subtitle }}</div>
                }
              </div>
              @if (selectedId() === opt.id) {
                <span class="check">✓</span>
              }
            </div>
          }
          @if (!filteredOptions().length) {
            <div class="empty">No {{ title() }} found.</div>
          }
        </div>

        <footer class="modal-footer">
          <button class="btn ghost" (click)="close.emit()">Cancel</button>
          <button class="btn primary" (click)="confirm()" [disabled]="!selectedId()">Select</button>
        </footer>
      </div>
    </div>
  `,
  styles: [`
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 1rem; width: 100%; max-width: 480px; max-height: 80vh; display: flex; flex-direction: column; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.2rem 1.4rem; border-bottom: 1px solid var(--border-subtle); }
    .modal-header h3 { margin: 0; color: var(--text); font-size: 1rem; }
    .close-btn { background: none; border: none; color: var(--muted); font-size: 1.1rem; cursor: pointer; padding: 0.25rem; }
    .close-btn:hover { color: var(--text); }
    .search-bar { padding: 0.8rem 1.4rem; border-bottom: 1px solid var(--border-subtle); }
    .search-bar input { width: 100%; background: var(--border-subtle); border: 1px solid var(--border); color: var(--text); padding: 0.5rem 0.75rem; border-radius: 0.5rem; font-size: 0.85rem; box-sizing: border-box; }
    .options { flex: 1; overflow-y: auto; padding: 0.5rem; display: flex; flex-direction: column; gap: 0.25rem; }
    .option { display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 0.8rem; border-radius: 0.5rem; cursor: pointer; transition: background 0.15s; }
    .option:hover { background: var(--border-subtle); }
    .option.selected { background: var(--accent-weak); border: 1px solid var(--accent); }
    .preview-img { width: 48px; height: 48px; border-radius: 0.4rem; overflow: hidden; background: var(--bg); flex-shrink: 0; }
    .preview-img img { width: 100%; height: 100%; object-fit: cover; }
    .option-info { flex: 1; min-width: 0; }
    .option-name { color: var(--text); font-weight: 600; font-size: 0.88rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .option-subtitle { color: var(--muted); font-size: 0.78rem; }
    .check { color: var(--accent); font-weight: 700; font-size: 1rem; }
    .empty { padding: 2rem; text-align: center; color: var(--muted); font-style: italic; }
    .modal-footer { display: flex; justify-content: flex-end; gap: 0.5rem; padding: 1rem 1.4rem; border-top: 1px solid var(--border-subtle); }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
  `]
})
export class AssetPickerComponent implements OnInit {
  type = input.required<AssetType>();
  selectedId = input<string>('');
  close = output<void>();
  selected = output<PickerOption | null>();

  title = signal('');
  showSearch = signal(false);
  search = signal('');
  options = signal<PickerOption[]>([]);

  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  onSearch(event: Event) {
    this.search.set((event.target as HTMLInputElement).value);
  }

  filteredOptions = () => {
    const q = this.search().toLowerCase();
    return this.options().filter(o => !q || o.name.toLowerCase().includes(q) || (o.subtitle && o.subtitle.toLowerCase().includes(q)));
  };

  ngOnInit() {
    this.loadOptions();
  }

  private loadOptions() {
    switch (this.type()) {
      case 'backgrounds':
        this.title.set('Background');
        this.showSearch.set(true);
        this.api.getBackgrounds().subscribe({
          next: (items: BackgroundAsset[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name, subtitle: i.category, preview: i.filePath })))
        });
        break;
      case 'background-videos':
        this.title.set('Background Video');
        this.showSearch.set(true);
        this.api.getBackgroundVideos().subscribe({
          next: (items: BackgroundVideo[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name, subtitle: i.category, preview: i.filePath })))
        });
        break;
      case 'audios':
        this.title.set('Audio');
        this.showSearch.set(true);
        this.api.getAudios().subscribe({
          next: (items: AudioAsset[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name, subtitle: i.category })))
        });
        break;
      case 'subscribe-images':
        this.title.set('Subscribe Image');
        this.showSearch.set(true);
        this.api.getSubscribeImages().subscribe({
          next: (items: SubscribeImage[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name, subtitle: i.category, preview: i.filePath })))
        });
        break;
      case 'channels':
        this.title.set('Channel');
        this.showSearch.set(true);
        this.api.getChannels().subscribe({
          next: (items: Channel[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name, subtitle: i.channelId })))
        });
        break;
      case 'themes':
        this.title.set('Theme');
        this.showSearch.set(false);
        this.api.getThemes().subscribe({
          next: (items: Theme[]) => this.options.set(items.map(i => ({ id: i.id, name: i.name })))
        });
        break;
    }
  }

  select(id: string) {
    const opt = this.options().find(o => o.id === id) || null;
    this.selected.emit(opt);
  }

  confirm() {
    const opt = this.options().find(o => o.id === this.selectedId()) || null;
    this.selected.emit(opt);
    this.close.emit();
  }
}
