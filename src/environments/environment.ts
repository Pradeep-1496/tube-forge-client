export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
  endpoints: {
    // YouTube Management
    youtube: {
      channels: '/youtube/channels',
      authUrl: '/youtube/auth/url',
      authCallback: '/youtube/auth/callback',
      channelInfo: '/youtube/channel-info',
      upload: '/youtube/upload',
      queue: '/youtube/queue',
      enqueue: '/youtube/queue/enqueue',
      refreshTokens: (id: string) => `/youtube/tokens/${id}/refresh`,
      uploadable: '/youtube/uploadable',
    },

    // Video Management
    videoManagement: {
      videos: '/video-management/videos',
      base: '/video-management',
      byChannel: (channelId: string) => `/video-management/channels/${channelId}/videos`,
      byId: (id: string) => `/video-management/${id}`,
      generate: (id: string) => `/video-management/${id}/generate`,
      upload: (id: string) => `/video-management/${id}/upload`,
      byStatus: (status: string) => `/video-management/status/${status}`,
      youtubeMetadata: (id: string) => `/video-management/${id}/youtube-metadata`,
    },

    // Dynamic Assets
    dynamicAssets: {
      channels: '/dynamic-assets/channels',
      channelById: (id: string) => `/dynamic-assets/channels/${id}`,
      textEffects: '/dynamic-assets/text-effects',
      textEffectById: (id: string) => `/dynamic-assets/text-effects/${id}`,
      backgroundAssets: '/dynamic-assets/background-assets',
      backgroundAssetById: (id: string) => `/dynamic-assets/background-assets/${id}`,
      stats: '/dynamic-assets/stats',
    },

    // Conversations
    conversations: {
      base: '/conversations',
      byId: (id: string) => `/conversations/${id}`,
      generate: (id: string) => `/conversations/${id}/generate`,
    },

    // Quotes
    quotes: {
      base: '/quotes',
      byId: (id: string) => `/quotes/${id}`,
      backgrounds: '/quotes/assets/backgrounds',
      backgroundById: (id: string) => `/quotes/assets/backgrounds/${id}`,
      generate: (id: string) => `/quotes/${id}/generate`,
    },
  },
};
