import { Component, input, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';

type Orientation = 'portrait' | 'landscape';

@Component({
  selector: 'app-html-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="html-preview">
      <div class="toolbar">
        <span class="label">Preview</span>
        <div class="orientation-toggle">
          <button
            type="button"
            class="ori-btn"
            [class.active]="orientation() === 'portrait'"
            (click)="orientation.set('portrait')"
          >
            <svg width="14" height="18" viewBox="0 0 14 18" fill="none">
              <rect x="0.5" y="0.5" width="13" height="17" rx="1.5" stroke="currentColor"/>
            </svg>
            Portrait
          </button>
          <button
            type="button"
            class="ori-btn"
            [class.active]="orientation() === 'landscape'"
            (click)="orientation.set('landscape')"
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect x="0.5" y="0.5" width="17" height="13" rx="1.5" stroke="currentColor"/>
            </svg>
            Landscape
          </button>
        </div>
      </div>
      <div class="preview-wrapper" [class.portrait]="orientation() === 'portrait'" [class.landscape]="orientation() === 'landscape'">
        <div class="preview-frame">
          @if (html(); as h) {
            <div class="rendered" [innerHTML]="safeHtml()"></div>
          } @else {
            <div class="placeholder">Enter HTML content to preview</div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .html-preview {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    .label {
      font-size: 0.82rem;
      font-weight: 500;
      color: var(--muted);
    }
    .orientation-toggle {
      display: flex;
      gap: 0.25rem;
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.5rem;
      padding: 0.15rem;
    }
    .ori-btn {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.3rem 0.65rem;
      border: none;
      background: transparent;
      color: var(--muted);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      border-radius: 0.35rem;
      transition: all 0.15s ease;
    }
    .ori-btn:hover {
      color: var(--text);
    }
    .ori-btn.active {
      background: var(--accent);
      color: #fff;
    }
    .preview-wrapper {
      display: flex;
      justify-content: center;
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.7rem;
      overflow: hidden;
      transition: padding 0.25s ease;
    }
    .preview-wrapper.portrait {
      padding: 0.5rem;
    }
    .preview-wrapper.landscape {
      padding: 0.5rem;
    }
    .preview-frame {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow: auto;
      background: #fff;
      border-radius: 0.35rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      transition: width 0.25s ease, height 0.25s ease;
    }
    .portrait .preview-frame {
      width: 270px;
      height: 480px;
    }
    .landscape .preview-frame {
      width: 480px;
      height: 270px;
    }
    .rendered {
      width: 100%;
      height: 100%;
      overflow: auto;
    }
    .rendered ::ng-deep * {
      max-width: 100%;
      box-sizing: border-box;
    }
    .placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #999;
      font-size: 0.85rem;
    }
  `],
})
export class HtmlPreviewComponent {
  html = input<string>('');
  orientation = signal<Orientation>('portrait');
  safeHtml = computed(() =>
    this.html()
      ? this.sanitizer.bypassSecurityTrustHtml(this.html())
      : ''
  );

  constructor(private readonly sanitizer: DomSanitizer) {}
}
