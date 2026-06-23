import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Channel } from '../../services/api.service';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <div class="channels">
      <header class="page-header">
        <div>
          <h1>Channels</h1>
          <p>Manage YouTube channels connected to the platform.</p>
        </div>
        <button class="btn primary" (click)="startCreate()">+ New Channel</button>
      </header>

      <section class="grid" *ngIf="!editing(); else editor">
        @for (ch of channels(); track ch.id) {
          <article class="channel-card" [class.inactive]="!ch.isActive">
            <div class="card-top">
              <div class="channel-name">{{ ch.name }}</div>
              <span class="status" [class.on]="ch.isActive">Active</span>
            </div>
            <div class="specs">
              <span>Schedule: <b>{{ ch.uploadSchedule || 'manual' }}</b></span>
              <span>Main: <b>{{ ch.isMainChannel ? 'Yes' : 'No' }}</b></span>
              <span>Categories: <b>{{ ch.contentCategories?.length || 0 }}</b></span>
            </div>
            @if(ch.description) {
              <p class="desc">{{ ch.description }}</p>
            }
            <div class="actions">
              <button class="btn sm ghost" (click)="startEdit(ch)">Edit</button>
              <button class="btn sm danger ghost" (click)="remove(ch)">Delete</button>
            </div>
          </article>
        }
        @if (!channels().length) {
          <div class="notice empty">No channels yet. Click “New Channel” to get started.</div>
        }
      </section>

      <ng-template #editor>
        <div class="editor">
          <h3>{{ editing()!.id ? 'Edit channel' : 'New channel' }}</h3>
          <div class="row">
            <div class="field"><label>Name</label><input [(ngModel)]="form.name" /></div>
            <div class="field"><label>Upload schedule</label><input [(ngModel)]="form.uploadSchedule" /></div>
          </div>
          <div class="field"><label>Description</label><textarea rows="3" [(ngModel)]="form.description"></textarea></div>
          <div class="row">
            <div class="field">
              <label>Categories (comma)</label>
              <input [(ngModel)]="form.contentCategories" />
            </div>
            <div class="field">
              <label>Default tags (comma)</label>
              <input [(ngModel)]="form.defaultTags" />
            </div>
          </div>
          <div class="row">
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="form.isMainChannel" />
              <span>Main channel (auto-upload)</span>
            </label>
            <label class="toggle">
              <input type="checkbox" [(ngModel)]="form.isActive" />
              <span>Active</span>
            </label>
          </div>
          <div class="actions">
            <button class="btn ghost" (click)="editing.set(null)">Cancel</button>
            <button class="btn primary" (click)="save()">Save</button>
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .channels { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .channel-card {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1.2rem 1.4rem;
      display: flex; flex-direction: column; gap: 0.8rem;
      transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .channel-card:hover { transform: translateY(-2px); border-color: var(--accent); }
    .channel-card.inactive { opacity: 0.7; }
    .card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .channel-name { font-weight: 700; color: var(--text); font-size: 1rem; }
    .status { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; font-weight: 600; }
    .status.on { color: var(--success); }
    .specs { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.82rem; color: var(--muted); }
    .specs b { color: var(--text); }
    .desc { color: var(--muted); font-size: 0.85rem; margin: 0; line-height: 1.45; }
    .editor {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      border-radius: 0.9rem;
      padding: 1.4rem;
      display: flex; flex-direction: column; gap: 1rem;
    }
    .editor h3 { margin: 0 0 0.25rem; color: var(--text); }
    .editor input, .editor textarea, .editor select {
      width: 100%;
      background: var(--border-subtle);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.55rem 0.85rem;
      border-radius: 0.55rem;
      font-size: 0.88rem;
    }
    .row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .toggle { display: flex; align-items: center; gap: 0.6rem; color: var(--text); font-size: 0.88rem; cursor: pointer; }
    .toggle input { width: auto; }
    .actions { display: flex; justify-content: flex-end; gap: 0.6rem; }
    .notice { padding: 2rem; text-align: center; color: var(--muted); font-style: italic; }
    .btn { padding: 0.55rem 1.2rem; border-radius: 0.55rem; font-weight: 600; font-size: 0.88rem; cursor: pointer; border: 1px solid transparent; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.sm { padding: 0.3rem 0.7rem; font-size: 0.78rem; border-radius: 0.45rem; }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
  `]
})
export class ChannelsComponent implements OnInit {
  editing = signal<Channel | null>(null);
  channels = signal<Channel[]>([]);
  form = { name: '', description: '', isMainChannel: false, uploadSchedule: '', contentCategories: '', defaultTags: '', isActive: true };

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadChannels();
  }

  loadChannels() {
    this.api.getChannels().subscribe({ next: (chs) => this.channels.set(chs) });
  }

  startCreate() {
    this.form = { name: '', description: '', isMainChannel: false, uploadSchedule: '', contentCategories: '', defaultTags: '', isActive: true };
    this.editing.set({ id: 0, name: '', isActive: true, description: '', isMainChannel: false, uploadSchedule: '', contentCategories: [], defaultTags: [] } as any);
  }

  startEdit(ch: Channel) {
    this.editing.set(ch);
    this.form = {
      name: ch.name, description: ch.description ?? '',
      isMainChannel: ch.isMainChannel, uploadSchedule: ch.uploadSchedule ?? '',
      contentCategories: (ch.contentCategories ?? []).join(', '),
      defaultTags: (ch.defaultTags ?? []).join(', '), isActive: ch.isActive ?? true
    };
  }

  save() {
    const payload = {
      name: this.form.name,
      description: this.form.description,
      isMainChannel: this.form.isMainChannel,
      uploadSchedule: this.form.uploadSchedule || undefined,
      contentCategories: this.form.contentCategories.split(',').map((s) => s.trim()).filter(Boolean),
      defaultTags: this.form.defaultTags.split(',').map((s) => s.trim()).filter(Boolean),
      isActive: this.form.isActive
    };
    const ch = this.editing()!;
    if (ch.id) {
      this.api.updateChannel(ch.id, payload).subscribe({ next: () => { this.editing.set(null); this.loadChannels(); } });
    } else {
      this.api.createChannel(payload as any).subscribe({ next: () => { this.editing.set(null); this.loadChannels(); } });
    }
  }

  remove(ch: Channel) {
    if (!confirm(`Delete channel "${ch.name}"?`)) return;
    this.api.deleteChannel(ch.id).subscribe({ next: () => this.loadChannels() });
  }
}
