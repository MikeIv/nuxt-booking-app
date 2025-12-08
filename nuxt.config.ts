import svgLoader from "vite-svg-loader";

const API_BASE_URL =
  process.env.NUXT_PUBLIC_API_BASE ||
  "https://varvarka-api.grandfs-develop.ru/api";
const IS_DEV = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  routeRules: {
    // @ts-expect-error - middleware works correctly despite type error
    "/": { middleware: "booking.reset" },
  },

  modules: [
    // Локальные composables должны быть загружены первыми
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@nuxt/fonts",
    "pinia-plugin-persistedstate/nuxt",
    "@primevue/nuxt-module",
  ],

  googleFonts: {
    families: {
      "Playfair+Display": [400, 500, 600, 700],
      Lora: [400, 500, 600, 700],
    },
    display: "swap",
  },

  ui: {
    // @ts-expect-error - Nuxt UI types may not include all icon options
    icons: ["mdi", "simple-icons"],
    theme: {
      colors: [
        "primary",
        "secondary",
        "info",
        "success",
        "warning",
        "error",
        "bgAccent",
        "bgDark",
      ],
    },
    button: {
      padding: {
        xs: "px-3 py-1.5",
        sm: "px-3 py-1.5",
        md: "px-4 py-2",
      },
    },
  },

  icon: {
    customCollections: [
      {
        prefix: "",
        dir: "./app/assets/icons",
      },
    ],
  },

  ssr: false,

  components: [{ path: "~/components/core", prefix: "Core" }, "~/components"],

  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
      "server/utils",
    ],
    exclude: [
      // Исключаем useToast из PrimeVue и @nuxt/ui
      /primevue\/usetoast/,
      /@nuxt\/ui.*useToast/,
    ],
  },

  devtools: {
    enabled: true,
    timeline: {
      enabled: IS_DEV,
    },
  },

  primevue: {
    options: {
      ripple: true,
    },
    components: {
      include: ["Button", "InputText", "Message", "Select", "Popover"],
    },
    composables: {
      // Отключаем все composables PrimeVue, так как используем кастомные
      include: [],
    },
  },

  css: [
    "~/assets/styles/main.scss",
    "~/assets/styles/variables/_z-index.scss",
    "~/assets/styles/variables/_colors.scss",
  ],

  postcss: {
    plugins: {
      "@tailwindcss/postcss": {},
      autoprefixer: {},
    },
  },

  devServer: {
    https: false,
    host: process.env.NUXT_HOST || "localhost",
    port: process.env.NUXT_PORT ? Number(process.env.NUXT_PORT) : 3000,
  },

  features: {
    devLogs: false,
  },

  experimental: {
    viewTransition: true,
  },

  compatibilityDate: "2025-07-15",

  runtimeConfig: {
    apiBase: API_BASE_URL,
    public: {
      apiBase:
        process.env.NUXT_PUBLIC_API_BASE ||
        "https://varvarka-api.grandfs-develop.ru/api",
      isDev: IS_DEV,
    },
  },

  nitro: {
    static: true,
    // devProxy: {
    //   "/api/v1": {
    //     target: "https://varvarka-api.grandfs-develop.ru/api/v1",
    //     changeOrigin: true,
    //     rewrite: (path) => path.replace(/^\/api\/v1/, ""),
    //     headers: {
    //       Accept: "application/json",
    //       "Content-Type": "application/json",
    //     },
    //   },
    // },
    prerender: {
      routes: ["/"],
    },
  },

  build: {
    transpile: [
      "@nuxt/ui",
      "@nuxt/icon",
      "@nuxt/image",
      "@nuxt/eslint",
      "@vueuse/nuxt",
      "@pinia/nuxt",
    ],
    ...(!IS_DEV && {
      analyze: {
        analyzerMode: "static",
        openAnalyzer: false,
      },
    }),
  },

  vite: {
    build: {
      target: "esnext",
      minify: "esbuild",
      cssMinify: true,
      terserOptions: {
        compress: {
          drop_console: process.env.NODE_ENV === "production",
          drop_debugger: true,
        },
      },
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ["vue", "pinia", "vue-router"],
          },
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
    },
    plugins: [svgLoader({ svgo: false })],
    css: {
      devSourcemap: true,
      modules: {
        generateScopedName: "[name]__[local]___[hash:base64:5]",
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
      // @ts-expect-error - ESLint config types may not include all rule options
      rules: {
        "vue/no-v-html": "off",
        "vue/no-multiple-template-root": "off",
        "vue/require-default-prop": "off",
        "vue/multi-word-component-names": "warn",
        "vue/attribute-hyphenation": ["warn", "always"],
        "vue/prop-name-casing": ["warn", "camelCase"],
        "vue/v-on-event-hyphenation": "warn",
        // Разрешаем @ts-nocheck для файлов, где Vue преобразует kebab-case в camelCase
        "@typescript-eslint/ban-ts-comment": [
          "error",
          {
            "ts-nocheck": "allow-with-description",
            "ts-ignore": "allow-with-description",
          },
        ],
        "no-console": process.env.NODE_ENV === "production" ? "error" : "warn",
        "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",
        "vue/html-indent": [
          "error",
          2,
          {
            baseIndent: 1,
            ignores: [],
          },
        ],
      },
    },
    checker: {
      lintOnStart: true,
      formatter: "stylish",
      // Отключаем проверку TypeScript для шаблонов Vue (kebab-case атрибуты)
      // TypeScript не понимает преобразование kebab-case в camelCase в шаблонах
      // Примечание: опция typescript не поддерживается vite-plugin-eslint2
      // Проверка TypeScript выполняется через ESLint правила
    },
    fix: process.env.NODE_ENV === "development",
    cache: true,
  },

  i18n: {
    langDir: "locales",
    strategy: "no_prefix",
    defaultLocale: "ru",
    locales: [
      {
        code: "ru",
        iso: "ru-RU",
        file: "ru.json",
        name: "Русский",
      },
      {
        code: "en",
        iso: "en-US",
        file: "en.json",
        name: "English",
      },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
    },
  },

  image: {
    domains: ["https://varvarka-v2.grandfs-develop.ru/"],
    presets: {
      cover: {
        modifiers: {
          fit: "cover",
          format: "webp",
          quality: 80,
        },
      },
      avatar: {
        modifiers: {
          fit: "cover",
          width: 50,
          height: 50,
          format: "webp",
        },
      },
    },
    format: ["webp"],
    provider: "ipx",
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  optimizeDeps: {
    exclude: ["@nuxt/ui"],
  },
});
