import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { ApiService, TextEffect, BackgroundAsset } from '../../services/api.service';

type Tab = 'text-effects' | 'backgrounds';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="assets">
      <header class="page-header">
        <div>
          <h1>Assets</h1>
          <p>Text effects and background images for your videos.</p>
        </div>
        <button class="btn primary" (click)="startCreate()">+ New Text Effect</button>
      </header>

      <div class="tabs">
        @for (t of tabs; track t) {
          <button
            class="tab"
            [class.active]="active() === t"
            (click)="active.set(t)"
          >{{ tabLabel(t) }}</button>
        }
      </div>

      @if (active() === 'text-effects') {
        <section class="list">
          @if (showEditor()) {
            <form [formGroup]="editorForm" (ngSubmit)="saveEffect()" class="editor">
              <h4>{{ editingId() ? 'Edit' : 'New' }} Text Effect</h4>
              <div class="row">
                <div class="field"><label>Name</label><input formControlName="name" /></div>
                <div class="field">
                  <label>Active</label>
                  <input type="checkbox" formControlName="isActive" />
                </div>
              </div>
              <div class="field"><label>Description</label><input formControlName="description" /></div>
              <div class="actions">
                <button type="button" class="btn ghost" (click)="closeEditor()">Cancel</button>
                <button type="submit" class="btn primary">Save</button>
              </div>
            </form>
          }
          <div class="grid">
            @for (te of textEffects(); track te.id) {
              <article class="asset-card">
                <div class="title">{{ te.name }}</div>
                <p class="desc">{{ te.description || '—' }}</p>
                <small>{{ te.isActive ? 'Active' : 'Disabled' }}</small>
                <div class="actions">
                  <button class="btn sm" (click)="startEditEffect(te)">Edit</button>
                  <button class="btn sm danger ghost" (click)="removeEffect(te)">Delete</button>
                </div>
              </article>
            }
            @if (!textEffects().length) {
              <div class="notice">No text effects yet.</div>
            }
          </div>
        </section>
      }

      @if (active() === 'backgrounds') {
        <section class="list">
          <div class="uploader">
            <input type="file" accept="image/*" #fileInput />
            <button class="btn primary" (click)="upload(fileInput)">
              {{ uploading() ? 'Uploading…' : 'Upload Image' }}
            </button>
          </div>
          <div class="grid">
            @for (bg of backgrounds(); track bg.id) {
              <article class="bg-card" [class.inactive]="bg.visibility !== 'public'">
                <div class="thumb">
                  <img [src]="bgUrl(bg)" [alt]="bg.name" />
                </div>
                <div class="meta">
                  <div class="name">{{ bg.name }}</div>
                  <small>{{ bg.type }}{{ bg.size ? ' · ' + (bg.size / 1024).toFixed(1) + ' KB' : '' }}</small>
                </div>
                <div class="actions">
                  <label class="toggle sm">
                    <input type="checkbox" [checked]="bg.visibility === 'public'" (change)="toggleBg(bg)" />
                  </label>
                  <button class="btn sm danger ghost" (click)="removeBg(bg)">Delete</button>
                </div>
              </article>
            }
            @if (!backgrounds().length) {
              <div class="notice">No backgrounds yet. Upload a JPG/PNG.</div>
            }
          </div>
        </section>
      }
    </div>
  `,
  styles: [`
    .assets { display: flex; flex-direction: column; gap: 1.4rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .tabs { display: flex; gap: 0.3rem; background: var(--border-subtle); border-radius: 0.55rem; padding: 0.25rem; width: fit-content; }
    .tab {
      background: transparent; border: none; color: var(--muted); padding: 0.5rem 1.2rem;
      border-radius: 0.45rem; font-weight: 500; font-size: 0.85rem; cursor: pointer;
    }
    .tab.active { background: var(--accent-weak); color: var(--text); }
    .list { display: flex; flex-direction: column; gap: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 1rem; }
    .asset-card, .bg-card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1rem;
      display: flex; flex-direction: column; gap: 0.5rem;
    }
    .bg-card .thumb { aspect-ratio: 16/9; background: var(--bg); border-radius: 0.5rem; overflow: hidden; }
    .bg-card .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .title { font-weight: 700; color: var(--text); }
    .desc { color: var(--muted); font-size: 0.82rem; margin: 0; }
    .meta { display: flex; flex-direction: column; gap: 0.15rem; }
    .meta .name { color: var(--text); font-weight: 600; }
    small { color: var(--muted); font-size: 0.75rem; }
    .notice { color: var(--muted); font-style: italic; padding: 1rem; text-align: center; }
    .editor {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1rem;
      display: flex; flex-direction: column; gap: 0.8rem;
    }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; align-items: center; flex-wrap: wrap; }
    .uploader, .row { display: flex; gap: 0.8rem; align-items: center; flex-wrap: wrap; }
    .uploader input[type="file"] { color: var(--muted); font-size: 0.85rem; }
    .toggle.sm input { width: auto; }
    .btn {
      padding: 0.5rem 1rem; border-radius: 0.55rem; border: 1px solid transparent; cursor: pointer;
      font-weight: 600; font-size: 0.85rem; transition: all 0.15s ease;
    }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
    input[type="text"], textarea, select {
      background: var(--border-subtle); border: 1px solid var(--border); color: var(--text);
      padding: 0.5rem 0.75rem; border-radius: 0.55rem; font-size: 0.88rem;
    }
  `]
})
export class AssetsComponent implements OnInit {
  tabs: Tab[] = ['text-effects', 'backgrounds'];
  active = signal<Tab>('text-effects');
  textEffects = signal<TextEffect[]>([]);
  backgrounds = signal<BackgroundAsset[]>([]);
  showEditor = signal(false);
  editingId = signal<string | null>(null);
  uploading = signal(false);
  editorForm: ReturnType<typeof this.fb.group>;
  private readonly api: ApiService;
  private readonly fb: FormBuilder;

  constructor(api: ApiService, fb: FormBuilder) {
    this.api = api;
    this.fb = fb;
    this.editorForm = this.fb.group({
      name: [''],
      description: [''],
      config: [{ value: {}, disabled: true }],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadEffects();
    this.loadBackgrounds();
  }

  tabLabel(t: Tab) { return t === 'text-effects' ? 'Text Effects' : 'Backgrounds'; }

  startCreate() {
    this.editorForm.reset({ name: '', description: '', config: {}, isActive: true });
    this.editingId.set(null);
    this.showEditor.set(true);
  }

  startEditEffect(te: TextEffect) {
    this.editorForm.reset({
      name: te.name,
      description: te.description ?? '',
      config: te.config ?? {},
      isActive: te.isActive
    });
    this.editingId.set(te.id);
    this.showEditor.set(true);
  }

  saveEffect() {
    if (this.editorForm.invalid) return;
    const payload = this.editorForm.getRawValue();
    this.api.createTextEffect(payload as any).subscribe({
      next: () => { this.closeEditor(); this.loadEffects(); }
    });
  }

  closeEditor() { this.showEditor.set(false); }

  removeEffect(te: TextEffect) {
    if (!confirm(`Remove text effect "${te.name}"?`)) return;
    this.api.deleteTextEffect(te.id).subscribe({ next: () => this.loadEffects() });
  }

  upload(input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    this.uploading.set(true);
    this.api.uploadBackgroundAsset(file).subscribe({
      next: () => { this.uploading.set(false); this.loadBackgrounds(); input.value = ''; },
      error: () => { this.uploading.set(false); alert('Upload failed.'); }
    });
  }

  toggleBg(bg: BackgroundAsset) {
    this.api.updateBackgroundAsset(bg.id, { visibility: bg.visibility === 'public' ? 'private' : 'public' } as any).subscribe({ next: () => this.loadBackgrounds() });
  }

  removeBg(bg: BackgroundAsset) {
    if (!confirm('Delete background?')) return;
    this.api.deleteBackgroundAsset(bg.id).subscribe({ next: () => this.loadBackgrounds() });
  }

  private loadEffects() {
    this.api.getTextEffects().subscribe({ next: (c) => this.textEffects.set(c) });
  }

  private loadBackgrounds() {
    this.api.getBackgroundAssets().subscribe({ next: (c) => this.backgrounds.set(c) });
  }

  bgUrl(bg: BackgroundAsset): string {
    return `http://localhost:3000/${bg.path.replace(/\\/g, '/')}`;
  }
}
