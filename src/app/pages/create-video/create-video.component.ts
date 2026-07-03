import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Template, ContentItem } from '../../services/api.service';
import { DomSanitizer } from '@angular/platform-browser';
import {
  AssetPickerComponent,
  PickerOption,
} from '../../components/core/asset-picker/asset-picker.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-video',
  standalone: true,
  imports: [CommonModule, FormsModule, AssetPickerComponent],
  template: `
    <div class="create">
      <header class="page-header">
        <h1>Create Video</h1>
        <p>Choose a template, fill in the details, and generate your video.</p>
      </header>

      <div class="template-bar">
        <span class="bar-label">Template:</span>
        <div class="template-options">
          @for (t of templates(); track t.id) {
            <button
              class="template-chip"
              [class.selected]="selectedTemplate()?.id === t.id"
              (click)="selectTemplate(t)"
            >
              {{ t.name }}
            </button>
          }
          @if (!templates().length) {
            <span class="bar-empty">Loading templates…</span>
          }
        </div>
      </div>

      <div class="split">
      <form class="form" (ngSubmit)="doGenerate()">
        <fieldset>
          <legend>Details</legend>

          <div class="field">
            <label>Content Source</label>
            <div class="mode-toggle">
              <label class="mode-option">
                <input
                  type="radio"
                  name="contentSource"
                  [value]="'manual'"
                  [ngModel]="contentSourceMode()"
                  (ngModelChange)="contentSourceMode.set($event)"
                />
                Write manually
              </label>
              <label class="mode-option">
                <input
                  type="radio"
                  name="contentSource"
                  [value]="'existing'"
                  [ngModel]="contentSourceMode()"
                  (ngModelChange)="contentSourceMode.set($event)"
                />
                Use existing content
              </label>
            </div>
          </div>

          @if (contentSourceMode() === 'manual') {
            <div class="field">
              <label for="title">Title</label>
              <input
                id="title"
                type="text"
                [ngModel]="title()"
                (ngModelChange)="title.set($event)"
                name="title"
                maxlength="100"
                placeholder="My Video Title"
                required
              />
            </div>

            <div class="field">
              <label for="content">
                Content
                @if (selectedTemplate()?.name === 'Conversation v1') {
                  <span class="hint"
                    >— Use <code>Speaker: Message || </code>end of one dialog ||</span
                  >
                }
                @if (selectedTemplate()?.name === 'Quote') {
                  <span class="hint">— Quote text, then <code>-- Author</code></span>
                }
              </label>
              <textarea
                id="content"
                rows="6"
                [ngModel]="content()"
                (ngModelChange)="content.set($event)"
                name="content"
                placeholder="Enter your content here..."
              ></textarea>
              <small>{{ content().length }} chars</small>
            </div>
          }

          @if (contentSourceMode() === 'existing') {
            <div class="field">
              <label for="existingContent">Select Content</label>
              <select
                id="existingContent"
                class="field-select"
                [ngModel]="selectedContentItem()?.id || ''"
                (ngModelChange)="onContentSelected($event)"
                name="existingContent"
              >
                <option value="">-- Select content --</option>
                @for (item of contentItems(); track item.id) {
                  <option [value]="item.id">{{ item.title || '(Untitled)' }}</option>
                }
              </select>
              @if (selectedContentItem()) {
                <button
                  type="button"
                  class="btn sm ghost"
                  (click)="selectedContentItem.set(null)"
                >
                  ✕ Clear
                </button>
              }
            </div>
          }
        </fieldset>

          <fieldset>
            <legend>Assets</legend>
            <div class="asset-row">
              <div class="field">
                <label>Background</label>
                <div class="bg-picker-group">
                  <button type="button" class="btn ghost" (click)="openPicker('backgrounds')">
                    {{ selectedBgImage() ? selectedBgImage()!.name : 'Image…' }}
                  </button>
                  <button type="button" class="btn ghost" (click)="openPicker('background-videos')">
                    {{ selectedBgVideo() ? selectedBgVideo()!.name : 'Video…' }}
                  </button>
                </div>
                @if (selectedBgImage() || selectedBgVideo()) {
                  <button type="button" class="btn sm ghost" (click)="clearBg()">✕ Clear</button>
                }
              </div>
              <div class="field">
                <label>Audio</label>
                <button type="button" class="btn ghost full" (click)="openPicker('audios')">
                  {{ selectedAudio() ? selectedAudio()!.name : 'Select…' }}
                </button>
                @if (selectedAudio()) {
                  <button type="button" class="btn sm ghost" (click)="selectedAudio.set(null)">
                    ✕ Clear
                  </button>
                }
              </div>
            </div>
            <div class="asset-row">
              <div class="field">
                <label>Subscribe Image</label>
                <button
                  type="button"
                  class="btn ghost full"
                  (click)="openPicker('subscribe-images')"
                >
                  {{ selectedSubscribeImage() ? selectedSubscribeImage()!.name : 'Select…' }}
                </button>
                @if (selectedSubscribeImage()) {
                  <button
                    type="button"
                    class="btn sm ghost"
                    (click)="selectedSubscribeImage.set(null)"
                  >
                    ✕ Clear
                  </button>
                }
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend>Publishing</legend>
            <div class="asset-row">
              <div class="field">
                <label>Channel</label>
                <button type="button" class="btn ghost full" (click)="openPicker('channels')">
                  {{ selectedChannel() ? selectedChannel()!.name : 'Select…' }}
                </button>
                @if (selectedChannel()) {
                  <button type="button" class="btn sm ghost" (click)="selectedChannel.set(null)">
                    ✕ Clear
                  </button>
                }
              </div>
              <div class="field">
                <label for="publishAt">Publish Date</label>
                <input
                  id="publishAt"
                  type="datetime-local"
                  [(ngModel)]="publishDate"
                  name="publishDate"
                />
              </div>
            </div>
          </fieldset>

          <div class="actions">
            <button type="submit" class="btn primary" [disabled]="!canGenerate() || generating()">
              @if (generating()) {
                <span class="spinner"></span>
                Generating…
              } @else {
                Generate Video
              }
            </button>
          </div>
        </form>

        <aside class="preview">
          <div class="preview-header">
            <h3>Preview</h3>
            <span class="badge" *ngIf="selectedTemplate()">{{ selectedTemplate()!.name }}</span>
          </div>
          <div class="device">
            <div class="device-content">
              @if (previewHtml(); as html) {
                <iframe [srcdoc]="safeHtml(html)" class="preview-frame" title="Preview"></iframe>
              } @else {
                <div class="placeholder">
                  <span>◫</span>
                  <p>Select a template and enter content</p>
                </div>
              }
            </div>
          </div>
        </aside>
      </div>
    </div>

    @if (showPicker()) {
      <app-asset-picker
        [type]="pickerType()"
        (close)="showPicker.set(false)"
        (selected)="onAssetPicked($event)"
      />
    }
  `,
  styles: [
    `
      .create {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .page-header h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .page-header p {
        color: var(--muted);
        margin: 0.2rem 0 0;
        font-size: 0.88rem;
      }

      .template-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.65rem;
      }
      .bar-label {
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 500;
        white-space: nowrap;
      }
      .template-options {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }
      .template-chip {
        padding: 0.35rem 0.85rem;
        border-radius: 9999px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
      }
      .template-chip:hover {
        border-color: var(--accent-weak);
        color: var(--text);
      }
      .template-chip.selected {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
      .bar-empty {
        color: var(--muted);
        font-size: 0.82rem;
        font-style: italic;
      }

      .split {
        display: grid;
        grid-template-columns: 1fr 360px;
        gap: 1.5rem;
        align-items: start;
      }
      @media (max-width: 960px) {
        .split {
          grid-template-columns: 1fr;
        }
        .preview {
          order: -1;
        }
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      fieldset {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        padding: 1.2rem;
        display: flex;
        flex-direction: column;
        gap: 0.85rem;
      }
      legend {
        color: var(--text);
        font-weight: 600;
        font-size: 0.88rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .field label {
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 500;
      }
      .field label .hint {
        color: var(--accent);
        font-weight: 400;
      }
      .field label .hint code {
        background: var(--border-subtle);
        padding: 0.05rem 0.3rem;
        border-radius: 0.2rem;
        font-size: 0.78rem;
      }
      .field input,
      .field textarea {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.55rem 0.8rem;
        border-radius: 0.5rem;
        font-size: 0.88rem;
        width: 100%;
        font-family: inherit;
      }
      .field input:focus,
      .field textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-weak);
      }
      .field textarea {
        resize: vertical;
        min-height: 100px;
      }
      .field-select {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.55rem 0.8rem;
        border-radius: 0.5rem;
        font-size: 0.88rem;
        width: 100%;
      }
      .field-select:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-weak);
      }
      .field small {
        font-size: 0.72rem;
        color: var(--muted);
        text-align: right;
      }
      .mode-toggle {
        display: flex;
        gap: 1.25rem;
      }
      .mode-option {
        display: flex;
        align-items: center;
        gap: 0.4rem;
        font-size: 0.88rem;
        color: var(--text);
        cursor: pointer;
      }
      .asset-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      .bg-picker-group {
        display: flex;
        gap: 0.35rem;
      }
      .bg-picker-group .btn {
        flex: 1;
      }
      @media (max-width: 600px) {
        .asset-row {
          grid-template-columns: 1fr;
        }
      }

      .actions {
        display: flex;
        justify-content: flex-end;
      }
      .btn {
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        font-weight: 600;
        font-size: 0.85rem;
        cursor: pointer;
        border: 1px solid transparent;
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
        transition: all 0.15s ease;
      }
      .btn.primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
        min-width: 140px;
        justify-content: center;
      }
      .btn.primary:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn.ghost {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .btn.ghost:hover {
        background: var(--border-subtle);
      }
      .btn.sm {
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
      }
      .btn.full {
        width: 100%;
        justify-content: flex-start;
        text-align: left;
      }
      .spinner {
        width: 1rem;
        height: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: #fff;
        border-radius: 50%;
        animation: spin 0.6s linear infinite;
        display: inline-block;
      }
      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .preview {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .preview-header h3 {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text);
      }
      .badge {
        font-size: 0.68rem;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--muted);
      }
      .device {
        width: 270px;
        height: 480px;
        border-radius: 0.9rem;
        border: 1px solid var(--border);
        overflow: hidden;
        position: relative;
        background: #09090b;
        flex-shrink: 0;
      }

      .device-content {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .preview-frame {
        width: 100%;
        height: 100%;
        border: none;
      }
      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        color: var(--muted);
      }
      .placeholder span {
        font-size: 2rem;
        opacity: 0.4;
      }
      .placeholder p {
        margin: 0;
        font-size: 0.82rem;
      }
    `,
  ],
})
export class CreateVideoComponent implements OnInit {
  templates = signal<Template[]>([]);
  selectedTemplate = signal<Template | null>(null);
  title = signal('');
  content = signal('');
  contentSourceMode = signal<'manual' | 'existing'>('manual');
  contentItems = signal<ContentItem[]>([]);
  selectedContentItem = signal<ContentItem | null>(null);

