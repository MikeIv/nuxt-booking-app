import { useBookingStore } from "~/stores/booking";
import { storeToRefs } from "pinia";
import type { ComputedRef } from "vue";
import type { BookingByUuidRoom } from "~/types/booking";
import type { Room } from "~/types/room";
import type { SelectedService } from "~/stores/booking";
import { pickNumber, pickString } from "~/utils/pick";
import {
  buildSelectedMultiRoomsFromBookingRooms,
  mapBookingUpdateRoomsPackages,
  pickChildrenAges,
  pickRoomRatePlanCode,
  resolveBookingNights,
} from "~/utils/bookingChangeRequest";
import { mapBookingRoomsServicesToByRoom } from "~/utils/mapBookingRoomServices";

type ChangeServicesResponse = {
  success: boolean;
  message?: string;
  payload?: unknown;
};

function buildRoomFromBookingRecord(
  roomRaw: Record<string, unknown>,
  roomTypeCode: string,
  ratePlanCode: string,
): Room {
  const tariffRaw = roomRaw.tariff as Record<string, unknown> | undefined;
  const tariffTitle = pickString(tariffRaw?.title) ?? "";
  const tariffPrice =
    pickNumber(tariffRaw?.price) ?? pickNumber(roomRaw.total) ?? 0;

  return {
    room_type_code: roomTypeCode,
    title: pickString(roomRaw.title) ?? "Номер",
    description: null,
    max_occupancy: Math.max(pickNumber(roomRaw.adults) ?? 1, 1),
    square: pickNumber(roomRaw.square) ?? 0,
    rooms: 1,
    amenities: [],
    min_price: tariffPrice,
    photos: [],
    tariffs: [
      {
        rate_plan_code: ratePlanCode,
        title: tariffTitle,
        price: tariffPrice,
        packages: [],
      },
    ],
  };
}

function pickSelectedPackageCodes(services: SelectedService[]): string[] {
  return services
    .map((service) => service.packageCode)
    .filter(
      (code): code is string => typeof code === "string" && code.trim() !== "",
    );
}

