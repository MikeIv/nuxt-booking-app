<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useNotificationToast } from "~/composables/useToast";
  import type { Room, RoomTariff } from "~/types/room";

  const { getBannersByVisibility } = useBanners();

  const servicesBanners = computed(() => {
    return getBannersByVisibility("booking");
  });

  interface SelectedEntry {
    roomIdx: number;
    roomCardIdx: number;
    roomTitle: string;
    room_type_code: string;
    ratePlanCode: string;
    price: number | null | undefined;
    title: string;
  }

  definePageMeta({
    layout: "steps",
  });

  const router = useRouter();
  const toast = useNotificationToast();
  const bookingStore = useBookingStore();
  const {
    selectedRoomType,
    selectedTariff: selectedTariffStore,
    roomTariffs,
    date,
    selectedServices,
    packages,
    isServerRequest,
    selectedMultiRooms,
  } = storeToRefs(bookingStore);

  // Проверяем, есть ли выбранные номера из multi-rooms
  const isMultiRoomsMode = computed(
    () => Object.keys(selectedMultiRooms.value).length > 0,
  );

  const selectedRoom = computed<Room | null>(() => {
    if (isMultiRoomsMode.value) {
      // В режиме multi-rooms не используем selectedRoom
      return null;
    }
    if (!roomTariffs.value?.length) return null;
    return (
      roomTariffs.value.find(
        (room) => room.room_type_code === selectedRoomType.value,
      ) || roomTariffs.value[0] || null
    );
  });

  const selectedTariff = computed<RoomTariff | null>(() => {
    if (isMultiRoomsMode.value) {
      // В режиме multi-rooms не используем selectedTariff
      return null;
    }
    if (selectedTariffStore?.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  const nights = useNights(date);

  const bookingTotal = computed(() => {
    if (isMultiRoomsMode.value) {
      // Для multi-rooms считаем сумму всех номеров
      const roomsTotal = Object.values(selectedMultiRooms.value).reduce(
        (sum, e) => {
          const perNight = e.price || 0;
          return sum + perNight * nights.value;
        },
        0,
      );
      const servicesTotal = selectedServices.value.reduce(
        (sum, s) => sum + s.price,
        0,
      );
      return roomsTotal + servicesTotal;
    }
    // Для одного номера
    if (!selectedTariff.value?.price) return 0;
    const roomTotal = selectedTariff.value.price * nights.value;
    const servicesTotal = selectedServices.value.reduce(
      (sum, s) => sum + s.price,
      0,
    );
    return roomTotal + servicesTotal;
  });

  const selectedEntry = computed<SelectedEntry | null>(() => {
    if (isMultiRoomsMode.value) {
      // В режиме multi-rooms не используем selectedEntry
      return null;
    }
    if (!selectedRoom.value || !selectedTariff.value) return null;
    return {
      roomIdx: 0,
      roomCardIdx: 0,
      roomTitle: selectedRoom.value.title || "",
      room_type_code: selectedRoom.value.room_type_code,
      ratePlanCode: selectedTariff.value.rate_plan_code,
      price: selectedTariff.value.price,
      title: selectedTariff.value.title || "",
    };
  });

  const selectedByRoomIdx = computed<Record<string, SelectedEntry>>(() => {
    if (isMultiRoomsMode.value) {
      // В режиме multi-rooms используем данные из store
      return selectedMultiRooms.value;
    }
    // Для одного номера
    const entry = selectedEntry.value;
    if (!entry) return {} as Record<number, SelectedEntry>;
    return { 0: entry };
  });

  // Функция для создания числового ID из строки package_code
  const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };

  // Преобразуем PackageResource в формат для ServiceCard
  const services = computed(() => {
    return packages.value.map((pkg) => ({
      id: hashStringToNumber(pkg.package_code),
      packageCode: pkg.package_code,
      title: pkg.title,
      price: Number(pkg.price) || 0,
      description: pkg.description,
      photos: pkg.photos,
      calculationRateTitle: pkg.calculation_rate_title,
    }));
  });

  const isPopupOpen = ref(false);
  const expandedRoom = ref(false);
  const upgradeRoom = ref<Room | null>(null);
  const upgradeRoomLoading = ref(false);
  const isUpgradePopupOpen = ref(false);
  const expandedUpgradeRoom = ref(false);

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };

  const closePopup = () => {
    isPopupOpen.value = false;
  };

  const openUpgradePopup = (event: MouseEvent) => {
    event.stopPropagation();
    isUpgradePopupOpen.value = true;
  };

  const closeUpgradePopup = () => {
    isUpgradePopupOpen.value = false;
  };

  const toggleExpand = () => {
    expandedRoom.value = !expandedRoom.value;
  };

  const toggleUpgradeExpand = () => {
    expandedUpgradeRoom.value = !expandedUpgradeRoom.value;
  };

  const handleContinue = () => {
    router.push("/personal");
  };

  // Функция для подготовки данных гостей для запроса upgrade
  const prepareGuestsForUpgrade = () => {
    const { guests: guestsStore } = bookingStore;
    const roomList = guestsStore.roomList ?? [];
    if (roomList.length === 0) {
      return { adults: 1, childs: [] };
    }
    // Для upgrade берем данные первого номера
    const firstRoom = roomList[0];
    if (!firstRoom) {
      return { adults: 1, childs: [] };
    }
    const childs = Array.from(
      { length: firstRoom.children },
      (_, index) => firstRoom.childrenAges?.[index] ?? 0,
    );
    return {
      adults: firstRoom.adults,
      childs,
    };
  };

  // Функция для запроса номера повышенного комфорта
  const fetchUpgradeRoom = async () => {
    if (!selectedRoom.value || !date.value || isMultiRoomsMode.value) {
      return;
    }

    const [startDate, endDate] = date.value;
    const roomTypeCode = selectedRoom.value.room_type_code;
    const guests = prepareGuestsForUpgrade();

    if (!roomTypeCode) {
      return;
    }

    upgradeRoomLoading.value = true;
    try {
      const { post } = useApi();
      const { formatDate } = bookingStore;

      const upgradeData = {
        room_type_code: roomTypeCode,
        start_at: formatDate(startDate),
        end_at: formatDate(endDate),
        guests,
      };

      const response = await post<Room[]>(
        "/v1/search/upgrade",
        upgradeData,
        {
          signal: AbortSignal.timeout(10000),
        },
      );

      if (response.success && response.payload && response.payload.length > 0) {
        // Преобразуем данные из API в формат Room
        const apiRoom = response.payload[0]!; // Non-null assertion, так как мы проверили length > 0
        // Обрабатываем square, который может быть строкой или числом
        const squareValue =
          typeof apiRoom.square === "string"
            ? Number(apiRoom.square) || 0
            : apiRoom.square ?? 0;
        upgradeRoom.value = {
          id: apiRoom.id ?? apiRoom.room_type_code,
          room_type_code: apiRoom.room_type_code,
          title: apiRoom.title || "",
          description: apiRoom.description ?? null,
          max_occupancy: apiRoom.max_occupancy ?? 0,
          square: squareValue,
          rooms: apiRoom.rooms ?? 0,
          amenities: apiRoom.amenities ?? [],
          bed: apiRoom.bed ?? null,
          view: apiRoom.view ?? null,
          family: apiRoom.family ?? null,
          min_price:
            typeof apiRoom.min_price === "string"
              ? Number(apiRoom.min_price)
              : apiRoom.min_price ?? null,
          price_for_register: apiRoom.price_for_register,
          photos: apiRoom.photos ?? [],
          tariffs: apiRoom.tariffs ?? [],
        };
      } else {
        upgradeRoom.value = null;
      }
    } catch (err: unknown) {
      // Тихая ошибка - не показываем уведомление, просто не отображаем карточку
      upgradeRoom.value = null;
      if (import.meta.dev) {
        console.error("Ошибка загрузки номера повышенного комфорта:", err);
      }
    } finally {
      upgradeRoomLoading.value = false;
    }
  };

  onMounted(async () => {
    // Проверяем режим multi-rooms
    if (isMultiRoomsMode.value) {
      // В режиме multi-rooms проверяем, что есть выбранные номера
      if (Object.keys(selectedMultiRooms.value).length === 0) {
        toast.add({
          severity: "warn",
          summary: "Ошибка",
          detail: "Номера не выбраны",
          life: 3000,
        });
        await router.push("/multi-rooms");
        return;
      }
    } else {
      // Для одного номера проверяем выбранный номер и тариф
      if (!selectedRoom.value) {
        toast.add({
          severity: "warn",
          summary: "Ошибка",
          detail: "Номер не выбран",
          life: 3000,
        });
        await router.push("/rooms");
        return;
      }
      if (!selectedTariff.value) {
        toast.add({
          severity: "warn",
          summary: "Ошибка",
          detail: "Тариф не выбран",
          life: 3000,
        });
        await router.push("/rooms");
        return;
      }
    }

    // Загружаем услуги из API
    try {
      await bookingStore.searchPackages();
    } catch (err: unknown) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: (err as Error).message || "Не удалось загрузить услуги",
        life: 5000,
      });
    }

    // Загружаем номер повышенного комфорта (только для одного номера)
    if (!isMultiRoomsMode.value && selectedRoom.value) {
      await fetchUpgradeRoom();
    }
  });
