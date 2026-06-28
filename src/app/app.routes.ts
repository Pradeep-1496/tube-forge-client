import { Routes } from '@angular/router';
import { LayoutComponent } from './components/layout/layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { VideosComponent } from './pages/videos/videos.component';
import { CreateVideoComponent } from './pages/create-video/create-video.component';
import { ChannelsComponent } from './pages/channels/channels.component';
import { AssetsComponent } from './pages/assets/assets.component';
import { SettingsComponent } from './pages/settings/settings.component';
import { LoginComponent } from './pages/auth/login/login.component';
import { RegisterComponent } from './pages/auth/register/register.component';
import { ContentComponent } from './pages/content/content.component';
import { VideoContentNewComponent } from './pages/video-content/new/video-content-new.component';
import { VideoContentDetailComponent } from './pages/video-content/detail/video-content-detail.component';
import { BackgroundsComponent } from './pages/backgrounds/backgrounds.component';
import { AudiosComponent } from './pages/audios/audios.component';
import { SubscribeImagesComponent } from './pages/subscribe-images/subscribe-images.component';
import { GenerationDetailComponent } from './pages/generation/detail/generation-detail.component';
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
      { path: 'videos', component: VideosComponent },
      { path: 'create', component: CreateVideoComponent },
      { path: 'content', component: ContentComponent },
      { path: 'video-content/new', component: VideoContentNewComponent },
      { path: 'video-content/:id', component: VideoContentDetailComponent },
      { path: 'backgrounds', component: BackgroundsComponent },
      { path: 'audios', component: AudiosComponent },
      { path: 'subscribe-images', component: SubscribeImagesComponent },
      { path: 'channels', component: ChannelsComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'generation/:id', component: GenerationDetailComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
