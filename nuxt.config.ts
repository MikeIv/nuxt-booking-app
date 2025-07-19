export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/styles/main.scss'],
  vite: {
    css: {
      modules: {
        generateScopedName: '[name]__[local]___[hash:base64:5]'
      },
      preprocessorOptions: {
        scss: {
          // Импорт переменных будет доступен во всех SCSS файлах
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

  routeRules: {
    // Статические страницы (SSG)
    '/': { static: true },                 // Главная (генерируется при билде)
    '/about': { static: true },            // Страница "О нас"
    '/blog/**': { static: true },          // Все посты блога (если URL известны заранее)

    // Динамические страницы (SSR)
    '/user/**': { ssr: true },             // Профили пользователей (рендер на сервере)
    '/products/**': { ssr: true },         // Товары с актуальными данными

    // SWR (Stale-While-Revalidate) - кеширование с фоновым обновлением
    '/news': { swr: 3600 },                // Кешировать на 1 час, затем обновить

    // Редиректы и прокси
    '/old-page': { redirect: '/new-page' }
  }
});
