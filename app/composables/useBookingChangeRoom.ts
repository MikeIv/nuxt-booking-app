import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";

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
      const startAt =
        typeof createdBooking.value?.order?.start_at === "string"
          ? createdBooking.value.order.start_at.slice(0, 10)
          : "";
      const endAt =
        typeof createdBooking.value?.order?.end_at === "string"
          ? createdBooking.value.order.end_at.slice(0, 10)
          : "";
      if (!startAt || !endAt) {
        throw new Error("Не удалось определить даты текущего бронирования.");
      }

      type GuestItem = {
        id: number | null;
        surname: string;
        name: string;
        middle_name: string | null;
        phone: string;
        email: string;
      };
      type RoomItem = {
        booking_id: number | null;
        room_type_code: string;
        rate_plan_code: string;
        packages: string[];
        adults: number;
        children: number;
        children_ages: number[];
        guests: GuestItem[];
      };

      const roomsRaw = createdBooking.value?.rooms;
      const existingRooms = Array.isArray(roomsRaw) ? roomsRaw : [];

      const rooms: RoomItem[] =
        existingRooms.length > 0
          ? existingRooms.map((roomRaw) => {
              const room = roomRaw as Record<string, unknown>;

              const guestsRaw = Array.isArray(room.guests) ? room.guests : [];
              const guests: GuestItem[] = guestsRaw.map((g) => {
                const guest = g as Record<string, unknown>;
                return {
                  id: pickNumber(guest.id),
                  surname: pickString(guest.surname) ?? "",
                  name: pickString(guest.name) ?? "",
                  middle_name: pickString(guest.middle_name),
                  phone: pickString(guest.phone) ?? "",
                  email: pickString(guest.email) ?? "",
                };
              });

              const childrenAges = (
                Array.isArray(room.children_ages) ? room.children_ages : []
              )
                .map((age) => pickNumber(age))
                .filter((age): age is number => age !== null);

              const roomPackages = (
                Array.isArray(room.packages) ? room.packages : []
              )
                .map((pkg) => pickString(pkg))
                .filter((pkg): pkg is string => pkg !== null);

              return {
                booking_id: pickNumber(room.id),
                room_type_code: roomTypeCode,
                rate_plan_code: ratePlanCode,
                packages: roomPackages,
                adults: pickNumber(room.adults) ?? 1,
                children: pickNumber(room.children) ?? 0,
                children_ages: childrenAges,
                guests,
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
