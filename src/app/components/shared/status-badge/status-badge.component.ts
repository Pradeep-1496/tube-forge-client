import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export type Status = 'draft' | 'generating' | 'generated' | 'uploading' | 'scheduled' | 'published' | 'failed';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="status()">
      <span class="dot" [class]="status()"></span>
      {{ status() }}
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
    .generating, .uploading { background: rgba(74,143,224,0.12); color: #93b8f8; border-color: rgba(74,143,224,0.25); }
    .generated { background: rgba(58,170,136,0.12); color: #5dd4ae; border-color: rgba(58,170,136,0.25); }
    .scheduled, .published { background: rgba(232,184,75,0.12); color: #e8b84b; border-color: rgba(232,184,75,0.25); }
    .failed { background: rgba(224,72,58,0.12); color: #e8836a; border-color: rgba(224,72,58,0.25); }
    .draft { background: rgba(122,122,140,0.12); color: #9a9aac; border-color: rgba(122,122,140,0.25); }
    .dot { width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
    .dot.generating, .dot.uploading { animation: pulse 1.6s infinite; }
    .dot.draft { animation: none; }
    @keyframes pulse {
      0%,100% { opacity: 0.5; }
      50% { opacity: 1; }
    }
  `]
})
export class StatusBadgeComponent {
  status = input<string | unknown>('');
}
