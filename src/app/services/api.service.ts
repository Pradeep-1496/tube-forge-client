import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, of, shareReplay, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export type Visibility = 'public' | 'private';

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
  channelId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
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
  path: string;
  size: number;
  type: string;
  userId: string;
  visibility: Visibility;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface Template {
  id: string;
  name: string;
  description?: string;
  config: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
}

export interface AudioAsset {
  audio_id: string;
  name: string;
  path: string;
  length: number;
  size: number;
  userId: string;
  visibility: Visibility;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface BackgroundVideo {
  bg_video_id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  userId: string;
  visibility: Visibility;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface VideoContent {
  id: string;
  title: string;
  content: string;
  visibility: Visibility;
  userId: string;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface GenerateRequest {
  videoContentId: string;
  backgroundId?: string;
  backgroundVideoId?: string;
  audioId?: string;
  theme?: string;
  subscribeImageId?: string;
  channelId: string;
  publishedDate: string;
}

export interface ContentItem {
  id: string;
  title: string;
  content: string;
  type: string;
  visibility: Visibility;
  userId: string;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateMetadataDto {
  title?: string;
  description?: string;
  tags?: string[];
  category_id?: string;
  default_language?: string;
  privacy_status?: string;
  status?: string;
  publish_at?: string;
  self_declared_made_for_kids?: boolean;
}

export interface MetadataItem {
  id: string;
  title: string;
  description: string;
  tags: string[];
  file_name: string;
  category_id: string;
  default_language: string;
  privacy_status: string;
  publish_at: string;
  self_declared_made_for_kids: boolean;
  output_video_path: string;
  channelId: string;
  status: string;
  youtubeVideoId: string | null;
  youtubeUrl: string | null;
  thumbnailPath: string;
  contentId: string;
  userId: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscribeImage {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  userId: string;
  visibility: Visibility;
  user?: { name: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginResponse {
  name: string;
  email: string;
  access_token: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  role: string;
  updatedAt: string;
  createdAt: string;
}

export interface Theme {
  id: string;
  name: string;
  config: Record<string, unknown>;
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

export interface GenerateFromVideoResponse {
  outputPath: string;
  metadata: {
    id: string;
    status: string;
    title: string;
    description: string;
    tags: string[];
    file_name: string;
    output_video_path: string;
    privacy_status: string;
    default_language: string;
    self_declared_made_for_kids: boolean;
    channelId: string;
    publish_at: string;
    category_id: string;
    contentId: string;
    thumbnailPath: string;
    userId: string;
    visibility: Visibility;
    updatedAt: string;
    createdAt: string;
    youtubeVideoId: string | null;
    youtubeUrl: string | null;
  };
}

export interface DraftVideoContent {
  id: string;
  title: string;
  content: string;
  type: string;
  userId: string;
  visibility: Visibility;
  createdAt: string;
  updatedAt: string;
  user?: { name: string };
}

export interface DraftVideo {
  id: string;
  contentId: string;
  theme: string | null;
  backgroundVideoId: string;
  audioId: string | null;
  subscribeImageId: string | null;
  channelId: string;
  publishedAt: string | null;
  userId: string;
  status: string;
  visibility?: string;
  outputVideoPath?: string | null;
  thumbnailPath?: string | null;
  file_name?: string | null;
  updatedAt: string;
  createdAt: string;
  backgroundId: string | null;
  audio?: AudioAsset | null;
  subscribeImage?: SubscribeImage | null;
  content?: DraftVideoContent | null;
}

export interface GenerateResult {
  success: boolean;
  videoPath?: string;
  thumbnailPath?: string;
  error?: string;
}

export interface ChannelForm {
  name: string;
  channelId: string;
  clientId: string;
  clientSecret: string;
  accessToken: string;
  refreshToken: string;
  expiryDate: number;
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
  private readonly baseUrl = environment.apiBaseUrl;
  private statsCache$: ReturnType<typeof this.createStatsCache> | undefined;

  readonly loading = signal(false);

  constructor(private readonly http: HttpClient) {}

  login(payload: LoginRequest) {
    return this.http.post<LoginResponse>(
      `${this.baseUrl}${environment.apiEndpoints.auth.login}`,
      payload,
    );
  }

  register(payload: RegisterRequest) {
    return this.http.post<RegisterResponse>(
      `${this.baseUrl}${environment.apiEndpoints.auth.register}`,
      payload,
    );
  }

  private createStatsCache() {
    return this.http
      .get<Channel[]>(`${this.baseUrl}${environment.apiEndpoints.channels.findAll}`)
      .pipe(
        map((channels) => ({
          totalChannels: channels.length,
          totalVideos: 0,
          published: 0,
          pending: 0,
          failed: 0,
          totalAssets: 0,
        })),
        shareReplay({ bufferSize: 1, refCount: true }),
      );
  }

  getStats() {
    if (!this.statsCache$) {
      this.statsCache$ = this.createStatsCache();
    }
    return this.statsCache$;
  }

  getChannels() {
    return this.http.get<Channel[]>(`${this.baseUrl}${environment.apiEndpoints.channels.findAll}`);
  }

  getChannel(id: string) {
    return this.http.get<Channel>(
      `${this.baseUrl}${environment.apiEndpoints.channels.findOne(id)}`,
    );
  }

  createChannel(payload: Partial<Channel>) {
    return this.http.post<Channel>(
      `${this.baseUrl}${environment.apiEndpoints.channels.create}`,
      payload,
    );
  }

  updateChannel(id: string, payload: Partial<Channel>) {
    return this.http.put<Channel>(
      `${this.baseUrl}${environment.apiEndpoints.channels.update(id)}`,
      payload,
    );
  }

  deleteChannel(id: string) {
    return this.http.delete<void>(`${this.baseUrl}${environment.apiEndpoints.channels.remove(id)}`);
  }

  getYouTubeChannels() {
    return this.http.get<YouTubeChannel[]>(`${this.baseUrl}/api/youtube/channels`);
  }

  getYouTubeChannelInfo() {
    return this.http.get<YouTubeChannelInfo>(`${this.baseUrl}/api/youtube/channel-info`);
  }

  getYouTubeAuthUrl() {
    return this.http.get<{ url: string }>(`${this.baseUrl}/api/youtube/auth/url`);
  }

  uploadVideoToYouTube(payload: { videoId: string; publishAt?: string }) {
    return this.http.post<UploadResult>(`${this.baseUrl}/api/youtube/upload`, payload);
  }

  getTemplates() {
    return this.http.get<Template[]>(
      `${this.baseUrl}${environment.apiEndpoints.templates.findAll}`,
    );
  }

  getTemplate(id: string) {
    return this.http.get<Template>(
      `${this.baseUrl}${environment.apiEndpoints.templates.findOne(id)}`,
    );
  }

  createTemplate(payload: Partial<Template>) {
    return this.http.post<Template>(
      `${this.baseUrl}${environment.apiEndpoints.templates.create}`,
      payload,
    );
  }

  updateTemplate(id: string, payload: Partial<Template>) {
    return this.http.put<Template>(
      `${this.baseUrl}${environment.apiEndpoints.templates.update(id)}`,
      payload,
    );
  }

  deleteTemplate(id: string) {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.apiEndpoints.templates.remove(id)}`,
    );
  }

  generateVideo(
    id: string,
    payload?: {
      channelId?: string;
      publishedDate?: string;
    },
  ) {
    return this.http.post<GenerateResult>(
      `${this.baseUrl}${environment.apiEndpoints.videoGeneration.generate(id)}`,
      payload ?? {},
    );
  }

  toVideoUrl(outputPath: string): string {
    if (!outputPath) return '';
    if (outputPath.startsWith('http://') || outputPath.startsWith('https://')) {
      return outputPath;
    }
    const filename = outputPath.replace(/\\/g, '/').split('/').pop() || '';
    return `${this.baseUrl}/output-videos/${filename}`;
  }

  generateFromVideo(
    videoContentId: string,
    backgroundVideoId: string,
    payload: {
      audioId?: string;
      theme?: string;
      channelId: string;
      publishedDate?: string;
      subscribeImageId?: string;
    },
  ) {
    if (!backgroundVideoId) {
      console.error('[ApiService] generateFromVideo called with missing backgroundVideoId', {
        videoContentId,
        backgroundVideoId,
        payload,
      });
      return throwError(() => new Error('Background video ID is required'));
    }
    const url = `${this.baseUrl}${environment.apiEndpoints.videoGeneration.generateFromVideo(videoContentId, backgroundVideoId)}`;
    console.debug('[ApiService] generateFromVideo', { url, payload });
    return this.http.post<GenerateFromVideoResponse>(url, payload);
  }

  createDraftFromVideo(
    contentId: string,
    backgroundVideoId: string,
    payload: {
      audioId?: string;
      theme?: string;
      subscribeImageId?: string;
      channelId: string;
      publishedDate?: string;
    },
  ) {
    return this.http.post<DraftVideo>(
      `${this.baseUrl}/api/draft-video/from-background/${contentId}/${backgroundVideoId}`,
      payload,
    );
  }

  getDraftVideos() {
    return this.http.get<DraftVideo[]>(`${this.baseUrl}/api/draft-video`);
  }

  getDraftVideo(id: string) {
    return this.http.get<DraftVideo>(`${this.baseUrl}/api/draft-video/${id}`);
  }

  updateDraftVideo(
    id: string,
    payload: {
      theme?: string;
      backgroundId?: string;
      audioId?: string;
      subscribeImageId?: string;
      channelId?: string;
      publishedDate?: string;
    },
  ) {
    return this.http.put<DraftVideo>(`${this.baseUrl}/api/draft-video/${id}`, payload);
  }

  deleteDraftVideo(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/api/draft-video/${id}`);
  }

  getThemes() {
    return this.http.get<Theme[]>(
      `${this.baseUrl}${environment.apiEndpoints.videoGeneration.themes}`,
    );
  }

  getBackgrounds() {
    return this.http.get<BackgroundAsset[]>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.findAll}`,
    );
  }

  getBackground(id: string) {
    return this.http.get<BackgroundAsset>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.findOne(id)}`,
    );
  }

  uploadBackground(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }) {
    const form = new FormData();
    form.append('file', file, file.name);
    if (fields?.name) form.append('name', fields.name);
    if (fields?.type) form.append('type', fields.type);
    if (fields?.visibility) form.append('visibility', fields.visibility);
    return this.http.post<BackgroundAsset>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.upload}`,
      form,
    );
  }

  deleteBackground(id: string) {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.remove(id)}`,
    );
  }

  getAudios() {
    return this.http.get<AudioAsset[]>(`${this.baseUrl}${environment.apiEndpoints.audios.findAll}`);
  }

  getAudio(id: string) {
    return this.http.get<AudioAsset>(
      `${this.baseUrl}${environment.apiEndpoints.audios.findOne(id)}`,
    );
  }

  uploadAudio(file: File, fields?: { name?: string; visibility?: Visibility }) {
    const form = new FormData();
    form.append('file', file, file.name);
    if (fields?.name) form.append('name', fields.name);
    if (fields?.visibility) form.append('visibility', fields.visibility);
    return this.http.post<AudioAsset>(
      `${this.baseUrl}${environment.apiEndpoints.audios.upload}`,
      form,
    );
  }

  deleteAudio(id: string) {
    return this.http.delete<void>(`${this.baseUrl}${environment.apiEndpoints.audios.remove(id)}`);
  }

  getBackgroundVideos() {
    return this.http.get<BackgroundVideo[]>(
      `${this.baseUrl}${environment.apiEndpoints.backgroundVideos.findAll}`,
    );
  }

  getBackgroundVideo(id: string) {
    return this.http.get<BackgroundVideo>(
      `${this.baseUrl}${environment.apiEndpoints.backgroundVideos.findOne(id)}`,
    );
  }

  uploadBackgroundVideo(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }) {
    const form = new FormData();
    form.append('file', file, file.name);
    if (fields?.name) form.append('name', fields.name);
    if (fields?.type) form.append('type', fields.type);
    if (fields?.visibility) form.append('visibility', fields.visibility);
    return this.http.post<BackgroundVideo>(
      `${this.baseUrl}${environment.apiEndpoints.backgroundVideos.upload}`,
      form,
    );
  }

