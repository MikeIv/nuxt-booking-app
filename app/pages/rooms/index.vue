<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { Room } from "~/types/room";

  definePageMeta({
    layout: "steps",
  });

  const VIEW_OPTIONS = [
    { id: 0, title: "Вид из окна" },
    { id: 1, title: "Парк" },
    { id: 2, title: "Город" },
    { id: 3, title: "Море" },
    { id: 4, title: "Внутренний двор" },
  ];

  const BALCONY_OPTIONS = [
    { id: 0, title: "Балкон" },
    { id: 1, title: "Есть балкон" },
    { id: 2, title: "Нет балкона" },
  ];

  const BALCONY_REGEX = /балкон/i;

  const bookingStore = useBookingStore();
  const { searchResults, date, guests, loading } = storeToRefs(bookingStore);
  const toast = useToast();
  const router = useRouter();

  const selectedView = ref<number>(0);
  const selectedBalcony = ref<number>(0);

  const viewOptions = computed(() => VIEW_OPTIONS);
  const balconyOptions = computed(() => BALCONY_OPTIONS);

  const totalAdults = computed(() => {
    if (!guests.value?.roomList) return 0;
    return guests.value.roomList.reduce((sum, r) => sum + r.adults, 0);
  });

  const hasBalconyAmenity = (room: Room): boolean => {
    const hasInMainAmenities = room.amenities?.some(
      (amenity) => amenity.title && BALCONY_REGEX.test(amenity.title),
    );

    if (hasInMainAmenities) return true;

    return (
      room.room_type_codes?.some((variant) =>
        variant.amenities?.some(
          (amenity) => amenity.title && BALCONY_REGEX.test(amenity.title),
        ),
      ) ?? false
    );
  };

  const hasSelectedView = (room: Room, viewId: number): boolean => {
    if (room.view?.id === viewId) return true;

    return (
      room.room_type_codes?.some((variant) => variant.view?.id === viewId) ??
      false
    );
  };

  const filteredRooms = computed(() => {
    const rooms = searchResults.value?.rooms;
    if (!rooms || rooms.length === 0) return [];

    const activeView = selectedView.value;
    const activeBalcony = selectedBalcony.value;

    if (!activeView && !activeBalcony) {
      return rooms;
    }

    return rooms.filter((room) => {
      if (activeView && !hasSelectedView(room, activeView)) {
        return false;
      }

      if (activeBalcony) {
        const hasBalcony = hasBalconyAmenity(room);
        if (activeBalcony === 1 && !hasBalcony) return false;
        if (activeBalcony === 2 && hasBalcony) return false;
      }

      return true;
    });
  });

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
        bookingStore.isServerRequest = false;
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

    <div v-if="loading" :class="$style.loading" data-testid="loading">Загрузка номеров...</div>

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

    <div v-else :class="$style.noResults" data-testid="no-results">
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
