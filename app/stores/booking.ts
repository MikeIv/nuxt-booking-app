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

export const useBookingStore = defineStore(
  "booking",
  () => {
    const date = ref<[Date, Date] | null>(null);
    const guests = ref<GuestInfo>({
      rooms: 1,
      adults: 2,
      children: 0,
    });
    const promoCode = ref("");
    const loading = ref(false);
    const error = ref<string | null>(null);
    const searchResults = ref<unknown>(null);
    const childrenAges = ref<number[]>([]);

    const totalGuests = computed(() => {
      return guests.value.adults + guests.value.children;
    });

    // Функция для обновления возрастов детей
    function updateChildrenAges(ages: number[]) {
      childrenAges.value = ages;
    }

    // Улучшенная функция для форматирования даты
    const formatDate = (date: Date | string): string => {
      // Если это уже строка, возвращаем как есть
      if (typeof date === "string") return date;

      if (date instanceof Date) {
        return date.toISOString().split("T")[0];
      }

      // Если это что-то еще, пытаемся преобразовать
      const dateObj = new Date(date);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toISOString().split("T")[0];
      }

      throw new Error(`Неверный формат даты: ${date}`);
    };

    function reset() {
      date.value = null;
      guests.value = { rooms: 1, adults: 2, children: 0 };
      promoCode.value = "";
      error.value = null;
      searchResults.value = null;
      childrenAges.value = [];
    }

    async function search(): Promise<SearchResponse> {
      if (!date.value) throw new Error("Укажите даты");
      if (guests.value.adults === 0)
        throw new Error("Укажите количество гостей");

      // Проверяем, не устарели ли даты
      const [startDate] = date.value;
      if (startDate < new Date()) {
        // Сбрасываем результаты, если даты устарели
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
        error.value = err.message || "Произошла ошибка при поиске";
        throw err;
      } finally {
        loading.value = false;
      }
    }

    // Дополнительные методы для работы с бронированием
    async function createBooking(bookingData: unknown) {
      const { post } = useApi();

      try {
        // Преобразуем даты в bookingData если они есть
        if (bookingData && typeof bookingData === "object") {
          const processedData = { ...(bookingData as unknown) };

          // Обрабатываем start_at
          if (processedData.start_at) {
            processedData.start_at = formatDate(processedData.start_at);
          }

          // Обрабатываем end_at
          if (processedData.end_at) {
            processedData.end_at = formatDate(processedData.end_at);
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
        error.value = err.message || "Произошла ошибка при бронировании";
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
        error.value = err.message || "Произошла ошибка при загрузке данных";
        throw err;
      }
    }

    async function cancelBooking(bookingId: string) {
      const { del } = useApi();

      try {
        const response = await del<{ message: string }>(`/${bookingId}/cancel`);

        if (response.success) {
          return response.payload.message;
        } else {
          throw new Error(response.message || "Ошибка при отмене брони");
        }
      } catch (err: unknown) {
        error.value = err.message || "Произошла ошибка при отмене брони";
        throw err;
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
      updateChildrenAges,
      search,
      createBooking,
      getBookingDetails,
      cancelBooking,
      reset,
    };
  },
  {
    persist: {
      key: "booking-store",
      paths: ["date", "guests", "promoCode", "childrenAges", "searchResults"],
      // Добавляем сериализацию/десериализацию для дат
      serializer: {
        serialize: (state) => {
          const serialized = { ...state };
          // Преобразуем Date в строки для сериализации
          if (serialized.date && Array.isArray(serialized.date)) {
            serialized.date = serialized.date.map((d) =>
              d instanceof Date ? d.toISOString() : d,
            );
          }
          return JSON.stringify(serialized);
        },
        deserialize: (str) => {
          const state = JSON.parse(str);
          // Восстанавливаем Date из строк
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
