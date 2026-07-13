import { Component, input } from '@angular/core';

@Component({
  selector: 'app-youtube-status-badge',
  standalone: true,
  template: `
    <span class="badge" [class]="status()">
      @switch (status()) {
        @case ('uploaded') { Uploaded }
        @case ('uploading') { Uploading }
        @case ('failed') { Failed }
        @default { {{ status() }} }
      }
    </span>
  `,
  styles: [`
    :host { display: inline-flex; }
    .badge {
      display: inline-flex; align-items: center; gap: 0.5rem;
      padding: 0.35rem 0.85rem; border-radius: 9999px;
      font-size: 0.78rem; font-weight: 600; letter-spacing: 0.02em;
      text-transform: capitalize;
      border: 1px solid var(--border);
      background: var(--surface); color: var(--muted);
    }
    .badge.uploaded {
      background: rgba(58,170,136,0.12); color: #5dd4ae; border-color: rgba(58,170,136,0.25);
    }
    .badge.uploading {
      background: rgba(74,143,224,0.12); color: #93b8f8; border-color: rgba(74,143,224,0.25);
    }
    .badge.failed {
      background: rgba(224,72,58,0.12); color: #e8836a; border-color: rgba(224,72,58,0.25);
    }
  `],
})
export class YoutubeStatusBadgeComponent {
  status = input.required<string>();
}
