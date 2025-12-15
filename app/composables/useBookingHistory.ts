import { ref, computed } from "vue";
import type {
  BookingHistoryItem,
  BookingHistoryResponse,
} from "~/types/booking";
import { useAuthStore } from "~/stores/auth";
import { useNotificationToast } from "~/composables/useToast";
import { useApi } from "~/composables/useApi";

export const useBookingHistory = () => {
  const authStore = useAuthStore();
  const toast = useNotificationToast();

  const bookingHistory = ref<BookingHistoryItem[]>([]);
  const allLoadedBookings = ref<BookingHistoryItem[]>([]);
  const isLoadingBookings = ref(false);
  const bookingsLoaded = ref(false);
  const currentPage = ref(1);
  const perPage = ref(5);
  const hasMoreBookings = ref(true);
  const allBookingsLoaded = ref(false);
  const isCollapsed = ref(false);

  const handleError = (err: unknown, defaultMessage: string) => {
    if (import.meta.dev) {
      console.error("💥 Ошибка:", err);
    }
    const message = (err as { message?: string })?.message || defaultMessage;
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: message,
      life: 5000,
    });
  };

  const fetchBookingHistory = async (resetPage = false) => {
    if (!authStore.user) {
      if (import.meta.dev) {
        console.warn("⚠️ Пользователь не авторизован");
      }
      return;
    }

    if (resetPage) {
      currentPage.value = 1;
      bookingHistory.value = [];
      allLoadedBookings.value = [];
      hasMoreBookings.value = true;
      allBookingsLoaded.value = false;
      isCollapsed.value = false;
    }

    isLoadingBookings.value = true;

    try {
      if (import.meta.dev) {
        console.log("📡 Загрузка истории бронирований...", {
          page: currentPage.value,
          per_page: perPage.value,
        });
      }

      const { get } = useApi();
      const response = (await get<BookingHistoryItem[]>(
        "/v1/users/bookings/history",
        {
          page: currentPage.value,
          per_page: perPage.value,
        },
      )) as BookingHistoryResponse;

      if (import.meta.dev) {
        console.log("📨 Ответ сервера (история бронирований):", response);
      }

      if (response.success) {
        const newBookings = response.payload || [];

        if (resetPage) {
          bookingHistory.value = newBookings;
          allLoadedBookings.value = newBookings;
        } else {
          bookingHistory.value = [...bookingHistory.value, ...newBookings];
          allLoadedBookings.value = [
            ...allLoadedBookings.value,
            ...newBookings,
          ];
        }

        bookingsLoaded.value = true;
        hasMoreBookings.value = newBookings.length === perPage.value;

        // Если получили меньше элементов, чем запрашивали, значит это все бронирования
        if (newBookings.length < perPage.value) {
          allBookingsLoaded.value = true;
        }

        if (import.meta.dev) {
          console.log(`✅ Загружено бронирований: ${newBookings.length}`);
        }
      } else {
        if (import.meta.dev) {
          console.warn(
            "⚠️ Не удалось загрузить историю бронирований:",
            response.message,
          );
        }
        toast.add({
          severity: "warn",
          summary: "Внимание",
          detail:
            response.message || "Не удалось загрузить историю бронирований",
          life: 5000,
        });
      }
    } catch (err: unknown) {
      handleError(err, "Не удалось загрузить историю бронирований");
    } finally {
      isLoadingBookings.value = false;
    }
  };

  const loadMoreBookings = async () => {
    // Если список свернут, раскрываем его, показывая все загруженные бронирования
    if (isCollapsed.value) {
      bookingHistory.value = [...allLoadedBookings.value];
      isCollapsed.value = false;
      return;
    }

    // Загружаем новые бронирования с сервера
    if (!isLoadingBookings.value && hasMoreBookings.value) {
      currentPage.value++;
      await fetchBookingHistory();

      // Проверяем, все ли бронирования загружены после подгрузки
      if (!hasMoreBookings.value) {
        allBookingsLoaded.value = true;
      }
    }
  };

  const collapseBookings = () => {
    // Показываем только первые 5 бронирований
    bookingHistory.value = allLoadedBookings.value.slice(0, perPage.value);
    isCollapsed.value = true;
  };

  // Computed свойства для кнопки "Загрузить ещё" / "Свернуть"
  const showLoadMoreButton = computed(() => {
    return (
      hasMoreBookings.value ||
      isCollapsed.value ||
      (allBookingsLoaded.value &&
        allLoadedBookings.value.length > perPage.value &&
        !isCollapsed.value)
    );
  });

  const loadMoreButtonLabel = computed(() => {
    if (isLoadingBookings.value) return "Загрузка...";
    if (
      allBookingsLoaded.value &&
      !isCollapsed.value &&
      allLoadedBookings.value.length > perPage.value
    ) {
      return "Свернуть";
    }
    return "Загрузить ещё";
  });

  const handleLoadMoreClick = () => {
    if (
      allBookingsLoaded.value &&
      !isCollapsed.value &&
      allLoadedBookings.value.length > perPage.value
    ) {
      collapseBookings();
    } else {
      loadMoreBookings();
    }
  };

  return {
    bookingHistory,
    isLoadingBookings,
    bookingsLoaded,
    showLoadMoreButton,
    loadMoreButtonLabel,
    fetchBookingHistory,
    handleLoadMoreClick,
  };
};
