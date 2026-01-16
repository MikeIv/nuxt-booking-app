<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { PackageResource } from "~/types/room";
  import { useNotificationToast } from "~/composables/useToast";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const toast = useNotificationToast();
  const bookingStore = useBookingStore();
  const { searchResults, roomTariffs, date, guests, selectedServices } =
    storeToRefs(bookingStore);

  const loading = ref(true);
  const error = ref<Error | null>(null);
  const isServicePopupOpen = ref(false);
  const selectedService = ref<PackageResource | null>(null);

  const selectedView = ref<number | undefined>(undefined);
  const selectedBalcony = ref<number | undefined>(undefined);

  interface SelectedEntry {
    roomIdx: number;
    roomCardIdx: number;
    roomTitle: string;
    room_type_code: string;
    ratePlanCode: string;
    price: number | null | undefined;
    title: string;
  }
  const selectedByRoomIdx = ref<Record<string, SelectedEntry>>({});

  function handleSelectTariff(
    ratePlanCode: string,
    roomIdx: number,
    roomCardIdx?: number,
  ) {
    // Если передан roomCardIdx, используем его для поиска комнаты
    // Иначе используем roomIdx (для обратной совместимости)
    const cardIdx = roomCardIdx !== undefined ? roomCardIdx : roomIdx;
    const room = roomTariffs.value?.[cardIdx];
    if (!room) return;
    const tar =
      room.tariffs?.find((t) => t.rate_plan_code === ratePlanCode) || null;

    // Используем составной ключ для уникальной идентификации номера в конкретной карточке
    const key = roomCardIdx !== undefined 
      ? `${roomCardIdx}-${roomIdx}` 
      : `${roomIdx}`;
    const already = selectedByRoomIdx.value[key];
    
    if (!ratePlanCode || (already && already.ratePlanCode === ratePlanCode)) {
      Reflect.deleteProperty(selectedByRoomIdx.value, key);
      return;
    }

    if (tar && room.room_type_code && room.room_type_code.trim() !== "") {
      selectedByRoomIdx.value[key] = {
        roomIdx,
        roomCardIdx: cardIdx,
        roomTitle: room.title,
        room_type_code: room.room_type_code,
        ratePlanCode: tar.rate_plan_code,
        price: tar.price,
        title: tar.title,
      };
    }
  }

  const selectedCodes = computed<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    Object.entries(selectedByRoomIdx.value).forEach(([key, entry]) => {
      map[key] = entry.ratePlanCode;
    });
    return map;
  });

  const nights = useNights(date);

  const bookingTotal = computed(() => {
    const roomsTotal = Object.values(selectedByRoomIdx.value).reduce((sum, e) => {
      const perNight = e.price || 0;
      return sum + perNight * nights.value;
    }, 0);
    const servicesTotal = selectedServices.value.reduce((sum, s) => sum + s.price, 0);
    return roomsTotal + servicesTotal;
  });

  const hasSummary = computed(
    () => Object.keys(selectedByRoomIdx.value).length > 0,
  );

  const dateValue = computed(() => date.value);

  const viewOptions = computed(() => {
    return [
      { id: 1, title: "Парк" },
      { id: 2, title: "Город" },
      { id: 3, title: "Море" },
      { id: 4, title: "Внутренний двор" },
    ];
  });

  const balconyOptions = computed(() => {
    return [
      { id: 1, title: "Есть балкон" },
      { id: 2, title: "Нет балкона" },
    ];
  });

  const openServicePopup = (event: MouseEvent, service: PackageResource) => {
    event.stopPropagation();
    selectedService.value = service;
    isServicePopupOpen.value = true;
  };

  const closeServicePopup = () => {
    isServicePopupOpen.value = false;
    selectedService.value = null;
  };

  const handleContinue = () => {
    // Сохраняем выбранные номера в store перед переходом на страницу услуг
    bookingStore.setSelectedMultiRooms(selectedByRoomIdx.value);
    router.push("/services");
  };

  onMounted(async () => {
    const roomsCount = guests.value?.roomList
      ? guests.value.roomList.length
      : guests.value?.rooms || 1;

    const totalAdults = guests.value?.roomList
      ? guests.value.roomList.reduce((sum, r) => sum + r.adults, 0)
      : 0;

    if (!date.value || totalAdults === 0) {
      toast.add({
        severity: "warn",
        summary: "Некорректные данные",
        detail: "Укажите даты и количество гостей",
        life: 3000,
      });
      router.push("/");
      return;
    }

    if (roomsCount <= 1) {
      router.push("/rooms/tariff");
      return;
    }

    try {
      loading.value = true;
      await bookingStore.search();
    } catch (err: unknown) {
      error.value = err as Error;
      toast.add({
        severity: "error",
        summary: "Ошибка загрузки",
        detail:
          (err as Error)?.message || "Произошла ошибка при загрузке тарифов",
        life: 3000,
      });
    } finally {
      loading.value = false;
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор номеров и тарифов</h1>

    <Booking />

    <div :class="$style.filtersWrapper">
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

    <section :class="[$style.block, hasSummary && $style.blockWithSummary]">
      <div v-if="loading" :class="$style.loadingContainer">
        <ProgressSpinner
          style="width: 50px; height: 50px"
          stroke-width="4"
          fill="transparent"
          animation-duration="2.5s"
          aria-label="Загрузка тарифов"
        />
        <p :class="$style.loadingText">Загрузка тарифов...</p>
      </div>

      <div v-else-if="error" :class="$style.errorContainer">
        <p>Произошла ошибка при загрузке тарифов. Попробуйте позже.</p>
      </div>

      <template v-else>
        <div v-if="roomTariffs?.length > 0">
          <div v-if="hasSummary" :class="$style.twoCols">
            <div :class="$style.cards">
              <BookingMultiCard
                v-for="(room, idx) in roomTariffs"
                :key="idx"
                :room="room"
                :room-card-idx="idx"
                :services="searchResults?.packages || []"
                :selected-codes="selectedCodes"
                @open-service-popup="openServicePopup"
                @select-tariff="handleSelectTariff"
              />

              <BookingServicePopup
                v-if="selectedService"
                :service="selectedService"
                :is-open="isServicePopupOpen"
                @close="closeServicePopup"
              />
            </div>

            <div :class="$style.summaryWrapper">
              <BookingSummary
                :selected-entries="selectedByRoomIdx"
                :date="dateValue"
                :nights="nights"
                :booking-total="bookingTotal"
                @continue="handleContinue"
              />
            </div>
          </div>

          <div v-else :class="$style.cards">
            <BookingMultiCard
              v-for="(room, idx) in roomTariffs"
              :key="idx"
              :room="room"
              :room-card-idx="idx"
              :services="searchResults?.packages || []"
              :selected-codes="selectedCodes"
              @open-service-popup="openServicePopup"
              @select-tariff="handleSelectTariff"
            />

            <BookingServicePopup
              v-if="selectedService"
              :service="selectedService"
              :is-open="isServicePopupOpen"
              @close="closeServicePopup"
            />
          </div>

          <div v-if="hasSummary" :class="$style.summaryWrapperMobile">
            <BookingSummary
              :selected-entries="selectedByRoomIdx"
              :date="dateValue"
              :nights="nights"
              :booking-total="bookingTotal"
              @continue="handleContinue"
            />
          </div>
        </div>

        <div
          v-else-if="searchResults && !searchResults.available"
          :class="$style.noResults"
        >
          <p>К сожалению, на выбранные даты нет доступных номеров.</p>
        </div>
      </template>
    </section>
  </div>
</template>

<style module lang="scss">
  @use "~/assets/styles/variables/resolutions" as size;

  .container {
    display: flex;
    flex-direction: column;
    margin-bottom: rem(40);
    padding: 0 rem(20);

    @media (min-width: #{size.$desktopMin}) {
      padding: 0 rem(60);
    }
  }

  .header {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: rem(40) 0;
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(28);
    font-weight: 600;
    color: var(--a-black);
  }

  .block {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 0 0 rem(40) 0;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .blockWithSummary {
    padding-bottom: rem(300);

    @media (min-width: #{size.$tablet}) {
      padding-bottom: rem(350);
    }

    @media (min-width: #{size.$desktopMin}) {
      padding-bottom: rem(40);
    }
  }

  .twoCols {
    display: flex;
    flex-direction: column;
    gap: rem(24);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      align-items: flex-start;
    }
  }

  .summaryWrapper {
    display: none;

    @media (min-width: #{size.$desktopMin}) {
      display: flex;
      width: 33.3333%;
      flex-shrink: 0;
    }
  }

  .summaryWrapperMobile {
    display: block;

    @media (min-width: #{size.$desktopMin}) {
      display: none;
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

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto rem(40) auto;
    }
  }

  .return {
    position: relative;
    display: flex;
    align-items: center;
    margin-bottom: rem(40);
    padding-left: rem(30);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);
    cursor: pointer;

    &:before {
      content: "<";
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      width: 10px;
    }
  }

  .cards {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);

    @media (min-width: #{size.$tablet}) {
      gap: rem(32);
    }
  }

  @media (min-width: #{size.$desktopMin}) {
    .twoCols > .cards {
      width: 66.6667%;
      margin-bottom: 0;
    }
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

  .noResults {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }

  .loadingContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: rem(16);
    padding: rem(40) 0;
  }

  .loadingText {
    margin: 0;
    text-align: center;
    font-family: "Inter", sans-serif;
    font-size: rem(14);
    font-weight: 400;
    color: var(--a-text-dark);
  }

  .errorContainer {
    padding: rem(20);
    text-align: center;
    color: var(--a-text-error);
    background-color: var(--a-bg-light);
    border-radius: var(--a-borderR--card);
    margin-bottom: rem(40);
  }
</style>
