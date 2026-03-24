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

  const canSubmitContactChange = computed(() => {
    if (isChangingContacts.value) return false;
    const f = contactForm.value;
    if (
      !f.name.trim() ||
      !f.surname.trim() ||
      !f.phone.trim() ||
      !f.email.trim()
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
    contactForm.value = buildBookingContactFallback(
      createdBooking.value,
      authStore.user,
    );
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
      };

      const order = createdBooking.value?.order;
      const startAtRaw =
        typeof order?.start_at === "string" ? order.start_at : "";
      const endAtRaw = typeof order?.end_at === "string" ? order.end_at : "";
      const startAt = startAtRaw.slice(0, 10);
      const endAt = endAtRaw.slice(0, 10);
      if (!startAt || !endAt) {
        throw new Error("Не удалось определить даты текущего бронирования.");
      }
      const roomsRaw = Array.isArray(createdBooking.value?.rooms)
        ? createdBooking.value.rooms
        : [];
      if (roomsRaw.length === 0) {
        throw new Error(
          "Не удалось определить состав бронирования. Обновите страницу.",
        );
      }
      const rooms = roomsRaw.map((roomRaw, roomIndex) => {
        const room = roomRaw as Record<string, unknown>;
        const roomPackages = (Array.isArray(room.packages) ? room.packages : [])
          .map((pkg) => pickString(pkg))
          .filter((pkg): pkg is string => pkg !== null);
        const childrenAges = (
          Array.isArray(room.children_ages) ? room.children_ages : []
        )
          .map((age) => pickNumber(age))
          .filter((age): age is number => age !== null);
        const guestsRaw = Array.isArray(room.guests) ? room.guests : [];
        const guests =
          guestsRaw.length > 0
            ? guestsRaw.map((guestRaw, guestIndex) => {
                const guest = guestRaw as Record<string, unknown>;
                const shouldUpdateGuest = roomIndex === 0 && guestIndex === 0;
                return {
                  id: pickNumber(guest.id),
                  surname: shouldUpdateGuest
                    ? contacts.surname
                    : (pickString(guest.surname) ?? ""),
                  name: shouldUpdateGuest
                    ? contacts.name
                    : (pickString(guest.name) ?? ""),
                  middle_name: shouldUpdateGuest
                    ? contacts.middle_name || null
                    : pickString(guest.middle_name),
                  phone: shouldUpdateGuest
                    ? contacts.phone
                    : (pickString(guest.phone) ?? ""),
                  email: shouldUpdateGuest
                    ? contacts.email
                    : (pickString(guest.email) ?? ""),
                };
              })
            : [
                {
                  id: null,
                  surname: contacts.surname,
                  name: contacts.name,
                  middle_name: contacts.middle_name || null,
                  phone: contacts.phone,
                  email: contacts.email,
                },
              ];

        return {
          booking_id: pickNumber(room.id),
          room_type_code: pickString(room.room_type_code) ?? "",
          rate_plan_code:
            pickString(room.rate_plan_code) ??
            pickString(room.rate_type_code) ??
            "",
          adults: pickNumber(room.adults) ?? 1,
          children: pickNumber(room.children) ?? 0,
          children_ages: childrenAges,
          packages: roomPackages,
          guests,
        };
      });

      const response = (await put<unknown>(
        `/v1/booking/${uuid}`,
        {
          start_at: startAt,
          end_at: endAt,
          rooms,
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
    openChangeContactsPopup,
    closeChangeContactsPopup,
    confirmChangeContacts,
  };
};
