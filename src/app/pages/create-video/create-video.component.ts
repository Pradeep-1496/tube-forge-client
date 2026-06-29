import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, Channel, TextEffect, BackgroundAsset } from '../../services/api.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-create-video',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="create">
      <header class="page-header">
        <h1>Create Video</h1>
        <p>Fill the form and preview before generating.</p>
      </header>

      <div class="split">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form">
          <fieldset>
            <legend>Configuration</legend>
            <div class="field">
              <label for="channelId">Channel</label>
              <select id="channelId" formControlName="channelId" required>
                <option value="" disabled>Select channel</option>
                <option *ngFor="let ch of channels()" [ngValue]="ch.id">{{ ch.name }}</option>
              </select>
            </div>
            <div class="field">
              <label for="title">Title</label>
              <input id="title" type="text" formControlName="title" maxlength="100" required />
              <small>{{ form.controls['title'].value?.length ?? 0 }}/100</small>
            </div>
            <div class="field">
              <label for="content">Content / Dialogue</label>
              <textarea
                id="content"
                rows="6"
                formControlName="content"
                required
                placeholder="Speaker: Line..."
              ></textarea>
            </div>
            <div class="row">
              <div class="field">
                <label for="contentType">Type</label>
                <select id="contentType" formControlName="contentType">
                  <option value="conversation">Conversation</option>
                  <option value="quote">Quote</option>
                </select>
              </div>
              <div class="field">
                <label for="publishAt">Schedule</label>
                <input id="publishAt" type="datetime-local" formControlName="publishAt" />
              </div>
            </div>
            <div class="row">
              <div class="field">
                <label for="textEffect">Text Effect</label>
                <select id="textEffect" formControlName="textEffectId">
                  <option [ngValue]="null">Default</option>
                  <option *ngFor="let te of textEffects()" [value]="te.id">{{ te.name }}</option>
                </select>
              </div>
              <div class="field">
                <label for="background">Background</label>
                <select id="background" formControlName="backgroundAssetId">
                  <option [ngValue]="null">Random</option>
                  <option *ngFor="let b of backgrounds()" [value]="b.id">{{ b.name }}</option>
                </select>
              </div>
            </div>
            <div class="field">
              <label for="tags">Tags (comma separated)</label>
              <input
                id="tags"
                type="text"
                formControlName="tags"
                placeholder="shorts, viral, convoloop"
              />
            </div>
            <div class="field">
              <label for="thumbnail">Thumbnail HTML</label>
              <textarea
                id="thumbnail"
                rows="5"
                formControlName="thumbnail"
                placeholder="<div style='...'>...</div>"
              ></textarea>
              <small>Inline CSS only. Use the preview to check rendering.</small>
            </div>
          </fieldset>
          <div class="actions">
            <button type="submit" class="btn primary" [disabled]="!form.valid || submitting()">
              {{ submitting() ? 'Creating…' : 'Create Draft' }}
            </button>
          </div>
        </form>

        <section class="preview">
          <h3>Preview</h3>
          <div class="device">
            <div class="screen" [ngStyle]="previewBackground()">
              <div class="overlay"></div>
              <div class="content">
                <div class="preview-title">{{ form.controls['title'].value || 'Title' }}</div>
                <div class="preview-thumb" [innerHTML]="thumbnailHtml()"></div>
                <div class="preview-lines">
                  <div *ngFor="let line of previewLines()" class="preview-line">
                    <span class="speaker">{{ line.speaker }}:</span>
                    <span class="text">{{ line.text }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [
    `
      .create {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
      }
      .page-header h1 {
        font-size: 1.6rem;
        font-weight: 700;
        color: var(--text);
        margin: 0;
      }
      .page-header p {
        color: var(--muted);
        margin: 0.25rem 0 0;
        font-size: 0.92rem;
      }
      .split {
        display: grid;
        grid-template-columns: 1fr 340px;
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
      .form fieldset {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      legend {
        color: var(--text);
        font-weight: 600;
        font-size: 0.9rem;
      }
      .field {
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
      }
      label {
        font-size: 0.82rem;
        color: var(--muted);
        font-weight: 500;
      }
      input,
      select,
      textarea {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.6rem 0.85rem;
        border-radius: 0.55rem;
        font-size: 0.9rem;
        width: 100%;
        font-family: inherit;
      }
      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px var(--accent-weak);
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      small {
        font-size: 0.75rem;
        color: var(--muted);
        text-align: right;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 0.5rem;
      }
      .btn {
        padding: 0.55rem 1.2rem;
        border-radius: 0.55rem;
        font-weight: 600;
        font-size: 0.88rem;
        border: 1px solid transparent;
        cursor: pointer;
        display: inline-flex;
        gap: 0.4rem;
        align-items: center;
        transition: all 0.15s ease;
      }
      .btn.primary {
        background: var(--accent);
        color: #fff;
        border-color: var(--accent);
      }
      .btn.primary:hover:not(:disabled) {
        filter: brightness(1.1);
      }
      .btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .preview h3 {
        margin: 0 0 0.8rem;
        color: var(--text);
        font-size: 0.9rem;
      }
      .device {
        background: var(--bg);
        border-radius: 1.2rem;
        border: 1px solid var(--border);
        overflow: hidden;
      }
      .screen {
        aspect-ratio: 9 / 16;
        position: relative;
        background: linear-gradient(135deg, #18181c 0%, #09090b 100%);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 1.5rem;
        text-align: center;
      }
      .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.35);
      }
      .content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        width: 100%;
      }
      .preview-title {
        color: #fff;
        font-weight: 700;
        font-size: 1.2rem;
        text-align: center;
        word-break: break-word;
      }
      .preview-thumb {
        width: 100%;
        text-align: center;
      }
      .preview-thumb :deep(*) {
        max-width: 100%;
      }
      .preview-lines {
        display: flex;
        flex-direction: column;
        gap: 0.7rem;
      }
      .preview-line {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25rem;
        justify-content: center;
        align-items: baseline;
      }
      .speaker {
        color: var(--accent);
        font-weight: 700;
        font-size: 0.95rem;
      }
      .text {
        color: #fff;
        font-size: 0.9rem;
        word-break: break-word;
      }
    `,
  ],
})
export class CreateVideoComponent implements OnInit {
  channels = signal<Channel[]>([]);
  textEffects = signal<TextEffect[]>([]);
  backgrounds = signal<BackgroundAsset[]>([]);
  submitting = signal(false);
  form: ReturnType<typeof this.fb.group>;
  private readonly api: ApiService;
  private readonly fb: FormBuilder;

