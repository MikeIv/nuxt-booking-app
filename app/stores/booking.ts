import { defineStore } from "pinia";
import type { StateTree } from "pinia";
import type { PersistenceOptions } from "pinia-plugin-persistedstate";
import type { Room } from "~/types/room";
import type { SearchResponse, BookingData } from "~/types/booking";

interface GuestInfo {
  rooms: number;
  adults: number;
  children: number;
}

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref<{
      rooms: number;
      roomList: { adults: number; children: number; childrenAges: number[] }[];
    }>({
      rooms: 1,
      roomList: [{ adults: 1, children: 0, childrenAges: [] }],
    });

    const promoCode = ref("");
    const loading = ref(false);
    const isServerRequest = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<SearchResponse | null>(null);
    const childrenAges = ref<number[]>([]);
    const selectedRoomType = ref<string | null>(null);
    const roomTariffs = ref<Room[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");
    const roomList = ref<GuestInfo[]>([]);

    const totalGuests = computed(() => {
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);
      return totalAdults + totalChildren;
    });

    const setLoading = (visible: boolean, message?: string) => {
      loading.value = visible;
      if (message) {
        loadingMessage.value = message;
      }
    };

    function updateRoomList(list: GuestInfo[]) {
      roomList.value = list;
    }

    function updateChildrenAges(ages: number[]) {
      childrenAges.value = ages;
    }

    const formatDate = (value: Date | string): string => {
      if (typeof value === "string") return value;
      if (!(value instanceof Date) || isNaN(value.getTime())) {
        throw new Error(`Неверный формат даты: ${String(value)}`);
      }
      return value.toISOString().substring(0, 10);
    };

    function validateSearchParams() {
      if (!date.value) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите даты");
      }
      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      if (totalAdults === 0) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите количество гостей");
      }
      const [startDate] = date.value;
      if (startDate < new Date()) {
        searchResults.value = null;
        setLoading(false);
        isServerRequest.value = false;
        throw new Error(
          "Выбранные даты устарели. Пожалуйста, выберите новые даты.",
        );
      }
    }

    function prepareSearchData(roomTypeCode?: string) {
      const [startDate, endDate] = date.value!;

      const rooms = guests.value.roomList ?? [];
      const totalAdults = rooms.reduce((sum, room) => sum + room.adults, 0);
      const totalChildren = rooms.reduce((sum, room) => sum + room.children, 0);

      const childs = [totalChildren || 0];

      const searchData: Record<string, unknown> = {
        start_at: formatDate(startDate),
        end_at: formatDate(endDate),
        adults: totalAdults,
        promocode: promoCode.value || null,
        childs,
      };
      if (roomTypeCode) {
        searchData.with_packages = true;
        searchData.room_type_code = roomTypeCode;
      }
      return searchData;
    }

    function setSelectedRoomType(roomTypeCode: string) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    async function search(skipReset = false): Promise<SearchResponse> {
      validateSearchParams();
      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;

      try {
        const { post } = useApi();
        const searchData = prepareSearchData();

        isServerRequest.value = true;
        const response = await post<SearchResponse>("/search", searchData, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success && response.payload) {
          searchResults.value = response.payload;
          if (response.payload.rooms && Array.isArray(response.payload.rooms)) {
            roomTariffs.value = response.payload.rooms as Room[];
          } else {
            roomTariffs.value = [];
          }
          return response.payload;
        } else {
          throw new Error(response.message || "Ошибка при поиске номеров");
        }
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        if (!skipReset) {
          isServerRequest.value = false;
          setLoading(false);
        }
      }
    }

    async function createBooking(bookingData: BookingData) {
      const { post } = useApi();

      setLoading(true, "Создаём бронирование...");

      try {
        const processedData = { ...bookingData };

        if (processedData.order?.start_at) {
          processedData.order.start_at = formatDate(
            processedData.order.start_at,
          );
        }
        if (processedData.order?.end_at) {
          processedData.order.end_at = formatDate(processedData.order.end_at);
        }

        isServerRequest.value = true;
        const response = await post<{ booking: unknown }>(
          "/v1/booking",
          processedData,
          { signal: AbortSignal.timeout(10000) },
        );

        if (response.success && response.payload) {
          return response.payload.booking;
        } else {
          throw new Error(response.message || "Ошибка при создании брони");
        }
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при бронировании";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
    }

    async function getBookingDetails(bookingId: string) {
      const { get } = useApi();

      setLoading(true, "Загружаем детали брони...");

      try {
        isServerRequest.value = true;
        const response = await get<{ booking: unknown }>(`/${bookingId}`, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success && response.payload) {
          return response.payload.booking;
        } else {
          throw new Error(
            response.message || "Ошибка при получении данных брони",
          );
        }
      } catch (err: unknown) {
        error.value =
          (err as Error).message || "Произошла ошибка при загрузке данных";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
    }

    async function searchWithRoomType(
      roomTypeCode: string,
    ): Promise<SearchResponse> {
      validateSearchParams();
      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;
      selectedRoomType.value = roomTypeCode;

      try {
        const { post } = useApi();
        const searchData = prepareSearchData(roomTypeCode);

        isServerRequest.value = true;
        const response = await post<SearchResponse>("/search", searchData, {
          signal: AbortSignal.timeout(10000),
        });

        if (response.success && response.payload) {
          searchResults.value = response.payload;
          if (response.payload.rooms && Array.isArray(response.payload.rooms)) {
            roomTariffs.value = response.payload.rooms as Room[];
          } else {
            roomTariffs.value = [];
          }
          return response.payload;
        } else {
          throw new Error(response.message || "Ошибка при поиске номеров");
        }
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        isServerRequest.value = false;
        setLoading(false);
      }
    }

    function forceReset() {
      date.value = null;
      guests.value = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };
      promoCode.value = "";
      error.value = null;
      searchResults.value = null;
      childrenAges.value = [];
      selectedRoomType.value = null;
      roomTariffs.value = [];
      setLoading(false);
      isServerRequest.value = false;

      if (typeof window !== "undefined") {
        localStorage.removeItem("booking-store");
        sessionStorage.removeItem("booking-store");

        const keys = Object.keys(localStorage).filter((key) =>
          key.startsWith("booking-store"),
        );
        keys.forEach((key) => localStorage.removeItem(key));
      }
    }

    return {
      date,
      guests,
      promoCode,
      loading,
      isServerRequest,
      error,
      searchResults,
      totalGuests,
      childrenAges,
      selectedRoomType,
      roomTariffs,
      loadingMessage,
      forceReset,
      updateChildrenAges,
      setSelectedRoomType,
      setLoading,
      search,
      createBooking,
      getBookingDetails,
      searchWithRoomType,
      formatDate,
      roomList,
      updateRoomList,
    };
  },
  {
    // типизацию persist приводим к совместимой форме
    persist: {
      key: "booking-store",
      paths: [
        "date",
        "guests",
        "promoCode",
        "childrenAges",
        "searchResults",
        "selectedRoomType",
        "roomTariffs",
        "roomList",
      ],
      serializer: {
        serialize: (state: StateTree) => {
          const serialized = { ...state } as Record<string, unknown> & {
            date?: unknown;
          };
          if (serialized.date && Array.isArray(serialized.date)) {
            serialized.date = (serialized.date as unknown[]).map((d) =>
              d instanceof Date ? d.toISOString() : d,
            );
          }
          return JSON.stringify(serialized);
        },
        deserialize: (str: string) => {
          const state = JSON.parse(str);
          if (state.date && Array.isArray(state.date)) {
            state.date = state.date.map((d: string | Date) =>
              typeof d === "string" ? new Date(d) : d,
            );
          }
          return state;
        },
      },
    } as PersistenceOptions,
  },
);