  showPicker = signal(false);
  pickerType = signal<
    'backgrounds' | 'background-videos' | 'audios' | 'subscribe-images' | 'channels'
  >('background-videos');

  selectedBgImage = signal<PickerOption | null>(null);
  selectedBgVideo = signal<PickerOption | null>(null);
  selectedAudio = signal<PickerOption | null>(null);
  selectedSubscribeImage = signal<PickerOption | null>(null);
  selectedChannel = signal<PickerOption | null>(null);
  publishDate = '';

  generating = signal(false);

  private readonly api: ApiService;
  private readonly sanitizer: DomSanitizer;
  private readonly router: Router;

  constructor(api: ApiService, sanitizer: DomSanitizer, router: Router) {
    this.api = api;
    this.sanitizer = sanitizer;
    this.router = router;
  }

  ngOnInit(): void {
    this.api.getTemplates().subscribe({ next: (t) => this.templates.set(t) });
    this.api.getContentItems().subscribe({ next: (items) => this.contentItems.set(items) });
  }

  selectTemplate(t: Template) {
    this.selectedTemplate.set(t);
  }

  safeHtml(html: string) {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeForJs(s: string): string {
    return s
      .replace(/\\/g, '\\\\')
      .replace(/'/g, "\\'")
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t');
  }

  previewHtml = computed(() => {
    const t = this.selectedTemplate();
    if (!t) return null;
    const c = this.content().trim();
    let html = t.code.replace(/\{\{content\}\}/g, this.escapeForJs(c || 'Preview content'));

    const bgImg = this.selectedBgImage();
    const bgVideo = this.selectedBgVideo();

    if (bgImg?.preview) {
      const url = this.assetUrl(bgImg);
      const bgStyle = `body{background-image:url('${url}');background-repeat:no-repeat;background-size:contain;background-position:center}`;
      const styleTag = `<style>${bgStyle}</style>`;
      html = html.replace(/<\/head\s*>/i, (m) => styleTag + m);
    } else if (bgVideo?.preview) {
      const url = this.assetUrl(bgVideo);
      const clearBg = `<style>body{background:none!important}</style>`;
      html = html.replace(/<\/head\s*>/i, (m) => clearBg + m);
      const videoEl = `<video autoplay muted loop playsinline style="position:fixed;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none"><source src="${url}" type="video/mp4"></video>`;
      html = html.replace(/<body[^>]*>/i, (m) => m + videoEl);
    }

    return html;
  });

  openPicker(
    type: 'backgrounds' | 'background-videos' | 'audios' | 'subscribe-images' | 'channels',
  ) {
    this.pickerType.set(type);
    this.showPicker.set(true);
  }

  onAssetPicked(opt: PickerOption | null) {
    if (!opt) return;
    switch (this.pickerType() as string) {
      case 'backgrounds':
        this.selectedBgVideo.set(null);
        this.selectedBgImage.set(opt);
        break;
      case 'background-videos':
        this.selectedBgImage.set(null);
        this.selectedBgVideo.set(opt);
        break;
      case 'audios':
        this.selectedAudio.set(opt);
        break;
      case 'subscribe-images':
        this.selectedSubscribeImage.set(opt);
        break;
      case 'channels':
        this.selectedChannel.set(opt);
        break;
    }
  }

  clearBg() {
    this.selectedBgImage.set(null);
    this.selectedBgVideo.set(null);
  }

  assetUrl(opt: PickerOption): string {
    if (!opt.preview) return '';
    if (opt.preview.startsWith('http://') || opt.preview.startsWith('https://')) return opt.preview;
    return `http://localhost:3000/${opt.preview.replace(/\\/g, '/')}`;
  }

  canGenerate(): boolean {
    const hasChannel = !!this.selectedChannel();
    if (this.contentSourceMode() === 'manual') {
      return (
        !!this.selectedTemplate() &&
        !!this.title().trim() &&
        !!this.content().trim() &&
        hasChannel
      );
    }
    return (
      !!this.selectedTemplate() &&
      !!this.selectedContentItem() &&
      hasChannel
    );
  }

  onContentSelected(id: string) {
    if (!id) {
      this.selectedContentItem.set(null);
      return;
    }
    const item = this.contentItems().find((c) => c.id === id) || null;
    this.selectedContentItem.set(item);
    if (item) {
      this.title.set(item.title || '');
      this.content.set(item.content || '');
    }
  }

  doGenerate() {
    const template = this.selectedTemplate();
    if (!template || !this.canGenerate() || this.generating()) return;

    this.generating.set(true);
    const publishedDate = this.publishDate
      ? new Date(this.publishDate).toISOString()
      : new Date().toISOString();

    const bgImage = this.selectedBgImage();
    const bgVideo = this.selectedBgVideo();

    const commonPayload = {
      backgroundId: bgImage?.id,
      backgroundVideoId: bgVideo?.id,
      audioId: this.selectedAudio()?.id,
      subscribeImageId: this.selectedSubscribeImage()?.id,
      channelId: this.selectedChannel()?.id || '',
      publishedDate,
    };

    const finish = (err?: any) => {
      this.generating.set(false);
      if (err) {
        alert(err?.error?.message || err?.message || 'Generation failed');
      }
    };

    if (this.contentSourceMode() === 'existing' && this.selectedContentItem()) {
      this.api
        .generateFromTemplateWithContent(
          template.id,
          this.selectedContentItem()!.id,
          commonPayload,
        )
        .subscribe({
          next: (res) => {
            finish();
            this.router.navigate(['/generation', res.metadata.id]);
          },
          error: (err) => finish(err),
        });
    } else {
      this.api
        .generateFromTemplate(template.id, {
          ...commonPayload,
          content: this.content().trim(),
          title: this.title().trim(),
          backgroundId: bgImage?.id,
        })
        .subscribe({
          next: (res) => {
            finish();
            this.router.navigate(['/generation', res.metadata.id]);
          },
          error: (err) => finish(err),
        });
    }
  }
}
