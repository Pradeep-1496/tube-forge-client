import { Component, input, output, signal, HostListener } from '@angular/core';
import { Visibility } from '../../../services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-asset-upload-form',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="upload-form">
      <div
        class="drop-zone"
        [class.drag-over]="dragOver()"
        (click)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
      >
        <input
          #fileInput
          type="file"
          [accept]="accept()"
          (change)="onFileSelected(fileInput)"
          style="display: none"
        />
        <div class="drop-content">
          <span class="drop-icon">📁</span>
          <p class="drop-text">{{ selectedFile() ? selectedFile()!.name : 'Drop file here or click to browse' }}</p>
          <small class="drop-hint">{{ acceptHint() }}</small>
        </div>
      </div>

      @if (selectedFile(); as file) {
        <div class="fields">
          <label class="field">
            <span class="label">Name</span>
            <input
              #nameInput
              type="text"
              [value]="name()"
              (input)="onNameInput(nameInput)"
              placeholder="Asset name"
            />
          </label>

          @if (showTypeField()) {
            <label class="field">
              <span class="label">Type</span>
              <select #typeSelect [value]="type()" (change)="onTypeChange(typeSelect)">
                <option value="landscape">Landscape</option>
                <option value="portrait">Portrait</option>
              </select>
            </label>
          }

          <label class="field">
            <span class="label">Visibility</span>
            <select #visSelect [value]="visibility()" (change)="onVisibilityChange(visSelect)">
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>

          <div class="actions">
            <button class="btn sm danger ghost" (click)="clear()">Clear</button>
            <button class="btn primary" (click)="submit(file)" [disabled]="uploading()">
              {{ uploading() ? 'Uploading…' : 'Upload' }}
            </button>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .upload-form { display: flex; flex-direction: column; gap: 1rem; }
    .drop-zone { border: 2px dashed var(--border); border-radius: 0.75rem; padding: 1.4rem; text-align: center; cursor: pointer; transition: all 0.15s ease; background: var(--bg); }
    .drop-zone:hover { border-color: var(--accent); background: var(--border-subtle); }
    .drop-zone.drag-over { border-color: var(--accent); background: var(--accent-weak); }
    .drop-content { display: flex; flex-direction: column; align-items: center; gap: 0.4rem; }
    .drop-icon { font-size: 1.6rem; }
    .drop-text { margin: 0; color: var(--text); font-weight: 500; font-size: 0.9rem; }
    .drop-hint { color: var(--muted); font-size: 0.78rem; }
    .fields { display: flex; flex-direction: column; gap: 0.8rem; padding: 0.8rem; background: var(--border-subtle); border-radius: 0.75rem; }
    .field { display: flex; flex-direction: column; gap: 0.25rem; }
    .label { font-size: 0.78rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .field input, .field select { padding: 0.5rem 0.7rem; border-radius: 0.45rem; border: 1px solid var(--border); background: var(--bg); color: var(--text); font-size: 0.85rem; }
    .field input:focus, .field select:focus { outline: none; border-color: var(--accent); }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.2rem; }
    .btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class AssetUploadFormComponent {
  accept = input.required<string>();
  showTypeField = input<boolean>(false);
  uploadFn = input.required<(file: File, fields: { name: string; type?: string; visibility: Visibility }) => Promise<any>>();

  uploaded = output<void>();

  selectedFile = signal<File | null>(null);
  name = signal('');
  type = signal('landscape');
  visibility = signal<Visibility>('public');
  uploading = signal(false);
  dragOver = signal(false);

  @HostListener('document:paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const file = event.clipboardData?.files?.[0];
    if (!file) return;
    this.selectFile(file);
  }

  acceptHint(): string {
    const a = this.accept().toLowerCase();
    if (a.includes('audio')) return 'MP3, WAV, OGG…';
    if (a.includes('video')) return 'MP4, MOV, WEBM…';
    if (a.includes('image')) return 'JPG, PNG, WEBP…';
    return 'Files';
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.dragOver.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    this.selectFile(file);
  }

  onFileSelected(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.selectFile(file);
    input.value = '';
  }

  onNameInput(el: HTMLInputElement) {
    this.name.set(el.value);
  }

  onTypeChange(el: HTMLSelectElement) {
    this.type.set(el.value);
  }

  onVisibilityChange(el: HTMLSelectElement) {
    this.visibility.set(el.value as Visibility);
  }

  private selectFile(file: File) {
    this.selectedFile.set(file);
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    this.name.set(baseName);
    const lower = file.name.toLowerCase();
    if (lower.includes('portrait')) {
      this.type.set('portrait');
    } else if (lower.includes('landscape')) {
      this.type.set('landscape');
    }
  }

  clear() {
    this.selectedFile.set(null);
    this.name.set('');
    this.type.set('landscape');
    this.visibility.set('public');
  }

  async submit(file: File) {
    if (!this.name().trim()) return;
    this.uploading.set(true);
    try {
      await this.uploadFn()(file, {
        name: this.name().trim(),
        type: this.showTypeField() ? this.type() : undefined,
        visibility: this.visibility(),
      });
      this.clear();
      this.uploaded.emit();
    } catch {
      alert('Upload failed.');
    } finally {
      this.uploading.set(false);
    }
  }
}
