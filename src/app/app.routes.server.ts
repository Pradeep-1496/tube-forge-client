import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'video-content/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'generation/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'generate-from-video',
    renderMode: RenderMode.Server
  },
  {
    path: 'drafts',
    renderMode: RenderMode.Server
  },
  {
    path: 'draft/edit/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
