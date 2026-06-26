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

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'videos', component: VideosComponent },
      { path: 'create', component: CreateVideoComponent },
      { path: 'channels', component: ChannelsComponent },
      { path: 'assets', component: AssetsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: '**', redirectTo: 'dashboard' }
    ]
  }
];
