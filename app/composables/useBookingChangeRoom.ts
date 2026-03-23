import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";

type ChangeBookingRoomResponse =
  | true
  | false
  | { success?: boolean; message?: string; payload?: unknown }
  | null
  | undefined;

function pickString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

function pickNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function pickBoolean(value: unknown): boolean {
  return value === true;
}

export const useBookingChangeRoom = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking, selectedRoomType, selectedTariff, changeRoomUuid } =
    storeToRefs(bookingStore);

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
    changeRoomUuid.value = null;
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
      type GuestItem = {
        surname: string;
        name: string;
        middle_name: string | null;
        phone: string;
        email: string;
        nationality: string;
        sms_confirmation: boolean;
        email_subscribe: boolean;
      };
      type RoomItem = {
        room_type_code: string;
        rate_type_code: string;
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
                  surname: pickString(guest.surname) ?? "",
                  name: pickString(guest.name) ?? "",
                  middle_name: pickString(guest.middle_name),
                  phone: pickString(guest.phone) ?? "",
                  email: pickString(guest.email) ?? "",
                  nationality:
                    pickString(guest.nationality) ??
                    pickString(createdBooking.value?.order?.nationality) ??
                    "",
                  sms_confirmation: pickBoolean(guest.sms_confirmation),
                  email_subscribe: pickBoolean(guest.email_subscribe),
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
                room_type_code: roomTypeCode,
                rate_type_code: ratePlanCode,
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
                room_type_code: roomTypeCode,
                rate_type_code: ratePlanCode,
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
          room_type_code: roomTypeCode,
          rate_plan_code: ratePlanCode,
          rate_type_code: ratePlanCode,
          rooms,
        },
        {
          signal: AbortSignal.timeout(15000),
        },
      )) as ChangeBookingRoomResponse;

      const isSuccess =
        response === true ||
        (typeof response === "object" &&
          response !== null &&
          (response as { success?: boolean }).success === true);

      if (!isSuccess) {
        const errMsg =
          typeof response === "object" && response !== null
            ? (response as { message?: string }).message
            : null;
        throw new Error(errMsg || "Не удалось изменить номер бронирования");
      }

      await bookingStore.getBookingByUuid(uuid);
      changeRoomUuid.value = null;
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
