import { useBookingStore } from "~/stores/booking";
import type { ComputedRef } from "vue";

export const useBookingCancel = (
  currentBookingUuid: ComputedRef<string | null>,
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
        bookingStore.forceReset();

        if (typeof window !== "undefined") {
          sessionStorage.removeItem("hasUnauthenticatedBooking");
        }

        await router.push("/");
        return;
      }

      cancelBookingError.value =
        response.message ?? "Не удалось отменить бронирование.";
    } catch (error: unknown) {
      const msg = getErrorMessage(error);
      cancelBookingError.value = msg;
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
