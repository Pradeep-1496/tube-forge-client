import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, VideoContent } from '../../../services/api.service';
import { ContentEditorComponent } from '../../../components/core/content-editor/content-editor.component';

@Component({
  selector: 'app-video-content-new',
  standalone: true,
  imports: [CommonModule, ContentEditorComponent],
  template: `
    <div class="page">
      <header class="page-header">
        <h1>New Video Content</h1>
        <p>Create text content that will be turned into a video.</p>
      </header>
      <app-content-editor (saved)="onSave($event)" (cancel)="onCancel()" />
    </div>
  `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1.6rem; }
    .page-header h1 { font-size: 1.6rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.25rem 0 0; font-size: 0.92rem; }
  `]
})
export class VideoContentNewComponent {
  constructor(
    private readonly api: ApiService,
    private readonly router: Router,
  ) {}

  onSave(payload: Partial<VideoContent>) {
    this.api.createContentItem(payload as any).subscribe({
      next: () => this.router.navigate(['/content']),
      error: (err) => alert(err?.error?.message || 'Failed to create content'),
    });
  }

  onCancel() {
    this.router.navigate(['/content']);
  }
}
