import svgLoader from "vite-svg-loader";

export default defineNuxtConfig({
  modules: [
    "@nuxt/ui",
    "@nuxt/image",
    "@nuxtjs/i18n",
    "@nuxt/eslint",
    "@vueuse/nuxt",
    "@pinia/nuxt",
    "@nuxt/icon",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
  ],

  googleFonts: {
    families: {
      "Playfair+Display": [400, 500, 600, 700],
      // Можно добавить другие шрифты
    },
    display: "swap",
  },

  ui: {
    // tailwind: false,
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
    ],
  },
  devtools: {
    enabled: true,
    timeline: {
      enabled: true,
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

  routeRules: {
    "/": { prerender: true, static: true },
    "/about": { prerender: true, static: true },
    "/blog/**": { prerender: true, static: true },
    "/user/**": { ssr: false, swr: 3600 },
    "/products/**": { ssr: false, swr: 3600 },
    "/news": { swr: 3600 },
    "/old-page": { redirect: "/new-page" },
    "/assets/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
    "/_nuxt/**": {
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  },

  devServer: {
    https: false,
  },

  features: {
    devLogs: false,
  },
  experimental: {
    payloadExtraction: true,
    componentIslands: true,
    viewTransition: true,
  },
  compatibilityDate: "2025-07-15",
  nitro: {
    static: true,
    compressPublicAssets: {
      gzip: true,
      brotli: true,
    },
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "Permissions-Policy": "geolocation=(), microphone=()",
        },
      },
    },
  },

  build: {
    transpile: ["@nuxt/ui", "truncate-html"],
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
            ui: ["@headlessui/vue"],
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

        // "vue/html-self-closing": [
        //   "warn",
        //   {
        //     html: { normal: "never", void: "always" },
        //     ignores: ["template"],
        //   },
        // ],
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
    include: ["@headlessui/vue", "truncate-html"],
    exclude: ["@nuxt/ui"],
  },
});
