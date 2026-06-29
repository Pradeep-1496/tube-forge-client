import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ApiService, MetadataItem, UpdateMetadataDto, DraftVideo } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';
import { StatusBadgeComponent } from '../../components/shared/status-badge/status-badge.component';

@Component({
  selector: 'app-video-metadata',
  standalone: true,
  imports: [CommonModule, RouterLink, StatusBadgeComponent, FormsModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Video Metadata</h1>
          <p>Browse all generated video records with preview playback.</p>
        </div>
        <div class="header-count">{{ filteredRecords().length }} / {{ records().length }} video(s)</div>
      </header>

      <div class="toolbar">
        <div class="search-field">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by title or description..."
            [ngModel]="searchQuery()"
            (ngModelChange)="searchQuery.set($event)"
          />
        </div>
        <div class="toolbar-filters">
          <select [ngModel]="filterStatus()" (ngModelChange)="filterStatus.set($event)">
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="failed">Failed</option>
          </select>
          <select [ngModel]="filterPrivacy()" (ngModelChange)="filterPrivacy.set($event)">
            <option value="">All privacy</option>
            <option value="public">Public</option>
            <option value="private">Private</option>
            <option value="unlisted">Unlisted</option>
          </select>
          <select [ngModel]="sortBy()" (ngModelChange)="sortBy.set($event)">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="title">By title A-Z</option>
          </select>
        </div>
      </div>

      @if (loading()) {
        <div class="loading">Loading metadata...</div>
      } @else if (error()) {
        <div class="error">{{ error() }}</div>
      } @else if (records().length === 0) {
        <div class="empty">
          <span class="empty-icon">🎬</span>
          <p>No video metadata records found yet.</p>
          <a routerLink="/create" class="btn primary">Create your first video</a>
        </div>
      } @else if (filteredRecords().length === 0) {
        <div class="empty">
          <span class="empty-icon">🔍</span>
          <p>No records match your search or filters.</p>
          <button class="btn ghost" (click)="clearFilters()">Clear filters</button>
        </div>
      } @else {
        <div class="table-wrap">
          @if (editing(); as editItem) {
            <div class="editor" [formGroup]="form">
              <h3>Edit Metadata</h3>
              <div class="editor-grid">
                <div class="field">
                  <label>Title</label>
                  <input formControlName="title" />
                </div>
                <div class="field">
                  <label>Description</label>
                  <textarea formControlName="description" rows="2"></textarea>
                </div>
                <div class="field">
                  <label>Tags (comma-separated)</label>
                  <input formControlName="tags" />
                </div>
                <div class="field">
                  <label>Category ID</label>
                  <input formControlName="category_id" />
                </div>
                <div class="field">
                  <label>Language</label>
                  <input formControlName="default_language" />
                </div>
                <div class="field">
                  <label>Privacy</label>
                  <select formControlName="privacy_status">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                    <option value="unlisted">Unlisted</option>
                  </select>
                </div>
                <div class="field">
                  <label>Status</label>
                  <select formControlName="status">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div class="field">
                  <label>Publish At</label>
                  <input type="datetime-local" formControlName="publish_at" />
                </div>
                <div class="field checkbox">
                  <label>
                    <input type="checkbox" formControlName="self_declared_made_for_kids" />
                    Made for kids
                  </label>
                </div>
              </div>
              <div class="actions">
                <button type="button" class="btn ghost" (click)="cancelEdit()">Cancel</button>
                <button type="button" class="btn primary" (click)="save()">Save</button>
              </div>
            </div>
          }
          <table class="table">
            <thead>
              <tr>
                <th class="col-thumb"></th>
                <th class="col-title">Title</th>
                <th class="col-status">Status</th>
                <th class="col-privacy">Privacy</th>
                <th class="col-lang">Lang</th>
                <th class="col-date">Created</th>
                <th class="col-actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (item of filteredRecords(); track item.id) {
                <tr>
                  <td class="col-thumb">
                    <div class="thumb" (click)="openView(item)">
                      <video preload="metadata" muted>
                        <source [src]="videoUrl(item)" type="video/mp4" />
                      </video>
                      <span class="thumb-play">▶</span>
                    </div>
                  </td>
                  <td class="col-title">
                    <span class="cell-title">{{ item.title }}</span>
                  </td>
                  <td class="col-status"><app-status-badge [status]="item.status" /></td>
                  <td class="col-privacy"><span class="privacy-tag" [class.public]="item.privacy_status === 'public'">{{ item.privacy_status }}</span></td>
                  <td class="col-lang">{{ item.default_language | uppercase }}</td>
                  <td class="col-date">{{ item.createdAt | date:'short' }}</td>
                  <td class="col-actions">
                    <div class="row-actions">
                      <button class="btn row-btn" (click)="openView(item)" title="View">👁</button>
                      @if (isOwned(item)) {
                        <button class="btn row-btn" (click)="startEdit(item)" title="Edit">✎</button>
                        <button class="btn row-btn danger" (click)="remove(item)" title="Delete">✕</button>
                      }
                      @if (item.youtubeUrl) {
                        <a class="btn row-btn" [href]="item.youtubeUrl" target="_blank" rel="noopener noreferrer" title="Open on YouTube">▶</a>
                      }
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
       }
     </div>

     <div class="drafts-section">
       <div class="section-header">
         <h2>Drafts</h2>
       </div>
       @if (draftsLoading()) {
         <div class="loading">Loading drafts...</div>
       } @else if (draftsError()) {
         <div class="error">{{ draftsError() }}</div>
       } @else if (drafts().length === 0) {
         <div class="empty small">
           <span class="empty-icon">📝</span>
           <p>No draft videos found.</p>
           <a routerLink="/generate-from-video" class="btn primary">Create from Video</a>
         </div>
       } @else {
         <div class="table-wrap">
           <table class="table">
             <thead>
               <tr>
                 <th class="col-title">Title</th>
                 <th class="col-theme">Theme</th>
                 <th class="col-audio">Audio</th>
                 <th class="col-status">Status</th>
                 <th class="col-date">Created</th>
                 <th class="col-actions">Actions</th>
               </tr>
             </thead>
             <tbody>
               @for (draft of drafts(); track draft.id) {
                 <tr>
                   <td class="col-title">
                     <span class="cell-title">{{ draft.content?.title || 'Untitled' }}</span>
                   </td>
                   <td class="col-theme">
                     <span class="theme-tag">{{ draft.theme || '—' }}</span>
                   </td>
                   <td class="col-audio">
                     <span class="cell-audio">{{ draft.audio?.name || '—' }}</span>
                   </td>
                   <td class="col-status">{{ draft.status }}</td>
                   <td class="col-date">{{ draft.createdAt | date: 'short' }}</td>
                   <td class="col-actions">
                     <div class="row-actions">
                       <button class="btn row-btn" (click)="viewDraft(draft)" title="View">👁</button>
                       <a class="btn row-btn edit" [routerLink]="['/draft/edit', draft.id]" title="Edit">✎</a>
                       <button class="btn row-btn generate" (click)="generateFromDraft(draft)" [disabled]="generatingDraftId() === draft.id" title="Generate video">
                         {{ generatingDraftId() === draft.id ? '...' : '▶' }}
                       </button>
                       <button class="btn row-btn danger" (click)="deleteDraft(draft)" title="Delete">✕</button>
                     </div>
                   </td>
                 </tr>
               }
             </tbody>
           </table>
         </div>
       }
     </div>

     @if (viewingItem(); as item) {
       <div class="modal-overlay" (click)="closeView()">
         <div class="modal" (click)="$event.stopPropagation()">
           <div class="modal-header">
             <h2>{{ item.title }}</h2>
             <button class="modal-close" (click)="closeView()">&times;</button>
           </div>
           <div class="modal-video-wrap">
             <video controls autoplay class="modal-video">
               <source [src]="videoUrl(item)" type="video/mp4" />
             </video>
           </div>
           <div class="modal-body">
             <p class="modal-desc">{{ item.description }}</p>
             <div class="modal-meta">
               <span><strong>Status:</strong> {{ item.status }}</span>
               <span><strong>Privacy:</strong> {{ item.privacy_status }}</span>
               <span><strong>Language:</strong> {{ item.default_language }}</span>
               <span><strong>Category:</strong> {{ item.category_id }}</span>
               @if (item.publish_at) {
                 <span><strong>Publish:</strong> {{ item.publish_at | date:'medium' }}</span>
               }
               <span><strong>Created:</strong> {{ item.createdAt | date:'medium' }}</span>
             </div>
             @if (item.tags.length) {
               <div class="modal-tags">
                 @for (tag of item.tags; track tag) {
                   <span class="tag">{{ tag }}</span>
                 }
               </div>
             }
             @if (item.youtubeUrl) {
               <a class="btn primary" [href]="item.youtubeUrl" target="_blank" rel="noopener noreferrer">
                 View on YouTube
               </a>
             }
           </div>
         </div>
       </div>
     }

     @if (viewingDraft(); as draft) {
       <div class="modal-overlay" (click)="closeView()">
         <div class="modal" (click)="$event.stopPropagation()">
           <div class="modal-header">
             <h2>{{ draft.content?.title || 'Untitled' }}</h2>
             <button class="modal-close" (click)="closeView()">&times;</button>
           </div>
           <div class="modal-body">
             <div class="detail-grid">
               <div class="detail-item">
                 <span class="detail-label">Content</span>
                 <span class="detail-value">{{ draft.content?.title || draft.contentId }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Background Video ID</span>
                 <span class="detail-value mono">{{ draft.backgroundVideoId }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Channel ID</span>
                 <span class="detail-value mono">{{ draft.channelId }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Theme</span>
                 <span class="detail-value">{{ draft.theme || '—' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Audio</span>
                 <span class="detail-value">{{ draft.audio?.name || draft.audioId || '—' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Subscribe Image</span>
                 <span class="detail-value">{{ draft.subscribeImage?.name || draft.subscribeImageId || '—' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Published Date</span>
                 <span class="detail-value">{{ (draft.publishedAt | date: 'medium') || '—' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Status</span>
                 <span class="detail-value">{{ draft.status }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Visibility</span>
                 <span class="detail-value">{{ draft.visibility || '—' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Created</span>
                 <span class="detail-value">{{ draft.createdAt | date: 'medium' }}</span>
               </div>
               <div class="detail-item">
                 <span class="detail-label">Updated</span>
                 <span class="detail-value">{{ draft.updatedAt | date: 'medium' }}</span>
               </div>
             </div>
             @if (draft.content?.content) {
               <div class="detail-section">
                 <span class="detail-label">Content</span>
                 <div class="content-preview" [innerHTML]="draft.content?.content"></div>
               </div>
             }
           </div>
           <div class="modal-actions">
             <button class="btn ghost" (click)="closeView()">Close</button>
             <a class="btn ghost" [routerLink]="['/draft/edit', draft.id]" (click)="closeView()">Edit</a>
             <button class="btn primary" (click)="closeView(); generateFromDraft(draft)" [disabled]="generatingDraftId() === draft.id">
               {{ generatingDraftId() === draft.id ? 'Generating...' : 'Generate Video' }}
             </button>
           </div>
         </div>
       </div>
     }
   `,
  styles: [`
    .page { display: flex; flex-direction: column; gap: 1rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; flex-wrap: wrap; }
    .page-header h1 { font-size: 1.4rem; font-weight: 700; color: var(--text); margin: 0; }
    .page-header p { color: var(--muted); margin: 0.2rem 0 0; font-size: 0.85rem; }
    .header-count { font-size: 0.78rem; color: var(--muted); background: var(--border-subtle); border: 1px solid var(--border); border-radius: 9999px; padding: 0.3rem 0.8rem; white-space: nowrap; }

    .toolbar { display: flex; gap: 0.6rem; flex-wrap: wrap; align-items: center; }
    .search-field { display: flex; align-items: center; gap: 0.4rem; flex: 1; min-width: 200px; background: var(--border-subtle); border: 1px solid var(--border); border-radius: 0.5rem; padding: 0 0.65rem; }
    .search-field input { flex: 1; background: transparent; border: none; color: var(--text); padding: 0.5rem 0; font-size: 0.84rem; outline: none; font-family: inherit; }
    .search-icon { font-size: 0.85rem; }
    .toolbar-filters { display: flex; gap: 0.4rem; flex-wrap: wrap; }
    .toolbar-filters select { background: var(--border-subtle); border: 1px solid var(--border); color: var(--text); padding: 0.45rem 0.6rem; border-radius: 0.45rem; font-size: 0.8rem; outline: none; font-family: inherit; cursor: pointer; }

    .loading { color: var(--muted); font-style: italic; padding: 2rem; font-size: 0.9rem; }
    .error { color: var(--danger); padding: 0.8rem 1rem; background: rgba(239,68,68,0.1); border-radius: 0.5rem; font-size: 0.85rem; }
    .empty { display: flex; flex-direction: column; align-items: center; gap: 0.6rem; padding: 3rem 2rem; color: var(--muted); text-align: center; }
    .empty-icon { font-size: 2rem; }
    .empty p { margin: 0; font-style: italic; font-size: 0.88rem; }

    .table-wrap { background: var(--surface); border: 1px solid var(--border); border-radius: 0.75rem; overflow: hidden; }
    .table { width: 100%; border-collapse: collapse; font-size: 0.82rem; }
    .table thead { background: var(--border-subtle); }
    .table th { text-align: left; padding: 0.55rem 0.7rem; font-size: 0.72rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 1px solid var(--border); white-space: nowrap; }
    .table td { padding: 0.45rem 0.7rem; border-bottom: 1px solid var(--border-subtle); vertical-align: middle; }
    .table tbody tr:hover { background: var(--accent-weak); }
    .table tbody tr:last-child td { border-bottom: none; }

    .col-thumb { width: 60px; }
    .col-title { min-width: 160px; }
    .col-status { width: 95px; }
    .col-privacy { width: 80px; }
    .col-lang { width: 55px; }
    .col-date { width: 130px; white-space: nowrap; }
    .col-actions { width: 110px; }

    .thumb { width: 50px; height: 36px; border-radius: 0.35rem; overflow: hidden; position: relative; cursor: pointer; background: #000; flex-shrink: 0; }
    .thumb video { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumb-play { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; color: rgba(255,255,255,0.7); background: rgba(0,0,0,0.25); opacity: 0; transition: opacity 0.15s; }
    .thumb:hover .thumb-play { opacity: 1; }

    .cell-title { color: var(--text); font-weight: 600; display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; }

    .privacy-tag { font-size: 0.72rem; padding: 0.15rem 0.5rem; border-radius: 9999px; background: var(--border-subtle); border: 1px solid var(--border); text-transform: capitalize; }
    .privacy-tag.public { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: var(--success); }

    .row-actions { display: flex; gap: 0.15rem; }
    .row-btn { display: inline-flex; align-items: center; justify-content: center; width: 1.8rem; height: 1.8rem; border-radius: 0.35rem; background: transparent; border: 1px solid var(--border); color: var(--muted); font-size: 0.8rem; cursor: pointer; text-decoration: none; transition: all 0.12s ease; }
    .row-btn:hover { background: var(--border-subtle); color: var(--text); }
    .row-btn.danger:hover { background: rgba(239,68,68,0.12); color: var(--danger); border-color: var(--danger); }

    .btn { display: inline-flex; align-items: center; padding: 0.4rem 0.85rem; border-radius: 0.45rem; font-weight: 600; font-size: 0.8rem; cursor: pointer; border: 1px solid transparent; text-decoration: none; transition: all 0.12s ease; }
    .btn.primary { background: var(--accent); color: #fff; }
    .btn.primary:hover { filter: brightness(1.1); }
    .btn.ghost { background: transparent; color: var(--text); border-color: var(--border); }
    .btn.ghost:hover:not(:disabled) { background: var(--border-subtle); }

    .editor { padding: 1rem 1.2rem; background: var(--border-subtle); border-bottom: 1px solid var(--border); }
    .editor h3 { margin: 0 0 0.6rem; color: var(--text); font-size: 1rem; }
    .editor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem 1rem; }
    .editor input, .editor textarea, .editor select { width: 100%; background: var(--surface); border: 1px solid var(--border); color: var(--text); padding: 0.4rem 0.65rem; border-radius: 0.4rem; font-size: 0.82rem; box-sizing: border-box; font-family: inherit; }
    .editor textarea { resize: vertical; min-height: 2.4rem; }
    .field { display: flex; flex-direction: column; gap: 0.2rem; }
    .field label { font-size: 0.72rem; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.03em; }
    .checkbox label { display: flex; align-items: center; gap: 0.4rem; cursor: pointer; text-transform: none; font-size: 0.82rem; color: var(--text); }
    .checkbox input { width: auto; }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.5rem; }

    .modal-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.75); display: flex; align-items: center; justify-content: center; padding: 1.5rem; animation: fadeIn 0.15s ease; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 0.9rem; max-width: 720px; width: 100%; max-height: 90vh; overflow-y: auto; display: flex; flex-direction: column; animation: scaleIn 0.15s ease; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1rem 1.2rem; border-bottom: 1px solid var(--border-subtle); }
    .modal-header h2 { margin: 0; font-size: 1.05rem; color: var(--text); }
    .modal-close { background: none; border: none; color: var(--muted); font-size: 1.4rem; cursor: pointer; line-height: 1; padding: 0; }
    .modal-close:hover { color: var(--text); }
    .modal-video-wrap { background: #000; }
    .modal-video { width: 100%; display: block; max-height: 440px; }
    .modal-body { padding: 1rem 1.2rem; display: flex; flex-direction: column; gap: 0.6rem; }
    .modal-desc { margin: 0; color: var(--muted); font-size: 0.85rem; line-height: 1.45; }
    .modal-meta { display: flex; flex-wrap: wrap; gap: 0.3rem 1rem; font-size: 0.8rem; color: var(--muted); }
    .modal-meta strong { color: var(--text); }
    .modal-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
    .tag { background: var(--accent-weak); color: var(--accent); font-size: 0.72rem; font-weight: 500; padding: 0.15rem 0.5rem; border-radius: 9999px; border: 1px solid rgba(99,102,241,0.2); }

    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

    @media (max-width: 700px) {
      .col-lang, .col-date { display: none; }
      .editor-grid { grid-template-columns: 1fr; }
    }

    .drafts-section { margin-top: 2.5rem; }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.8rem; }
    .section-header h2 { font-size: 1.2rem; font-weight: 700; color: var(--text); margin: 0; }
    .drafts-table .col-title { min-width: 160px; }
    .drafts-table .col-theme { width: 100px; }
    .drafts-table .col-audio { width: 100px; }
    .drafts-table .col-status { width: 80px; }
    .drafts-table .col-date { width: 130px; white-space: nowrap; }
    .drafts-table .col-actions { width: 150px; }
    .empty.small { padding: 1.8rem 1rem; }
    .empty.small .empty-icon { font-size: 1.5rem; }
    .empty.small p { font-size: 0.82rem; }
  `]
})
export class VideoMetadataComponent implements OnInit {
  records = signal<MetadataItem[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);
  editing = signal<MetadataItem | null>(null);
  saving = signal(false);
  form: ReturnType<typeof this.fb.group>;

  currentUserId = signal<string>('');

  searchQuery = signal('');
  filterStatus = signal('');
  filterPrivacy = signal('');
  sortBy = signal('newest');
  viewingItem = signal<MetadataItem | null>(null);

  drafts = signal<DraftVideo[]>([]);
  draftsLoading = signal(true);
  draftsError = signal<string | null>(null);
  generatingDraftId = signal<string | null>(null);
  viewingDraft = signal<DraftVideo | null>(null);

  filteredRecords = computed(() => {
    let list = this.records();

    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        (r) =>
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query),
      );
    }

    const status = this.filterStatus();
    if (status) {
      list = list.filter((r) => r.status === status);
    }

    const privacy = this.filterPrivacy();
    if (privacy) {
      list = list.filter((r) => r.privacy_status === privacy);
    }

    const sort = this.sortBy();
    if (sort === 'newest') {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'title') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }

    return list;
  });

  constructor(
    private readonly api: ApiService,
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly toast: ToastService,
    private readonly router: Router,
  ) {
    const user = this.auth.getCurrentUser();
    if (user) this.currentUserId.set(user.id);
    this.form = this.fb.group({
      title: [''],
      description: [''],
      tags: [''],
      category_id: [''],
      default_language: [''],
      privacy_status: ['private'],
      status: ['draft'],
      publish_at: [''],
      self_declared_made_for_kids: [false],
    });
  }

  ngOnInit(): void {
    this.loadMetadata();
    this.loadDrafts();
  }

  private loadMetadata(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getMetadata().subscribe({
      next: (items) => {
        this.records.set(items as MetadataItem[]);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.message || err?.message || 'Failed to load metadata');
        this.loading.set(false);
      },
    });
  }

  private loadDrafts(): void {
    this.draftsLoading.set(true);
    this.draftsError.set(null);
    this.api.getDraftVideos().subscribe({
      next: (items) => {
        this.drafts.set(items);
        this.draftsLoading.set(false);
      },
      error: (err) => {
        const status = err.status;
        if (status === 403) this.draftsError.set("You don't have permission to view drafts");
        else this.draftsError.set(err?.error?.message || err?.message || 'Failed to load drafts');
        this.draftsLoading.set(false);
      },
    });
  }

  generateFromDraft(draft: DraftVideo) {
    this.generatingDraftId.set(draft.id);
    const publishedDate = draft.publishedAt ? new Date(draft.publishedAt).toISOString() : undefined;
    this.api
      .generateFromVideo(draft.contentId, draft.backgroundVideoId, {
        audioId: draft.audioId || undefined,
        theme: draft.theme || undefined,
        channelId: draft.channelId,
        publishedDate,
        subscribeImageId: draft.subscribeImageId || undefined,
      })
      .subscribe({
        next: (res) => {
          this.generatingDraftId.set(null);
          this.toast.show('Video generation started', 'success');
          this.router.navigate(['/generation', res.metadata.id]);
        },
        error: (err) => {
          this.generatingDraftId.set(null);
          const status = err.status;
          const body = err.error;
          let msg = 'Failed to generate video';
          if (status === 403) msg = "You don't have permission";
          else if (status === 404) msg = 'Draft or content not found (already deleted?)';
          else if (typeof body === 'string') msg = body;
          else if (body?.message) msg = body.message;
          else if (err.message) msg = err.message;
          if (status) msg = `[${status}] ${msg}`;
          this.toast.show(msg, 'error');
        },
      });
  }

  viewDraft(draft: DraftVideo): void {
    this.viewingDraft.set(draft);
  }

  closeView(): void {
    this.viewingItem.set(null);
    this.viewingDraft.set(null);
  }

  deleteDraft(draft: DraftVideo): void {
    if (!confirm(`Delete this draft?`)) return;
    this.api.deleteDraftVideo(draft.id).subscribe({
      next: () => {
        this.drafts.update((list) => list.filter((d) => d.id !== draft.id));
        this.toast.show('Draft deleted', 'success');
      },
      error: (err) => {
        const status = err.status;
        let msg = 'Failed to delete draft';
        if (status === 403) msg = "You don't have permission to delete this draft";
        else if (status === 404) msg = 'Draft not found (already deleted?)';
        else msg = err?.error?.message || err?.message || msg;
        if (status) msg = `[${status}] ${msg}`;
        this.toast.show(msg, 'error');
      },
    });
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.filterStatus.set('');
    this.filterPrivacy.set('');
    this.sortBy.set('newest');
  }

  videoUrl(item: MetadataItem): string {
    return this.api.toVideoUrl(item.output_video_path);
  }

  openView(item: MetadataItem): void {
    this.viewingItem.set(item);
  }

  startEdit(item: MetadataItem): void {
    this.editing.set(item);
    this.form.reset({
      title: item.title,
      description: item.description,
      tags: item.tags?.join(', ') ?? '',
      category_id: item.category_id,
      default_language: item.default_language,
      privacy_status: item.privacy_status,
      status: item.status,
      publish_at: item.publish_at ? item.publish_at.slice(0, 16) : '',
      self_declared_made_for_kids: item.self_declared_made_for_kids,
    });
  }

  cancelEdit(): void {
    this.editing.set(null);
  }

  isOwned(item: MetadataItem): boolean {
    return item.userId === this.currentUserId();
  }

  remove(item: MetadataItem): void {
    if (!confirm(`Delete metadata for "${item.title}"?`)) return;
    this.api.deleteMetadataItem(item.id).subscribe({
      next: () => {
        this.records.update((list) => list.filter((r) => r.id !== item.id));
        this.toast.show(`Deleted "${item.title}"`, 'success');
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to delete', 'error');
      },
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) return;
    const raw = this.form.getRawValue();
    const payload: UpdateMetadataDto = {
      title: raw.title || undefined,
      description: raw.description || undefined,
      tags: raw.tags ? raw.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : undefined,
      category_id: raw.category_id || undefined,
      default_language: raw.default_language || undefined,
      privacy_status: raw.privacy_status || undefined,
      status: raw.status || undefined,
      publish_at: raw.publish_at ? new Date(raw.publish_at).toISOString() : undefined,
      self_declared_made_for_kids: raw.self_declared_made_for_kids,
    };

    const item = this.editing()!;
    this.saving.set(true);
    this.api.updateMetadataItem(item.id, payload).subscribe({
      next: (updated) => {
        this.records.update((list) => list.map((r) => (r.id === updated.id ? updated : r)));
        this.editing.set(null);
        this.saving.set(false);
        this.toast.show('Metadata updated', 'success');
      },
      error: (err) => {
        this.toast.show(err?.error?.message || 'Failed to update', 'error');
        this.saving.set(false);
      },
    });
  }
}
