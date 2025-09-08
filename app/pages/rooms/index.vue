<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const items = ref(["Backlog", "Todo", "In Progress", "Done"]);

  const bookingStore = useBookingStore();
  const { searchResults, date, guests } = storeToRefs(bookingStore);

  onMounted(async () => {
    if (date.value && guests.value.adults > 0 && !searchResults.value) {
      try {
        await bookingStore.search();
      } catch (error) {
        console.error("Ошибка при загрузке сохраненного поиска:", error);
      }
    }
  });

  console.log("searchResults", searchResults);
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номера</h1>
    <Booking />
    <div>
      <UInputMenu
        :items="items"
        placeholder="Тип кровати"
        :class="$style.input"
        class="rooms-filter"
      />
    </div>

    <div v-if="bookingStore.loading" :class="$style.loading">
      Загрузка номеров...
    </div>

    <section v-else-if="searchResults" :class="$style.roomsList">
      <BookingCard
        v-for="item in searchResults?.rooms"
        :key="item.id"
        :room="item"
      />
    </section>

    <!-- Сообщение, если нет результатов -->
    <div v-else-if="!bookingStore.loading" :class="$style.noResults">
      Нет доступных номеров. Выполните поиск.
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);
  }
  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }
  .input {
    border: 1px solid var(--a-accentBg);
    border-radius: rem(8);

    & input .bg-default {
      background: var(--a-accentBg);
    }
  }

  .roomsList {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(20);
    width: 100%;
    padding: rem(40) rem(4);

    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: #{size.$desktopMin}) {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  .loading {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-gray);
  }

  .noResults {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-gray);
    text-align: center;
  }
</style>

<style lang="scss">
  .rooms-filter input {
    background-color: var(--a-btnAccentBg);
    & .bg-default {
      background: var(--a-accentBg);
    }
  }
</style>
