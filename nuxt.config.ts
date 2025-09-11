import svgLoader from "vite-svg-loader";

const API_BASE_URL =
  process.env.NUXT_PUBLIC_API_BASE ||
  "https://varvarka-api.grandfs-develop.ru/api/v1";
const IS_DEV = process.env.NODE_ENV === "development";

export default defineNuxtConfig({
  routeRules: {
    "/": { middleware: "booking.reset" },
  },

  modules: [
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
    global: true,
    icons: ["mdi", "simple-icons"],
    fonts: {
      sans: "var(--system-font)",
      mono: false,
    },
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

  components: [
    { path: "~/components/core", prefix: "Core" },
    { path: "~/components/modules", prefix: "Module" },
    "~/components",
  ],

  imports: {
    dirs: [
      "composables",
      "composables/*/index.{ts,js,mjs,mts}",
      "composables/**",
      "server/utils",
    ],
  },

  devtools: {
    enabled: IS_DEV,
    timeline: {
      enabled: IS_DEV,
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
        "https://varvarka-api.grandfs-develop.ru/api/v1",
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
      "truncate-html",
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
      plugins: ["vue"],
      extends: [
        "plugin:vue/vue3-essential",
        "@nuxt/eslint-config",
        "plugin:prettier/recommended",
      ],
      rules: {
        "vue/no-multiple-template-root": "off",
        "vue/require-default-prop": "off",
        "vue/multi-word-component-names": "warn",
        "vue/attribute-hyphenation": "warn",
        "vue/v-on-event-hyphenation": "warn",
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
    include: ["truncate-html"],
    exclude: ["@nuxt/ui"],
  },
});
