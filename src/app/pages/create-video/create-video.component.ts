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
        <p class="page-subtitle">Choose a template, fill in the details, and generate your video.</p>
      </header>

      <div class="template-bar">
        <span class="template-bar-label">Template</span>
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
          <fieldset class="section" [class.is-ready]="sectionContentComplete()">
            <legend class="section-legend">
              <span class="section-indicator" [class.done]="sectionContentComplete()"></span>
              Content
            </legend>

            <div class="field">
              <label>Source</label>
              <div class="toggle-group" role="radiogroup" aria-label="Content source">
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="contentSourceMode() === 'manual'"
                  class="toggle-opt"
                  [class.active]="contentSourceMode() === 'manual'"
                  (click)="contentSourceMode.set('manual')"
                >Write</button>
                <button
                  type="button"
                  role="radio"
                  [attr.aria-checked]="contentSourceMode() === 'existing'"
                  class="toggle-opt"
                  [class.active]="contentSourceMode() === 'existing'"
                  (click)="contentSourceMode.set('existing')"
                >Existing</button>
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
                  placeholder="e.g. Top 10 React Tips"
                />
              </div>

              <div class="field">
                <label for="content">Script</label>
                <textarea
                  id="content"
                  rows="6"
                  [ngModel]="content()"
                  (ngModelChange)="content.set($event)"
                  name="content"
                  placeholder="Enter your content here..."
                ></textarea>
                <div class="field-foot">
                  <span class="hint-text">
                    @if (selectedTemplate()?.name === 'Conversation v1') {
                      Use <code>Speaker: Message || </code>end of one dialog ||
                    }
                    @if (selectedTemplate()?.name === 'Quote') {
                      Quote text, then <code>&ndash; Author</code>
                    }
                  </span>
                  <span class="char-count">{{ content().length }}</span>
                </div>
              </div>
            }

            @if (contentSourceMode() === 'existing') {
              <div class="field">
                <label for="existingContent">Select Content</label>
                <div class="select-row">
                  <select
                    id="existingContent"
                    class="field-select"
                    [ngModel]="selectedContentItem()?.id || ''"
                    (ngModelChange)="onContentSelected($event)"
                    name="existingContent"
                  >
                    <option value="">Choose…</option>
                    @for (item of contentItems(); track item.id) {
                      <option [value]="item.id">{{ item.title || '(Untitled)' }}</option>
                    }
                  </select>
                  @if (selectedContentItem()) {
                    <button
                      type="button"
                      class="btn sm ghost"
                      (click)="selectedContentItem.set(null)"
                    >Clear</button>
                  }
                </div>
              </div>
            }
          </fieldset>

          <fieldset class="section" [class.is-ready]="sectionAssetsComplete()">
            <legend class="section-legend">
              <span class="section-indicator" [class.done]="sectionAssetsComplete()"></span>
              Assets
            </legend>

            <div class="field">
              <label>Background</label>
              <div class="asset-pair">
                <button
                  type="button"
                  class="asset-btn"
                  [class.selected]="!!selectedBgImage()"
                  (click)="openPicker('backgrounds')"
                >
                  @if (selectedBgImage(); as img) {
                    <span class="asset-check">✓</span>
                    <span class="asset-label">{{ img.name }}</span>
                  } @else {
                    <span class="asset-label">Image…</span>
                  }
                </button>
                <button
                  type="button"
                  class="asset-btn"
                  [class.selected]="!!selectedBgVideo()"
                  (click)="openPicker('background-videos')"
                >
                  @if (selectedBgVideo(); as vid) {
                    <span class="asset-check">✓</span>
                    <span class="asset-label">{{ vid.name }}</span>
                  } @else {
                    <span class="asset-label">Video…</span>
                  }
                </button>
                @if (selectedBgImage() || selectedBgVideo()) {
                  <button type="button" class="asset-clear" (click)="clearBg()">Clear</button>
                }
              </div>
            </div>

            <div class="asset-row">
              <div class="field">
                <label>Audio</label>
                <button
                  type="button"
                  class="asset-btn full"
                  [class.selected]="!!selectedAudio()"
                  (click)="openPicker('audios')"
                >
                  @if (selectedAudio(); as a) {
                    <span class="asset-check">✓</span>
                    <span class="asset-label">{{ a.name }}</span>
                  } @else {
                    <span class="asset-label">Select track…</span>
                  }
                </button>
                @if (selectedAudio()) {
                  <button type="button" class="asset-clear" (click)="selectedAudio.set(null)">Clear</button>
                }
              </div>
              <div class="field">
                <label>Subscribe Image</label>
                <button
                  type="button"
                  class="asset-btn full"
                  [class.selected]="!!selectedSubscribeImage()"
                  (click)="openPicker('subscribe-images')"
                >
                  @if (selectedSubscribeImage(); as s) {
                    <span class="asset-check">✓</span>
                    <span class="asset-label">{{ s.name }}</span>
                  } @else {
                    <span class="asset-label">Select image…</span>
                  }
                </button>
                @if (selectedSubscribeImage()) {
                  <button
                    type="button"
                    class="asset-clear"
                    (click)="selectedSubscribeImage.set(null)"
                  >Clear</button>
                }
              </div>
            </div>
          </fieldset>

          <fieldset class="section" [class.is-ready]="sectionPublishComplete()">
            <legend class="section-legend">
              <span class="section-indicator" [class.done]="sectionPublishComplete()"></span>
              Publish
            </legend>

            <div class="asset-row">
              <div class="field">
                <label>Channel</label>
                <button
                  type="button"
                  class="asset-btn full"
                  [class.selected]="!!selectedChannel()"
                  (click)="openPicker('channels')"
                >
                  @if (selectedChannel(); as ch) {
                    <span class="asset-check">✓</span>
                    <span class="asset-label">{{ ch.name }}</span>
                  } @else {
                    <span class="asset-label">Select channel…</span>
                  }
                </button>
              </div>
              <div class="field">
                <label for="publishAt">Schedule</label>
                <input
                  id="publishAt"
                  type="datetime-local"
                  [(ngModel)]="publishDate"
                  name="publishDate"
                />
                <span class="field-hint">Leave empty to publish immediately</span>
              </div>
            </div>
          </fieldset>

          <div class="form-footer">
            <div class="form-status">
              @if (!canGenerate()) {
                <span class="missing-hint">
                  @if (!selectedTemplate()) {
                    Select a template to get started
                  } @else if (contentSourceMode() === 'manual' && (!title().trim() || !content().trim())) {
                    Add a title and script
                  } @else if (!selectedChannel()) {
                    Choose a channel
                  }
                </span>
              }
            </div>
            <button
              type="submit"
              class="btn btn-generate"
              [disabled]="!canGenerate() || generating()"
            >
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
            @if (selectedTemplate()) {
              <span class="badge">{{ selectedTemplate()!.name }}</span>
            }
          </div>
          <div class="device" [class.has-content]="!!previewHtml()">
            <div class="device-notch"></div>
            @if (previewHtml(); as html) {
              <iframe [srcdoc]="safeHtml(html)" class="preview-frame" title="Preview"></iframe>
            } @else {
              <div class="placeholder">
                <div class="placeholder-icon">◫</div>
                <p>Select a template<br />and enter content</p>
              </div>
            }
          </div>
          @if (selectedTemplate()) {
            <div class="preview-meta">
              @if (selectedBgImage() || selectedBgVideo()) {
                <span class="meta-chip">BG: {{ selectedBgImage()?.name || selectedBgVideo()?.name }}</span>
              }
              @if (selectedAudio()) {
                <span class="meta-chip">Audio: {{ selectedAudio()!.name }}</span>
              }
              @if (!selectedBgImage() && !selectedBgVideo() && !selectedAudio()) {
                <span class="meta-chip dim">No assets selected</span>
              }
            </div>
          }
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
      .page-subtitle {
        color: var(--muted);
        margin: 0.2rem 0 0;
        font-size: 0.88rem;
      }

      .template-bar {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.7rem 1rem;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.65rem;
      }
      .template-bar-label {
        font-size: 0.78rem;
        color: var(--muted);
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.04em;
        white-space: nowrap;
      }
      .template-options {
        display: flex;
        gap: 0.35rem;
        flex-wrap: wrap;
      }
      .template-chip {
        padding: 0.35rem 0.8rem;
        border-radius: 9999px;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
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
        gap: 0.85rem;
      }

      .section {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-left: 3px solid var(--border);
        border-radius: 0.65rem;
        padding: 1.15rem 1.25rem;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        transition: border-left-color 0.25s ease;
      }
      .section.is-ready {
        border-left-color: var(--accent);
      }

      .section-legend {
        color: var(--text);
        font-weight: 600;
        font-size: 0.95rem;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        letter-spacing: -0.01em;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }
      .section-indicator {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: var(--border);
        transition: background 0.25s ease;
        flex-shrink: 0;
      }
      .section-indicator.done {
        background: var(--accent);
      }

      .field {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
      }
      .field > label {
        font-size: 0.8rem;
        color: var(--muted);
        font-weight: 500;
      }
      .field input,
      .field textarea,
      .field-select {
        background: var(--bg);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.55rem 0.8rem;
        border-radius: 0.5rem;
        font-size: 0.88rem;
        width: 100%;
        font-family: inherit;
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .field input:focus,
      .field textarea:focus,
      .field-select:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-weak);
      }
      .field textarea {
        resize: vertical;
        min-height: 100px;
      }
      .field-select {
        appearance: none;
        background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a7a8c'/%3E%3C/svg%3E");
        background-repeat: no-repeat;
        background-position: right 0.7rem center;
        padding-right: 2rem;
        cursor: pointer;
      }
      .field-select option {
        background: var(--surface);
        color: var(--text);
      }

      .toggle-group {
        display: flex;
        gap: 0;
        background: var(--bg);
        border: 1px solid var(--border);
        border-radius: 0.5rem;
        overflow: hidden;
        width: fit-content;
      }
      .toggle-opt {
        padding: 0.4rem 0.9rem;
        border: none;
        background: transparent;
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
      }
      .toggle-opt:hover {
        color: var(--text);
      }
      .toggle-opt.active {
        background: var(--accent);
        color: #fff;
      }
      .toggle-opt:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: -2px;
      }

      .select-row {
        display: flex;
        gap: 0.4rem;
        align-items: center;
      }
      .select-row .field-select {
        flex: 1;
      }

      .field-foot {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
        min-height: 1.2rem;
      }
      .hint-text {
        font-size: 0.72rem;
        color: var(--muted);
        font-style: italic;
      }
      .hint-text code {
        background: var(--border-subtle);
        padding: 0.05rem 0.3rem;
        border-radius: 0.2rem;
        font-size: 0.72rem;
        color: var(--accent);
      }
      .char-count {
        font-size: 0.72rem;
        color: var(--muted);
        font-variant-numeric: tabular-nums;
        flex-shrink: 0;
      }
      .field-hint {
        font-size: 0.7rem;
        color: var(--muted);
        margin-top: 0.1rem;
      }

      .asset-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.75rem;
      }
      @media (max-width: 600px) {
        .asset-row {
          grid-template-columns: 1fr;
        }
      }

      .asset-pair {
        display: flex;
        gap: 0.35rem;
        align-items: center;
        flex-wrap: wrap;
      }
      .asset-pair .asset-btn {
        flex: 1;
        min-width: 0;
      }

      .asset-btn {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        padding: 0.45rem 0.75rem;
        border-radius: 0.45rem;
        border: 1px solid var(--border);
        background: var(--bg);
        color: var(--muted);
        font-size: 0.82rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
        font-family: inherit;
        text-align: left;
      }
      .asset-btn:hover {
        border-color: var(--accent-weak);
        color: var(--text);
      }
      .asset-btn.selected {
        border-color: var(--accent);
        background: var(--accent-weak);
        color: var(--text);
      }
      .asset-btn:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 2px;
      }
      .asset-btn.full {
        width: 100%;
      }
      .asset-check {
        color: var(--accent);
        font-weight: 700;
        font-size: 0.75rem;
        flex-shrink: 0;
      }
      .asset-label {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .asset-clear {
        padding: 0.25rem 0.55rem;
        border-radius: 0.35rem;
        border: 1px solid var(--border);
        background: transparent;
        color: var(--muted);
        font-size: 0.72rem;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s;
        font-family: inherit;
      }
      .asset-clear:hover {
        border-color: var(--danger);
        color: var(--danger);
        background: rgba(224, 72, 58, 0.08);
      }

      .form-footer {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        padding-top: 0.25rem;
      }
      .form-status {
        min-height: 1.1rem;
      }
      .missing-hint {
        font-size: 0.78rem;
        color: var(--muted);
        font-style: italic;
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
        font-family: inherit;
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
      .btn-generate {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
        width: 100%;
        justify-content: center;
        padding: 0.6rem 1rem;
        font-size: 0.9rem;
      }
      .btn-generate:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .btn-generate:hover:not(:disabled) {
        filter: brightness(1.1);
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
        gap: 0.65rem;
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
        font-size: 0.65rem;
        padding: 0.15rem 0.45rem;
        border-radius: 9999px;
        background: var(--accent-weak);
        border: 1px solid var(--accent);
        color: var(--accent);
        font-weight: 500;
      }
      .device {
        width: 270px;
        height: 480px;
        border-radius: 1.1rem;
        border: 1px solid var(--border);
        overflow: hidden;
        position: relative;
        background: #09090b;
        flex-shrink: 0;
        align-self: center;
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }
      .device.has-content {
        border-color: var(--accent-weak);
        box-shadow: 0 0 24px rgba(232, 184, 75, 0.07);
      }
      .device-notch {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 80px;
        height: 16px;
        background: #09090b;
        border-radius: 0 0 10px 10px;
        z-index: 2;
      }
      .preview-frame {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: none;
      }
      .placeholder {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        color: var(--muted);
      }
      .placeholder-icon {
        font-size: 1.6rem;
        opacity: 0.3;
      }
      .placeholder p {
        margin: 0;
        font-size: 0.78rem;
        text-align: center;
        line-height: 1.4;
        opacity: 0.6;
      }

      .preview-meta {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
      }
      .meta-chip {
        font-size: 0.66rem;
        padding: 0.12rem 0.4rem;
        border-radius: 3px;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--muted);
        font-family: 'JetBrains Mono', 'SF Mono', monospace;
      }
      .meta-chip.dim {
        opacity: 0.5;
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

  sectionContentComplete = computed(() => {
    if (this.contentSourceMode() === 'manual')
      return !!this.title().trim() && !!this.content().trim();
    return !!this.selectedContentItem();
  });

  sectionAssetsComplete = computed(() => {
    return !!(this.selectedBgImage() || this.selectedBgVideo());
  });

  sectionPublishComplete = computed(() => {
    return !!this.selectedChannel();
  });

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
