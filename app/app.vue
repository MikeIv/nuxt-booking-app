<template>
  <UApp>
    <NuxtLayout>
      <!-- Индикатор загрузки между страницами -->
      <NuxtLoadingIndicator :color="'#00dc82'" :height="3" />

      <NuxtPage />

      <!-- Глобальное уведомление для изменения маршрута -->
      <NuxtRouteAnnouncer />
    </NuxtLayout>
    
    <!-- Компоненты вне layout, но внутри UApp для правильного контекста provide/inject -->
    <NotificationToast :notifications="notifications" :on-remove="remove" />
    <BookingLoadingOverlay />
  </UApp>
</template>

<script setup lang="ts">
  import { computed } from "vue";
  import { useNotifications } from "~/composables/useNotifications";

  const { notifications: notificationsRef, remove } = useNotifications();
  
  // Преобразуем readonly ref в массив для передачи в компонент
  const notifications = computed(() => notificationsRef.value);

  useHead({
    titleTemplate: (title) => (title ? `${title} | Varvarka` : "Varvarka"),
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "Varvarka" },
      { name: "theme-color", content: "#ffffff" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
    ],
    bodyAttrs: {
      class: "min-h-screen bg-gray-50",
    },
  });
</script>

<style>
  html {
    scroll-behavior: smooth;
  }
</style>
