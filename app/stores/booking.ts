import { defineStore } from "pinia";

interface GuestInfo {
  rooms: number;
  adults: number;
  children: number;
}

interface SearchResponse {
  available: boolean;
  rooms?: unknown[];
  totalPrice?: number;
  message?: string;
}

interface RoomTariff {
  room_type_code: string;
  price: number;
  available: boolean;
  tariff_details?: unknown;
  // другие поля ответа
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
    const error = ref<string | null>(null);
    const searchResults = ref<unknown>(null);
    const childrenAges = ref<number[]>([]);
    const selectedRoomType = ref<string | null>(null);
    const roomTariffs = ref<RoomTariff[]>([]);

    const totalGuests = computed(() => {
      return guests.value.adults + guests.value.children;
    });

    // Функция для обновления возрастов детей
    function updateChildrenAges(ages: number[]) {
      childrenAges.value = ages;
    }

    // Улучшенная функция для форматирования даты
    const formatDate = (date: Date | string): string => {
      if (typeof date === "string") return date;

      return date.toISOString().split("T")[0];

      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
      }

      throw new Error(`Неверный формат даты: ${date}`);
    };

    // Новый метод для установки типа комнаты без поиска
    function setSelectedRoomType(roomTypeCode: string) {
      selectedRoomType.value = roomTypeCode;
      roomTariffs.value = [];
    }

    async function search(): Promise<SearchResponse> {
      if (!date.value) throw new Error("Укажите даты");
      if (guests.value.adults === 0)
        throw new Error("Укажите количество гостей");

      // Проверяем, не устарели ли даты
      const [startDate] = date.value;
      if (startDate < new Date()) {
        searchResults.value = null;
        throw new Error(
          "Выбранные даты устарели. Пожалуйста, выберите новые даты.",
        );
      }

      loading.value = true;
      error.value = null;

      try {
        const { post } = useApi();

        const [startDate, endDate] = date.value;

        // Подготавливаем массив возрастов детей
        const childs = childrenAges.value.slice(0, guests.value.children);
        while (childs.length < guests.value.children) {
          childs.push(0);
        }

        const searchData = {
          start_at: formatDate(startDate),
          end_at: formatDate(endDate),
          adults: guests.value.adults,
          promocode: promoCode.value,
          childs: childs,
        };

        console.log("Search data:", searchData);

        const response = await post<SearchResponse>("/search", searchData);

        if (response.success) {
          searchResults.value = response.payload;
          return response.payload;
        } else {
          throw new Error(response.message || "Ошибка при поиске номеров");
        }
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    async function createBooking(bookingData: unknown) {
      const { post } = useApi();

      try {
        if (bookingData && typeof bookingData === "object") {
          const processedData = { ...(bookingData as Record<string, unknown>) };

          if (processedData.start_at) {
            processedData.start_at = formatDate(
              processedData.start_at as string | Date,
            );
          }

          // Обрабатываем end_at
          if (processedData.end_at) {
            processedData.end_at = formatDate(
              processedData.end_at as string | Date,
            );
          }

          bookingData = processedData;
        }

        const response = await post<{ booking: unknown }>(
          "/create",
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
      }
    }

    async function getBookingDetails(bookingId: string) {
      const { get } = useApi();

      try {
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
      }
    }

    async function searchWithRoomType(
      roomTypeCode: string,
    ): Promise<SearchResponse> {
      if (!date.value) throw new Error("Укажите даты");
      if (guests.value.adults === 0)
        throw new Error("Укажите количество гостей");

      loading.value = true;
      error.value = null;
      selectedRoomType.value = roomTypeCode;

      try {
        const { post } = useApi();

        console.log("roomTypeCode", roomTypeCode);

        const [startDate, endDate] = date.value;

        const childs = childrenAges.value.slice(0, guests.value.children);
        while (childs.length < guests.value.children) {
          childs.push(0);
        }

        const searchData = {
          start_at: formatDate(startDate),
          end_at: formatDate(endDate),
          adults: guests.value.adults,
          promocode: promoCode.value,
          childs: childs,
          with_packages: true,
          room_type_code: roomTypeCode,
        };

        console.log("Search with room type data:", searchData);

        const response = await post<SearchResponse>("/search", searchData);

        if (response.success) {
          searchResults.value = response.payload;

          if (response.payload.rooms && Array.isArray(response.payload.rooms)) {
            roomTariffs.value = response.payload.rooms as RoomTariff[];
          }

          return response.payload;
        } else {
          throw new Error(response.message || "Ошибка при поиске номеров");
        }
      } catch (err: unknown) {
        error.value = (err as Error).message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        loading.value = false;
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
      error,
      searchResults,
      totalGuests,
      childrenAges,
      selectedRoomType,
      roomTariffs,
      forceReset,
      updateChildrenAges,
      setSelectedRoomType,
      search,
      createBooking,
      getBookingDetails,
      searchWithRoomType,
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
