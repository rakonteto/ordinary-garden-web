/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/ordinary-garden-web/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['apple-touch-icon.png'],
      manifest: {
        name: '보통의 정원',
        short_name: '보통의 정원',
        description: '노지·텃밭 정원과 기상청 날씨',
        lang: 'ko',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#eef1ea',
        theme_color: '#2f5d3a',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: 'https://rakonteto.github.io/ordinary-garden-data/weather.json',
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'weather-data',
              expiration: { maxEntries: 4, maxAgeSeconds: 60 * 60 * 6 },
            },
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
