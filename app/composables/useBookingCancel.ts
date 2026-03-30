import { useBookingStore } from "~/stores/booking";
import type { ComputedRef } from "vue";

export const useBookingCancel = (
  currentBookingUuid: ComputedRef<string | null>,
  bookingNumber: ComputedRef<string | null>,
  confirmationEmail: ComputedRef<string>,
) => {
  const bookingStore = useBookingStore();
  const toast = useNotificationToast();
  const { getErrorMessage } = useApiHelpers();
  const { post } = useApi();
  const router = useRouter();

  const isCancelBookingPopupOpen = ref(false);
  const isCancellingBooking = ref(false);
  const cancelBookingError = ref<string | null>(null);

  const openCancelBookingPopup = () => {
    cancelBookingError.value = null;
    isCancelBookingPopupOpen.value = true;
  };

  const closeCancelBookingPopup = () => {
    cancelBookingError.value = null;
    isCancelBookingPopupOpen.value = false;
  };

  const confirmCancelBooking = async () => {
    const uuid = currentBookingUuid.value;

    if (!uuid) {
      toast.add({
        severity: "error",
        summary: "Не удалось отменить бронирование",
        detail:
          "UUID бронирования не найден. Обновите страницу или проверьте ссылку.",
        life: 5000,
      });
      closeCancelBookingPopup();
      return;
    }

    if (isCancellingBooking.value) return;
    isCancellingBooking.value = true;
    bookingStore.setLoading(true, "Отменяем бронирование...");
    bookingStore.setServerRequest(true);

    try {
      const response = await post<unknown>(
        `/v1/booking/${uuid}/cancel`,
        { uuid },
        {
          signal: AbortSignal.timeout(15000),
        },
      );

      if (response.success) {
        cancelBookingError.value = null;
        closeCancelBookingPopup();

        const number = bookingNumber.value;
        const email = confirmationEmail.value;

        bookingStore.forceReset();

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }

        const query: Record<string, string> = {};
        if (number) query.bookingNumber = number;
        if (email) query.email = email;

        await router.push({ path: "/cancellation", query });
        return;
      }

      cancelBookingError.value =
        response.message ?? "Не удалось отменить бронирование.";
      bookingStore.setLoading(false);
      bookingStore.setServerRequest(false);
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      cancelBookingError.value = msg;
      bookingStore.setLoading(false);
      bookingStore.setServerRequest(false);
      toast.add({
        severity: "error",
        summary: "Не удалось отменить бронирование",
        detail: msg,
        life: 5000,
      });
    } finally {
      isCancellingBooking.value = false;
    }
  };

  return {
    isCancelBookingPopupOpen,
    isCancellingBooking,
    cancelBookingError,
    openCancelBookingPopup,
    closeCancelBookingPopup,
    confirmCancelBooking,
  };
};
