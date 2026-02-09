import { useBookingStore } from "~/stores/booking";
import type { Room, RoomTariff, RoomAmenity } from "~/types/room";
import type {
  SearchUpgradeRequest,
  SearchUpgradePayload,
  SearchUpgradeRoomItem,
} from "~/types/booking";

interface UseUpgradeRoomOptions {
  selectedRoom: Ref<Room | null>;
  selectedTariff: Ref<RoomTariff | null>;
  isMultiRoomsMode: Ref<boolean>;
}

export const useUpgradeRoom = (options: UseUpgradeRoomOptions) => {
  const { selectedRoom, selectedTariff, isMultiRoomsMode } = options;

  const bookingStore = useBookingStore();
  const { date, promoCode } = storeToRefs(bookingStore);
  const nights = useNights(date);

  // --- State ---
  /** Все варианты номера повышенного комфорта (по типам кроватей) из payload.rooms */
  const upgradeRooms = shallowRef<Room[]>([]);
  /** Id выбранного типа кровати (определяет, какой номер показывать в карточке) */
  const selectedUpgradeBedId = ref<number | null>(null);
  const upgradeRoomLoading = ref(false);
  const isUpgradePopupOpen = ref(false);
  const isCompareModalOpen = ref(false);
  const expandedUpgradeRoom = ref(false);

  /** Текущий номер для отображения: по selectedUpgradeBedId или первый из списка */
  const upgradeRoom = computed<Room | null>(() => {
    const list = upgradeRooms.value;
    if (!list.length) return null;
    if (selectedUpgradeBedId.value != null) {
      const found = list.find((r) => r.bed?.id === selectedUpgradeBedId.value);
      if (found) return found;
    }
    return list[0] ?? null;
  });

  const setSelectedUpgradeBedId = (bedId: string) => {
    const id = bedId === "" ? null : Number(bedId);
    selectedUpgradeBedId.value = Number.isNaN(id) ? null : id;
  };

  // --- Computed ---
  /** Добавочная цена за повышение комфорта (за ночь): min_price номера повышенного комфорта минус min_price выбранного номера (первая карточка) */
  const upgradeAdditionalPerNight = computed(() => {
    if (!upgradeRoom.value || !selectedRoom.value) return 0;
    const upgradePrice =
      upgradeRoom.value.min_price ?? upgradeRoom.value.tariffs?.[0]?.price ?? 0;
    const basePrice =
      selectedRoom.value.min_price ??
      selectedRoom.value.tariffs?.[0]?.price ??
      0;
    return Math.max(0, Number(upgradePrice) - Number(basePrice));
  });

  // --- Actions ---
  const openUpgradePopup = (event: MouseEvent) => {
    event.stopPropagation();
    isUpgradePopupOpen.value = true;
  };

  const closeUpgradePopup = () => {
    isUpgradePopupOpen.value = false;
  };

  const toggleUpgradeExpand = () => {
    expandedUpgradeRoom.value = !expandedUpgradeRoom.value;
  };

  const openCompareModal = () => {
    isCompareModalOpen.value = true;
  };

  const closeCompareModal = () => {
    isCompareModalOpen.value = false;
  };

  const onCompareRooms = () => {
    openCompareModal();
  };

  /** Маппинг элемента payload.rooms в тип Room */
  const mapUpgradeRoomToRoom = (item: SearchUpgradeRoomItem): Room => {
    const amenities: RoomAmenity[] = Array.isArray(item.amenities)
      ? item.amenities.map((a) => ({ title: a.title }))
      : [];
    const tariffs: RoomTariff[] = (item.tariffs ?? []).map((t) => ({
      rate_plan_code: t.rate_plan_code,
      title: t.title,
      price: Number(t.price) || 0,
      price_for_register: t.price_for_register,
      packages: (t.packages ?? []).map((code) => ({ title: code })),
      has_food: t.has_food,
      cancellation_free: t.cancellation_free,
      payment_types: t.payment_types,
      description: t.cancellation_description ?? null,
    }));
    return {
      id: item.room_type_code,
      room_type_code: item.room_type_code,
      title: item.title,
      description: item.description ?? null,
      max_occupancy: item.max_occupancy ?? 0,
      square: item.square ?? 0,
      rooms: item.rooms ?? 0,
      amenities,
      bed: item.bed ?? null,
      view: item.view ?? null,
      balcony: item.balcony ?? null,
      family: item.family ?? null,
      min_price: Number(item.min_price) || null,
      price_for_register: item.price_for_register,
      photos: Array.isArray(item.photos) ? item.photos : [],
      tariffs,
    };
  };

  /** Подготовка данных гостей для запроса upgrade */
  const prepareGuestsForUpgrade = (): SearchUpgradeRequest["guests"] => {
    const { guests: guestsStore } = bookingStore;
    const roomList = guestsStore.roomList ?? [];
    if (roomList.length === 0) {
      return { adults: 1, childs: null };
    }
    const firstRoom = roomList[0];
    if (!firstRoom) {
      return { adults: 1, childs: null };
    }
    const childs =
      firstRoom.children > 0
        ? Array.from(
            { length: firstRoom.children },
            (_, index) => firstRoom.childrenAges?.[index] ?? 0,
          )
        : null;
    return {
      adults: Math.max(1, firstRoom.adults),
      childs,
    };
  };

  /** Загрузка номера повышенного комфорта (POST /v1/search/upgrade) */
  const fetchUpgradeRoom = async () => {
    if (
      !selectedRoom.value ||
      !selectedTariff.value ||
      !date.value ||
      isMultiRoomsMode.value
    ) {
      return;
    }

    const [startDate, endDate] = date.value;
    const roomTypeCode = selectedRoom.value.room_type_code;
    const ratePlanCode = selectedTariff.value.rate_plan_code;
    const guests = prepareGuestsForUpgrade();

    if (!roomTypeCode || !ratePlanCode) {
      return;
    }

    upgradeRoomLoading.value = true;
    try {
      const { post } = useApi();
      const { formatDate } = bookingStore;

      const upgradeData: SearchUpgradeRequest = {
        room_type_code: roomTypeCode,
        rate_plan_code: ratePlanCode,
        promocode: promoCode.value?.trim() || null,
        start_at: formatDate(startDate),
        end_at: formatDate(endDate),
        guests,
      };

      const response = await post<SearchUpgradePayload>(
        "/v1/search/upgrade",
        upgradeData,
        {
          signal: AbortSignal.timeout(10000),
        },
      );

      if (response.success && response.payload?.rooms?.length) {
        const mapped = response.payload.rooms.map(mapUpgradeRoomToRoom);
        upgradeRooms.value = mapped;
        const first = mapped[0]!;
        selectedUpgradeBedId.value = first.bed?.id ?? null;
      } else {
        upgradeRooms.value = [];
        selectedUpgradeBedId.value = null;
      }
    } catch (err: unknown) {
      upgradeRooms.value = [];
      selectedUpgradeBedId.value = null;
      if (import.meta.dev) {
        console.error("Ошибка загрузки номера повышенного комфорта:", err);
      }
    } finally {
      upgradeRoomLoading.value = false;
    }
  };

  return {
    // State
    upgradeRoom,
    upgradeRooms,
    selectedUpgradeBedId,
    upgradeRoomLoading,
    isUpgradePopupOpen,
    isCompareModalOpen,
    expandedUpgradeRoom,
    // Computed
    upgradeAdditionalPerNight,
    nights,
    // Actions
    setSelectedUpgradeBedId,
    openUpgradePopup,
    closeUpgradePopup,
    openCompareModal,
    closeCompareModal,
    toggleUpgradeExpand,
    onCompareRooms,
    fetchUpgradeRoom,
  };
};
