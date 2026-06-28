import { Component, input, output, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MediaAssetComponent } from '../media-asset/media-asset.component';

@Component({
  selector: 'app-asset-preview-modal',
  standalone: true,
  imports: [CommonModule, MediaAssetComponent],
  template: `
    <div class="overlay" (click)="close.emit()">
      <div class="modal" (click)="$event.stopPropagation()">
        <button class="close-btn" (click)="close.emit()">✕</button>
        <button class="nav-btn prev" (click)="prev.emit()">‹</button>
        <button class="nav-btn next" (click)="next.emit()">›</button>
        <div class="stage" [class.portrait]="isPortrait()">
          <app-media-asset
            class="full-media"
            [type]="type()"
            [src]="src()"
            [alt]="alt()"
          />
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { position: fixed; inset: 0; z-index: 200; }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
    .modal { position: relative; background: var(--surface); border: 1px solid var(--border); border-radius: 1rem; width: 100%; max-width: 1200px; max-height: 90vh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
    .close-btn { position: absolute; top: 0.6rem; right: 0.6rem; background: rgba(0,0,0,0.6); border: none; color: #fff; width: 2rem; height: 2rem; border-radius: 50%; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; }
    .close-btn:hover { background: rgba(0,0,0,0.8); }
    .nav-btn { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.5); border: none; color: #fff; width: 2.4rem; height: 2.4rem; border-radius: 50%; font-size: 1.4rem; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 5; }
    .nav-btn:hover { background: rgba(0,0,0,0.75); }
    .prev { left: 0.5rem; }
    .next { right: 0.5rem; }
    .stage { width: 100%; max-height: 80vh; display: flex; align-items: center; justify-content: center; background: #000; border-radius: 0.5rem; overflow: hidden; }
    .stage.portrait { max-width: 420px; margin: 0 auto; }
    .stage.portrait :deep(.media-wrap) { aspect-ratio: 9/16; max-height: 78vh; width: auto; }
    .stage :deep(.media-wrap) { width: 100%; height: auto; max-height: 80vh; }
    .stage :deep(.media-wrap) img, .stage :deep(.media-wrap) video { object-fit: contain !important; }
    .stage :deep(.media-wrap) audio { width: 100%; }
  `]
})
export class AssetPreviewModalComponent {
  src = input.required<string>();
  type = input.required<'image' | 'video' | 'audio'>();
  alt = input('');
  isPortrait = input<boolean>(false);

  close = output<void>();
  prev = output<void>();
  next = output<void>();

  @HostListener('document:keydown.escape')
  onEsc() {
    this.close.emit();
  }
}
