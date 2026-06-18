import { useBookingStore } from "~/stores/booking";
import { useAuthStore } from "~/stores/auth";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import { pickNumber, pickString } from "~/utils/pick";
import type { ContactFormData } from "~/types/booking";
import {
  mapBookingChangeGuest,
  pickBookingStayDates,
  pickChildrenAges,
  pickRoomPackageCodes,
  pickRoomRatePlanCode,
} from "~/utils/bookingChangeRequest";

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
      const stayDates = pickBookingStayDates(order);
      if (!stayDates) {
        throw new Error("Не удалось определить даты текущего бронирования.");
      }
      const { startAt, endAt } = stayDates;

      const roomsRaw = Array.isArray(createdBooking.value?.rooms)
        ? createdBooking.value.rooms
        : [];
      if (roomsRaw.length === 0) {
        throw new Error(
          "Не удалось определить состав бронирования. Обновите страницу.",
        );
      }
      const orderNationality =
        pickString(order?.nationality) ?? f.country.trim();

      const rooms = roomsRaw.map((roomRaw, roomIndex) => {
        const room = roomRaw as Record<string, unknown>;
        const childrenAges = pickChildrenAges(room);
        const guestsRaw = Array.isArray(room.guests) ? room.guests : [];
        const guests =
          guestsRaw.length > 0
            ? guestsRaw.map((guestRaw, guestIndex) => {
                const guest = mapBookingChangeGuest(guestRaw, orderNationality);
                if (roomIndex !== 0 || guestIndex !== 0) return guest;

                return {
                  ...guest,
                  ...contacts,
                  middle_name: contacts.middle_name || null,
                  nationality: orderNationality,
                };
              })
            : [
                {
                  ...mapBookingChangeGuest({}, orderNationality),
                  ...contacts,
                  middle_name: contacts.middle_name || null,
                  nationality: orderNationality,
                },
              ];

        return {
          booking_id: pickNumber(room.id),
          room_type_code: pickString(room.room_type_code) ?? "",
          rate_plan_code: pickRoomRatePlanCode(room),
          adults: pickNumber(room.adults) ?? 1,
          children: pickNumber(room.children) ?? 0,
          children_ages: childrenAges,
          packages: pickRoomPackageCodes(room),
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
