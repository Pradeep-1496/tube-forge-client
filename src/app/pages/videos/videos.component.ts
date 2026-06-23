import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { DataTableComponent } from '../../components/shared/data-table/data-table.component';

@Component({
  selector: 'app-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, DataTableComponent],
  template: `
    <div class="videos">
      <header class="page-header">
        <div>
          <h1>Videos</h1>
          <p>Manage, generate, and upload your video library.</p>
        </div>
      </header>

      <div class="toolbar">
        <select [(ngModel)]="selectedChannelId" (change)="loadVideos()" class="select">
          <option [ngValue]="null">All channels</option>
          <option *ngFor="let ch of channels()" [ngValue]="ch.id">{{ ch.name }}</option>
        </select>
        <a routerLink="/create" class="btn primary">
          <span>+</span> New video
        </a>
      </div>

      <app-data-table
        [columns]="columns"
        [rows]="videos()"
        (onAction)="onGenerate($event)"
        (onDelete)="onDelete($event)"
        actionLabel="Generate"
      />
    </div>
  `,
  styles: [`
    .videos { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1.5rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
    .toolbar { display: flex; gap: 0.75rem; align-items: center; flex-wrap: wrap; }
    .select {
      background: var(--border-subtle);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 0.55rem 1rem;
      border-radius: 0.55rem;
      font-size: 0.88rem;
      min-width: 200px;
    }
    .select:focus { outline: none; border-color: var(--accent); }
  `]
})
export class VideosComponent implements OnInit {
  channels = signal<any[]>([]);
  videos = signal<any[]>([]);
  selectedChannelId: string | null = null;
  columns = [
    { key: 'id', label: 'ID', width: '180px' },
    { key: 'title', label: 'Title', width: '220px' },
    { key: 'channel', label: 'Channel', format: (_v: unknown, row: any) => row.youtubeChannel?.name ?? '—' },
    { key: 'contentType', label: 'Type' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created', format: (v: unknown) => v ? new Date(v as string).toLocaleString() : '—' }
  ];

  constructor(private readonly api: ApiService) {}

  ngOnInit(): void {
    this.loadChannels();
    this.loadVideos();
  }

  loadChannels() {
    this.api.getYouTubeChannels().subscribe({ next: (chs) => this.channels.set(chs) });
  }

  loadVideos() {
    const id = this.selectedChannelId ?? this.channels()[0]?.id;
    if (!id) {
      this.videos.set([]);
      return;
    }
    this.api.getVideosByChannel(id).subscribe({
      next: (rows) => this.videos.set(rows)
    });
  }

  onGenerate = (row: any) => {
    this.api.generateVideo(row.id).subscribe({
      next: (res) => { if (res.success) this.loadVideos(); },
      error: (err) => alert(err?.error ?? 'Failed')
    });
  };

  onDelete = (row: any) => {
    if (!confirm('Delete video?')) return;
    this.api.deleteVideo(row.id).subscribe({ next: () => this.loadVideos() });
  };
}
