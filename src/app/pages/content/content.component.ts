import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ApiService, ContentItem } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-content',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="content-page">
      <header class="page-header">
        <div>
          <h1>Content</h1>
          <p>Manage your video content items.</p>
        </div>
        <button class="btn primary" (click)="startCreate()">+ New Content</button>
      </header>

      <section class="grid" *ngIf="!editing(); else editor">
        @for (item of items(); track item.id) {
          <article class="content-card">
            <div class="card-top">
              <div class="title">{{ item.title }}</div>
              <span class="badge">{{ item.type }}</span>
            </div>
            <p class="body">{{ item.content }}</p>
            <div class="meta">
              <span>By: <b>{{ item.user?.name || 'Unknown' }}</b></span>
              @if (isOwned(item)) {
                <span class="owned">Owned</span>
              }
            </div>
            <div class="actions">
              <button class="btn sm ghost" (click)="startEdit(item)">Edit</button>
              <button class="btn sm danger ghost" (click)="remove(item)">Delete</button>
            </div>
          </article>
        }
        @if (!items().length) {
          <div class="notice empty">No content items yet. Click “New Content” to get started.</div>
        }
      </section>

      <ng-template #editor>
        <div class="editor" [formGroup]="form">
          <h3>{{ editing()!.id ? 'Edit content' : 'New content' }}</h3>
          <div class="field">
            <label>Title</label>
            <input formControlName="title" placeholder="Enter title" />
          </div>
          <div class="field">
            <label>Content</label>
            <textarea rows="4" formControlName="content" placeholder="Enter content"></textarea>
          </div>
          <div class="row">
            <div class="field">
              <label>Type</label>
              <input formControlName="type" placeholder="e.g. video" />
            </div>
            <div class="field">
              <label>Visibility</label>
              <input formControlName="visibility" placeholder="e.g. private" />
            </div>
          </div>
          <div class="actions">
            <button type="button" class="btn ghost" (click)="editing.set(null)">Cancel</button>
            <button type="button" class="btn primary" (click)="save()">Save</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [
    `
      .content-page {
        display: flex;
        flex-direction: column;
        gap: 1.6rem;
      }
      .page-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 1.5rem;
        flex-wrap: wrap;
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
      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1rem;
      }
      .content-card {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.2rem 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        transition: transform 0.2s ease, border-color 0.2s ease;
      }
      .content-card:hover {
        transform: translateY(-2px);
        border-color: var(--accent);
      }
      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .title {
        font-weight: 700;
        color: var(--text);
        font-size: 1rem;
      }
      .badge {
        font-size: 0.72rem;
        color: var(--muted);
        text-transform: uppercase;
        font-weight: 700;
        background: var(--border-subtle);
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
      }
      .body {
        color: var(--muted);
        font-size: 0.85rem;
        margin: 0;
        line-height: 1.45;
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      .meta {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.78rem;
        color: var(--muted);
      }
      .meta b {
        color: var(--text);
      }
      .owned {
        display: inline-flex;
        align-items: center;
        gap: 0.35rem;
        font-size: 0.72rem;
        color: var(--success);
        text-transform: uppercase;
        font-weight: 700;
        background: rgba(34, 197, 94, 0.12);
        border: 1px solid rgba(34, 197, 94, 0.35);
        padding: 0.2rem 0.6rem;
        border-radius: 9999px;
        width: fit-content;
      }
      .editor {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .editor h3 {
        margin: 0 0 0.25rem;
        color: var(--text);
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
      textarea {
        width: 100%;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.55rem 0.85rem;
        border-radius: 0.55rem;
        font-size: 0.88rem;
        font-family: inherit;
      }
      .row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.6rem;
      }
      .notice {
        padding: 2rem;
        text-align: center;
        color: var(--muted);
        font-style: italic;
      }
      .btn {
        padding: 0.55rem 1.2rem;
        border-radius: 0.55rem;
        font-weight: 600;
        font-size: 0.88rem;
        cursor: pointer;
        border: 1px solid transparent;
      }
      .btn.primary {
        background: var(--accent);
        color: #fff;
      }
      .btn.ghost {
        background: transparent;
        color: var(--text);
        border-color: var(--border);
      }
      .btn.sm {
        padding: 0.3rem 0.7rem;
        font-size: 0.78rem;
        border-radius: 0.45rem;
      }
      .btn.danger.ghost:hover:not(:disabled) {
        background: rgba(239, 68, 68, 0.15);
        color: var(--danger);
      }
    `,
  ],
})
export class ContentComponent implements OnInit {
  items = signal<ContentItem[]>([]);
  editing = signal<ContentItem | null>(null);
  currentUserId = signal<string>('');
  form: ReturnType<typeof this.fb.group>;

  constructor(private readonly api: ApiService, private readonly fb: FormBuilder, private readonly auth: AuthService) {
    this.form = this.fb.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      type: [''],
      visibility: [''],
    });
  }

  ngOnInit(): void {
    const user = this.auth.getCurrentUser();
    if (user) this.currentUserId.set(user.id);
    this.loadItems();
  }

  isOwned(item: ContentItem): boolean {
    const me = this.currentUserId();
    return !!me && item.userId === me;
  }

  loadItems() {
    this.api.getContentItems().subscribe({
      next: (data) => this.items.set(data),
      error: (err) => console.error('[ContentComponent] getContentItems error', err),
    });
  }

  startCreate() {
    this.form.reset({ title: '', content: '', type: '', visibility: '' });
    this.editing.set({ id: '', title: '', content: '', type: '', visibility: '', userId: '' } as any);
  }

  startEdit(item: ContentItem) {
    this.editing.set(item);
    this.form.reset({
      title: item.title,
      content: item.content,
      type: item.type,
      visibility: item.visibility,
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    const current = this.editing()!;
    if (current.id) {
      this.api.updateContentItem(current.id, payload as any).subscribe({
        next: () => {
          this.editing.set(null);
          this.loadItems();
        },
        error: (err) => console.error('[ContentComponent] updateContentItem error', err),
      });
    } else {
      this.api.createContentItem(payload as any).subscribe({
        next: () => {
          this.editing.set(null);
          this.loadItems();
        },
        error: (err) => console.error('[ContentComponent] createContentItem error', err),
      });
    }
  }

  remove(item: ContentItem) {
    if (!confirm(`Delete "${item.title}"?`)) return;
    this.api.deleteContentItem(item.id).subscribe({ next: () => this.loadItems() });
  }
}
