export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:3000',
  apiEndpoints: {
    auth: {
      register: '/api/auth/register',
      login: '/api/auth/login',
    },
    channels: {
      create: '/api/channels',
      findAll: '/api/channels',
      findOne: (id: string) => `/api/channels/${id}`,
      update: (id: string) => `/api/channels/${id}`,
      remove: (id: string) => `/api/channels/${id}`,
    },
    templates: {
      create: '/api/templates',
      findAll: '/api/templates',
      findOne: (id: string) => `/api/templates/${id}`,
      update: (id: string) => `/api/templates/${id}`,
      remove: (id: string) => `/api/templates/${id}`,
    },
    videoGeneration: {
      generate: (id: string) => `/api/video-generation/generate/${id}`,
      generateFromVideo: (videoContentId: string, backgroundVideoId: string) =>
        `/api/video-generation/generate-from-video/${videoContentId}/${backgroundVideoId}`,
      generateFromTemplate: (templateId: string) =>
        `/api/video-generation/generate-from-template/${templateId}`,
      themes: '/api/video-generation/themes',
    },
    backgrounds: {
      upload: '/api/backgrounds/upload',
      findAll: '/api/backgrounds',
      findOne: (id: string) => `/api/backgrounds/${id}`,
      remove: (id: string) => `/api/backgrounds/${id}`,
    },
    audios: {
      upload: '/api/audios/upload',
      findAll: '/api/audios',
      findOne: (id: string) => `/api/audios/${id}`,
      remove: (id: string) => `/api/audios/${id}`,
    },
    backgroundVideos: {
      upload: '/api/background-videos/upload',
      findAll: '/api/background-videos',
      findOne: (id: string) => `/api/background-videos/${id}`,
      remove: (id: string) => `/api/background-videos/${id}`,
    },
    content: {
      create: '/api/content',
      findAll: '/api/content',
      findOne: (id: string) => `/api/content/${id}`,
      update: (id: string) => `/api/content/${id}`,
      remove: (id: string) => `/api/content/${id}`,
    },
    metadata: {
      create: '/api/metadata',
      findAll: '/api/metadata',
      findOne: (id: string) => `/api/metadata/${id}`,
      update: (id: string) => `/api/metadata/${id}`,
      remove: (id: string) => `/api/metadata/${id}`,
    },
    subscribeImages: {
      upload: '/api/subscribe-images/upload',
      findAll: '/api/subscribe-images',
      findOne: (id: string) => `/api/subscribe-images/${id}`,
      update: (id: string) => `/api/subscribe-images/${id}`,
      remove: (id: string) => `/api/subscribe-images/${id}`,
    },
  },
};