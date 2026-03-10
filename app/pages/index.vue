<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "main",
  });

  const bookingStore = useBookingStore();

  bookingStore.setLoading(false);
  bookingStore.isServerRequest = false;

  useSeoMeta({
    title: "Главная",
    description: "Varvarka — официальный сайт. Бронирование номеров и услуги.",
  });
</script>

<template>
  <div :class="$style.main">
    <MainIntro />
    <Booking />

    <!-- Блоки с якорями с fallback-скелетонами на время загрузки -->
    <Suspense>
      <template #default>
        <LazyMainAccommodation anchor-id="accommodation" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="Номера и размещение" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <LazyMainRestaurants anchor-id="restaurants" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="Рестораны и бары" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <LazyMainEvents anchor-id="events" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="Мероприятия" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <LazyMainSpa anchor-id="spa" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="SPA и отдых" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <LazyMainEntertainment anchor-id="entertainment" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="Развлечения" />
      </template>
    </Suspense>

    <Suspense>
      <template #default>
        <LazyMainConstruction anchor-id="construction" />
      </template>
      <template #fallback>
        <MainSectionSkeleton title="Информация" />
      </template>
    </Suspense>
  </div>
</template>

<style module lang="scss">
  .main {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
  }
</style>
