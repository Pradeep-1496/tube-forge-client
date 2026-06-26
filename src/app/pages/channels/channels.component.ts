import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
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
          <article class="channel-card">
            <div class="card-top">
              <div class="channel-name">{{ ch.name }}</div>
              <span class="status on">Active</span>
            </div>
            <div class="specs">
              <span
                >Channel ID: <b>{{ ch.channelId }}</b></span
              >
              <span
                >Client ID: <b>{{ ch.clientId }}</b></span
              >
              <span
                >Expiry: <b>{{ ch.expiryDate | date: 'medium' }}</b></span
              >
            </div>
            <div class="tokens">
              <span
                >Client Secret: <b>{{ mask(ch.clientSecret) }}</b></span
              >
              <span
                >Access Token: <b>{{ mask(ch.accessToken) }}</b></span
              >
              <span
                >Refresh Token: <b>{{ mask(ch.refreshToken) }}</b></span
              >
            </div>
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
        <div class="editor" [formGroup]="form">
          <h3>{{ editing()!.id ? 'Edit channel' : 'New channel' }}</h3>
          <div class="row">
            <div class="field"><label>Name</label><input formControlName="name" /></div>
            <div class="field"><label>Channel ID</label><input formControlName="channelId" /></div>
          </div>
          <div class="row">
            <div class="field"><label>Client ID</label><input formControlName="clientId" /></div>
            <div class="field">
              <label>Client Secret</label><input formControlName="clientSecret" />
            </div>
          </div>
          <div class="row">
            <div class="field">
              <label>Access Token</label><input formControlName="accessToken" />
            </div>
            <div class="field">
              <label>Refresh Token</label><input formControlName="refreshToken" />
            </div>
          </div>
          <div class="field">
            <label>Expiry Date</label
            ><input
              type="text"
              formControlName="expiryDate"
              placeholder="Milliseconds timestamp"
            />
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
      .channels {
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
      .channel-card {
        background: var(--border-subtle);
        border: 1px solid var(--border);
        border-radius: 0.9rem;
        padding: 1.2rem 1.4rem;
        display: flex;
        flex-direction: column;
        gap: 0.8rem;
        transition:
          transform 0.2s ease,
          border-color 0.2s ease;
      }
      .channel-card:hover {
        transform: translateY(-2px);
        border-color: var(--accent);
      }
      .card-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
      }
      .channel-name {
        font-weight: 700;
        color: var(--text);
        font-size: 1rem;
      }
      .status {
        font-size: 0.75rem;
        color: var(--muted);
        text-transform: uppercase;
        font-weight: 600;
      }
      .status.on {
        color: var(--success);
      }
      .specs {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.82rem;
        color: var(--muted);
      }
      .specs b {
        color: var(--text);
      }
      .tokens {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
        font-size: 0.78rem;
        color: var(--muted);
      }
      .tokens b {
        color: var(--text);
        font-family: monospace;
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
      .editor input,
      .editor textarea,
      .editor select {
        width: 100%;
        background: var(--border-subtle);
        border: 1px solid var(--border);
        color: var(--text);
        padding: 0.55rem 0.85rem;
        border-radius: 0.55rem;
        font-size: 0.88rem;
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
export class ChannelsComponent implements OnInit {
  editing = signal<Channel | null>(null);
  channels = signal<Channel[]>([]);
  form: ReturnType<typeof this.fb.group>;

  constructor(
    private readonly api: ApiService,
    private readonly fb: FormBuilder,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      channelId: ['', Validators.required],
      clientId: ['', Validators.required],
      clientSecret: ['', Validators.required],
      accessToken: ['', Validators.required],
      refreshToken: ['', Validators.required],
      expiryDate: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    console.debug('[ChannelsComponent] ngOnInit');
    this.loadChannels();
  }

  loadChannels() {
    console.debug('[ChannelsComponent] loadChannels() calling getChannels');
    this.api.getChannels().subscribe({
      next: (chs) => {
        console.debug('[ChannelsComponent] getChannels next', chs);
        this.channels.set(chs);
      },
      error: (err) => {
        console.error('[ChannelsComponent] getChannels error', err);
      },
    });
  }

  startCreate() {
    this.form.reset({
      name: '',
      channelId: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      expiryDate: '',
    });
    this.editing.set({
      id: '',
      name: '',
      channelId: '',
      clientId: '',
      clientSecret: '',
      accessToken: '',
      refreshToken: '',
      expiryDate: '',
      userId: '',
    } as any);
  }

  startEdit(ch: Channel) {
    this.editing.set(ch);
    this.form.reset({
      name: ch.name,
      channelId: ch.channelId,
      clientId: ch.clientId,
      clientSecret: ch.clientSecret,
      accessToken: ch.accessToken,
      refreshToken: ch.refreshToken,
      expiryDate: ch.expiryDate,
    });
  }

  save() {
    if (this.form.invalid) return;
    const payload = this.form.getRawValue();
    const ch = this.editing()!;
    if (ch.id) {
      this.api.updateChannel(ch.id, payload as any).subscribe({
        next: () => {
          this.editing.set(null);
          this.loadChannels();
        },
        error: (err) => console.error('[ChannelsComponent] updateChannel error', err),
      });
    } else {
      this.api.createChannel(payload as any).subscribe({
        next: () => {
          this.editing.set(null);
          this.loadChannels();
        },
        error: (err) => console.error('[ChannelsComponent] createChannel error', err),
      });
    }
  }

  remove(ch: Channel) {
    if (!confirm(`Delete channel "${ch.name}"?`)) return;
    this.api.deleteChannel(ch.id).subscribe({ next: () => this.loadChannels() });
  }

  mask(value: string): string {
    if (!value) return '—';
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '••••••••' + value.slice(-4);
  }
}