  constructor(
    api: ApiService,
    fb: FormBuilder,
    private readonly sanitizer: DomSanitizer,
  ) {
    this.api = api;
    this.fb = fb;
    this.form = this.fb.group({
      channelId: [null as string | null, Validators.required],
      title: ['', [Validators.required, Validators.maxLength(100)]],
      description: [''],
      content: ['', Validators.required],
      contentType: ['conversation'],
      textEffectId: [null as string | null],
      backgroundAssetId: [null as string | null],
      publishAt: [''],
      tags: [''],
      thumbnail: [''],
    });
  }

  ngOnInit(): void {
    this.api.getChannels().subscribe({ next: (c) => this.channels.set(c) });
    this.api.getTextEffects().subscribe({ next: (c) => this.textEffects.set(c) });
    this.api.getBackgroundAssets().subscribe({ next: (c) => this.backgrounds.set(c) });
  }

  private toSingleLine(text: string): string {
    return text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
  }

  onSubmit() {
    if (this.form.invalid || this.submitting()) return;
    this.submitting.set(true);
    const raw = this.form.getRawValue() as Record<string, unknown>;
    const payload = {
      ...raw,
      content: this.toSingleLine((raw['content'] as string) || ''),
      tags: ((raw['tags'] as string) || '')
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean) as string[],
    };
    this.api.createVideo(payload as any).subscribe({
      next: () => {
        this.submitting.set(false);
        alert('Draft created! Go to Videos to generate.');
      },
      error: (err) => {
        this.submitting.set(false);
        alert(err?.error ?? 'Failed');
      },
    });
  }

  previewBackground() {
    const id = this.form.controls['backgroundAssetId'].value;
    const asset = this.backgrounds().find((a) => a.id === id);
    if (!asset || !asset.path) return {};
    return {
      background: `url(http://localhost:3000/${asset.path.replace(/\\/g, '/')}) no-repeat center / cover`,
    };
  }

  previewLines() {
    const content = (this.form.controls['content'].value as string) || '';
    return content
      .split('\n')
      .filter((l) => l.trim() && l.includes(':'))
      .map((l) => {
        const [speaker, ...rest] = l.split(':');
        return { speaker: speaker.trim(), text: rest.join(':').trim() };
      });
  }

  thumbnailHtml() {
    const raw = (this.form.controls['thumbnail'].value as string) || '';
    return this.sanitizer.bypassSecurityTrustHtml(raw);
  }
}
