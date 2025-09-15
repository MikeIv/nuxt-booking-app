<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, date, guests } = storeToRefs(bookingStore);

  const selectedBedType = ref();
  const bedOptions = computed(() => {
    if (!searchResults.value?.filters?.beds) return [];
    return searchResults.value.filters.beds.map((bed) => ({
      id: bed.id,
      title: bed.title,
    }));
  });

  console.log("Bed options:", bedOptions.value);

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
      <Select
        v-model="selectedBedType"
        :options="bedOptions"
        show-clear
        option-label="title"
        placeholder="Тип кровати"
        :class="$style.filterSelect"
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

  .filterSelect {
    color: var(--a-black);

    @media (min-width: #{size.$mobile}) {
      max-width: rem(368);
    }

    &:global(.p-select) {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: rem(54);
      padding: rem(12) rem(24);
      font-family: "Inter", sans-serif;
      font-size: rem(26);
      background: var(--a-text-white);
      border: rem(1) solid var(--a-border-primary);
      border-radius: var(--a-borderR--input);
    }

    :global {
      .p-select-clear-icon {
        top: 48%;
        right: rem(54);
        width: rem(20);
        color: var(--a-text-accent);
      }
      .p-select-dropdown {
        width: rem(22);
        color: var(--a-text-light);

        svg {
          width: rem(22);
        }
      }
    }
  }
</style>

<style lang="scss"></style>
