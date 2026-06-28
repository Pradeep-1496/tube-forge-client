import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { VideoContent, Visibility } from '../../../services/api.service';

@Component({
  selector: 'app-content-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="editor" [formGroup]="form">
      <h3>{{ initial()?.id ? 'Edit content' : 'New video content' }}</h3>
      <div class="field">
        <label for="title">Title</label>
        <input id="title" formControlName="title" placeholder="Enter a descriptive title" />
      </div>
      <div class="field">
        <label for="content">Content</label>
        <textarea
          id="content"
          rows="8"
          formControlName="content"
          placeholder="Write the full script or long-form text content for the video..."
        ></textarea>
        <small class="char-count">{{ form.controls['content'].value?.length ?? 0 }} characters</small>
      </div>
      <div class="visibility-row">
        <label class="toggle-label">
          <input type="checkbox" formControlName="visibility" [checked]="form.controls['visibility'].value === 'public'" (change)="toggleVisibility()" />
          <span class="toggle-text">{{ form.controls['visibility'].value === 'public' ? 'Public' : 'Private' }}</span>
        </label>
        <span class="visibility-hint">
          {{ form.controls['visibility'].value === 'public' ? 'Visible to all users' : 'Only visible to you' }}
        </span>
      </div>
      <div class="actions">
        <button type="button" class="btn ghost" (click)="cancel.emit()">Cancel</button>
        <button type="button" class="btn primary" (click)="save()" [disabled]="form.invalid">
          {{ initial()?.id ? 'Update' : 'Create' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor { background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem; padding: 1.4rem; display: flex; flex-direction: column; gap: 1rem; }
    .editor h3 { margin: 0 0 0.25rem; color: var(--text); }
    .field { display: flex; flex-direction: column; gap: 0.35rem; }
    label { font-size: 0.82rem; color: var(--muted); font-weight: 500; }
    input, textarea, select {
      width: 100%; background: var(--border-subtle); border: 1px solid var(--border); color: var(--text);
      padding: 0.55rem 0.85rem; border-radius: 0.55rem; font-size: 0.88rem; font-family: inherit;
      box-sizing: border-box;
    }
    input:focus, textarea:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-weak); }
    textarea { resize: vertical; min-height: 120px; }
    .char-count { text-align: right; font-size: 0.75rem; color: var(--muted); }
    .visibility-row { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem 0; }
    .toggle-label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.88rem; color: var(--text); }
    .toggle-label input[type="checkbox"] { width: auto; accent-color: var(--accent); }
    .toggle-text { font-weight: 600; }
    .visibility-hint { font-size: 0.78rem; color: var(--muted); }
    .actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
    .btn { padding: 0.55rem 1.2rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.88rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    .btn.primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn.primary:hover:not(:disabled) { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
  `]
})
export class ContentEditorComponent {
  initial = input<VideoContent | null>(null);
  saved = output<Partial<VideoContent>>();
  cancel = output<void>();
  form: ReturnType<typeof this.fb.group>;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      visibility: ['private'],
    });
  }

  ngOnInit() {
    const init = this.initial();
    if (init) {
      this.form.patchValue({
        title: init.title,
        content: init.content,
        visibility: init.visibility,
      });
    }
  }

  toggleVisibility() {
    this.form.controls['visibility'].setValue(
      this.form.controls['visibility'].value === 'public' ? 'private' : 'public'
    );
  }

  save() {
    if (this.form.invalid) return;
    this.saved.emit(this.form.getRawValue());
  }
}
