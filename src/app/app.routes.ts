import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { CreateVideoComponent } from './pages/create-video/create-video.component';
import { ChannelsComponent } from './pages/channels/channels.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ContentComponent } from './pages/content/content.component';
import { VideoContentDetailComponent } from './pages/video-content/detail/video-content-detail.component';
import { BackgroundsComponent } from './pages/backgrounds/backgrounds.component';
import { AudiosComponent } from './pages/audios/audios.component';
import { SubscribeImagesComponent } from './pages/subscribe-images/subscribe-images.component';
import { GenerationDetailComponent } from './pages/generation/detail/generation-detail.component';
import { GenerateFromVideoComponent } from './pages/generate-from-video/generate-from-video.component';
import { DraftEditComponent } from './pages/draft-edit/draft-edit.component';
import { VideoMetadataComponent } from './pages/video-metadata/video-metadata.component';
import { YoutubeConnectPage } from './pages/youtube/connect/connect.page';
import { YoutubeCallbackPage } from './pages/youtube/callback/callback.page';
import { MetadataDetailPage } from './pages/metadata/detail/detail.page';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'create', component: CreateVideoComponent },
      { path: 'content', component: ContentComponent },
      { path: 'video-content/:id', component: VideoContentDetailComponent },
      { path: 'backgrounds', component: BackgroundsComponent },
      { path: 'audios', component: AudiosComponent },
      { path: 'video-metadata', component: VideoMetadataComponent }, 
      { path: 'subscribe-images', component: SubscribeImagesComponent },
      { path: 'channels', component: ChannelsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'generate-from-video', component: GenerateFromVideoComponent },
      { path: 'drafts', redirectTo: 'video-metadata', pathMatch: 'full' },
      { path: 'draft/edit/:id', component: DraftEditComponent },
      { path: 'generation/:id', component: GenerationDetailComponent },
      { path: 'youtube/connect', component: YoutubeConnectPage },
      { path: 'youtube/callback', component: YoutubeCallbackPage },
      { path: 'metadata/:id/upload', component: MetadataDetailPage },
      { path: '**', redirectTo: 'dashboard' },
    ],
  },
];
