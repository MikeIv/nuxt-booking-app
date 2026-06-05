import { useBookingStore } from "~/stores/booking";
import type { ComputedRef } from "vue";

const POLL_INTERVAL_MS = 5000;
const PROCESSING_MESSAGE = "Ожидаем подтверждение бронирования...";

export type BookingConfirmationPageStatus =
  | "idle"
  | "processing"
  | "confirmed"
  | "failed";

const resolvePageStatus = (
  status: string | undefined,
): BookingConfirmationPageStatus => {
  if (status === "processing") return "processing";
  if (status === "confirmed") return "confirmed";
  if (status === "failed") return "failed";
  return "idle";
};

export const useBookingStatusPolling = (
  bookingUuid: ComputedRef<string | null>,
  options?: {
    onLoadError?: () => void;
    onConfirmed?: () => void;
  },
) => {
  const bookingStore = useBookingStore();

  const pageStatus = ref<BookingConfirmationPageStatus>(
    bookingUuid.value ? "processing" : "idle",
  );
  let pollTimer: ReturnType<typeof setInterval> | null = null;
  let isFetching = false;

  const isAwaitingConfirmation = computed(
    () => pageStatus.value === "processing",
  );
  const isBookingConfirmed = computed(() => pageStatus.value === "confirmed");
  const isBookingFailed = computed(() => pageStatus.value === "failed");
  const showConfirmationContent = computed(
    () => !isAwaitingConfirmation.value && !isBookingFailed.value,
  );

  const clearPollTimer = () => {
    if (!pollTimer) return;
    clearInterval(pollTimer);
    pollTimer = null;
  };

  const showProcessingOverlay = () => {
    bookingStore.setLoading(true, PROCESSING_MESSAGE);
    bookingStore.setServerRequest(true);
  };

  const hideProcessingOverlay = () => {
    bookingStore.setLoading(false);
    bookingStore.setServerRequest(false);
  };

  const applyPageStatus = (status: string | undefined) => {
    pageStatus.value = resolvePageStatus(status);

    if (pageStatus.value === "processing") {
      showProcessingOverlay();
      return;
    }

    hideProcessingOverlay();
    clearPollTimer();

    if (pageStatus.value === "confirmed") {
      options?.onConfirmed?.();
    }
  };

  const startPolling = () => {
    if (pollTimer) return;

    pollTimer = setInterval(() => {
      void pollBooking();
    }, POLL_INTERVAL_MS);
  };

  const pollBooking = async () => {
    const uuid = bookingUuid.value;
    if (!uuid || isFetching) return;

    isFetching = true;

    try {
      const booking = await bookingStore.getBookingByUuid(uuid, {
        silent: true,
      });
      applyPageStatus(booking.status);

      if (booking.status === "processing") {
        startPolling();
      }
    } catch {
      options?.onLoadError?.();
      if (bookingUuid.value) {
        pageStatus.value = "processing";
        showProcessingOverlay();
        startPolling();
      }
    } finally {
      isFetching = false;
    }
  };

  const initialize = async () => {
    const uuid = bookingUuid.value;

    if (!uuid) {
      const existingStatus = bookingStore.createdBooking?.status;
      pageStatus.value = resolvePageStatus(existingStatus);
      if (pageStatus.value === "confirmed") {
        options?.onConfirmed?.();
      }
      return;
    }

    const cachedBooking = bookingStore.getSessionBookingByUuid(uuid);
    if (cachedBooking) {
      bookingStore.setBookingByUuid(cachedBooking);

      if (cachedBooking.status !== "processing") {
        applyPageStatus(cachedBooking.status);
        return;
      }
    }

    showProcessingOverlay();
    await pollBooking();
  };

  onMounted(() => {
    void initialize();
  });

  onUnmounted(() => {
    clearPollTimer();
    if (isAwaitingConfirmation.value) {
      hideProcessingOverlay();
    }
  });

  return {
    pageStatus,
    isAwaitingConfirmation,
    isBookingConfirmed,
    isBookingFailed,
    showConfirmationContent,
  };
};