export const useBookingChangeServices = (
  currentBookingUuid: ComputedRef<string | null>,
) => {
  const bookingStore = useBookingStore();
  const { put } = useApi();
  const { getErrorMessage } = useApiHelpers();
  const { createdBooking } = storeToRefs(bookingStore);

  const {
    setChangeServicesUuid,
    setSelectedServicesByRoom,
    setRoomTariffs,
    setSelectedMultiRooms,
    getSelectedServicesForRoom,
  } = bookingStore;

  const isChangeServicesPopupOpen = ref(false);
  const isChangingServices = ref(false);
  const changeServicesError = ref<string | null>(null);
  const changeServicesSuccess = ref<string | null>(null);

  function syncSelectedServicesFromBooking(): void {
    const rooms = createdBooking.value?.rooms;
    if (!Array.isArray(rooms) || rooms.length === 0) {
      setSelectedServicesByRoom({});
      return;
    }

    setSelectedServicesByRoom(
      mapBookingRoomsServicesToByRoom(rooms as BookingByUuidRoom[]) as Record<
        string,
        SelectedService[]
      >,
    );
  }

  function prepareSingleRoomServicesChange(
    firstRoom: Record<string, unknown>,
    roomTypeCode: string,
    ratePlanCode: string,
  ): void {
    setSelectedMultiRooms({});

    bookingStore.setSelectedRoomType(roomTypeCode);
    bookingStore.setSelectedTariff({
      rate_plan_code: ratePlanCode,
      title:
        pickString(
          (firstRoom.tariff as Record<string, unknown> | undefined)?.title,
        ) ?? "",
      price:
        pickNumber(
          (firstRoom.tariff as Record<string, unknown> | undefined)?.price,
        ) ??
        pickNumber(firstRoom.total) ??
        0,
      packages: [],
    });

    setRoomTariffs([
      buildRoomFromBookingRecord(firstRoom, roomTypeCode, ratePlanCode),
    ]);
  }

  function prepareMultiRoomServicesChange(
    roomsRaw: unknown[],
    nights: number,
  ): string | null {
    const entries = buildSelectedMultiRoomsFromBookingRooms(roomsRaw, nights);

    for (const entry of Object.values(entries)) {
      if (!entry.room_type_code?.trim() || !entry.ratePlanCode?.trim()) {
        return `Не удалось определить номер ${entry.roomIdx + 1} для загрузки услуг.`;
      }
    }

    bookingStore.setSelectedRoomType(null);
    bookingStore.setSelectedTariff(null);
    setRoomTariffs([]);
    setSelectedMultiRooms(entries);

    return null;
  }

  function prepareStoreForServicesChange(): string | null {
    const roomsRaw = createdBooking.value?.rooms;
    if (!Array.isArray(roomsRaw) || roomsRaw.length === 0) {
      return "Не удалось определить состав бронирования. Обновите страницу.";
    }

    const order = createdBooking.value?.order;
    const startAtRaw =
      typeof order?.start_at === "string" ? order.start_at : "";
    const endAtRaw = typeof order?.end_at === "string" ? order.end_at : "";

    if (startAtRaw && endAtRaw) {
      bookingStore.setDate([new Date(startAtRaw), new Date(endAtRaw)]);
    }

    bookingStore.setGuests({
      rooms: roomsRaw.length,
      roomList: roomsRaw.map((roomRaw) => {
        const room = roomRaw as Record<string, unknown>;
        return {
          adults: Math.max(pickNumber(room.adults) ?? 1, 1),
          children: pickNumber(room.children) ?? 0,
          childrenAges: pickChildrenAges(room),
        };
      }),
    });

    if (roomsRaw.length > 1) {
      const multiError = prepareMultiRoomServicesChange(
        roomsRaw,
        resolveBookingNights(order),
      );
      if (multiError) return multiError;
    } else {
      const firstRoom = roomsRaw[0] as Record<string, unknown>;
      const roomTypeCode = pickString(firstRoom.room_type_code) ?? null;
      const ratePlanCode = pickRoomRatePlanCode(firstRoom) || null;

      if (!roomTypeCode || !ratePlanCode) {
        return "Не удалось определить номер для загрузки услуг.";
      }

      prepareSingleRoomServicesChange(firstRoom, roomTypeCode, ratePlanCode);
    }

    syncSelectedServicesFromBooking();

    return null;
  }

  const startChangeServicesFlow = (): string | null => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      return "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
    }

    const prepareError = prepareStoreForServicesChange();
    if (prepareError) return prepareError;

    setChangeServicesUuid(uuid);
    return null;
  };

  const openChangeServicesPopup = () => {
    changeServicesError.value = null;
    changeServicesSuccess.value = null;
    isChangeServicesPopupOpen.value = true;
  };

  const closeChangeServicesPopup = () => {
    changeServicesError.value = null;
    changeServicesSuccess.value = null;
    isChangeServicesPopupOpen.value = false;
    setChangeServicesUuid(null);
    syncSelectedServicesFromBooking();
  };

  const confirmChangeServices = async () => {
    const uuid = currentBookingUuid.value;
    if (!uuid) {
      changeServicesError.value =
        "UUID бронирования не найден. Обновите страницу или проверьте ссылку.";
      return;
    }

    isChangingServices.value = true;
    changeServicesError.value = null;
    changeServicesSuccess.value = null;

    try {
      const roomsRaw = Array.isArray(createdBooking.value?.rooms)
        ? createdBooking.value.rooms
        : [];
      if (roomsRaw.length === 0) {
        throw new Error(
          "Не удалось определить состав бронирования. Обновите страницу.",
        );
      }

      const rooms = mapBookingUpdateRoomsPackages(roomsRaw, (roomIndex) =>
        pickSelectedPackageCodes(getSelectedServicesForRoom(roomIndex)),
      );

      const response = (await put<unknown>(
        `/v1/booking/${uuid}`,
        { rooms },
        { signal: AbortSignal.timeout(15000) },
      )) as ChangeServicesResponse;

      if (!response.success) {
        throw new Error(response.message || "Не удалось изменить услуги");
      }

      await bookingStore.getBookingByUuid(uuid);
      setChangeServicesUuid(null);
      syncSelectedServicesFromBooking();
      changeServicesSuccess.value = "Услуги успешно обновлены.";
    } catch (error: unknown) {
      changeServicesError.value = getErrorMessage(error);
    } finally {
      isChangingServices.value = false;
    }
  };

  return {
    isChangeServicesPopupOpen,
    isChangingServices,
    changeServicesError,
    changeServicesSuccess,
    startChangeServicesFlow,
    openChangeServicesPopup,
    closeChangeServicesPopup,
    confirmChangeServices,
  };
};
