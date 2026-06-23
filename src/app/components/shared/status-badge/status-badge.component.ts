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
      font-size: 0.8rem; font-weight: 600; letter-spacing: 0.02em;
      text-transform: capitalize;
      border: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.04); color: #d1d5db;
    }
    .generating, .uploading { background: rgba(59,130,246,0.12); color: #93c5fd; border-color: rgba(59,130,246,0.25); }
    .generated { background: rgba(16,185,129,0.12); color: #6ee7b7; border-color: rgba(16,185,129,0.25); }
    .scheduled, .published { background: rgba(139,92,246,0.12); color: #c4b5fd; border-color: rgba(139,92,246,0.25); }
    .failed { background: rgba(239,68,68,0.12); color: #fca5a5; border-color: rgba(239,68,68,0.25); }
    .draft { background: rgba(107,114,128,0.12); color: #9ca3af; border-color: rgba(107,114,128,0.25); }
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
