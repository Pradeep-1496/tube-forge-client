import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, of, shareReplay } from 'rxjs';
import { environment } from '../../environments/environment';

export interface YouTubeChannel {
  id: string;
  name: string;
  channelId?: string;
  channelType?: string;
  isMainChannel?: boolean;
  defaultTags?: string[];
  defaultHashtags?: string[];
  uploadSchedule?: string;
  contentCategories?: string[];
  brandingConfig?: Record<string, unknown> | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  isMainChannel: boolean;
  uploadSchedule?: string;
  brandingConfig?: Record<string, unknown>;
  contentCategories?: string[];
  defaultTags?: string[];
  isActive?: boolean;
  createdAt?: string;
}

export interface Video {
  id: string;
  channelId: string;
  title: string;
  content: string;
  contentType: 'conversation' | 'quote' | string;
  status: 'draft' | 'generating' | 'generated' | 'uploading' | 'scheduled' | 'published' | 'failed';
  videoPath?: string | null;
  thumbnailPath?: string | null;
  youtubeVideoId?: string | null;
  youtubeUrl?: string | null;
  scheduledDate?: string | null;
  youtubeTitle?: string | null;
  youtubeDescription?: string | null;
  tags?: string | null;
  hashtags?: string | null;
  privacyStatus?: string | null;
  language?: string | null;
  createdAt?: string;
  updatedAt?: string;
  youtubeChannel?: YouTubeChannel;
  conversationId?: string | null;
  quoteId?: string | null;
  textEffectId?: string | null;
  backgroundAssetId?: string | null;
}

export interface TextEffect {
  id: string;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

export interface BackgroundAsset {
  id: string;
  name: string;
  category: string;
  filePath: string;
  mimeType: string;
  sizeBytes?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Stats {
  totalChannels: number;
  totalVideos: number;
  published: number;
  pending: number;
  failed: number;
  totalAssets: number;
}

export interface YouTubeChannelInfo {
  channelId: string;
  channelTitle: string;
  description: string;
  thumbnails: { default?: { url: string }; medium?: { url: string }; high?: { url: string } };
}

export interface UploadResult {
  success: boolean;
  videoId?: string;
  error?: string;
}

export interface GenerateResult {
  success: boolean;
  videoPath?: string;
  thumbnailPath?: string;
  error?: string;
}

export interface ChannelForm {
  name: string;
  description: string;
  isMainChannel: boolean;
  uploadSchedule: string;
  brandingConfig: Record<string, unknown>;
  contentCategories: string[];
  defaultTags: string[];
}

export interface VideoForm {
  channelId: string;
  title: string;
  description: string;
  content: string;
  contentType: 'conversation' | 'quote';
  textEffectId: string | null;
  backgroundAssetId: string | null;
  publishAt: string;
  tags: string[];
  thumbnail: string;
}

export interface TextEffectForm {
  name: string;
  description: string;
  config: Record<string, unknown>;
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = `${environment.apiUrl}/api`;
  private statsCache$: ReturnType<typeof this.createStatsCache> | undefined;

  readonly loading = signal(false);

  constructor(private readonly http: HttpClient) {}

  private createStatsCache() {
    return this.http
      .get<Stats>(`${this.baseUrl}/dynamic-assets/stats`)
      .pipe(shareReplay({ bufferSize: 1, refCount: true }));
  }

  getStats() {
    if (!this.statsCache$) {
      this.statsCache$ = this.createStatsCache();
    }
    return this.statsCache$;
  }

  getChannels() {
    return this.http.get<Channel[]>(`${this.baseUrl}/dynamic-assets/channels`);
  }

  getYouTubeChannels() {
    return this.http.get<YouTubeChannel[]>(`${this.baseUrl}/youtube/channels`);
  }

  getChannel(id: string) {
    return this.http.get<Channel>(`${this.baseUrl}/dynamic-assets/channels/${id}`);
  }

  createChannel(payload: ChannelForm) {
    return this.http.post<Channel>(`${this.baseUrl}/dynamic-assets/channels`, payload);
  }

  updateChannel(id: string, payload: Partial<ChannelForm>) {
    return this.http.put<Channel>(`${this.baseUrl}/dynamic-assets/channels/${id}`, payload);
  }

  deleteChannel(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/dynamic-assets/channels/${id}`);
  }

  getTextEffects() {
    return this.http.get<TextEffect[]>(`${this.baseUrl}/dynamic-assets/text-effects`);
  }

  createTextEffect(payload: TextEffectForm) {
    return this.http.post<TextEffect>(`${this.baseUrl}/dynamic-assets/text-effects`, payload);
  }

  deleteTextEffect(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/dynamic-assets/text-effects/${id}`);
  }

  getBackgroundAssets() {
    return this.http.get<BackgroundAsset[]>(`${this.baseUrl}/dynamic-assets/background-assets`);
  }

  uploadBackgroundAsset(file: File) {
    const form = new FormData();
    form.append('file', file, file.name);
    return this.http.post<BackgroundAsset>(
      `${this.baseUrl}/dynamic-assets/background-assets`,
      form,
    );
  }

  updateBackgroundAsset(id: string, payload: Partial<BackgroundAsset>) {
    return this.http.put<BackgroundAsset>(
      `${this.baseUrl}/dynamic-assets/background-assets/${id}`,
      payload,
    );
  }

  deleteBackgroundAsset(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/dynamic-assets/background-assets/${id}`);
  }

  getVideosByChannel(channelId: string) {
    const url = `${this.baseUrl}${environment.endpoints.videoManagement.byChannel(channelId)}`;
    return this.http.get<Video[]>(url);
  }

  getVideo(id: string) {
    return this.http.get<Video>(`${this.baseUrl}/video-management/videos/${id}`);
  }

  createVideo(payload: VideoForm) {
    return this.http.post<Video>(`${this.baseUrl}/video-management/videos`, payload);
  }

  generateVideo(id: string) {
    return this.http.post<GenerateResult>(
      `${this.baseUrl}/video-management/videos/${id}/generate`,
      {},
    );
  }

  deleteVideo(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/video-management/videos/${id}`);
  }

  getYouTubeAuthUrl() {
    return this.http.get<{ url: string }>(`${this.baseUrl}/youtube/auth/url`);
  }

  getYouTubeChannelInfo() {
    return this.http.get<YouTubeChannelInfo>(`${this.baseUrl}/youtube/channel-info`);
  }

  uploadVideoToYouTube(payload: { videoId: string; publishAt?: string }) {
    return this.http.post<UploadResult>(`${this.baseUrl}/youtube/upload`, payload);
  }
}
