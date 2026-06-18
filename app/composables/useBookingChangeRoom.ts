import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import { pickNumber, pickString } from "~/utils/pick";
import {
  mapBookingChangeGuests,
  pickBookingStayDates,
  pickChildrenAges,
  pickRoomPackageCodes,
} from "~/utils/bookingChangeRequest";

type ChangeBookingRoomResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

export const useBookingChangeRoom = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking, selectedRoomType, selectedTariff } =
    storeToRefs(bookingStore);

  const { setChangeRoomUuid } = bookingStore;

  const isChangeRoomPopupOpen = ref(false);
  const isChangingRoom = ref(false);
  const changeRoomError = ref<string | null>(null);
  const changeRoomSuccess = ref<string | null>(null);

  const openChangeRoomPopup = () => {
    changeRoomError.value = null;
    changeRoomSuccess.value = null;
    isChangeRoomPopupOpen.value = true;
  };

  const closeChangeRoomPopup = () => {
    changeRoomError.value = null;
    changeRoomSuccess.value = null;
    isChangeRoomPopupOpen.value = false;
    setChangeRoomUuid(null);
  };

  const confirmChangeRoom = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeRoomError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    const roomTypeCode = selectedRoomType.value;
    const ratePlanCode = selectedTariff.value?.rate_plan_code ?? null;

    if (!roomTypeCode || !ratePlanCode) {
      changeRoomError.value =
        "Не удалось определить выбранный номер или тариф. Попробуйте выбрать номер ещё раз.";
      return;
    }

    isChangingRoom.value = true;
    changeRoomError.value = null;
    changeRoomSuccess.value = null;

    try {
      const stayDates = pickBookingStayDates(createdBooking.value?.order);
      if (!stayDates) {
        throw new Error("Не удалось определить даты текущего бронирования.");
      }
      const { startAt, endAt } = stayDates;

      const orderNationality =
        pickString(createdBooking.value?.order?.nationality) ?? "";
      const roomsRaw = createdBooking.value?.rooms;
      const existingRooms = Array.isArray(roomsRaw) ? roomsRaw : [];

      const rooms =
        existingRooms.length > 0
          ? existingRooms.map((roomRaw) => {
              const room = roomRaw as Record<string, unknown>;
              const guestsRaw = Array.isArray(room.guests) ? room.guests : [];

              return {
                booking_id: pickNumber(room.id),
                room_type_code: roomTypeCode,
                rate_plan_code: ratePlanCode,
                packages: pickRoomPackageCodes(room),
                adults: pickNumber(room.adults) ?? 1,
                children: pickNumber(room.children) ?? 0,
                children_ages: pickChildrenAges(room),
                guests: mapBookingChangeGuests(guestsRaw, orderNationality),
              };
            })
          : [
              {
                booking_id: null,
                room_type_code: roomTypeCode,
                rate_plan_code: ratePlanCode,
                packages: [],
                adults: 1,
                children: 0,
                children_ages: [],
                guests: [],
              },
            ];

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
      )) as ChangeBookingRoomResponse;

      if (!response.success) {
        throw new Error(
          response.message || "Не удалось изменить номер бронирования",
        );
      }

      await bookingStore.getBookingByUuid(uuid);
      setChangeRoomUuid(null);
      changeRoomSuccess.value = "Номер успешно изменён.";
    } catch (error: unknown) {
      changeRoomError.value = getErrorMessage(error);
    } finally {
      isChangingRoom.value = false;
    }
  };

  return {
    isChangeRoomPopupOpen,
    isChangingRoom,
    changeRoomError,
    changeRoomSuccess,
    openChangeRoomPopup,
    closeChangeRoomPopup,
    confirmChangeRoom,
  };
};
