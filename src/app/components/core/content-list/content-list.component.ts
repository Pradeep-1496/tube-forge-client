import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VideoContent } from '../../../services/api.service';

@Component({
  selector: 'app-content-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid">
      @for (item of items(); track item.id) {
        <article class="content-card" (click)="view.emit(item)">
          <div class="card-top">
            <div class="title">{{ item.title }}</div>
            <span class="badge" [class.public]="item.visibility === 'public'" [class.private]="item.visibility === 'private'">
              {{ item.visibility }}
            </span>
          </div>
          <p class="body">{{ item.content }}</p>
          <div class="meta">
            <span>By: <b>{{ item.user?.name || 'Unknown' }}</b></span>
            @if (item.createdAt) {
              <span class="date">{{ item.createdAt | date:'short' }}</span>
            }
          </div>
          <div class="actions">
            <button class="btn sm ghost" (click)="$event.stopPropagation(); edit.emit(item)">Edit</button>
            <button class="btn sm danger ghost" (click)="$event.stopPropagation(); delete.emit(item)">Delete</button>
          </div>
        </article>
      }
      @if (!items().length) {
        <div class="notice">No video content yet.</div>
      }
    </div>
  `,
  styles: [`
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .content-card {
      background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.9rem;
      padding: 1.2rem 1.4rem; display: flex; flex-direction: column; gap: 0.8rem;
      cursor: pointer; transition: transform 0.2s ease, border-color 0.2s ease;
    }
    .content-card:hover { transform: translateY(-2px); border-color: var(--accent); }
    .card-top { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
    .title { font-weight: 700; color: var(--text); font-size: 1rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .badge { font-size: 0.72rem; text-transform: uppercase; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: 9999px; }
    .badge.public { background: rgba(16,185,129,0.15); color: var(--success); }
    .badge.private { background: rgba(99,102,241,0.15); color: var(--accent); }
    .body { color: var(--muted); font-size: 0.85rem; margin: 0; line-height: 1.45; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
    .meta { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.78rem; color: var(--muted); }
    .meta b { color: var(--text); }
    .date { font-family: monospace; font-size: 0.72rem; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .btn { padding: 0.3rem 0.7rem; border-radius: 0.45rem; font-weight: 600; font-size: 0.78rem; cursor: pointer; border: 1px solid transparent; transition: all 0.15s ease; }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover { background: var(--border-subtle); }
    .btn.danger.ghost:hover:not(:disabled) { background: rgba(239,68,68,0.15); color: var(--danger); }
    .notice { padding: 2rem; text-align: center; color: var(--muted); font-style: italic; }
  `]
})
export class ContentListComponent {
  items = input<VideoContent[]>([]);
  view = output<VideoContent>();
  edit = output<VideoContent>();
  delete = output<VideoContent>();
}
