
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: [
  {
    "renderMode": 2,
    "route": "/"
  },
  {
    "renderMode": 2,
    "route": "/login"
  },
  {
    "renderMode": 2,
    "route": "/register"
  },
  {
    "renderMode": 2,
    "route": "/dashboard"
  },
  {
    "renderMode": 2,
    "route": "/create"
  },
  {
    "renderMode": 2,
    "route": "/content"
  },
  {
    "renderMode": 0,
    "route": "/video-content/*"
  },
  {
    "renderMode": 2,
    "route": "/backgrounds"
  },
  {
    "renderMode": 2,
    "route": "/audios"
  },
  {
    "renderMode": 2,
    "route": "/video-metadata"
  },
  {
    "renderMode": 2,
    "route": "/subscribe-images"
  },
  {
    "renderMode": 2,
    "route": "/channels"
  },
  {
    "renderMode": 2,
    "route": "/settings"
  },
  {
    "renderMode": 0,
    "route": "/generate-from-video"
  },
  {
    "renderMode": 0,
    "redirectTo": "/video-metadata",
    "route": "/drafts"
  },
  {
    "renderMode": 0,
    "route": "/draft/edit/*"
  },
  {
    "renderMode": 0,
    "route": "/generation/*"
  },
  {
    "renderMode": 2,
    "route": "/youtube/connect"
  },
  {
    "renderMode": 2,
    "route": "/youtube/callback"
  },
  {
    "renderMode": 0,
    "route": "/metadata/*/upload"
  },
  {
    "renderMode": 2,
    "redirectTo": "/dashboard",
    "route": "/**"
  }
],
  entryPointToBrowserMapping: undefined,
  assets: {
    'index.csr.html': {size: 7616, hash: 'bc51066c1f438a1ce5239d049ed46b0851b0efa184f521cb19a5f37e9618caef', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1142, hash: '67d80240dcf4ee8ff9b0900ebc201dc536f9655fc4cc6da9ad9b381d1f0dd939', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'create/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/create_index_html.mjs').then(m => m.default)},
    'audios/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/audios_index_html.mjs').then(m => m.default)},
    'index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/index_html.mjs').then(m => m.default)},
    'subscribe-images/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/subscribe-images_index_html.mjs').then(m => m.default)},
    'login/index.html': {size: 18851, hash: 'f6244fbdb379d65cbca2c5325df00dad7e08e37b093d7c4b23d8744795e868db', text: () => import('./assets-chunks/login_index_html.mjs').then(m => m.default)},
    'settings/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/settings_index_html.mjs').then(m => m.default)},
    'youtube/callback/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/youtube_callback_index_html.mjs').then(m => m.default)},
    'channels/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/channels_index_html.mjs').then(m => m.default)},
    'backgrounds/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/backgrounds_index_html.mjs').then(m => m.default)},
    'dashboard/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/dashboard_index_html.mjs').then(m => m.default)},
    'video-metadata/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/video-metadata_index_html.mjs').then(m => m.default)},
    'content/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/content_index_html.mjs').then(m => m.default)},
    'youtube/connect/index.html': {size: 240, hash: 'db096474d521163c4f5fb7d700305222bcea1012b38583442ad232da75e59192', text: () => import('./assets-chunks/youtube_connect_index_html.mjs').then(m => m.default)},
    'register/index.html': {size: 19229, hash: '52b3319ac8c62dbc7087aa0ae1221c07d2eff7767a0d42880c32f0e289e8aa98', text: () => import('./assets-chunks/register_index_html.mjs').then(m => m.default)},
    'styles-PPX55BRF.css': {size: 16286, hash: '0OT1mYnUNts', text: () => import('./assets-chunks/styles-PPX55BRF_css.mjs').then(m => m.default)}
  },
};