  deleteBackgroundVideo(id: string) {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.apiEndpoints.backgroundVideos.remove(id)}`,
    );
  }

  getContentItems() {
    return this.http.get<ContentItem[]>(
      `${this.baseUrl}${environment.apiEndpoints.content.findAll}`,
    );
  }

  getContentItem(id: string) {
    return this.http.get<ContentItem>(
      `${this.baseUrl}${environment.apiEndpoints.content.findOne(id)}`,
    );
  }

  createContentItem(payload: Partial<ContentItem>) {
    return this.http.post<ContentItem>(
      `${this.baseUrl}${environment.apiEndpoints.content.create}`,
      payload,
    );
  }

  updateContentItem(id: string, payload: Partial<ContentItem>) {
    return this.http.put<ContentItem>(
      `${this.baseUrl}${environment.apiEndpoints.content.update(id)}`,
      payload,
    );
  }

  deleteContentItem(id: string) {
    return this.http.delete<void>(`${this.baseUrl}${environment.apiEndpoints.content.remove(id)}`);
  }

  getRunning() {
    return this.http.get<boolean>(`${this.baseUrl}/api/running`);
  }

  getMetadata() {
    return this.http.get<MetadataItem[]>(
      `${this.baseUrl}${environment.apiEndpoints.metadata.findAll}`,
    );
  }

  getMetadataItem(id: string) {
    return this.http.get<MetadataItem>(
      `${this.baseUrl}${environment.apiEndpoints.metadata.findOne(id)}`,
    );
  }

  createMetadataItem(payload: Partial<MetadataItem>) {
    return this.http.post<MetadataItem>(
      `${this.baseUrl}${environment.apiEndpoints.metadata.create}`,
      payload,
    );
  }

  updateMetadataItem(id: string, payload: UpdateMetadataDto) {
    return this.http.put<MetadataItem>(
      `${this.baseUrl}${environment.apiEndpoints.metadata.update(id)}`,
      payload,
    );
  }

  deleteMetadataItem(id: string) {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}${environment.apiEndpoints.metadata.remove(id)}`,
    );
  }

  getSubscribeImages() {
    return this.http.get<SubscribeImage[]>(
      `${this.baseUrl}${environment.apiEndpoints.subscribeImages.findAll}`,
    );
  }

  getSubscribeImage(id: string) {
    return this.http.get<SubscribeImage>(
      `${this.baseUrl}${environment.apiEndpoints.subscribeImages.findOne(id)}`,
    );
  }

  uploadSubscribeImage(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }) {
    const form = new FormData();
    form.append('file', file, file.name);
    if (fields?.name) form.append('name', fields.name);
    if (fields?.type) form.append('type', fields.type);
    if (fields?.visibility) form.append('visibility', fields.visibility);
    return this.http.post<SubscribeImage>(
      `${this.baseUrl}${environment.apiEndpoints.subscribeImages.upload}`,
      form,
    );
  }

  updateSubscribeImage(id: string, payload: Partial<SubscribeImage>) {
    return this.http.put<SubscribeImage>(
      `${this.baseUrl}${environment.apiEndpoints.subscribeImages.update(id)}`,
      payload,
    );
  }

  deleteSubscribeImage(id: string) {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.apiEndpoints.subscribeImages.remove(id)}`,
    );
  }

  getTextEffects() {
    return this.http.get<TextEffect[]>(`${this.baseUrl}/api/dynamic-assets/text-effects`);
  }

  createTextEffect(payload: Partial<TextEffect>) {
    return this.http.post<TextEffect>(`${this.baseUrl}/api/dynamic-assets/text-effects`, payload);
  }

  deleteTextEffect(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/api/dynamic-assets/text-effects/${id}`);
  }

  getBackgroundAssets() {
    return this.http.get<BackgroundAsset[]>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.findAll}`,
    );
  }

  uploadBackgroundAsset(file: File, fields?: { name?: string; type?: string; visibility?: Visibility }) {
    const form = new FormData();
    form.append('file', file, file.name);
    if (fields?.name) form.append('name', fields.name);
    if (fields?.type) form.append('type', fields.type);
    if (fields?.visibility) form.append('visibility', fields.visibility);
    return this.http.post<BackgroundAsset>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.upload}`,
      form,
    );
  }

  updateBackgroundAsset(id: string, payload: Partial<BackgroundAsset>) {
    return this.http.put<BackgroundAsset>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.findOne(id)}`,
      payload,
    );
  }

  deleteBackgroundAsset(id: string) {
    return this.http.delete<void>(
      `${this.baseUrl}${environment.apiEndpoints.backgrounds.remove(id)}`,
    );
  }

  getVideosByChannel(channelId: string) {
    return this.http.get<ContentItem[]>(
      `${this.baseUrl}${environment.apiEndpoints.content.findAll}`,
    );
  }

  getVideo(id: string) {
    return this.http.get<ContentItem>(
      `${this.baseUrl}${environment.apiEndpoints.content.findOne(id)}`,
    );
  }

  createVideo(payload: Partial<ContentItem>) {
    return this.http.post<ContentItem>(
      `${this.baseUrl}${environment.apiEndpoints.content.create}`,
      payload,
    );
  }

  deleteVideo(id: string) {
    return this.http.delete<void>(`${this.baseUrl}${environment.apiEndpoints.content.remove(id)}`);
  }
}
