import { Component, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, VideoContent, BackgroundAsset, BackgroundVideo, AudioAsset, SubscribeImage, Channel, Theme } from '../../../services/api.service';
import { AssetPickerComponent, PickerOption } from '../asset-picker/asset-picker.component';

type Step = 'content' | 'background' | 'audio' | 'subscribe' | 'theme' | 'channel';

@Component({
  selector: 'app-generation-wizard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AssetPickerComponent],
  template: `
    <div class="wizard">
      <div class="steps-indicator">
        @for (s of steps; track s; let i = $index) {
          <div class="step-dot" [class.active]="i === currentStep()" [class.done]="i < currentStep()">
            <span class="step-num">{{ i < currentStep() ? '✓' : i + 1 }}</span>
            <span class="step-label">{{ stepLabel(s) }}</span>
          </div>
        }
      </div>

      <div class="wizard-body">
        @if (currentStep() === 0) {
          <section class="step">
            <h3>Select Video Content</h3>
            <p class="hint">Choose the content to generate a video from.</p>
            <div class="content-list">
              @for (item of contentItems(); track item.id) {
                <div class="content-option" [class.selected]="selectedContent()?.id === item.id" (click)="selectContent(item)">
                  <div class="content-info">
                    <strong>{{ item.title }}</strong>
                    <p>{{ item.content | slice:0:120 }}{{ item.content.length > 120 ? '…' : '' }}</p>
                  </div>
                  <span class="badge" [class.public]="item.visibility === 'public'">{{ item.visibility }}</span>
                </div>
              }
              @if (!contentItems().length) {
                <div class="empty">No content items available.</div>
              }
            </div>
          </section>
        }

        @if (currentStep() === 1) {
          <section class="step">
            <h3>Choose Background</h3>
            <p class="hint">Pick a background image or video.</p>
            <div class="picker-actions">
              <button class="btn ghost" (click)="openPicker('backgrounds')">
                {{ selectedBg() ? selectedBg()!.name : 'Select background image' }}
              </button>
              <button class="btn ghost" (click)="openPicker('background-videos')">
                {{ selectedBgVideo() ? selectedBgVideo()!.name : 'Select background video' }}
              </button>
            </div>
            <div class="preview-row" *ngIf="selectedBg() || selectedBgVideo()">
              <span class="tag" *ngIf="selectedBg()">Image: {{ selectedBg()!.name }}</span>
              <span class="tag" *ngIf="selectedBgVideo()">Video: {{ selectedBgVideo()!.name }}</span>
              <button class="btn sm ghost" (click)="clearBg()">Clear</button>
            </div>
          </section>
        }

        @if (currentStep() === 2) {
          <section class="step">
            <h3>Pick Audio</h3>
            <p class="hint">Select background music or audio track.</p>
            <button class="btn ghost full" (click)="openPicker('audios')">
              {{ selectedAudio() ? selectedAudio()!.name : 'Select audio track' }}
            </button>
            <div class="selected-info" *ngIf="selectedAudio()">
              <span>Selected: <strong>{{ selectedAudio()!.name }}</strong></span>
              <button class="btn sm ghost" (click)="clearAudio()">Clear</button>
            </div>
          </section>
        }

        @if (currentStep() === 3) {
          <section class="step">
            <h3>Subscribe Image (Optional)</h3>
            <p class="hint">Add a subscribe image overlay if desired.</p>
            <button class="btn ghost full" (click)="openPicker('subscribe-images')">
              {{ selectedSubscribeImage() ? selectedSubscribeImage()!.name : 'Select subscribe image' }}
            </button>
            <div class="selected-info" *ngIf="selectedSubscribeImage()">
              <span>Selected: <strong>{{ selectedSubscribeImage()!.name }}</strong></span>
              <button class="btn sm ghost" (click)="clearSubscribeImage()">Clear</button>
            </div>
          </section>
        }

        @if (currentStep() === 4) {
          <section class="step">
            <h3>Select Theme</h3>
            <p class="hint">Choose a visual theme for the video.</p>
            <button class="btn ghost full" (click)="openPicker('themes')">
              {{ selectedTheme() ? selectedTheme()!.name : 'Select theme' }}
            </button>
            <div class="selected-info" *ngIf="selectedTheme()">
              <span>Selected: <strong>{{ selectedTheme()!.name }}</strong></span>
              <button class="btn sm ghost" (click)="clearTheme()">Clear</button>
            </div>
          </section>
        }

        @if (currentStep() === 5) {
          <section class="step">
            <h3>Channel & Date</h3>
            <p class="hint">Choose the YouTube channel and publish date.</p>
            <button class="btn ghost full" (click)="openPicker('channels')">
              {{ selectedChannel() ? selectedChannel()!.name : 'Select channel' }}
            </button>
            <div class="field" style="margin-top: 1rem;">
              <label>Published Date</label>
              <input type="datetime-local" [(ngModel)]="publishDate" />
            </div>
          </section>
        }
      </div>

      <div class="wizard-footer">
        <button class="btn ghost" (click)="prevStep()" [disabled]="currentStep() === 0">Back</button>
        <div class="right">
          <button class="btn ghost" (click)="cancel.emit()">Cancel</button>
          @if (currentStep() < 5) {
            <button class="btn primary" (click)="nextStep()" [disabled]="!canProceed()">Next</button>
          }
          @if (currentStep() === 5) {
            <button class="btn primary" (click)="doGenerate()" [disabled]="!canGenerate()">
              Generate Video
            </button>
          }
        </div>
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
  styles: [`
    .wizard { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; display: flex; flex-direction: column; }
    .steps-indicator { display: flex; gap: 0; padding: 1.2rem 1.4rem; border-bottom: 1px solid var(--border-subtle); overflow-x: auto; }
    .step-dot { display: flex; align-items: center; gap: 0.5rem; padding: 0 1rem; position: relative; }
    .step-dot:not(:last-child)::after { content: ''; position: absolute; left: 100%; top: 50%; width: 1rem; height: 1px; background: var(--border); }
    .step-num { width: 1.6rem; height: 1.6rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; background: var(--border); color: var(--muted); flex-shrink: 0; }
    .step-dot.active .step-num { background: var(--accent); color: #fff; }
    .step-dot.done .step-num { background: var(--success); color: #fff; }
    .step-label { font-size: 0.78rem; color: var(--muted); white-space: nowrap; }
    .step-dot.active .step-label { color: var(--text); font-weight: 600; }
    .wizard-body { padding: 1.4rem; min-height: 280px; }
    .step h3 { margin: 0 0 0.35rem; color: var(--text); font-size: 1.1rem; }
    .hint { color: var(--muted); font-size: 0.85rem; margin: 0 0 1rem; }
    .content-list { display: flex; flex-direction: column; gap: 0.5rem; max-height: 320px; overflow-y: auto; }
    .content-option { display: flex; justify-content: space-between; align-items: flex-start; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.55rem; border: 1px solid var(--border); cursor: pointer; transition: all 0.15s; }
    .content-option:hover { border-color: var(--accent-weak); }
    .content-option.selected { border-color: var(--accent); background: var(--accent-weak); }
    .content-info { flex: 1; min-width: 0; }
    .content-info strong { color: var(--text); font-size: 0.9rem; display: block; }
    .content-info p { color: var(--muted); font-size: 0.82rem; margin: 0.25rem 0 0; }
    .badge { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; padding: 0.2rem 0.5rem; border-radius: 9999px; flex-shrink: 0; }
    .badge.public { background: rgba(16,185,129,0.15); color: var(--success); }
    .empty { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .picker-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .preview-row { display: flex; align-items: center; gap: 0.5rem; margin-top: 0.75rem; flex-wrap: wrap; }
    .tag { font-size: 0.8rem; padding: 0.25rem 0.6rem; background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.4rem; color: var(--text); }
    .selected-info { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; color: var(--text); font-size: 0.88rem; }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    .field label { font-size: 0.82rem; color: var(--muted); font-weight: 500; }
    .field input { background: var(--border-subtle); border: 1px solid var(--border); color: var(--text); padding: 0.55rem 0.85rem; border-radius: 0.55rem; font-size: 0.88rem; }
    .wizard-footer { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.4rem; border-top: 1px solid var(--border-subtle); }
    .right { display: flex; gap: 0.5rem; align-items: center; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; }
    .btn.full { width: 100%; justify-content: flex-start; text-align: left; }
  `]
})
export class GenerationWizardComponent implements OnInit {
  contentId = input<string>('');
  generate = output<{
    videoContentId: string;
    backgroundId?: string;
    backgroundVideoId?: string;
    audioId?: string;
    theme?: string;
    subscribeImageId?: string;
    channelId: string;
    publishedDate: string;
  }>();
  cancel = output<void>();

  steps: Step[] = ['content', 'background', 'audio', 'subscribe', 'theme', 'channel'];
  currentStep = signal(0);
  showPicker = signal(false);
  pickerType = signal<any>('backgrounds');

  contentItems = signal<VideoContent[]>([]);
  selectedContent = signal<VideoContent | null>(null);
  selectedBg = signal<PickerOption | null>(null);
  selectedBgVideo = signal<PickerOption | null>(null);
  selectedAudio = signal<PickerOption | null>(null);
  selectedSubscribeImage = signal<PickerOption | null>(null);
  selectedTheme = signal<PickerOption | null>(null);
  selectedChannel = signal<PickerOption | null>(null);
  publishDate = signal('');

  private readonly api: ApiService;

  constructor(api: ApiService) {
    this.api = api;
  }

  ngOnInit() {
    this.loadContent();
  }

  stepLabel(s: Step): string {
    const labels: Record<Step, string> = {
      content: 'Content',
      background: 'Background',
      audio: 'Audio',
      subscribe: 'Subscribe',
      theme: 'Theme',
      channel: 'Channel',
    };
    return labels[s];
  }

  canProceed(): boolean {
    switch (this.currentStep()) {
      case 0: return !!this.selectedContent();
      case 5: return !!this.selectedChannel();
      default: return true;
    }
  }

  canGenerate(): boolean {
    return !!this.selectedContent() && !!this.selectedChannel();
  }

  private loadContent() {
        this.api.getContentItems().subscribe({ next: (items) => this.contentItems.set(items as VideoContent[]) });
  }

  selectContent(item: VideoContent) {
    this.selectedContent.set(item);
  }

  openPicker(type: any) {
    this.pickerType.set(type);
    this.showPicker.set(true);
  }

  onAssetPicked(opt: PickerOption | null) {
    if (!opt) return;
    switch (this.pickerType()) {
      case 'backgrounds': this.selectedBg.set(opt); break;
      case 'background-videos': this.selectedBgVideo.set(opt); break;
      case 'audios': this.selectedAudio.set(opt); break;
      case 'subscribe-images': this.selectedSubscribeImage.set(opt); break;
      case 'themes': this.selectedTheme.set(opt); break;
      case 'channels': this.selectedChannel.set(opt); break;
    }
  }

  clearBg() { this.selectedBg.set(null); this.selectedBgVideo.set(null); }
  clearAudio() { this.selectedAudio.set(null); }
  clearSubscribeImage() { this.selectedSubscribeImage.set(null); }
  clearTheme() { this.selectedTheme.set(null); }

  nextStep() {
    if (this.currentStep() < 5) this.currentStep.update(v => v + 1);
  }

  prevStep() {
    if (this.currentStep() > 0) this.currentStep.update(v => v - 1);
  }

  doGenerate() {
    const content = this.selectedContent();
    if (!content) return;
    this.generate.emit({
      videoContentId: content.id,
      backgroundId: this.selectedBg()?.id,
      backgroundVideoId: this.selectedBgVideo()?.id,
      audioId: this.selectedAudio()?.id,
      theme: this.selectedTheme()?.id,
      subscribeImageId: this.selectedSubscribeImage()?.id,
      channelId: this.selectedChannel()?.id || '',
      publishedDate: this.publishDate(),
    });
  }
}
