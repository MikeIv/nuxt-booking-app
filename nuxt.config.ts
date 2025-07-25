import svgLoader from 'vite-svg-loader'

export default defineNuxtConfig({

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/image',
    '@nuxt/eslint',
  ],
  ssr: false,

  components: [
    { path: '~/components/core', prefix: 'Core' },
    { path: '~/components/modules', prefix: 'Module' },
    '~/components',
  ],

  imports: {
    dirs: [
      'composables',
      'composables/*/index.{ts,js,mjs,mts}',
      'composables/**',
    ],
  },
  devtools: { enabled: true },
  css: [
    '~/assets/styles/main.scss',
    '~/assets/styles/variables/_z-index.scss',
  ],

  routeRules: {
    '/': { static: true },
    '/about': { static: true },
    '/blog/**': { static: true },
    '/user/**': { ssr: true },
    '/products/**': { ssr: true },
    '/news': { swr: 3600 },
    '/old-page': { redirect: '/new-page' },
    '/assets/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
    '/_nuxt/**': { headers: { 'Cache-Control': 'public, max-age=31536000, immutable' } },
  },

  devServer: {
    https: false, // Ускоряет запуск в development
  },

  // Отключение ненужных функций
  features: {
    devLogs: false, // В production
  },
  experimental: {
    payloadExtraction: true, // Извлечение критического CSS
  },
  compatibilityDate: '2025-07-15',
  nitro: {
    static: true,
    routeRules: {
      '/**': {
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=()',
        },
      },
    },
  },

  vite: {
    build: {
      target: 'esnext',
      minify: 'esbuild',
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === 'production',
        },
      },
      chunkSizeWarningLimit: 1600,
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
    },
    server: {
      fs: {
        strict: true, // Запрещает доступ к файлам вне корня проекта
      },
    },
    plugins: [svgLoader()],
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]',
      },
      preprocessorOptions: {
        scss: {
          additionalData: `
            @use "sass:math";
            @use "~/assets/styles/tools/functions" as *;
            @use "~/assets/styles/variables" as *;
          `,
        },
      },
    },
  },

  eslint: {
    config: {
      plugins: ['vue'],

      extends: [
        'plugin:vue/vue3-recommended',
        '@nuxt/eslint-config',
      ],

      // Настройки стиля
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
      },

      rules: {
        'vue/no-multiple-template-root': 'off',
        'vue/multi-word-component-names': 'warn',
        'vue/attribute-hyphenation': 'warn',
        'vue/v-on-event-hyphenation': 'warn',

        'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'warn',
      },
    },

    checker: {
      lintOnStart: true,
      formatter: 'stylish',
    },

    fix: process.env.NODE_ENV === 'development',
    cache: true,
  },

  i18n: {
    langDir: 'locales',
    strategy: 'no_prefix',
    defaultLocale: 'ru',
    locales: [
      {
        code: 'ru',
        iso: 'ru-RU',
        file: 'ru.json',
        name: 'Русский',
      },
      {
        code: 'en',
        iso: 'en-US',
        file: 'en.json',
        name: 'English',
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
    },
  },
  image: {
    domains: ['https://varvarka-v2.grandfs-develop.ru/'],
    presets: {
      cover: {
        modifiers: {
          fit: 'cover',
          format: 'webp',
          quality: 80,
        },
      },
    },
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
    },
    format: ['webp', 'avif'],
    provider: 'ipx',
  },
})
