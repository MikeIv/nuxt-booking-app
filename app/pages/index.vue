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
    <!-- Блоки с якорями -->
    <LazyMainAccommodation anchor-id="accommodation" />
    <LazyMainRestaurants anchor-id="restaurants" />
    <LazyMainEvents anchor-id="events" />
    <LazyMainSpa anchor-id="spa" />
    <LazyMainEntertainment anchor-id="entertainment" />
    <LazyMainConstruction anchor-id="construction" />
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
