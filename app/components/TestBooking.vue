<!-- components/TestBooking.vue -->
<script setup lang="ts">
  const bookingStore = useBookingStore();

  const testBooking = async () => {
    try {
      // Устанавливаем даты
      bookingStore.setDates("2024-01-01", "2024-01-05");
      bookingStore.setGuests({ adults: 2, rooms: 1 });

      // Делаем поиск
      const results = await bookingStore.search();
      console.log("✅ Search results:", results);
    } catch (error) {
      console.error("❌ Search failed:", error);
    }
  };
</script>

<template>
  <div>
    <button
      class="bg-blue-500 text-white px-4 py-2 rounded"
      @click="testBooking"
    >
      Test Booking Search
    </button>

    <div v-if="bookingStore.loading">Loading...</div>
    <div v-if="bookingStore.error" class="text-red-500">
      {{ bookingStore.error }}
    </div>
    <div v-if="bookingStore.searchResults">
      <pre>{{ bookingStore.searchResults }}</pre>
    </div>
  </div>
</template>
