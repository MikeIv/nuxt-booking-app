import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({
  ssr: false,
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: [
    '~/assets/styles/main.scss',
    '~/assets/styles/variables/_z-index.scss'
  ],

  vite: {
    plugins: [svgLoader()],
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @use "~/assets/styles/tools/functions" as *;
            @use "~/assets/styles/variables" as *;
          `
        }
      }
    }
  },

  components: [
    { path: '~/components/core', prefix: 'Core' },
    { path: '~/components/modules', prefix: 'Module' },
    '~/components'
  ],

  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**'
    ]
  },

  routeRules: {
    '/': { static: true },
    '/about': { static: true },
    '/blog/**': { static: true },
    '/user/**': { ssr: true },
    '/products/**': { ssr: true },
    '/news': { swr: 3600 },
    '/old-page': { redirect: '/new-page' }
  },

  modules: [
    '@nuxtjs/i18n',
  ],
  i18n: {
    langDir: 'locales',
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    locales: [
      {
        code: 'ru',
        iso: 'ru-RU',
        file: 'ru.json',
        name: 'Русский'
      },
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English'
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected'
    },
  }
})