<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useNotificationToast } from "~/composables/useToast";
  import { useRoomFilters } from "~/composables/useRoomFilters";

  definePageMeta({
    layout: "steps",
  });

  const bookingStore = useBookingStore();
  const { searchResults, date, guests, loading } = storeToRefs(bookingStore);
  const toast = useNotificationToast();
  const router = useRouter();

  const searchFilters = computed(() => searchResults.value?.filters);
  const {
    selectedView,
    selectedBalcony,
    viewOptions,
    balconyOptions,
    filterRoomList,
  } = useRoomFilters(searchFilters);

  const totalAdults = computed(() => {
    if (!guests.value?.roomList) return 0;
    return guests.value.roomList.reduce((sum, r) => sum + r.adults, 0);
  });

  const filteredRooms = computed(() =>
    filterRoomList(searchResults.value?.rooms),
  );

  const hasSearchResults = computed(() => {
    return (searchResults.value?.rooms?.length ?? 0) > 0;
  });

  onMounted(async () => {
    if (!date.value || totalAdults.value === 0) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      router.push("/");
      return;
    }

    if (!searchResults.value) {
      if (import.meta?.env?.DEV) {
        console.log("onMounted search:", {
          loading: loading.value,
          isServerRequest: bookingStore.isServerRequest,
        });
      }
      try {
        await bookingStore.search();
      } catch (error: unknown) {
        console.error("Ошибка при загрузке сохраненного поиска:", error);
        toast.add({
          severity: "error",
          summary: "Ошибка загрузки",
          detail:
            (error as Error)?.message || "Произошла ошибка при поиске номеров",
          life: 3000,
        });
        bookingStore.setLoading(false);
        bookingStore.setServerRequest(false);
      }
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номера</h1>
    <Booking />

    <div :class="$style.filtersWrapper" data-testid="filters-wrapper">
      <Select
        v-model="selectedView"
        :options="viewOptions"
        option-label="title"
        option-value="id"
        placeholder="Вид из окна"
        :class="$style.filterSelect"
      />
      <Select
        v-model="selectedBalcony"
        :options="balconyOptions"
        option-label="title"
        option-value="id"
        placeholder="Балкон"
        :class="$style.filterSelect"
      />
    </div>

    <div v-if="loading || bookingStore.isServerRequest" :class="$style.loading" data-testid="loading">Загрузка номеров...</div>

    <template v-else-if="hasSearchResults">
      <section :class="$style.roomsList">
        <BookingCard
          v-for="item in filteredRooms"
          :key="item.room_type_code"
          :room="item"
        />
        <div v-if="filteredRooms.length === 0" :class="$style.noFilterResults" data-testid="no-filter-results">
          Нет номеров с выбранными параметрами
        </div>
      </section>
    </template>

    <div v-else-if="!loading && !bookingStore.isServerRequest" :class="$style.noResults" data-testid="no-results">
      Нет доступных номеров. Выполните поиск.
    </div>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    max-width: #{size.$desktopMax};
    margin: 0 auto rem(40) auto;
    padding: 0 rem(20);
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-black);

    @media (min-width: #{size.$tablet}) {
      font-size: rem(34);
    }

    @media (min-width: #{size.$desktopMin}) {
      margin: rem(40) 0 rem(60) 0;
    }
  }

  .filtersWrapper {
    display: flex;
    flex-direction: column;
    gap: rem(16);
    margin-bottom: rem(20);
    width: 100%;

    @media (min-width: #{size.$tabletMin}) {
      flex-direction: row;
      gap: rem(24);
    }
  }

  .roomsList {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(20);
    width: 100%;
    padding: 0 rem(4) rem(40) rem(4);

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
    color: var(--a-text-light);
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
    grid-column: 1 / -1;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-text-accent);
    text-align: center;
  }

  .filterSelect {
    color: var(--a-black);
    width: 100%;

    @media (min-width: #{size.$mobile}) {
      max-width: rem(368);
    }

    &:global(.p-select) {
      display: flex;
      align-items: center;
      width: 100%;
      min-height: rem(54);
      padding: rem(6) rem(24);
      font-family: "Inter", sans-serif;
      font-size: rem(26);
      background: var(--a-text-white);
      border: rem(1) solid var(--a-border-primary);
      border-radius: var(--a-borderR--input);
      outline: none;

      &:hover {
        border-color: var(--a-border-primary);
      }
    }

    :global {
      .p-select-label {
        font-size: rem(26);
      }
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