</script>

<template>
  <div :class="$style.container">
    <h1 :class="$style.header">Выбор услуг</h1>
    <div v-if="servicesBanners.length > 0" :class="$style.bannersWrapper">
      <CommonBannersList :banners="servicesBanners" />
    </div>

    <section :class="$style.block">
      <div
        v-if="selectedRoom || isMultiRoomsMode"
        :class="$style.twoCols"
      >
        <div :class="$style.content">
          <BookingRoomInfoCard
            v-if="selectedRoom"
            :room="selectedRoom"
            :expanded="expandedRoom"
            :hide-description="true"
            @open-popup="openPopup"
            @toggle-expand="toggleExpand"
          />

          <BookingRoomPopup
            v-if="selectedRoom"
            :room="selectedRoom"
            :is-open="isPopupOpen"
            @close="closePopup"
          />

          <!-- Карточка номера повышенного комфорта -->
          <div v-if="upgradeRoom && !isMultiRoomsMode" :class="$style.upgradeRoomCard">
            <BookingRoomInfoCard
              :room="upgradeRoom"
              :expanded="expandedUpgradeRoom"
              :hide-description="true"
              @open-popup="openUpgradePopup"
              @toggle-expand="toggleUpgradeExpand"
            />
          </div>

          <BookingRoomPopup
            v-if="upgradeRoom && !isMultiRoomsMode"
            :room="upgradeRoom"
            :is-open="isUpgradePopupOpen"
            @close="closeUpgradePopup"
          />

          <section :class="$style.servicesList">
            <div v-if="isServerRequest" :class="$style.loading">
              Загрузка услуг...
            </div>
            <div v-else-if="services.length === 0" :class="$style.noServices">
              Услуги не найдены
            </div>
            <BookingServiceCard
              v-for="service in services"
              v-else
              :id="service.id"
              :key="service.packageCode"
              :title="service.title"
              :price="service.price"
              :photos="service.photos"
            />
          </section>
        </div>

        <div :class="$style.summaryWrapper">
          <BookingSummary
            v-if="selectedEntry || isMultiRoomsMode"
            :selected-entries="selectedByRoomIdx"
            :date="date"
            :nights="nights"
            :booking-total="bookingTotal"
            @continue="handleContinue"
          />
        </div>
      </div>

      <div v-else :class="$style.noRoom">
        <p>Номер не выбран. Пожалуйста, вернитесь к выбору номера.</p>
      </div>
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

  .bannersWrapper {
    margin-bottom: rem(20);
    width: 100%;

    @media (min-width: #{size.$desktopMedium}) {
      max-width: #{size.$desktop};
      margin-left: auto;
      margin-right: auto;
    }
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

  .twoCols {
    display: flex;
    flex-direction: column;
    gap: rem(24);

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: row;
      align-items: stretch;
    }
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: rem(32);
    margin-bottom: rem(40);
    padding-bottom: rem(120);

    @media (min-width: #{size.$desktopMin}) {
      width: 66.6667%;
      margin-bottom: 0;
      padding-bottom: 0;
    }
  }

  .summaryWrapper {
    display: flex;
    width: 100%;

    @media (min-width: #{size.$desktopMin}) {
      flex-direction: column;
      width: calc(100% / 3);
    }
  }

  .servicesList {
    display: grid;
    grid-template-columns: 1fr;
    gap: rem(20);
    width: 100%;
    padding: 0 rem(4) rem(40) rem(4);

    @media (max-width: calc(#{size.$desktopMin} - 1px)) {
      padding-bottom: rem(20);
    }

    @media (min-width: #{size.$tabletMin}) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (min-width: #{size.$desktopMin}) and (max-width: calc(#{size.$desktopMedium} - 1px)) {
      grid-template-columns: 1fr;
    }

    @media (min-width: #{size.$desktopMedium}) {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .noRoom {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-text-accent);
    text-align: center;
  }

  .loading,
  .noServices {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: rem(40);
    font-size: rem(18);
    color: var(--a-text-accent);
    text-align: center;
  }

  .upgradeRoomCard {
    :deep(section) {
      border: 1px solid var(--a-border-primary-accent);
    }
  }
</style>
