<script setup lang="ts">
  import { useBookingStore } from "~/stores/booking";
  import { useNotificationToast } from "~/composables/useToast";
  import type { Room, RoomTariff } from "~/types/room";
  import type { SelectedEntry } from "~/types/booking";

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
    guests,
  } = storeToRefs(bookingStore);

  const guestsCount = computed(() => {
    const list = guests.value?.roomList ?? [];
    return list.reduce((sum, room) => sum + (room?.adults ?? 0), 0) || 1;
  });

  // --- Баннеры ---
  const { getBannersByVisibility } = useBanners();
  const servicesBanners = computed(() => getBannersByVisibility("booking"));

  // --- Режим multi-rooms ---
  const isMultiRoomsMode = computed(
    () => Object.keys(selectedMultiRooms.value).length > 0,
  );

  // --- Выбранный номер / тариф ---
  const selectedRoom = computed<Room | null>(() => {
    if (isMultiRoomsMode.value) return null;
    if (!roomTariffs.value?.length) return null;
    return (
      roomTariffs.value.find(
        (room) => room.room_type_code === selectedRoomType.value,
      ) || roomTariffs.value[0] || null
    );
  });

  const selectedTariff = computed<RoomTariff | null>(() => {
    if (isMultiRoomsMode.value) return null;
    if (selectedTariffStore?.value) return selectedTariffStore.value;
    if (!selectedRoom.value?.tariffs?.length) return null;
    return selectedRoom.value.tariffs[0] || null;
  });

  // --- Ночи и итоговая стоимость ---
  const nights = useNights(date);

  const bookingTotal = computed(() => {
    if (isMultiRoomsMode.value) {
      const roomsTotal = Object.values(selectedMultiRooms.value).reduce(
        (sum, e) => sum + (e.price || 0) * nights.value,
        0,
      );
      const roomIndices = Object.keys(selectedMultiRooms.value).map(Number);
      const servicesTotal = roomIndices.reduce(
        (sum, idx) =>
          sum +
          bookingStore.getSelectedServicesForRoom(idx).reduce(
            (s, svc) => s + svc.price,
            0,
          ),
        0,
      );
      return roomsTotal + servicesTotal;
    }

    const servicesTotal = selectedServices.value.reduce(
      (sum, s) => sum + s.price,
      0,
    );
    if (!selectedTariff.value?.price) return 0;
    return selectedTariff.value.price * nights.value + servicesTotal;
  });

  // --- Выбранная запись для сводки ---
  const selectedEntry = computed<SelectedEntry | null>(() => {
    if (isMultiRoomsMode.value) return null;
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
    if (isMultiRoomsMode.value) return selectedMultiRooms.value;
    const entry = selectedEntry.value;
    if (!entry) return {};
    return { 0: entry };
  });

  // --- Преобразование пакетов в формат ServiceCard ---
  const hashStringToNumber = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  };

  const services = computed(() =>
    packages.value.map((pkg) => ({
      id: hashStringToNumber(pkg.package_code),
      packageCode: pkg.package_code,
      title: pkg.title,
      price: Number(pkg.price) || 0,
      description: pkg.description,
      photos: pkg.photos,
      calculationRateTitle: pkg.calculation_rate_title,
    })),
  );

  // --- Popup текущего номера ---
  const isPopupOpen = ref(false);
  const expandedRoom = ref(false);

  const openPopup = (event: MouseEvent) => {
    event.stopPropagation();
    isPopupOpen.value = true;
  };
  const closePopup = () => {
    isPopupOpen.value = false;
  };
  const toggleExpand = () => {
    expandedRoom.value = !expandedRoom.value;
  };

  // --- Upgrade-номер (composable) ---
  const upgrade = useUpgradeRoom({ selectedRoom, selectedTariff, isMultiRoomsMode });
  const {
    upgradeRoomLoading,
    isUpgradePopupOpen,
    isCompareModalOpen,
    expandedUpgradeRoom,
    upgradeRooms,
    upgradeAdditionalPerNight,
    nights: upgradeNights,
    setSelectedUpgradeBedId,
    openUpgradePopup,
    closeUpgradePopup,
    closeCompareModal,
    toggleUpgradeExpand,
    onCompareRooms,
    fetchUpgradeRoom,
  } = upgrade;
  // Реактивная ссылка без DeepReadonly (Vue template checker issue)
  const upgradeRoom = computed<Room | null>(() => upgrade.upgradeRoom.value);

  // --- Табы номеров при мультибронировании ---
  const multiRoomTabIndices = computed(() => {
    const keys = Object.keys(selectedMultiRooms.value);
    return keys.map((_, i) => i);
  });
  const activeRoomTab = ref(0);
  watch(
    () => multiRoomTabIndices.value.length,
    (len, prevLen) => {
      if (prevLen !== undefined && activeRoomTab.value >= len) {
        activeRoomTab.value = Math.max(0, len - 1);
      }
    },
  );

  // При переключении вкладки номера — запрашиваем пакеты для этого номера
  watch(activeRoomTab, async (tabIndex) => {
    if (!isMultiRoomsMode.value) return;
    try {
      await bookingStore.searchPackages(tabIndex);
    } catch (err: unknown) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: (err as Error).message || "Не удалось загрузить услуги",
        life: 5000,
      });
    }
  });

  const onUpgradeRoom = () => {
    if (!upgradeRoom.value) return;
    bookingStore.applyUpgradeRoom(upgradeRoom.value);
    toast.add({
      severity: "success",
      summary: "Номер улучшен",
      detail: "Выбран номер повышенного комфорта.",
      life: 3000,
    });
  };

  /** Показывать блок «Повысить комфорт» только пока выбран базовый номер (не улучшенный) */
  const showUpgradeBlock = computed(
    () =>
      !isMultiRoomsMode.value &&
      (upgradeRoomLoading.value || !!upgradeRoom.value) &&
      selectedRoom.value?.room_type_code !== upgradeRoom.value?.room_type_code,
  );

  const handleContinue = () => {
    router.push("/personal");
  };

  // --- Инициализация ---
  onMounted(async () => {
    if (isMultiRoomsMode.value) {
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

    // Загружаем услуги: при мультибронировании — только для первого номера
    try {
      await bookingStore.searchPackages(isMultiRoomsMode.value ? 0 : undefined);
    } catch (err: unknown) {
      toast.add({
        severity: "error",
        summary: "Ошибка",
        detail: (err as Error).message || "Не удалось загрузить услуги",
        life: 5000,
      });
    }

    // Загружаем upgrade-номер (только для одного номера)
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
        <!-- Левая колонка: номер + upgrade + услуги -->
        <div :class="$style.content">
          <!-- Текущий номер -->
          <BookingRoomInfoCard
            v-if="selectedRoom"
            :room="selectedRoom"
            :expanded="expandedRoom"
            :hide-description="true"
            :no-margin-bottom="showUpgradeBlock"
            @open-popup="openPopup"
            @toggle-expand="toggleExpand"
          />

          <BookingRoomPopup
            v-if="selectedRoom"
            :room="selectedRoom"
            :is-open="isPopupOpen"
            @close="closePopup"
          />

          <!-- Блок «Повысить комфорт» (скрывается после нажатия «Улучшить номер») -->
          <BookingUpgradeRoomCard
            v-if="showUpgradeBlock"
            :upgrade-room="upgradeRoom"
            :upgrade-rooms="upgradeRooms"
            :loading="upgradeRoomLoading"
            :expanded="expandedUpgradeRoom"
            :additional-per-night="upgradeAdditionalPerNight"
            :nights="upgradeNights"
            @open-popup="openUpgradePopup"
            @toggle-expand="toggleUpgradeExpand"
            @bed-type-change="setSelectedUpgradeBedId"
            @compare="onCompareRooms"
            @upgrade="onUpgradeRoom"
          />

          <BookingRoomPopup
            v-if="upgradeRoom && !isMultiRoomsMode"
            :room="upgradeRoom"
            :is-open="isUpgradePopupOpen"
            @close="closeUpgradePopup"
          />

          <BookingCompareRoomsModal
            :is-open="isCompareModalOpen"
            :current-room="selectedRoom"
            :upgrade-room="upgradeRoom"
            :nights="upgradeNights"
            :guests-count="guestsCount"
            :current-price="selectedTariff?.price ?? null"
            :upgrade-price="upgradeRoom?.min_price ?? upgradeRoom?.tariffs?.[0]?.price ?? null"
            @close="closeCompareModal"
            @upgrade="onUpgradeRoom"
          />

          <!-- Дополнительные услуги -->
          <section :class="$style.servicesList">
            <!-- При мультибронировании — табы переключения номеров вместо заголовка -->
            <div v-if="isMultiRoomsMode && multiRoomTabIndices.length > 0" :class="$style.roomTabs">
              <button
                v-for="(_, tabIndex) in multiRoomTabIndices"
                :key="tabIndex"
                type="button"
                :class="[$style.roomTab, activeRoomTab === tabIndex && $style.roomTabActive]"
                @click="activeRoomTab = tabIndex"
              >
                Номер {{ tabIndex + 1 }}
              </button>
            </div>
            <h2 v-else :class="$style.servicesListTitle">Дополнительные услуги</h2>
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
              :package-code="service.packageCode"
              :photos="service.photos"
              :room-index="isMultiRoomsMode ? activeRoomTab : 0"
            />
          </section>
        </div>

        <!-- Правая колонка: сводка бронирования -->
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

  .roomTabs {
    grid-column: 1 / -1;
    display: flex;
    flex-wrap: wrap;
    gap: rem(12);
    margin-bottom: rem(16);
  }

  .roomTab {
    min-width: rem(287);
    height: rem(49);
    padding: 0 rem(24);
    border-radius: 39px;
    border: 1px solid var(--a-border-primary);
    background: transparent;
    color: var(--a-text-dark);
    font-size: rem(20);
    font-weight: 400;
    font-family: inherit;
    cursor: pointer;
    transition: background-color 0.2s, border-color 0.2s;

    &:hover {
      border-color: var(--a-accentDarkBg);
      background: var(--ui-color-primary-50);
    }
  }

  .roomTabActive {
    background: var(--a-primaryBg);
    border-color: var(--a-primaryBg);
    color: var(--a-text-dark);

    &:hover {
      background: var(--a-accentDarkBg);
      border-color: var(--a-accentDarkBg);
    }
  }

  .servicesListTitle {
    grid-column: 1 / -1;
    margin: 0 0 rem(16) 0;
    font-family: "Lora", serif;
    font-size: rem(24);
    font-weight: 500;
    color: var(--a-text-dark);
    word-wrap: break-word;
    text-align: center;
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
</style>
