<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { Room } from "~/types/room";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, date, guests, loading } = storeToRefs(bookingStore);

  // Используем undefined для отображения плейсхолдера
  const selectedBedType = ref<number | undefined>(undefined);

  const bedOptions = computed(() => {
    if (
      !searchResults.value?.filters?.beds ||
      searchResults.value.filters.beds.length === 0
    )
      return [];

    return searchResults.value.filters.beds.map((bed) => ({
      id: bed.id,
      title: bed.title,
    }));
  });

  const filteredRooms = computed(() => {
    if (!searchResults.value?.rooms) return [];

    // Если ничего не выбрано (плейсхолдер) или выбраны "Все типы кроватей" (id = 0)
    if (selectedBedType.value === undefined || selectedBedType.value === 0) {
      return searchResults.value.rooms; // Возвращаем все комнаты
    }

    // Фильтруем по id кровати
    return searchResults.value.rooms.filter(
      (room: Room) => room.bed?.id === selectedBedType.value,
    );
  });

  const hasSearchResults = computed(() => {
    return (
      searchResults.value &&
      searchResults.value.rooms &&
      searchResults.value.rooms.length > 0
    );
  });

  onMounted(async () => {
    if (date.value && guests.value.adults > 0 && !searchResults.value) {
      try {
        await bookingStore.search();
      } catch (error) {
        console.error("Ошибка при загрузке сохраненного поиска:", error);
      }
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номера</h1>
    <Booking />

    <div v-if="bedOptions.length > 0">
      <Select
        v-model="selectedBedType"
        :options="bedOptions"
        option-label="title"
        option-value="id"
        placeholder="Тип кровати"
        :class="$style.filterSelect"
      />
    </div>

    <div v-if="loading" :class="$style.loading">Загрузка номеров...</div>

    <template v-else-if="hasSearchResults">
      <section :class="$style.roomsList">
        <BookingCard
          v-for="item in filteredRooms"
          :key="item.id"
          :room="item"
        />

        <div v-if="filteredRooms.length === 0" :class="$style.noFilterResults">
          Нет номеров с выбранным типом кровати
        </div>
      </section>
    </template>

    <div v-else :class="$style.noResults">
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
    color: var(--a-text-accent);
    text-align: center;
  }

  .noFilterResults {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-text-accent);
    text-align: center;
    grid-column: 1 / -1;
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
