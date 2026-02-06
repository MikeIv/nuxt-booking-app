import { useBookingStore } from "~/stores/booking";
import type { Room, RoomTariff } from "~/types/room";
import type {
  SearchUpgradeRequest,
  SearchUpgradePayload,
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
  const upgradeRoom = shallowRef<Room | null>(null);
  const upgradeRoomLoading = ref(false);
  const isUpgradePopupOpen = ref(false);
  const expandedUpgradeRoom = ref(false);

  // --- Computed ---
  /** Добавочная цена за повышение комфорта (за ночь) */
  const upgradeAdditionalPerNight = computed(() => {
    if (!upgradeRoom.value || !selectedTariff.value) return 0;
    const upgradePrice =
      upgradeRoom.value.min_price ?? upgradeRoom.value.tariffs?.[0]?.price ?? 0;
    const basePrice = selectedTariff.value.price ?? 0;
    return Math.max(0, upgradePrice - basePrice);
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

  const onCompareRooms = () => {
    isUpgradePopupOpen.value = true;
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

      const response = await post<SearchUpgradePayload[]>(
        "/v1/search/upgrade",
        upgradeData,
        {
          signal: AbortSignal.timeout(10000),
        },
      );

      if (response.success && response.payload?.length) {
        const p = response.payload[0]!;
        upgradeRoom.value = {
          id: p.room_type_code,
          room_type_code: p.room_type_code,
          title: p.title,
          description: p.description ?? null,
          max_occupancy: 0,
          square: 0,
          rooms: 0,
          amenities: [],
          bed: null,
          view: null,
          family: null,
          min_price: Number(p.min_price) || null,
          photos: Array.isArray(p.photos) ? p.photos : [],
          tariffs: [
            {
              rate_plan_code: p.rate_plan_code,
              title: p.title,
              price: Number(p.min_price) || 0,
              packages: [],
            },
          ],
        };
      } else {
        upgradeRoom.value = null;
      }
    } catch (err: unknown) {
      upgradeRoom.value = null;
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
    upgradeRoomLoading,
    isUpgradePopupOpen,
    expandedUpgradeRoom,
    // Computed
    upgradeAdditionalPerNight,
    nights,
    // Actions
    openUpgradePopup,
    closeUpgradePopup,
    toggleUpgradeExpand,
    onCompareRooms,
    fetchUpgradeRoom,
  };
};
