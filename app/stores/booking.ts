import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { PackageResource, RoomTariff } from "~/types/room";

interface GuestInfo {
  rooms: number;
  adults: number;
  children: number;
}

interface Bed {
  id: number;
  title: string;
}

interface SearchResponse {
  available: boolean;
  rooms?: RoomTariff[];
  totalPrice?: number;
  message?: string;
  packages?: PackageResource[];
  filters?: { beds?: Bed[] };
}

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref<GuestInfo>({
      rooms: 1,
      adults: 1,
      children: 0,
    });
    const promoCode = ref("");
    const loading = ref(false);
    const isServerRequest = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<SearchResponse | null>(null);
    const childrenAges = ref<number[]>([]);
    const selectedRoomType = ref<string | null>(null);
    const roomTariffs = ref<RoomTariff[]>([]);
    const loadingMessage = ref("Загружаем данные о номерах...");

    const totalGuests = computed(() => {
      return guests.value.adults + guests.value.children;
    });

    const setLoading = (visible: boolean, message?: string) => {
      loading.value = visible;
      if (message) {
        loadingMessage.value = message;
      }
    };

    function updateChildrenAges(ages: number[]) {
      childrenAges.value = ages;
    }

    const formatDate = (date: Date | string): string => {
      if (typeof date === "string") return date;
      if (!(date instanceof Date) || isNaN(date.getTime())) {
        throw new Error(`Неверный формат даты: ${date}`);
      }
      return date.toISOString().split("T")[0];
    };

    function setSelectedRoomType(roomTypeCode: string) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    async function search(skipReset = false): Promise<SearchResponse> {
      if (!date.value) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите даты");
      }
      if (guests.value.adults === 0) {
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

      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;

      try {
        const { post } = useApi();
        const [startDate, endDate] = date.value;

        const childs = childrenAges.value.slice(0, guests.value.children);
        while (childs.length < guests.value.children) {
          childs.push(0);
        }

        const searchData = {
          start_at: formatDate(startDate),
          end_at: formatDate(endDate),
          adults: guests.value.adults,
          promocode: promoCode.value || null,
          childs,
        };

        console.log("Search data:", searchData);

        isServerRequest.value = true;
        const response = await post<SearchResponse>("/search", searchData);

        if (response.success && response.payload) {
          searchResults.value = response.payload;
          if (response.payload.rooms && Array.isArray(response.payload.rooms)) {
            roomTariffs.value = response.payload.rooms;
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

    async function createBooking(bookingData: unknown) {
      const { post } = useApi();

      setLoading(true, "Создаём бронирование...");

      try {
        if (bookingData && typeof bookingData === "object") {
          const processedData = { ...(bookingData as Record<string, unknown>) };

          if (processedData.order?.start_at) {
            processedData.order.start_at = formatDate(
              processedData.order.start_at as string | Date,
            );
          }

          if (processedData.order?.end_at) {
            processedData.order.end_at = formatDate(
              processedData.order.end_at as string | Date,
            );
          }

          bookingData = processedData;
        }

        isServerRequest.value = true;
        const response = await post<{ booking: unknown }>(
          "/v1/booking",
          bookingData,
        );

        if (response.success) {
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
        const response = await get<{ booking: unknown }>(`/${bookingId}`);

        if (response.success) {
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
      if (!date.value) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите даты");
      }
      if (guests.value.adults === 0) {
        setLoading(false);
        isServerRequest.value = false;
        throw new Error("Укажите количество гостей");
      }

      setLoading(true, "Загружаем данные о номерах...");
      error.value = null;
      selectedRoomType.value = roomTypeCode;

      try {
        const { post } = useApi();

        const [startDate, endDate] = date.value;

        const childs = childrenAges.value.slice(0, guests.value.children);
        while (childs.length < guests.value.children) {
          childs.push(0);
        }

        const searchData = {
          start_at: formatDate(startDate),
          end_at: formatDate(endDate),
          adults: guests.value.adults,
          promocode: promoCode.value || null,
          childs,
          with_packages: true,
          room_type_code: roomTypeCode,
        };

        console.log("Search with room type data:", searchData);

        isServerRequest.value = true;
        const response = await post<SearchResponse>("/search", searchData);

        if (response.success && response.payload) {
          searchResults.value = response.payload;
          if (response.payload.rooms && Array.isArray(response.payload.rooms)) {
            roomTariffs.value = response.payload.rooms;
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
      guests.value = { rooms: 1, adults: 1, children: 0 };
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
    };
  },
  {
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
      ],
      serializer: {
        serialize: (state) => {
          const serialized = { ...state };
          if (serialized.date && Array.isArray(serialized.date)) {
            serialized.date = serialized.date.map((d) =>
              d instanceof Date ? d.toISOString() : d,
            );
          }
          return JSON.stringify(serialized);
        },
        deserialize: (str) => {
          const state = JSON.parse(str);
          if (state.date && Array.isArray(state.date)) {
            state.date = state.date.map((d: string | Date) =>
              typeof d === "string" ? new Date(d) : d,
            );
          }
          return state;
        },
      },
    },
  },
);
