<template>
  <div>
    <!-- Глобальные компоненты -->
    <NuxtLayout>
      <!-- Индикатор загрузки между страницами -->
      <NuxtLoadingIndicator :color="'#00dc82'" :height="3" />

      <!-- Основное содержимое страниц -->
      <NuxtPage />

      <!-- Глобальное уведомление для изменения маршрута (для accessibility) -->
      <NuxtRouteAnnouncer />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Глобальные мета-теги (можно переопределять в отдельных страницах)
useHead({
  titleTemplate: (title) => title ? `${title} | My App` : 'My App',
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { hid: 'description', name: 'description', content: 'Мое приложение на Nuxt 3' },
    { name: 'theme-color', content: '#ffffff' },
  ],
  link: [
    { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  ],
  bodyAttrs: {
    class: 'min-h-screen bg-gray-50',
  },
});
</script>

<style>
/* Глобальные стили (или подключайте через assets/css/) */
html {
  scroll-behavior: smooth;
}
</style>