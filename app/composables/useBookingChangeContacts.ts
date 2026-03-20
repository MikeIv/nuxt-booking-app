import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import type { ContactFormData } from "~/types/booking";

type ChangeBookingResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

export const useBookingChangeContacts = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const authStore = useAuthStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking } = storeToRefs(bookingStore);

  const isChangeContactsPopupOpen = ref(false);
  const isChangingContacts = ref(false);
  const changeContactsError = ref<string | null>(null);
  const changeContactsSuccess = ref<string | null>(null);
  const contactForm = ref<ContactFormData>({
    name: "",
    surname: "",
    middle_name: "",
    phone: "",
    email: "",
    country: "",
  });

  function buildContactFormFromBooking(): ContactFormData {
    const order = createdBooking.value?.order;
    const firstRoom = Array.isArray(createdBooking.value?.rooms)
      ? (createdBooking.value.rooms[0] as Record<string, unknown> | undefined)
      : undefined;
    const guests = Array.isArray(firstRoom?.guests)
      ? (firstRoom.guests as Array<Record<string, unknown>>)
      : [];
    const mainGuest =
      guests.find((g) => g.is_main === true) ?? guests[0] ?? null;

    return {
      name:
        (typeof order?.name === "string" ? order.name : "") ||
        (typeof mainGuest?.name === "string" ? mainGuest.name : "") ||
        authStore.user?.name ||
        "",
      surname:
        (typeof order?.surname === "string" ? order.surname : "") ||
        (typeof mainGuest?.surname === "string" ? mainGuest.surname : "") ||
        authStore.user?.surname ||
        "",
      middle_name:
        (typeof mainGuest?.middle_name === "string"
          ? mainGuest.middle_name
          : "") ||
        authStore.user?.middle_name ||
        "",
      phone:
        (typeof mainGuest?.phone === "string" ? mainGuest.phone : "") ||
        authStore.user?.phone ||
        "",
      email:
        (typeof mainGuest?.email === "string" ? mainGuest.email : "") ||
        authStore.user?.email ||
        "",
      country:
        (typeof order?.nationality === "string" ? order.nationality : "") ||
        authStore.user?.country ||
        "",
    };
  }

  const canSubmitContactChange = computed(() => {
    if (isChangingContacts.value) return false;
    const f = contactForm.value;
    if (
      !f.name.trim() ||
      !f.surname.trim() ||
      !f.phone.trim() ||
      !f.email.trim() ||
      !f.country.trim()
    ) {
      return false;
    }
    return (
      /^\S+@\S+\.\S+$/.test(f.email.trim()) &&
      /^[+]?[0-9\s\-()]{10,}$/.test(f.phone.trim())
    );
  });

  const openChangeContactsPopup = () => {
    changeContactsError.value = null;
    changeContactsSuccess.value = null;
    contactForm.value = buildContactFormFromBooking();
    isChangeContactsPopupOpen.value = true;
  };

  const closeChangeContactsPopup = () => {
    changeContactsError.value = null;
    changeContactsSuccess.value = null;
    isChangeContactsPopupOpen.value = false;
  };

  const confirmChangeContacts = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeContactsError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    if (!canSubmitContactChange.value) {
      changeContactsError.value = "Проверьте корректность заполнения полей.";
      return;
    }

    isChangingContacts.value = true;
    changeContactsError.value = null;
    changeContactsSuccess.value = null;

    try {
      const f = contactForm.value;
      const contacts = {
        name: f.name.trim(),
        surname: f.surname.trim(),
        middle_name: f.middle_name.trim(),
        email: f.email.trim(),
        phone: f.phone.trim(),
        country: f.country.trim(),
      };

      const response = (await put<unknown>(
        "/v1/users/profile",
        {
          ...contacts,
          booking_change: { uuid, contacts },
        },
        {
          signal: AbortSignal.timeout(15000),
        },
      )) as ChangeBookingResponse;

      if (!response.success) {
        throw new Error(
          response.message || "Не удалось изменить контактные данные",
        );
      }

      await bookingStore.getBookingByUuid(uuid);
      changeContactsSuccess.value = "Контактные данные успешно обновлены.";
    } catch (error: unknown) {
      changeContactsError.value = getErrorMessage(error);
    } finally {
      isChangingContacts.value = false;
    }
  };

  return {
    isChangeContactsPopupOpen,
    isChangingContacts,
    changeContactsError,
    changeContactsSuccess,
    contactForm,
    canSubmitContactChange,
    buildContactFormFromBooking,
    openChangeContactsPopup,
    closeChangeContactsPopup,
    confirmChangeContacts,
  };
};
