import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      registerType: 'autoUpdate',

      workbox: {
        mode: 'development'
      },

      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png'
      ],

      manifest: {
        name: 'NXT Pay',
        short_name: 'NXT Pay',
        description: 'Top up your prepaid meter in seconds.',
        theme_color: '#14213D',
        background_color: '#F7F4EC',
        display: 'standalone',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
