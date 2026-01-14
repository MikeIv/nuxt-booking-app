<script setup lang="ts">
  definePageMeta({
    layout: "main",
  });

  const bookingStore = useBookingStore();

  // Сбрасываем состояние загрузки при монтировании главной страницы
  onMounted(() => {
    bookingStore.setLoading(false);
    bookingStore.isServerRequest = false;
  });
</script>

<template>
  <div :class="$style.main">
    <MainIntro />
    <!-- Блоки бронирования -->
    <Booking />
    <!-- Блоки с якорями -->
    <MainAccommodation anchor-id="accommodation" />
    <MainRestaurants anchor-id="restaurants" />
    <MainEvents anchor-id="events" />
    <MainSpa anchor-id="spa" />
    <MainEntertainment anchor-id="entertainment" />
    <MainConstruction anchor-id="construction" />
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
