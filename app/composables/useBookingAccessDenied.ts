import {
  BOOKING_ACCESS_DENIED_MESSAGE,
  isBookingAccessDeniedError,
} from "~/composables/useApiHelpers";

export const useBookingAccessDenied = () => {
  const router = useRouter();
  const toast = useNotificationToast();

  const handleBookingAccessDenied = async (): Promise<void> => {
    toast.add({
      severity: "error",
      summary: "Ошибка",
      detail: BOOKING_ACCESS_DENIED_MESSAGE,
      life: 5000,
    });
    await router.push("/");
  };

  const handleBookingAccessDeniedIfNeeded = async (
    error: unknown,
  ): Promise<boolean> => {
    if (!isBookingAccessDeniedError(error)) {
      return false;
    }

    await handleBookingAccessDenied();
    return true;
  };

  return {
    handleBookingAccessDenied,
    handleBookingAccessDeniedIfNeeded,
  };
};
