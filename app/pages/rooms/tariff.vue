<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import type { PackageResource, RoomTariff } from "~/types/room";
  import ArrowBack from "~/assets/icons/arrow-back.svg";
  import { useNotificationToast } from "~/composables/useToast";

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const toast = useNotificationToast();
  const bookingStore = useBookingStore();
  const { searchResults, selectedRoomType, roomTariffs, date, guests } =
    storeToRefs(bookingStore);
  const loading = ref(true);
  const error = ref<Error | null>(null);
  const isPopupOpen = ref(false);
  const isServicePopupOpen = ref(false);
  const selectedService = ref<PackageResource | null>(null);
  const expandedRooms = ref<Record<string, boolean>>({});

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const _openServicePopup = (event: MouseEvent, service: PackageResource) => {
    event.stopPropagation();
    selectedService.value = service;
    isServicePopupOpen.value = true;
  };

  const closeServicePopup = () => {
    isServicePopupOpen.value = false;
    selectedService.value = null;
  };

  const toggleExpand = (roomTitle: string) => {
    expandedRooms.value[roomTitle] = !expandedRooms.value[roomTitle];
  };

  // Фильтруем тарифы для выбранного типа номера
  const filteredRoomTariffs = computed(() => {
    if (!selectedRoomType.value || !roomTariffs.value?.length) {
      return roomTariffs.value || [];
    }
    
    // Фильтруем номера по выбранному типу
    const filtered = roomTariffs.value.filter(
      (room) => room.room_type_code === selectedRoomType.value,
    );
    
    // Если нашли номера с тарифами, возвращаем их
    if (filtered.length > 0) {
      return filtered;
    }
    
    // Если не нашли, возвращаем все номера (на случай, если код не совпадает)
    return roomTariffs.value;
  });

  const handleTariff = async (tariff: RoomTariff) => {
    if (!selectedRoomType.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Выберите тип номера перед продолжением",
        life: 3000,
      });
      return;
    }
    bookingStore.selectedTariff = tariff;
    await router.push("/services");
  };

  const goBackToRooms = async () => {
    bookingStore.setLoading(true, "Загружаем номера...");
    bookingStore.isServerRequest = true;
    bookingStore.selectedRoomType = null;
    bookingStore.searchResults = null;
    bookingStore.roomTariffs = [];
    try {
      await router.push("/rooms");
      await nextTick();
    } finally {
      // loading и isServerRequest будут сброшены после загрузки данных на странице /rooms
    }
  };

  onMounted(async () => {
    // Если выбрано больше одного номера — редирект на мультибронирование
    const roomsCount = guests.value?.roomList
      ? guests.value.roomList.length
      : guests.value?.rooms || 1;
    if (roomsCount > 1) {
      router.push("/multi-rooms");
      return;
    }

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

    if (!selectedRoomType.value) {
      toast.add({
        severity: "warn",
        summary: "Ошибка",
        detail: "Тип номера не выбран",
        life: 3000,
      });
      router.push("/rooms");
      return;
    }

    // Проверяем, есть ли уже загруженные данные для выбранного типа номера
    const hasValidData =
      roomTariffs.value?.length > 0 &&
      roomTariffs.value.some(
        (room) =>
          room.room_type_code === selectedRoomType.value &&
          room.tariffs &&
          room.tariffs.length > 0,
      );

    if (hasValidData) {
      // Данные уже загружены, просто скрываем загрузку
      loading.value = false;
      if (import.meta?.env?.DEV) {
        console.log("✅ Данные тарифов уже загружены:", {
          roomTariffs: roomTariffs.value,
          selectedRoomType: selectedRoomType.value,
        });
      }
      return;
    }

    try {
      loading.value = true;
      const result = await bookingStore.search({ roomTypeCode: selectedRoomType.value });
      
      // Ждем обновления DOM после загрузки данных
      await nextTick();
      
      if (import.meta?.env?.DEV) {
        console.log("📥 Результат загрузки тарифов:", {
          result,
          roomTariffs: roomTariffs.value,
          roomTariffsLength: roomTariffs.value?.length,
          searchResults: searchResults.value,
          normalizedRooms: result?.rooms,
        });
        
        // Детальная проверка структуры данных
        if (roomTariffs.value && roomTariffs.value.length > 0) {
          roomTariffs.value.forEach((room, idx) => {
            console.log(`Комната ${idx}:`, {
              title: room.title,
              room_type_code: room.room_type_code,
              tariffsCount: room.tariffs?.length || 0,
              tariffs: room.tariffs,
            });
          });
        }
      }

      // Проверяем, что данные действительно загружены
      if (!roomTariffs.value || roomTariffs.value.length === 0) {
        console.warn("⚠️ Данные тарифов не загружены после запроса");
        if (import.meta?.env?.DEV) {
          console.warn("Проверка searchResults:", searchResults.value);
        }
      } else {
        // Проверяем, что у номеров есть тарифы
        const roomsWithTariffs = roomTariffs.value.filter(
          (room) => room.tariffs && room.tariffs.length > 0,
        );
        if (roomsWithTariffs.length === 0) {
          console.warn("⚠️ Номера загружены, но тарифы отсутствуют");
          if (import.meta?.env?.DEV) {
            console.warn("Структура номеров:", roomTariffs.value.map(r => ({
              title: r.title,
              tariffs: r.tariffs,
            })));
          }
        }
      }
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
    <h1 :class="$style.header">Выбор тарифа для номера</h1>

    <Booking />
    <!-- <BookingAdvantages /> -->

    <section :class="$style.tariffBlock">
      <Button :class="$style.return" unstyled @click="goBackToRooms">
        <ArrowBack :class="$style.arrowIcon" />
        <span>Назад к выбору номеров</span>
      </Button>

      <div v-if="loading" :class="$style.loadingContainer">
        <div :class="$style.spinner" />
        <p>Загрузка тарифов...</p>
      </div>

      <div v-else-if="error" :class="$style.errorContainer">
        <p>Произошла ошибка при загрузке тарифов. Попробуйте позже.</p>
      </div>

      <template v-else>
        <h2 :class="$style.tariffTitle">Выберите тариф к номеру</h2>

        <div v-if="filteredRoomTariffs?.length > 0" :class="$style.tariffs">
          <div
            v-for="(room, index) in filteredRoomTariffs"
            :key="`room-${room.room_type_code || room.id || index}`"
            :class="$style.tariffCard"
          >
            <BookingRoomInfoCard
              :room="room"
              :expanded="expandedRooms[room.title || '']"
              @open-popup="openPopup"
              @toggle-expand="toggleExpand"
            />
            <!--            <BookingServicesList-->
            <!--              :services="searchResults?.packages || []"-->
            <!--              :is-service-popup-open="isServicePopupOpen"-->
            <!--              @open-service-popup="openServicePopup"-->
            <!--            />-->
            <BookingTariffsList
              :tariffs="room.tariffs || []"
              @book-tariff="handleTariff"
            />
            <BookingRoomPopup
              :room="room"
              :is-open="isPopupOpen"
              @close="closePopup"
            />
            <BookingServicePopup
              v-if="selectedService"
              :service="selectedService"
              :is-open="isServicePopupOpen"
              @close="closeServicePopup"
            />
          </div>
        </div>

        <div
          v-else-if="searchResults && !searchResults.available"
          :class="$style.noResults"
        >
          <p>К сожалению, на выбранные даты нет доступных номеров.</p>
        </div>

        <div v-else :class="$style.noResults">
          <p>Тарифы не найдены. Проверьте выбранные параметры.</p>
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
    font-family: "Lora", serif;
    font-size: rem(34);
    font-weight: 600;
    color: var(--a-black);
  }

  .tariffBlock {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: rem(20) 0;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin: 0 auto;
    }
  }

  .return {
    position: relative;
    display: flex;
    align-items: center;
    gap: rem(32);
    margin-bottom: rem(40);
    font-family: "Lora", serif;
    font-size: rem(20);
    color: var(--a-text-dark);
    cursor: pointer;

    &:hover {
      color: var(--a-text-accent);
    }
  }

  .arrowIcon {
    width: rem(14);
    height: rem(28);
    flex-shrink: 0;
  }

  .tariffTitle {
    margin-bottom: rem(40);
    text-align: center;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 600;
    color: var(--a-text-dark);
    text-transform: uppercase;

    @media (min-width: #{size.$tablet}) {
      font-size: rem(28);
    }
  }

  .tariffs {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);
  }

  .tariffCard {
    display: flex;
    flex-direction: column;
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
    padding: rem(40) 0;
  }

  .spinner {
    width: rem(40);
    height: rem(40);
    border: rem(3) solid var(--a-border-light);
    border-top: rem(3) solid var(--a-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: rem(16);
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
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
